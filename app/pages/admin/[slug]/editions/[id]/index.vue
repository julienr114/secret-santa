<script setup lang="ts">
import { messageTypesFor, type MessageType } from '#server/utils/messages';
import {
  useDashboardQuery,
  useEditionQuery,
  usePeopleQuery,
} from '~/composables/queries/useGroup';
import {
  useCheckQuery,
  useClearWaiversMutation,
  useCloseMutation,
  useDrawMutation,
  useMessagesQuery,
  useOpenMutation,
  useSendEmailsMutation,
  useWaiveMutation,
} from '~/composables/queries/useEdition';
import { useShareMessage } from '~/composables/useShareMessage';
import { defaultMessageType } from '~/utils/labels';
import { participantStatusLine } from '~/utils/participantStatus';

// Edition cockpit (README section 11): the action of the moment, the
// participants with their badges ("consulté" above all), and a share
// button on every row.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const id = computed(() => String(route.params.id));
const toast = useToast();
const { t, tk, locale } = useT();
const errorMessage = useErrorMessage();
const onError = (error: unknown) =>
  toast.add({ title: errorMessage(error), color: 'error' });

const edition = useEditionQuery(slug, id);
const dashboard = useDashboardQuery(slug);
const check = useCheckQuery(slug, id);
const open = useOpenMutation(slug, id);
const drawMutation = useDrawMutation(slug, id);
const close = useCloseMutation(slug, id);

const status = computed(() => edition.data.value?.edition.status ?? 'draft');
const label = computed(
  () =>
    edition.data.value?.edition.label ??
    t('adminEdition.general.editionFallback'),
);
useHead({
  title: computed(() => `${label.value} — ${t('common.appName')}`),
});
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
const messageItems = computed(() =>
  messageTypesFor(status.value).map((value) => ({
    value,
    label: tk(`common.messageType.${value}`),
  })),
);
const messages = useMessagesQuery(slug, id, messageType);
const sharer = useShareMessage(slug);

const participants = computed(() => edition.data.value?.participants ?? []);
// Reminder, shown on the "add" row: active members left out of the edition.
const people = usePeopleQuery(slug);
const missing = computed(() => {
  const inEdition = new Set(participants.value.map((p) => p.id));
  return (people.data.value?.persons ?? []).filter(
    (p) => p.active && !inEdition.has(p.id),
  );
});
const missingText = computed(() => {
  const names = missing.value.map((p) => p.firstName);
  if (names.length === 0) return undefined;
  return t('adminEdition.cockpit.missing', {
    count: names.length,
    names: new Intl.ListFormat(locale.value, { type: 'conjunction' }).format(
      names,
    ),
  });
});
// Previous-year pairs can be allowed again for this edition, one by one.
const waive = useWaiveMutation(slug, id);
const clearWaivers = useClearWaiversMutation(slug, id);
const confirmWaiver = ref<string | null>(null);
const pairKey = (p: { giverId: string; receiverId: string }) =>
  `${p.giverId}>${p.receiverId}`;
const onWaive = (pair: { giverId: string; receiverId: string }) =>
  waive.mutate(
    { giverId: pair.giverId, receiverId: pair.receiverId },
    {
      onSettled: () => {
        confirmWaiver.value = null;
      },
      onError,
    },
  );
const personOf = (pid: string) => participants.value.find((p) => p.id === pid);
const firstNameOf = (pid: string) => personOf(pid)?.firstName ?? '?';
const viewedCount = computed(
  () => participants.value.filter((p) => p.viewCount > 0).length,
);
// Status line of each participant, with the number of ideas; nothing at
// all for someone with neither before the draw.
const subtitles = computed(() =>
  Object.fromEntries(
    participants.value.flatMap((p) => {
      const line = participantStatusLine(p, status.value, t);
      const ideas = p.wishesCount
        ? t('common.count.ideas', { count: p.wishesCount })
        : '';
      const label = [line?.label, ideas].filter(Boolean).join(' · ');
      return label
        ? [[p.participationId, { label, icon: line?.icon, tone: line?.tone }]]
        : [];
    }),
  ),
);
// Bulk sending by email, when the super-admin switched it on for the
// group: one button for the chosen message, to people who have an address.
// A second tap confirms, since a sent email cannot be taken back.
const emailSending = computed(
  () => dashboard.data.value?.group.emailSending ?? false,
);
const sendEmails = useSendEmailsMutation(slug, id);
const confirmEmail = ref(false);
const withEmail = computed(() => participants.value.filter((p) => p.email));
const emailPending = computed(() =>
  withEmail.value.filter((p) => !p.messageSentAt),
);
// Everyone reachable is already marked as sent: offer to send again.
const emailAudience = computed(() =>
  emailPending.value.length > 0 ? 'unsent' : 'all',
);
const emailCount = computed(() =>
  emailAudience.value === 'unsent'
    ? emailPending.value.length
    : withEmail.value.length,
);
const withoutEmailCount = computed(
  () => participants.value.length - withEmail.value.length,
);
const onSendEmails = () =>
  sendEmails.mutate(
    { type: messageType.value, audience: emailAudience.value },
    {
      onSuccess: ({ sent, left }) =>
        toast.add({
          title: t('adminEdition.cockpit.email.sent', { count: sent }),
          description: left
            ? t('adminEdition.cockpit.email.left', { count: left })
            : undefined,
          color: 'success',
          icon: 'i-lucide-mail-check',
        }),
      onError,
      onSettled: () => {
        confirmEmail.value = false;
      },
    },
  );
// Who receives the email, then the usual warning about spam.
const emailHelp = computed(() => {
  const message = tk(`common.messageType.${messageType.value}`);
  return [
    withoutEmailCount.value
      ? t('adminEdition.cockpit.email.recipientsPartial', {
          message,
          count: withoutEmailCount.value,
        })
      : t('adminEdition.cockpit.email.recipients', { message }),
    t('adminEdition.cockpit.email.spamTip'),
  ].join(' ');
});
const sentCount = computed(
  () => participants.value.filter((p) => p.messageSentAt).length,
);
const subtitle = computed(() => {
  const rules = edition.data.value?.rules;
  return [
    rules?.budget && t('adminEdition.cockpit.budget', { budget: rules.budget }),
    rules?.eventDate &&
      t('adminEdition.cockpit.eventDate', { date: rules.eventDate }),
  ]
    .filter(Boolean)
    .join(' · ');
});

// How many messages were shared (once drawn), then what the button does.
const shareHelp = computed(() =>
  [
    status.value === 'drawn' &&
      t('adminEdition.cockpit.sharedCount', {
        count: sentCount.value,
        total: participants.value.length,
      }),
    t('adminEdition.cockpit.shareHelp'),
  ]
    .filter(Boolean)
    .join(' '),
);

const confirmDraw = ref(false);
const confirmClose = ref(false);
const runDraw = () =>
  drawMutation.mutate(undefined, {
    onSuccess: () => {
      confirmDraw.value = false;
      toast.add({
        title: t('adminEdition.cockpit.drawDone'),
        description: t('adminEdition.cockpit.drawDoneToast', {
          message: t('common.messageType.drawn'),
        }),
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
          {{ t('adminEdition.cockpit.draftIntro') }}
        </p>
        <UButton
          block
          icon="i-lucide-mail-open"
          :label="t('adminEdition.cockpit.openInvitations')"
          :loading="open.isPending.value"
          @click="open.mutate(undefined, { onError })"
        />
      </section>

      <section v-else-if="status === 'invitations'" class="flex flex-col gap-3">
        <h2 :class="sectionTitle">
          {{ t('adminEdition.cockpit.checkTitle') }}
        </h2>
        <USkeleton v-if="check.isPending.value" class="h-16 w-full" />
        <template v-else-if="check.data.value">
          <UAlert
            v-if="check.data.value.ready"
            color="success"
            variant="subtle"
            icon="i-lucide-circle-check"
            :title="t('adminEdition.cockpit.drawPossible')"
            :description="
              t('adminEdition.cockpit.drawPossibleDescription', {
                count: check.data.value.participantCount,
              })
            "
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
                  t('adminEdition.cockpit.blocked', {
                    names: check.data.value.problem.blocked.join(', '),
                  }),
                check.data.value.problem.constrained.length &&
                  t('adminEdition.cockpit.constrained', {
                    names: check.data.value.problem.constrained.join(', '),
                  }),
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
            :label="t('adminEdition.cockpit.startDraw')"
            @click="confirmDraw = true"
          />
          <div
            v-else
            class="flex flex-col gap-2 rounded-md border border-default bg-default p-4"
          >
            <p
              v-if="missing.length"
              class="flex items-start gap-2 text-sm text-warning"
            >
              <UIcon
                name="i-lucide-user-round-x"
                class="mt-0.5 size-4 shrink-0"
              />
              <span>{{
                t('adminEdition.cockpit.missingWarning', {
                  text: missingText ?? '',
                })
              }}</span>
            </p>
            <p class="text-sm">
              {{ t('adminEdition.cockpit.drawIsFinal') }}
            </p>
            <div class="flex gap-2">
              <UButton
                icon="i-lucide-sparkles"
                :label="t('adminEdition.cockpit.drawNow')"
                :loading="drawMutation.isPending.value"
                @click="runDraw"
              />
              <UButton
                variant="ghost"
                color="neutral"
                :label="t('adminEdition.cockpit.notYet')"
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
          :title="t('adminEdition.cockpit.drawDone')"
          :description="
            t('adminEdition.cockpit.drawnDescription', {
              viewed: viewedCount,
              total: participants.length,
            })
          "
        />
        <UButton
          v-if="!confirmClose"
          block
          variant="outline"
          color="neutral"
          icon="i-lucide-archive"
          :label="t('adminEdition.cockpit.closeAfterParty')"
          @click="confirmClose = true"
        />
        <div
          v-else
          class="flex flex-col gap-2 rounded-md border border-default bg-default p-4"
        >
          <p class="text-sm">
            {{ t('adminEdition.cockpit.closeExplanation') }}
          </p>
          <div class="flex gap-2">
            <UButton
              :label="t('adminEdition.cockpit.close')"
              :loading="close.isPending.value"
              @click="close.mutate(undefined, { onError })"
            />
            <UButton
              variant="ghost"
              color="neutral"
              :label="t('common.actions.cancel')"
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
        :description="t('adminEdition.cockpit.closedNotice')"
      />

      <!-- Message to share -->
      <section v-if="canSend" class="flex flex-col gap-2">
        <h2 :class="sectionTitle">
          {{ t('adminEdition.cockpit.messageTitle') }}
        </h2>
        <USelect v-model="messageType" :items="messageItems" class="w-full" />
        <p class="px-1 text-xs text-muted">{{ shareHelp }}</p>
        <div
          v-if="emailSending"
          class="flex flex-col gap-2 rounded-lg border border-default bg-default p-3"
        >
          <p v-if="withEmail.length === 0" class="text-sm text-muted">
            {{ t('adminEdition.cockpit.email.noAddress') }}
          </p>
          <template v-else>
            <div v-if="confirmEmail" class="flex gap-2">
              <UButton
                class="grow justify-center"
                icon="i-lucide-mail"
                :loading="sendEmails.isPending.value"
                :label="
                  t('adminEdition.cockpit.email.confirm', { count: emailCount })
                "
                @click="onSendEmails"
              />
              <UButton
                variant="ghost"
                color="neutral"
                :label="t('common.actions.cancel')"
                @click="confirmEmail = false"
              />
            </div>
            <UButton
              v-else
              block
              variant="soft"
              icon="i-lucide-mail"
              :label="
                emailAudience === 'unsent'
                  ? t('adminEdition.cockpit.email.send', { count: emailCount })
                  : t('adminEdition.cockpit.email.resend', {
                      count: emailCount,
                    })
              "
              @click="confirmEmail = true"
            />
            <p class="text-xs text-muted">{{ emailHelp }}</p>
          </template>
        </div>
      </section>

      <!-- Participants -->
      <p v-if="participants.length === 0" class="text-muted">
        {{ t('adminEdition.cockpit.empty') }}
      </p>
      <MobileList
        v-else-if="status !== 'closed'"
        :title="t('common.count.participants', { count: participants.length })"
      >
        <MobileListItem
          v-for="p in participants"
          :key="p.participationId"
          :avatar="p.avatar"
          :to="`/admin/${slug}/editions/${id}/participants/${p.participationId}`"
          :title="p.firstName"
          :chevron="!canSend"
        >
          <template v-if="subtitles[p.participationId]" #subtitle>
            <UIcon
              v-if="subtitles[p.participationId]?.icon"
              :name="subtitles[p.participationId]?.icon"
              class="size-4 shrink-0"
              :class="subtitles[p.participationId]?.tone"
            />
            <span class="truncate">{{
              subtitles[p.participationId]?.label
            }}</span>
          </template>
          <template v-if="canSend" #trailing>
            <UButton
              size="sm"
              class="shrink-0 rounded-full"
              icon="i-lucide-send"
              :color="p.messageSentAt ? 'neutral' : 'primary'"
              :variant="p.messageSentAt ? 'outline' : 'soft'"
              :label="
                p.messageSentAt
                  ? t('adminEdition.cockpit.resend')
                  : t('adminEdition.cockpit.send')
              "
              :aria-label="
                p.messageSentAt
                  ? t('adminEdition.cockpit.resendLinkOf', {
                      name: p.firstName,
                    })
                  : t('adminEdition.cockpit.sendLinkOf', { name: p.firstName })
              "
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
          :title="t('adminEdition.cockpit.addParticipants')"
          :subtitle="missingText"
        >
          <template v-if="missing.length" #trailing>
            <span class="size-2.5 rounded-full bg-warning" aria-hidden="true" />
          </template>
        </MobileListItem>
        <MobileListItem
          v-if="status === 'drawn'"
          :to="`/admin/${slug}/editions/${id}/annuler`"
          icon="i-lucide-rotate-ccw"
          :title="t('adminEdition.cockpit.cancelAndRedraw')"
          :subtitle="t('adminEdition.cockpit.cancelAndRedrawHint')"
          tone="danger"
        />
        <MobileListItem
          v-if="status === 'drawn'"
          :to="`/admin/${slug}/editions/${id}/voir-le-tirage`"
          icon="i-lucide-eye"
          :title="t('adminEdition.cockpit.revealOne')"
          :subtitle="t('adminEdition.cockpit.revealOneHint')"
        />
      </MobileList>
      <AdminEditionResults
        v-if="status === 'closed' && participants.length"
        :id="id"
        :slug="slug"
        :people="participants"
        :title="
          t('adminEdition.cockpit.resultsTitle', { count: participants.length })
        "
      />
      <AdminExclusions
        :slug="slug"
        :editable="canEdit"
        :archived="
          status === 'closed'
            ? (edition.data.value?.edition.exclusionsAtDraw ?? [])
            : undefined
        "
        :title="t('adminEdition.cockpit.exclusionsTitle')"
        :footer="
          check.data.value?.historyExclusions
            ? t('adminEdition.cockpit.pendingExclusions', {
                count: check.data.value.historyExclusions,
              })
            : undefined
        "
      />
      <MobileList
        v-if="canEdit && check.data.value?.previousPairs.length"
        :title="t('adminEdition.cockpit.previousDraws')"
        :footer="t('adminEdition.cockpit.previousDrawsFooter')"
      >
        <MobileListItem
          v-for="pair in check.data.value.previousPairs"
          :key="`${pair.editionLabel}-${pair.giverId}`"
          :title="`${firstNameOf(pair.giverId)} → ${firstNameOf(pair.receiverId)}`"
          :subtitle="pair.editionLabel"
          :chevron="false"
        >
          <template #trailing>
            <div
              v-if="confirmWaiver === pairKey(pair)"
              class="flex shrink-0 items-center gap-1"
            >
              <UButton
                size="sm"
                :label="t('adminEdition.cockpit.waive')"
                :loading="waive.isPending.value"
                @click.stop="onWaive(pair)"
              />
              <UButton
                size="sm"
                variant="ghost"
                color="neutral"
                :label="t('common.actions.cancel')"
                @click.stop="confirmWaiver = null"
              />
            </div>
            <UButton
              v-else
              variant="ghost"
              color="neutral"
              icon="i-lucide-x"
              :aria-label="
                t('adminEdition.cockpit.waiveLabel', {
                  giver: firstNameOf(pair.giverId),
                  receiver: firstNameOf(pair.receiverId),
                })
              "
              @click.stop="confirmWaiver = pairKey(pair)"
            />
          </template>
          <template #leading>
            <span class="flex shrink-0 items-center" aria-hidden="true">
              <AdminAvatar
                v-if="personOf(pair.giverId)"
                :avatar="personOf(pair.giverId)!.avatar"
                size="sm"
                class="outline-2 outline-white"
              />
              <AdminAvatar
                v-if="personOf(pair.receiverId)"
                :avatar="personOf(pair.receiverId)!.avatar"
                size="sm"
                class="-ml-3 outline-2 outline-white"
              />
            </span>
          </template>
        </MobileListItem>
      </MobileList>
      <div
        v-if="canEdit && check.data.value?.waivedCount"
        class="-mt-4 flex items-center justify-between gap-2 px-1 text-xs text-muted"
      >
        <span>
          {{
            t('adminEdition.cockpit.waived', {
              count: check.data.value.waivedCount,
            })
          }}
        </span>
        <UButton
          size="xs"
          variant="link"
          :label="t('adminEdition.cockpit.restoreAll')"
          :loading="clearWaivers.isPending.value"
          @click="clearWaivers.mutate(undefined, { onError })"
        />
      </div>
    </AdminQueryState>
  </AdminScreen>
</template>
