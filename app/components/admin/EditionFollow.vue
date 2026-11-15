<script setup lang="ts">
import type { Participant } from '#server/database/editions';
import {
  followState,
  participantCounters,
  sortParticipants,
  type FollowState,
} from '#server/utils/editions';

// After the draw: what to do now (let everyone know, or close once the
// party is over), the participants in one list from the least done, each
// with a round button to send or send again, then what can be done later.
const props = defineProps<{
  slug: string;
  editionId: string;
  participants: Participant[];
  /** The party is over: closing becomes the action of the moment. */
  canClose: boolean;
  /** The day of the party, written out; null when unknown. */
  dateText: string | null;
  closing: boolean;
}>();
const emit = defineEmits<{ send: [participationId: string]; close: [] }>();
const { t } = useT();

const base = computed(() => `/admin/${props.slug}/editions/${props.editionId}`);
const sorted = computed(() => sortParticipants(props.participants, 'drawn'));
const counts = computed(() => participantCounters(props.participants));
const allNotified = computed(() => counts.value.toNotify === 0);
const counters = computed(() => [
  {
    value: counts.value.toNotify,
    label: t('adminEdition.screen.follow.toNotify'),
    tone: 'primary' as const,
  },
  {
    value: counts.value.notOpened,
    label: t('adminEdition.screen.follow.notOpened', {
      count: counts.value.notOpened,
    }),
    tone: 'warning' as const,
  },
  {
    value: counts.value.viewed,
    label: t('adminEdition.screen.follow.viewed', {
      count: counts.value.viewed,
    }),
    tone: 'success' as const,
  },
]);
/** Icon and colour of each state, then its words. */
const STATES: Record<FollowState, { icon: string; tone: string }> = {
  toNotify: { icon: 'i-lucide-circle-dashed', tone: 'text-muted' },
  notOpened: { icon: 'i-lucide-clock', tone: 'text-warning-ink' },
  viewed: { icon: 'i-lucide-check', tone: 'text-success' },
};
/**
 * Where a participant stands, as an icon, a colour and words.
 * @param p - The participant.
 * @returns The icon, its tone class and the text of the state.
 */
const stateOf = (p: Participant) => {
  const state = followState(p);
  return {
    ...STATES[state],
    text:
      state === 'viewed'
        ? t('adminEdition.screen.follow.state.viewed', { count: p.viewCount })
        : t(`adminEdition.screen.follow.state.${state}`),
  };
};
// Closing asks for a second tap. Without a real date nothing says it is
// too early: the row of the list closes too (README 21.3).
const confirming = ref(false);
const confirmingRow = ref(false);
</script>

<template>
  <UiActionCard
    v-if="canClose"
    :eyebrow="t('adminEdition.screen.now')"
    :title="t('adminEdition.screen.follow.partyTitle')"
    :help="t('adminEdition.screen.follow.partyHelp')"
    data-testid="action-card"
  >
    <UiCounters :items="counters" />
    <template #action>
      <UButton
        v-if="!confirming"
        block
        icon="i-lucide-archive"
        :label="t('adminEdition.screen.follow.closeRow')"
        @click="confirming = true"
      />
      <div v-else class="flex flex-col gap-2">
        <p class="text-sm">
          {{ t('adminEdition.screen.follow.closeConfirm') }}
        </p>
        <div class="grid grid-cols-2 gap-2">
          <UButton
            block
            variant="soft"
            color="neutral"
            :label="t('common.actions.cancel')"
            @click="confirming = false"
          />
          <UButton
            block
            :loading="closing"
            :label="t('adminEdition.screen.follow.closeRow')"
            @click="emit('close')"
          />
        </div>
      </div>
    </template>
  </UiActionCard>
  <UiActionCard
    v-else
    :eyebrow="t('adminEdition.screen.now')"
    :title="
      allNotified
        ? t('adminEdition.screen.follow.titleDone')
        : t('adminEdition.screen.follow.title')
    "
    :help="t('adminEdition.screen.follow.help')"
    data-testid="action-card"
  >
    <UiCounters :items="counters" />
    <template #action>
      <UButton
        block
        icon="i-lucide-mail"
        :to="`${base}/emails?type=${allNotified ? 'reminder' : 'drawn'}`"
        :label="
          allNotified
            ? t('adminEdition.screen.follow.actionReminder')
            : t('adminEdition.screen.follow.action')
        "
      />
    </template>
  </UiActionCard>

  <UiList
    :title="t('common.count.participants', { count: participants.length })"
    :footer="t('adminEdition.screen.follow.firstFootnote')"
    data-testid="participants"
  >
    <UiListItem
      v-for="p in sorted"
      :key="p.participationId"
      :avatar="p.avatar"
      :to="`${base}/participants/${p.participationId}`"
      :title="p.firstName"
      :chevron="false"
    >
      <template #subtitle>
        <UIcon
          :name="stateOf(p).icon"
          class="size-3.5 shrink-0"
          :class="stateOf(p).tone"
        />
        <span class="truncate" :class="stateOf(p).tone">{{
          stateOf(p).text
        }}</span>
      </template>
      <template #trailing>
        <UButton
          size="lg"
          class="size-11 shrink-0 justify-center rounded-full"
          icon="i-lucide-send"
          :color="p.messageSentAt ? 'neutral' : 'primary'"
          :variant="p.messageSentAt ? 'outline' : 'soft'"
          :aria-label="
            p.messageSentAt
              ? t('adminEdition.cockpit.resendLinkOf', { name: p.firstName })
              : t('adminEdition.cockpit.sendLinkOf', { name: p.firstName })
          "
          @click.prevent.stop="emit('send', p.participationId)"
        />
      </template>
    </UiListItem>
  </UiList>

  <UiList
    :title="t('adminEdition.screen.follow.later')"
    :footer="t('adminEdition.screen.follow.noResults')"
  >
    <UiListItem
      v-if="!canClose && dateText"
      icon="i-lucide-archive"
      :title="t('adminEdition.screen.follow.closeRow')"
      :subtitle="
        t('adminEdition.screen.follow.closeRowLater', { date: dateText })
      "
      :chevron="false"
      class="opacity-60"
    />
    <UiListItem
      v-else-if="!dateText && !confirmingRow"
      icon="i-lucide-archive"
      :title="t('adminEdition.screen.follow.closeRow')"
      :subtitle="t('adminEdition.screen.follow.closeRowHint')"
      :on-click="() => (confirmingRow = true)"
    />
    <li v-else-if="!dateText" class="flex flex-col gap-2 px-4 py-3">
      <p class="text-sm">{{ t('adminEdition.screen.follow.closeConfirm') }}</p>
      <div class="flex gap-2">
        <UButton
          :loading="closing"
          :label="t('adminEdition.screen.follow.closeRow')"
          @click="emit('close')"
        />
        <UButton
          variant="ghost"
          color="neutral"
          :label="t('common.actions.cancel')"
          @click="confirmingRow = false"
        />
      </div>
    </li>
    <UiListItem
      :to="`${base}/voir-le-tirage`"
      icon="i-lucide-eye"
      :title="t('adminEdition.screen.follow.revealOne')"
      :subtitle="t('adminEdition.screen.follow.revealOneHint')"
    />
    <UiListItem
      :to="`${base}/annuler`"
      icon="i-lucide-rotate-ccw"
      tone="danger"
      :title="t('adminEdition.screen.follow.cancel')"
      :subtitle="t('adminEdition.screen.follow.cancelHint')"
    />
  </UiList>
</template>
