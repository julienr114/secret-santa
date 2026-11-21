<script setup lang="ts">
import { formatEventDate } from '#server/utils/rules';
import { GIFT_HINTS_MODES } from '#shared/utils/hints';
import { usePartyQuery } from '~/composables/queries/useParty';

// The settings of a Secret Santa (docs/spec/v3/secret-santa.md, « Ses
// réglages », V3TirageReglages), its own and no longer the party's: the
// draw (« Éviter la même personne »), « Devine qui », the word added to
// the messages, the emails to me. Each saved at once, in its sheet, with
// its switch or on its own page. Below what the mockup shows, until the
// screens that will hold them are drawn: the day, the budget and the word
// of the party, and « Pistes de cadeaux » until ticket 107. Once the
// Secret Santa is closed, read only; the game no longer changes once the
// draw is revealed.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const id = computed(() => String(route.params.id));
const { t, tk, locale } = useT();
const party = usePartyQuery(slug);
const { edition, shown, save, saving } = useEditionRuleSaver(slug, id);
const closed = computed(() => edition.data.value?.edition.status === 'closed');
const year = computed(() => edition.data.value?.edition.year ?? '');
const parts = computed(() => [
  {
    label: party.data.value?.party.name ?? '',
    to: `/f/${slug.value}`,
  },
  {
    label: t('party.secretSanta.context', { year: year.value }),
    to: `/admin/${slug.value}/editions/${id.value}`,
  },
]);
useHead({
  title: () =>
    `${t('party.secretSanta.settings')} — ${parts.value
      .map((part) => part.label)
      .join(' · ')} — ${t('common.appName')}`,
});
const screen = computed(() => ({
  back: `/admin/${slug.value}/editions/${id.value}`,
}));

const eventDate = computed(() => edition.data.value?.rules.eventDate ?? '');
const dateOpen = ref(false);
const guess = computed(() => edition.data.value?.guess);
const gameFixed = computed(
  () => closed.value || Boolean(edition.data.value?.edition.revealedAt),
);
const guessOpen = ref(false);

const editing = ref<null | 'years' | 'hints'>(null);
const sheet = (which: 'years' | 'hints') =>
  computed({
    get: () => editing.value === which,
    set: (value) => {
      editing.value = value ? which : null;
    },
  });
const yearsOpen = sheet('years');
const hintsOpen = sheet('hints');

/** How far back nobody draws the same person again, as a row says it. */
const yearsChoices = computed(() => [
  { value: 0, label: t('adminGroup.rules.previousYears.none') },
  { value: 1, label: t('adminGroup.rules.previousYears.lastYear') },
  {
    value: 2,
    label: t('adminGroup.rules.previousYears.lastYears', { count: 2 }),
  },
  {
    value: 3,
    label: t('adminGroup.rules.previousYears.lastYears', { count: 3 }),
    hint: t('adminGroup.rules.previousYears.tight'),
  },
]);
const yearsValue = computed(() => {
  const years = shown.value.excludePreviousYears ?? 0;
  return years === 0
    ? t('adminGroup.rules.previousYears.noneShort')
    : t('adminGroup.rules.previousYears.short', { count: years });
});
/** What participants may note for their giver, until ticket 107. */
const hintsChoices = computed(() =>
  GIFT_HINTS_MODES.map((mode) => ({
    value: mode,
    label: tk(`hints.setting.${mode}`),
    hint: tk(`hints.setting.${mode}Help`),
  })),
);
const noteValue = computed(() =>
  shown.value.messageNote
    ? `« ${shown.value.messageNote} »`
    : t('adminEdition.invite.noWords'),
);
</script>

<template>
  <AdminScreen v-bind="screen">
    <AdminQueryState
      :pending="edition.isPending.value"
      :error="edition.error.value"
      :skeleton="['title', 'list']"
    >
      <div class="flex flex-col gap-1">
        <UiPageContext :parts="parts" :label="t('common.context')" />
        <UiPageTitle>{{ t('party.secretSanta.settings') }}</UiPageTitle>
      </div>

      <UiList :title="t('party.secretSanta.drawSection')">
        <UiListItem
          :title="t('adminGroup.rules.excludePreviousYearsShort')"
          :value="yearsValue"
          :chevron="!closed"
          :busy="saving('excludePreviousYears')"
          :busy-label="t('common.actions.saving')"
          :on-click="closed ? undefined : () => (editing = 'years')"
          data-testid="setting-previous-years"
        />
      </UiList>

      <UiList v-if="guess" :title="t('adminEdition.guess.title')">
        <UiListItem
          :title="t('party.secretSanta.guessRow')"
          :value="t(`adminEdition.guess.mode.${guess.mode}`)"
          :chevron="!gameFixed"
          :on-click="gameFixed ? undefined : () => (guessOpen = true)"
          data-testid="setting-guess"
        />
      </UiList>

      <UiList :title="t('party.secretSanta.messagesSection')">
        <UiListItem
          :title="t('adminGroup.rules.messageNote')"
          :value="noteValue"
          :to="
            closed ? undefined : `/admin/${slug}/editions/${id}/mot-messages`
          "
          data-testid="group-note"
        />
      </UiList>

      <UiList
        :title="t('adminGroup.rules.notifySection')"
        data-testid="notifications"
      >
        <UiListItem
          :checked="shown.notifyAllViewed ?? true"
          :title="t('party.secretSanta.allViewed')"
          :busy="saving('notifyAllViewed')"
          @update:checked="(on) => save({ notifyAllViewed: on })"
        />
        <UiListItem
          :checked="shown.notifyReminder ?? true"
          :title="t('adminGroup.rules.notifyReminder')"
          :subtitle="t('adminGroup.rules.notifyReminderHelp')"
          :busy="saving('notifyReminder')"
          @update:checked="(on) => save({ notifyReminder: on })"
        />
      </UiList>

      <UiList
        :title="t('adminEdition.settings.party')"
        data-testid="edition-settings"
      >
        <UiListItem
          icon="i-lucide-calendar"
          icon-tone="neutral"
          :title="t('adminEdition.settings.dateTitle')"
          :value="
            eventDate
              ? formatEventDate(eventDate, locale)
              : t('adminEdition.screen.rules.none')
          "
          :chevron="!closed"
          :on-click="closed ? undefined : () => (dateOpen = true)"
          data-testid="setting-date"
        />
        <AdminEditionRuleRows
          :slug="slug"
          :edition-id="id"
          :readonly="closed"
          values
        />
        <UiListItem
          :title="t('hints.setting.title')"
          :value="tk(`hints.setting.${shown.giftHints ?? 'full'}`)"
          :chevron="!closed"
          :busy="saving('giftHints')"
          :busy-label="t('common.actions.saving')"
          :on-click="closed ? undefined : () => (editing = 'hints')"
          data-testid="gift-hints-setting"
        />
      </UiList>
    </AdminQueryState>

    <UiChoiceSheet
      v-model:open="yearsOpen"
      :title="t('adminGroup.rules.excludePreviousYearsShort')"
      :description="t('adminGroup.rules.excludePreviousYearsHelp')"
      :choices="yearsChoices"
      :value="shown.excludePreviousYears ?? 0"
      :validate-label="t('common.actions.validate')"
      :cancel-label="t('common.actions.cancel')"
      @validate="
        (years) => {
          editing = null;
          save({ excludePreviousYears: years });
        }
      "
    />
    <UiChoiceSheet
      v-model:open="hintsOpen"
      :title="t('hints.setting.title')"
      :description="t('hints.setting.help')"
      :choices="hintsChoices"
      :value="shown.giftHints ?? 'full'"
      :validate-label="t('common.actions.validate')"
      :cancel-label="t('common.actions.cancel')"
      @validate="
        (mode) => {
          editing = null;
          save({ giftHints: mode });
        }
      "
    />
    <AdminPartyDateSheet
      v-if="!closed"
      v-model:open="dateOpen"
      :slug="slug"
      :edition-id="id"
      :value="eventDate"
    />
    <AdminGuessSheet
      v-if="guess && !gameFixed && eventDate"
      v-model:open="guessOpen"
      :slug="slug"
      :edition-id="id"
      :guess="guess"
      :event-date="eventDate"
    />
  </AdminScreen>
</template>
