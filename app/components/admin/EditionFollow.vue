<script setup lang="ts">
import type { Participant } from '#server/database/editions';
import {
  followSeries,
  followState,
  participantCounters,
  sortParticipants,
  type FollowState,
} from '#server/utils/editions';
import { FOLD_FROM, foldList, listView } from '#shared/utils/lists';

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
// Past ten people, a search; past twelve, each series shows three rows,
// then a row that unfolds the rest of it and says where they stand.
const SEARCH_FROM = 10;
const SERIES_SHOWN = 3;
const query = ref('');
const searchable = computed(() => props.participants.length > SEARCH_FROM);
const unfolded = ref<FollowState[]>([]);
/** One row of the list: a participant, or the fold of a series. */
type Row =
  | { kind: 'person'; person: Participant }
  | { kind: 'fold'; state: FollowState; rest: Participant[] };
const rows = computed<Row[]>(() => {
  const person = (p: Participant): Row => ({ kind: 'person', person: p });
  if (query.value.trim()) {
    return listView(sorted.value, {
      query: query.value,
      expanded: true,
      shown: 0,
      nameOf: (p) => p.firstName,
    }).shown.map(person);
  }
  const folds = props.participants.length > FOLD_FROM;
  return followSeries(props.participants).flatMap((series) => {
    const fold =
      folds && !unfolded.value.includes(series.state)
        ? foldList(series.items, SERIES_SHOWN, SERIES_SHOWN)
        : { shown: series.items, rest: [] };
    return [
      ...fold.shown.map(person),
      ...(fold.rest.length
        ? [{ kind: 'fold' as const, state: series.state, rest: fold.rest }]
        : []),
    ];
  });
});
/**
 * Unfolds one series of the list.
 * @param state - The series.
 * @returns Nothing.
 */
const unfold = (state: FollowState) => {
  unfolded.value = [...unfolded.value, state];
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
      <li v-if="rows.length === 0" class="px-4 py-3 text-sm text-muted">
        {{ t('adminEdition.screen.lists.noMatch') }}
      </li>
      <template
        v-for="row in rows"
        :key="row.kind === 'person' ? row.person.participationId : row.state"
      >
        <UiFoldRow
          v-if="row.kind === 'fold'"
          :avatars="row.rest.map((p) => p.avatar)"
          :label="
            t('adminEdition.screen.lists.more', { count: row.rest.length })
          "
          :detail="t(`adminEdition.screen.lists.series.${row.state}`)"
          @expand="unfold(row.state)"
        />
        <UiListItem
          v-else
          :avatar="row.person.avatar"
          :to="`${base}/participants/${row.person.participationId}`"
          :title="row.person.firstName"
          :chevron="false"
        >
          <template #subtitle>
            <UIcon
              :name="stateOf(row.person).icon"
              class="size-3.5 shrink-0"
              :class="stateOf(row.person).tone"
            />
            <span class="truncate" :class="stateOf(row.person).tone">{{
              stateOf(row.person).text
            }}</span>
          </template>
          <template #trailing>
            <UButton
              size="lg"
              class="size-11 shrink-0 justify-center rounded-full"
              icon="i-lucide-send"
              :color="row.person.messageSentAt ? 'neutral' : 'primary'"
              :variant="row.person.messageSentAt ? 'outline' : 'soft'"
              :aria-label="
                row.person.messageSentAt
                  ? t('adminEdition.cockpit.resendLinkOf', {
                      name: row.person.firstName,
                    })
                  : t('adminEdition.cockpit.sendLinkOf', {
                      name: row.person.firstName,
                    })
              "
              @click.prevent.stop="emit('send', row.person.participationId)"
            />
          </template>
        </UiListItem>
      </template>
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
