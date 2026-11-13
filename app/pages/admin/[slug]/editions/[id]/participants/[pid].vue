<script setup lang="ts">
import type { MessageType } from '#server/utils/messages';
import {
  useDashboardQuery,
  useEditionQuery,
} from '~/composables/queries/useGroup';
import {
  useLinkCopiedMutation,
  useMessagesQuery,
  useRegenerateMutation,
  useRemoveParticipantMutation,
  useUnsendMutation,
} from '~/composables/queries/useEdition';
import { useShareMessage } from '~/composables/useShareMessage';
import { errorMessage } from '~/utils/errors';
import { MESSAGE_LABELS, defaultMessageType, formatDate } from '~/utils/labels';

// One participant of an edition: share, copy, and the "replay without
// betraying the secret" actions of README 4.4.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const id = computed(() => String(route.params.id));
const pid = computed(() => String(route.params.pid));
const toast = useToast();
const onError = (error: unknown) =>
  toast.add({ title: errorMessage(error), color: 'error' });

const edition = useEditionQuery(slug, id);
const dashboard = useDashboardQuery(slug);
const unsend = useUnsendMutation(slug);
const linkCopied = useLinkCopiedMutation(slug);
const regenerate = useRegenerateMutation(slug);
const remove = useRemoveParticipantMutation(slug, id);
const sharer = useShareMessage(slug);

const status = computed(() => edition.data.value?.edition.status ?? 'draft');
const p = computed(
  () =>
    edition.data.value?.participants.find(
      (x) => x.participationId === pid.value,
    ) ?? null,
);
const canSend = computed(
  () => status.value === 'invitations' || status.value === 'drawn',
);
const canEdit = computed(
  () => status.value === 'draft' || status.value === 'invitations',
);
const messageType = ref<MessageType>(defaultMessageType(status.value));
const messageItems = Object.entries(MESSAGE_LABELS).map(([value, text]) => ({
  value,
  label: text,
}));
const messages = useMessagesQuery(slug, id, messageType);
const message = computed(() => messages.data.value?.messages[pid.value]);

useHead({
  title: computed(
    () => `${p.value?.firstName ?? 'Participant'} — Secret Santa`,
  ),
});
const screen = computed(() => ({
  back: `/admin/${slug.value}/editions/${id.value}`,
  crumbs: [
    {
      label: dashboard.data.value?.group.name ?? slug.value,
      to: `/admin/${slug.value}`,
    },
    {
      label: edition.data.value?.edition.label ?? 'Édition',
      to: `/admin/${slug.value}/editions/${id.value}`,
    },
    { label: p.value?.firstName ?? '…' },
  ],
}));

const viewed = computed(() => {
  const count = p.value?.viewCount ?? 0;
  if (count === 0)
    return status.value === 'drawn'
      ? "N'a pas encore consulté son résultat"
      : null;
  const last = p.value?.lastViewedAt
    ? ` · dernière fois ${formatDate(p.value.lastViewedAt)}`
    : '';
  return `A consulté son résultat ${count === 1 ? 'une fois' : `${count} fois`}${last}`;
});

const copyLink = async () => {
  if (!message.value) return;
  await navigator.clipboard.writeText(message.value.link);
  toast.add({
    title: 'Lien copié',
    color: 'success',
    icon: 'i-lucide-clipboard-check',
  });
  linkCopied.mutate(pid.value);
};
const confirm = ref<null | 'regenerate' | 'remove'>(null);
const onRegenerate = () =>
  regenerate.mutate(pid.value, {
    onSuccess: () => {
      confirm.value = null;
      toast.add({
        title: "Nouveau lien créé, l'ancien ne marche plus",
        description: 'Pense à le repartager.',
        color: 'success',
      });
    },
    onError,
  });
const onRemove = () =>
  remove.mutate(pid.value, {
    onSuccess: () =>
      navigateTo(`/admin/${slug.value}/editions/${id.value}`, {
        replace: true,
      }),
    onError,
  });
const sectionTitle =
  'px-1 text-xs font-semibold tracking-wide text-muted uppercase';
</script>

<template>
  <AdminScreen v-bind="screen">
    <AdminQueryState
      :pending="edition.isPending.value"
      :error="edition.error.value"
    >
      <p v-if="!p" class="text-muted">Participant introuvable.</p>
      <template v-else>
        <div class="flex flex-col gap-2">
          <h1 class="font-display text-3xl font-bold">{{ p.firstName }}</h1>
          <div class="flex flex-wrap gap-1">
            <AdminStatusBadge
              v-for="badge in p.badges"
              :key="badge"
              :code="badge"
            />
            <span v-if="p.badges.length === 0" class="text-sm text-muted"
              >en attente</span
            >
          </div>
          <p v-if="viewed" class="text-sm text-muted">{{ viewed }}</p>
        </div>

        <template v-if="canSend">
          <section class="flex flex-col gap-2">
            <h2 :class="sectionTitle">Message</h2>
            <USelect
              v-model="messageType"
              :items="messageItems"
              class="w-full"
            />
          </section>
          <MobileList>
            <MobileListItem
              icon="i-lucide-share-2"
              title="Partager le message"
              subtitle="WhatsApp, SMS… via le téléphone"
              @click="
                sharer.share(p.participationId, messageType, message?.text)
              "
            />
            <MobileListItem
              icon="i-lucide-copy"
              title="Copier le message"
              @click="
                sharer.copy(p.participationId, messageType, message?.text)
              "
            />
            <MobileListItem
              icon="i-lucide-link"
              title="Copier le lien seul"
              @click="copyLink"
            />
            <MobileListItem
              v-if="p.messageSentAt"
              icon="i-lucide-undo-2"
              title="Pas envoyé finalement ?"
              subtitle="Retire la pastille « envoyé »"
              @click="
                unsend.mutate(p.participationId, {
                  onSuccess: () =>
                    toast.add({ title: 'Pastille retirée', color: 'success' }),
                  onError,
                })
              "
            />
          </MobileList>
        </template>

        <MobileList
          title="Dépannage"
          footer="Aucune de ces actions ne révèle le résultat. Toutes sont inscrites au journal du groupe."
        >
          <template v-if="status !== 'closed'">
            <MobileListItem
              v-if="confirm !== 'regenerate'"
              icon="i-lucide-refresh-cw"
              title="Régénérer le lien"
              subtitle="Lien transféré par erreur"
              @click="confirm = 'regenerate'"
            />
            <li v-else class="flex flex-col gap-2 px-4 py-3">
              <p class="text-sm">
                L'ancien lien de {{ p.firstName }} ne marchera plus. Continuer ?
              </p>
              <div class="flex gap-2">
                <UButton
                  label="Régénérer"
                  :loading="regenerate.isPending.value"
                  @click="onRegenerate"
                />
                <UButton
                  variant="ghost"
                  color="neutral"
                  label="Annuler"
                  @click="confirm = null"
                />
              </div>
            </li>
          </template>
          <template v-if="canEdit">
            <MobileListItem
              v-if="confirm !== 'remove'"
              icon="i-lucide-user-minus"
              title="Retirer de l'édition"
              tone="danger"
              @click="confirm = 'remove'"
            />
            <li v-else class="flex flex-col gap-2 px-4 py-3">
              <p class="text-sm">
                Retirer {{ p.firstName }} de cette édition ?
              </p>
              <div class="flex gap-2">
                <UButton
                  color="error"
                  label="Retirer"
                  :loading="remove.isPending.value"
                  @click="onRemove"
                />
                <UButton
                  variant="ghost"
                  color="neutral"
                  label="Annuler"
                  @click="confirm = null"
                />
              </div>
            </li>
          </template>
        </MobileList>
      </template>
    </AdminQueryState>
  </AdminScreen>
</template>
