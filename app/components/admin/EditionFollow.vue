<script setup lang="ts">
import { fullName } from '#server/utils/people';
import type {
  EditionParticipant as Participant,
  GuessSummary,
} from '~/composables/queries/useGroup';
import {
  followSeries,
  participantCounters,
  sortParticipants,
  type FollowState,
} from '#server/utils/editions';
import { FOLD_FROM, foldList, listView, type Fold } from '#shared/utils/lists';

// After the draw: what to do now (let everyone know; from the day of the
// party, reveal the results, or close without revealing once it is
// over), the participants in one list from the least done, each with a
// round button to send or send again, then two rows: « Réglages de
// l'édition », a page of its own, and « Un souci ? », a sheet (README
// 22.16).
const props = defineProps<{
  /** The group uses gift hints: else no count of them. */
  hintsOn?: boolean;
  slug: string;
  editionId: string;
  participants: Participant[];
  /** Drawn again after a cancelled draw: « Nouveau tirage » is sent. */
  redrawn: boolean;
  /** The day of the party has come: revealing is the action of the moment. */
  partyReached: boolean;
  /** The party is over: the edition may be closed. */
  canClose: boolean;
  /** The day of the party, written out; null when unknown. */
  dateText: string | null;
  closing: boolean;
  /** « Devine qui » (README 22.17). */
  guess?: GuessSummary;
  /** When the draw was revealed, if it was. */
  revealedAt?: string | null;
  /** The day of the party (ISO), for the game's setting. */
  eventDate?: string;
  /** Where a word added goes: above or below the message (group rule). */
  notePosition?: 'before' | 'after';
}>();
const emit = defineEmits<{
  send: [participationId: string];
  close: [];
  reveal: [];
}>();
const { t } = useT();

const base = computed(() => `/admin/${props.slug}/editions/${props.editionId}`);
const sorted = computed(() => sortParticipants(props.participants, 'drawn'));
const counts = computed(() => participantCounters(props.participants));
/**
 * How many left gift hints (lot 16 bis): a number, never which ones are
 * new nor for whom.
 */
const withHints = computed(
  () => props.participants.filter((p) => p.hasHints).length,
);
const allNotified = computed(() => counts.value.toNotify === 0);
/** The message the email screen opens on. */
const emailType = computed(() => {
  if (allNotified.value) return 'reminder';
  return props.redrawn ? 'redraw' : 'drawn';
});
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
const { lookOf: stateOf, seriesLook } = useFollowLook();
const closingShown = useBusy(() => props.closing);
const closeLabel = computed(() =>
  closingShown.value
    ? t('adminEdition.screen.follow.closing')
    : t('adminEdition.screen.follow.closeRow'),
);
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
// Closing asks for a second tap.
const confirming = ref(false);
// « Devine qui » (README 22.17): its card, and the reminders. Those who
// passed their turn are not reminded (Correction 15).
const gameOn = computed(() => (props.guess?.mode ?? 'none') !== 'none');
const notPlayed = computed(() =>
  props.participants.filter((p) => p.played === false && !p.skipped),
);
const reminderOpen = ref(false);
const guessOpen = ref(false);
/** The palmarès can be watched once the draw is revealed. */
const revealedGame = computed(() => Boolean(props.revealedAt));
/**
 * Closes the reminder, then opens the send sheet of someone without an
 * address.
 * @param participationId - The person.
 * @returns Nothing.
 */
const onShareFromReminder = (participationId: string) => {
  reminderOpen.value = false;
  emit('send', participationId);
};
// What used to be « Plus tard, ou en cas de pépin » (README 22.16): the
// edition's settings on a page of their own, and « Un souci ? » in a sheet.
const troubleOpen = ref(false);
/**
 * Closes « Un souci ? », then opens the sheet that reveals the results
 * before the party.
 * @returns Nothing.
 */
const onRevealEarly = () => {
  troubleOpen.value = false;
  emit('reveal');
};
/** How many opened their result, against everyone: the bar of the card. */
const viewedShare = computed(() =>
  props.participants.length === 0
    ? 0
    : Math.round((counts.value.viewed / props.participants.length) * 100),
);
/** On the day itself the party is not « over » yet. */
const partyTitle = computed(() =>
  props.canClose
    ? t('adminEdition.screen.reveal.cardTitle')
    : t('adminEdition.screen.reveal.cardTitleToday'),
);
</script>

<template>
  <UiActionCard
    v-if="partyReached"
    :eyebrow="t('adminEdition.screen.now')"
    :title="partyTitle"
    :help="t('adminEdition.screen.reveal.wholeGroup')"
    data-testid="action-card"
  >
    <p class="-mt-3 text-sm leading-[1.45] text-toned">
      {{ t('adminEdition.screen.reveal.cardHelp') }}
    </p>
    <div class="flex flex-col gap-1.5">
      <div
        role="progressbar"
        :aria-valuenow="counts.viewed"
        aria-valuemin="0"
        :aria-valuemax="participants.length"
        :aria-label="t('adminEdition.screen.reveal.viewedLabel')"
        class="h-2 overflow-hidden rounded-full bg-track"
      >
        <div
          class="h-full rounded-full bg-success"
          :style="{ width: `${viewedShare}%` }"
        />
      </div>
      <p class="text-[13px] text-toned">
        {{
          t('adminEdition.screen.reveal.viewed', {
            count: counts.viewed,
            total: participants.length,
          })
        }}
      </p>
    </div>
    <template #action>
      <UButton
        block
        size="xl"
        icon="i-lucide-eye"
        class="h-12 justify-center font-bold"
        :ui="{ leadingIcon: 'size-5' }"
        :label="t('adminEdition.screen.reveal.action')"
        @click="emit('reveal')"
      />
      <!-- The answers of the game come with the reveal (README 22.17). -->
      <template v-if="canClose && !gameOn">
        <UButton
          v-if="!confirming"
          block
          variant="ghost"
          class="h-11 justify-center text-[15px] font-semibold text-primary-ink"
          :label="t('adminEdition.screen.reveal.closeWithout')"
          @click="confirming = true"
        />
        <div v-else class="flex flex-col gap-2 pt-1">
          <p class="text-sm">
            {{ t('adminEdition.screen.follow.closeConfirm') }}
          </p>
          <div class="grid grid-cols-2 gap-2">
            <UButton
              block
              variant="soft"
              color="neutral"
              :disabled="closing"
              :label="t('common.actions.cancel')"
              @click="confirming = false"
            />
            <UButton
              block
              :disabled="closing"
              :loading="closingShown"
              :label="closeLabel"
              @click="emit('close')"
            />
          </div>
        </div>
      </template>
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
        class="h-12 justify-center font-bold"
        :ui="{ leadingIcon: 'size-5' }"
        icon="i-lucide-mail"
        :to="`${base}/emails?type=${emailType}`"
        :label="
          allNotified
            ? t('adminEdition.screen.follow.actionReminder')
            : t('adminEdition.screen.notifyCount', { count: counts.toNotify })
        "
      />
    </template>
  </UiActionCard>
  <slot name="after-card" />

  <section class="flex flex-col gap-1.5" data-testid="participants">
    <UiSectionTitle>{{
      t('common.count.participants', { count: participants.length })
    }}</UiSectionTitle>
    <p
      v-if="hintsOn !== false && withHints > 0"
      class="px-1 text-[13px] text-toned"
      data-testid="hints-count"
    >
      {{
        t('hints.state.hintsLeft', {
          count: withHints,
          total: participants.length,
        })
      }}
    </p>
    <UiSearchField
      v-if="searchable"
      v-model="query"
      class="mb-1.5"
      :label="t('adminEdition.screen.lists.search')"
      :clear-label="t('adminEdition.screen.lists.clear')"
    />
    <UiList>
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
        @more="part.state && unfold(part.state, true)"
        @collapse="part.state && unfold(part.state, false)"
      >
        <template v-if="part.state" #detail>
          <UIcon
            :name="seriesLook(part.state).icon"
            class="size-3.5 shrink-0"
            :class="seriesLook(part.state).iconTone"
          />
          <span class="truncate" :class="seriesLook(part.state).tone">{{
            seriesLook(part.state).text
          }}</span>
        </template>
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
                :class="stateOf(p).iconTone"
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
    <p class="px-1 text-[13px] leading-[1.4] text-toned">
      {{ t('adminEdition.screen.follow.listFooter') }}
    </p>
  </section>

  <AdminGameCard
    v-if="guess && gameOn"
    :slug="slug"
    :edition-id="editionId"
    :guess="guess"
    :can-remind="notPlayed.length > 0"
    :revealed="revealedGame"
    @remind="reminderOpen = true"
    @settings="guessOpen = true"
  />
  <AdminGuessSheet
    v-if="guess && gameOn && eventDate"
    v-model:open="guessOpen"
    :slug="slug"
    :edition-id="editionId"
    :guess="guess"
    :event-date="eventDate"
  />
  <AdminGameReminderSheet
    v-if="guess && gameOn"
    v-model:open="reminderOpen"
    :slug="slug"
    :edition-id="editionId"
    :people="notPlayed"
    :guess="guess"
    :note-position="notePosition ?? 'after'"
    @send="onShareFromReminder"
  />

  <div class="flex flex-col gap-3">
    <UiList>
      <AdminEditionSettingsRow :slug="slug" :edition-id="editionId" />
      <UiListItem
        icon="i-lucide-circle-help"
        icon-tone="neutral"
        :title="t('adminEdition.trouble.title')"
        :subtitle="t('adminEdition.trouble.row')"
        :on-click="() => (troubleOpen = true)"
        chevron
        data-testid="trouble-row"
      />
    </UiList>
    <p class="px-1 text-[13px] leading-[1.4] text-toned">
      {{ t('adminEdition.screen.follow.noResults') }}
    </p>
  </div>

  <AdminTroubleSheet
    v-model:open="troubleOpen"
    :slug="slug"
    :edition-id="editionId"
    :can-reveal-early="Boolean(dateText) && !partyReached"
    :can-close-here="!dateText"
    :closing="closing"
    @reveal-early="onRevealEarly"
    @close="emit('close')"
  />
</template>
