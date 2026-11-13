<script setup lang="ts">
import type { MessageType } from '#server/utils/messages';
import {
  useDashboardQuery,
  useEditionQuery,
} from '~/composables/queries/useGroup';
import {
  useCheckQuery,
  useCloseMutation,
  useDrawMutation,
  useMessagesQuery,
  useOpenMutation,
} from '~/composables/queries/useEdition';
import { useShareMessage } from '~/composables/useShareMessage';
import { errorMessage } from '~/utils/errors';
import { MESSAGE_LABELS, defaultMessageType, plural } from '~/utils/labels';

// Edition cockpit (README section 11): the action of the moment, the
// participants with their badges ("consulté" above all), and a share
// button on every row.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const id = computed(() => String(route.params.id));
const toast = useToast();
const onError = (error: unknown) =>
  toast.add({ title: errorMessage(error), color: 'error' });

const edition = useEditionQuery(slug, id);
const dashboard = useDashboardQuery(slug);
const check = useCheckQuery(slug, id);
const open = useOpenMutation(slug, id);
const drawMutation = useDrawMutation(slug, id);
const close = useCloseMutation(slug, id);

const status = computed(() => edition.data.value?.edition.status ?? 'draft');
const label = computed(() => edition.data.value?.edition.label ?? 'Édition');
useHead({ title: computed(() => `${label.value} — Secret Santa`) });
const screen = computed(() => ({
  back: `/admin/${slug.value}`,
  crumbs: [
    {
      label: dashboard.data.value?.group.name ?? slug.value,
      to: `/admin/${slug.value}`,
    },
    { label: label.value },
  ],
}));

const canSend = computed(
  () => status.value === 'invitations' || status.value === 'drawn',
);
const canEdit = computed(
  () => status.value === 'draft' || status.value === 'invitations',
);
const messageType = ref<MessageType>(defaultMessageType(status.value));
watch(status, (s) => {
  messageType.value = defaultMessageType(s);
});
const messageItems = Object.entries(MESSAGE_LABELS).map(([value, text]) => ({
  value,
  label: text,
}));
const messages = useMessagesQuery(slug, id, messageType);
const sharer = useShareMessage(slug);

const participants = computed(() => edition.data.value?.participants ?? []);
const viewedCount = computed(
  () => participants.value.filter((p) => p.viewCount > 0).length,
);
const sentCount = computed(
  () => participants.value.filter((p) => p.messageSentAt).length,
);
const subtitle = computed(() => {
  const rules = edition.data.value?.rules;
  return [
    rules?.budget && `Budget ${rules.budget}`,
    rules?.eventDate && `le ${rules.eventDate}`,
  ]
    .filter(Boolean)
    .join(' · ');
});

const confirmDraw = ref(false);
const confirmClose = ref(false);
const runDraw = () =>
  drawMutation.mutate(undefined, {
    onSuccess: () => {
      confirmDraw.value = false;
      toast.add({
        title: 'Tirage effectué',
        description: 'Partage maintenant le message « Tirage fait » à chacun.',
        icon: 'i-lucide-sparkles',
        color: 'success',
      });
    },
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
      <div class="flex flex-col gap-1">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h1 class="font-display text-3xl font-bold">{{ label }}</h1>
          <AdminStatusBadge :code="status" />
        </div>
        <p v-if="subtitle" class="text-muted">{{ subtitle }}</p>
      </div>

      <!-- Action of the moment -->
      <section v-if="status === 'draft'" class="flex flex-col gap-3">
        <p class="text-muted">
          Vérifie la liste des participants, puis ouvre les invitations pour
          pouvoir partager les liens.
        </p>
        <UButton
          block
          icon="i-lucide-mail-open"
          label="Ouvrir les invitations"
          :loading="open.isPending.value"
          @click="open.mutate(undefined, { onError })"
        />
      </section>

      <section v-else-if="status === 'invitations'" class="flex flex-col gap-3">
        <h2 :class="sectionTitle">Vérification</h2>
        <USkeleton v-if="check.isPending.value" class="h-16 w-full" />
        <template v-else-if="check.data.value">
          <UAlert
            v-if="check.data.value.ready"
            color="success"
            variant="subtle"
            icon="i-lucide-circle-check"
            title="Le tirage est possible"
            :description="`${plural(check.data.value.participantCount, 'participant')}, toutes les règles sont respectées.`"
          />
          <UAlert
            v-if="check.data.value.problem"
            color="error"
            variant="subtle"
            icon="i-lucide-circle-alert"
            :title="
              errorMessage({ statusMessage: check.data.value.problem.reason })
            "
            :description="
              [
                check.data.value.problem.blocked.length &&
                  `Personne ne peut être tiré pour : ${check.data.value.problem.blocked.join(', ')}.`,
                check.data.value.problem.constrained.length &&
                  `Très peu de choix pour : ${check.data.value.problem.constrained.join(', ')}.`,
              ]
                .filter(Boolean)
                .join(' ')
            "
          />
        </template>
        <template v-if="check.data.value?.ready">
          <UButton
            v-if="!confirmDraw"
            block
            icon="i-lucide-sparkles"
            label="Lancer le tirage"
            @click="confirmDraw = true"
          />
          <div
            v-else
            class="flex flex-col gap-2 rounded-md border border-default bg-default p-4"
          >
            <p class="text-sm">
              Le tirage est définitif : la liste sera verrouillée. On y va ?
            </p>
            <div class="flex gap-2">
              <UButton
                icon="i-lucide-sparkles"
                label="Tirer au sort"
                :loading="drawMutation.isPending.value"
                @click="runDraw"
              />
              <UButton
                variant="ghost"
                color="neutral"
                label="Pas encore"
                @click="confirmDraw = false"
              />
            </div>
          </div>
        </template>
      </section>

      <section v-else-if="status === 'drawn'" class="flex flex-col gap-3">
        <UAlert
          color="success"
          variant="subtle"
          icon="i-lucide-gift"
          title="Tirage effectué"
          :description="`${viewedCount}/${participants.length} ont consulté leur résultat. Personne, gardien compris, ne voit les résultats ici.`"
        />
        <UButton
          v-if="!confirmClose"
          block
          variant="outline"
          color="neutral"
          icon="i-lucide-archive"
          label="Clôturer après la fête"
          @click="confirmClose = true"
        />
        <div
          v-else
          class="flex flex-col gap-2 rounded-md border border-default bg-default p-4"
        >
          <p class="text-sm">
            Clôturer rend l'édition non modifiable ; elle servira d'historique
            l'an prochain.
          </p>
          <div class="flex gap-2">
            <UButton
              label="Clôturer"
              :loading="close.isPending.value"
              @click="close.mutate(undefined, { onError })"
            />
            <UButton
              variant="ghost"
              color="neutral"
              label="Annuler"
              @click="confirmClose = false"
            />
          </div>
        </div>
      </section>

      <UAlert
        v-else
        color="neutral"
        variant="subtle"
        icon="i-lucide-archive"
        description="Édition clôturée, en lecture seule."
      />

      <!-- Message to share -->
      <section v-if="canSend" class="flex flex-col gap-2">
        <h2 :class="sectionTitle">Message à partager</h2>
        <USelect v-model="messageType" :items="messageItems" class="w-full" />
        <p class="px-1 text-xs text-muted">
          {{ sentCount }}/{{ participants.length }} partagé{{
            sentCount > 1 ? 's' : ''
          }}. Le bouton ouvre le partage du téléphone (WhatsApp, SMS…) avec le
          message et le lien personnel.
        </p>
      </section>

      <!-- Participants -->
      <p v-if="participants.length === 0" class="text-muted">
        Personne pour l'instant.
      </p>
      <MobileList v-else :title="plural(participants.length, 'participant')">
        <MobileListItem
          v-for="p in participants"
          :key="p.participationId"
          :avatar="p.avatar"
          :to="`/admin/${slug}/editions/${id}/participants/${p.participationId}`"
          :title="p.firstName"
          :subtitle="p.badges.length === 0 ? 'en attente' : undefined"
        >
          <template #trailing>
            <div class="flex flex-wrap justify-end gap-1">
              <AdminStatusBadge
                v-for="badge in p.badges"
                :key="badge"
                :code="badge"
              />
            </div>
            <UButton
              v-if="canSend"
              color="secondary"
              variant="soft"
              icon="i-lucide-share-2"
              :aria-label="`Partager le lien de ${p.firstName}`"
              :disabled="!messages.data.value?.messages[p.participationId]"
              @click.prevent.stop="
                sharer.share(
                  p.participationId,
                  messageType,
                  messages.data.value?.messages[p.participationId]?.text,
                )
              "
            />
          </template>
        </MobileListItem>
      </MobileList>

      <MobileList v-if="canEdit || status === 'drawn'">
        <MobileListItem
          v-if="canEdit"
          :to="`/admin/${slug}/editions/${id}/ajouter`"
          icon="i-lucide-user-plus"
          title="Ajouter des participants"
        />
        <MobileListItem
          v-if="status === 'drawn'"
          :to="`/admin/${slug}/editions/${id}/annuler`"
          icon="i-lucide-rotate-ccw"
          title="Annuler et relancer le tirage"
          subtitle="Désistement, oubli… journalisé"
          tone="danger"
        />
      </MobileList>
    </AdminQueryState>
  </AdminScreen>
</template>
