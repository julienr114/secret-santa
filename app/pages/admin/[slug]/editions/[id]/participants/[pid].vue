<script setup lang="ts">
import { messageTypesFor, type MessageType } from '#server/utils/messages';
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
import { defaultMessageType, formatDate } from '~/utils/labels';

// One participant of an edition: share, copy, and the "replay without
// betraying the secret" actions of README 4.4.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const id = computed(() => String(route.params.id));
const pid = computed(() => String(route.params.pid));
const toast = useToast();
const { t, tk, locale } = useT();
const errorMessage = useErrorMessage();
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
const messageItems = computed(() =>
  messageTypesFor(status.value).map((value) => ({
    value,
    label: tk(`common.messageType.${value}`),
  })),
);
watch(status, (s) => {
  messageType.value = defaultMessageType(s);
});
const messages = useMessagesQuery(slug, id, messageType);
const message = computed(() => messages.data.value?.messages[pid.value]);

useHead({
  title: computed(
    () =>
      `${p.value?.firstName ?? t('adminEdition.participant.fallbackTitle')} — ${t('common.appName')}`,
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
      label:
        edition.data.value?.edition.label ??
        t('adminEdition.general.editionFallback'),
      to: `/admin/${slug.value}/editions/${id.value}`,
    },
    { label: p.value?.firstName ?? '…' },
  ],
}));

const viewed = computed(() => {
  const count = p.value?.viewCount ?? 0;
  if (count === 0)
    return status.value === 'drawn'
      ? t('adminEdition.participant.notViewed')
      : null;
  return p.value?.lastViewedAt
    ? t('adminEdition.participant.viewedWithLast', {
        count,
        date: formatDate(p.value.lastViewedAt, locale.value),
      })
    : t('adminEdition.participant.viewed', { count });
});

const copyLink = async () => {
  if (!message.value) return;
  await navigator.clipboard.writeText(message.value.link);
  toast.add({
    title: t('adminEdition.participant.linkCopied'),
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
        title: t('adminEdition.participant.linkRegenerated'),
        description: t('adminEdition.participant.linkRegeneratedDescription'),
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
      <p v-if="!p" class="text-muted">
        {{ t('adminEdition.participant.notFound') }}
      </p>
      <template v-else>
        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-4">
            <AdminAvatar :avatar="p.avatar" size="lg" />
            <h1 class="font-display text-3xl font-bold">{{ p.firstName }}</h1>
          </div>
          <div class="flex flex-wrap gap-1">
            <AdminStatusBadge
              v-for="badge in p.badges"
              :key="badge"
              :code="badge"
            />
            <span v-if="p.badges.length === 0" class="text-sm text-muted">{{
              t('adminEdition.participant.waiting')
            }}</span>
          </div>
          <p v-if="viewed" class="text-sm text-muted">{{ viewed }}</p>
        </div>

        <template v-if="canSend">
          <section class="flex flex-col gap-2">
            <h2 :class="sectionTitle">
              {{ t('adminEdition.participant.messageTitle') }}
            </h2>
            <USelect
              v-model="messageType"
              :items="messageItems"
              class="w-full"
            />
          </section>
          <MobileList>
            <MobileListItem
              icon="i-lucide-share-2"
              :title="t('adminEdition.participant.shareMessage')"
              :subtitle="t('adminEdition.participant.shareMessageHint')"
              @click="
                sharer.share(p.participationId, messageType, message?.text)
              "
            />
            <MobileListItem
              icon="i-lucide-copy"
              :title="t('adminEdition.participant.copyMessage')"
              @click="
                sharer.copy(p.participationId, messageType, message?.text)
              "
            />
            <MobileListItem
              icon="i-lucide-link"
              :title="t('adminEdition.participant.copyLink')"
              @click="copyLink"
            />
            <MobileListItem
              v-if="p.messageSentAt"
              icon="i-lucide-undo-2"
              :title="t('adminEdition.participant.unsend')"
              :subtitle="
                t('adminEdition.participant.unsendHint', {
                  badge: t('common.badge.sent'),
                })
              "
              @click="
                unsend.mutate(p.participationId, {
                  onSuccess: () =>
                    toast.add({
                      title: t('adminEdition.participant.unsendDone'),
                      color: 'success',
                    }),
                  onError,
                })
              "
            />
          </MobileList>
        </template>

        <MobileList
          :title="t('adminEdition.participant.troubleshooting')"
          :footer="t('adminEdition.participant.troubleshootingFooter')"
        >
          <template v-if="status !== 'closed'">
            <MobileListItem
              v-if="confirm !== 'regenerate'"
              icon="i-lucide-refresh-cw"
              :title="t('adminEdition.participant.regenerate')"
              :subtitle="t('adminEdition.participant.regenerateHint')"
              @click="confirm = 'regenerate'"
            />
            <li v-else class="flex flex-col gap-2 px-4 py-3">
              <p class="text-sm">
                {{
                  t('adminEdition.participant.regenerateConfirm', {
                    name: p.firstName,
                  })
                }}
              </p>
              <div class="flex gap-2">
                <UButton
                  :label="t('adminEdition.participant.regenerateAction')"
                  :loading="regenerate.isPending.value"
                  @click="onRegenerate"
                />
                <UButton
                  variant="ghost"
                  color="neutral"
                  :label="t('common.actions.cancel')"
                  @click="confirm = null"
                />
              </div>
            </li>
          </template>
          <template v-if="canEdit">
            <MobileListItem
              v-if="confirm !== 'remove'"
              icon="i-lucide-user-minus"
              :title="t('adminEdition.participant.remove')"
              tone="danger"
              @click="confirm = 'remove'"
            />
            <li v-else class="flex flex-col gap-2 px-4 py-3">
              <p class="text-sm">
                {{
                  t('adminEdition.participant.removeConfirm', {
                    name: p.firstName,
                  })
                }}
              </p>
              <div class="flex gap-2">
                <UButton
                  color="error"
                  :label="t('adminEdition.participant.removeAction')"
                  :loading="remove.isPending.value"
                  @click="onRemove"
                />
                <UButton
                  variant="ghost"
                  color="neutral"
                  :label="t('common.actions.cancel')"
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
