<script setup lang="ts">
import { fullName } from '#server/utils/people';
import type { Participant } from '#server/database/editions';
import {
  followSeries,
  participantCounters,
  sortParticipants,
  type FollowState,
} from '#server/utils/editions';
import { FOLD_FROM, foldList, listView, type Fold } from '#shared/utils/lists';

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
const { lookOf: stateOf } = useFollowLook();
// Past ten people, a search; past twelve, each series shows three rows,
// then a row that unfolds the rest of it and says where they stand.
const SEARCH_FROM = 10;
const SERIES_SHOWN = 3;
const query = ref('');
const searchable = computed(() => props.participants.length > SEARCH_FROM);
/** The series unfolded with "Voir les N autres". */
const unfolded = ref<FollowState[]>([]);
/** One part of the list: a series (or the search results) and its fold. */
type Part = { state: FollowState | null; fold: Fold<Participant> };
const parts = computed<Part[]>(() => {
  if (query.value.trim()) {
    return [
      {
        state: null,
        fold: listView(sorted.value, {
          query: query.value,
          expanded: false,
          shown: 0,
          nameOf: fullName,
        }),
      },
    ];
  }
  const folds = props.participants.length > FOLD_FROM;
  return followSeries(props.participants).map((series) => ({
    state: series.state,
    fold: folds
      ? foldList(
          series.items,
          SERIES_SHOWN,
          unfolded.value.includes(series.state),
          SERIES_SHOWN,
        )
      : { shown: series.items, unfolded: [], rest: [] },
  }));
});
const empty = computed(() =>
  parts.value.every((part) => !part.fold.shown.length),
);
/**
 * Unfolds a series, or folds it again.
 * @param state - The series.
 * @param open - True to unfold it, false to fold it.
 * @returns Nothing.
 */
const unfold = (state: FollowState, open: boolean) => {
  unfolded.value = open
    ? [...unfolded.value, state]
    : unfolded.value.filter((s) => s !== state);
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
        size="xl"
        class="min-h-14 justify-center font-bold"
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
        size="xl"
        class="min-h-14 justify-center font-bold"
        icon="i-lucide-mail"
        :to="`${base}/emails?type=${allNotified ? 'reminder' : 'drawn'}`"
        :label="
          allNotified
            ? t('adminEdition.screen.follow.actionReminder')
            : t('adminEdition.screen.notifyCount', { count: counts.toNotify })
        "
      />
    </template>
  </UiActionCard>

  <section class="flex flex-col gap-1.5" data-testid="participants">
    <UiSectionTitle>{{
      t('common.count.participants', { count: participants.length })
    }}</UiSectionTitle>
    <UiSearchField
      v-if="searchable"
      v-model="query"
      class="mb-1.5"
      :label="t('adminEdition.screen.lists.search')"
      :clear-label="t('adminEdition.screen.lists.clear')"
    />
    <UiList :footer="t('adminEdition.screen.follow.firstFootnote')">
      <li v-if="empty" class="px-4 py-3 text-sm text-muted">
        {{ t('adminEdition.screen.lists.noMatch') }}
      </li>
      <UiFoldedRows
        v-for="part in parts"
        :key="part.state ?? 'search'"
        :fold="part.fold"
        :key-of="(p) => p.participationId"
        :avatar-of="(p) => p.avatar"
        :more-label="(count) => t('adminEdition.screen.lists.more', { count })"
        :collapse-label="t('adminEdition.screen.lists.collapse')"
        :detail="
          part.state
            ? t(`adminEdition.screen.lists.series.${part.state}`)
            : undefined
        "
        @more="part.state && unfold(part.state, true)"
        @collapse="part.state && unfold(part.state, false)"
      >
        <template #row="{ item: p }">
          <UiListItem
            :avatar="p.avatar"
            :on-click="() => emit('send', p.participationId)"
            :label="
              p.messageSentAt
                ? t('adminEdition.cockpit.resendLinkOf', { name: fullName(p) })
                : t('adminEdition.cockpit.sendLinkOf', { name: fullName(p) })
            "
            :title="fullName(p)"
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
              <span
                class="flex size-11 shrink-0 items-center justify-center rounded-full"
                :class="
                  p.messageSentAt
                    ? 'text-muted ring-1 ring-default'
                    : 'bg-primary-soft text-primary'
                "
                aria-hidden="true"
              >
                <UIcon name="i-lucide-send" class="size-5" />
              </span>
            </template>
          </UiListItem>
        </template>
      </UiFoldedRows>
    </UiList>
  </section>

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
