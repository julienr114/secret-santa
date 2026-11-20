<script setup lang="ts">
import { GIFT_HINTS_MODES } from '#shared/utils/hints';
import { usePartyQuery } from '~/composables/queries/useParty';

// The settings of the Secret Santa that are still the group's (ticket
// 104): the draw, the participants, the emails of the draw. Each row
// changes in its sheet or with its switch, saved at once, or on its own
// page (the word added to the messages, README 23.3). The settings of the
// party itself are on its own page; these go onto each Secret Santa with
// ticket 105.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t, tk } = useT();
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const context = useScreenContext(slug);
useHead({ title: () => context.titleOf(title.value) });
const screen = computed(() => ({ back: `/f/${slug.value}/reglages` }));
const { rules, shown, save, saving } = useRuleSaver(slug);
const party = usePartyQuery(slug);
const year = computed(() => party.data.value?.secretSantas.at(-1)?.year);
const title = computed(() =>
  year.value
    ? t('party.reglages.secretSantaRow', { year: year.value })
    : t('party.reglages.secretSantaRowNone'),
);

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

/** What participants may note for their giver (README 22.11). */
const hintsChoices = computed(() =>
  GIFT_HINTS_MODES.map((mode) => ({
    value: mode,
    label: tk(`hints.setting.${mode}`),
    hint: tk(`hints.setting.${mode}Help`),
  })),
);

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
const noteValue = computed(() =>
  shown.value.messageNote
    ? `« ${shown.value.messageNote} »`
    : t('adminEdition.invite.noWords'),
);
</script>

<template>
  <AdminScreen v-bind="screen">
    <div class="flex flex-col gap-1">
      <UiPageContext
        :parts="context.parts.value"
        :label="t('common.context')"
      />
      <UiPageTitle>{{ title }}</UiPageTitle>
    </div>
    <AdminQueryState
      :pending="rules.isPending.value"
      :error="rules.error.value"
      :skeleton="['list', 'list']"
      :rows="2"
    >
      <UiList
        :title="t('adminGroup.rules.drawSection')"
        :footer="t('adminGroup.rules.tighter')"
      >
        <UiListItem
          :title="t('adminGroup.rules.excludePreviousYearsShort')"
          :value="yearsValue"
          :busy="saving('excludePreviousYears')"
          :busy-label="t('common.actions.saving')"
          :on-click="() => (editing = 'years')"
        />
      </UiList>

      <UiList :title="t('adminGroup.rules.participantsSection')">
        <UiListItem
          :title="t('hints.setting.title')"
          :subtitle="tk(`hints.setting.${shown.giftHints ?? 'full'}`)"
          :chevron="true"
          :busy="saving('giftHints')"
          :busy-label="t('common.actions.saving')"
          :on-click="() => (editing = 'hints')"
          data-testid="gift-hints-setting"
        />
        <UiListItem
          :title="t('adminGroup.rules.messageNote')"
          :value="noteValue"
          :to="`/f/${slug}/reglages/mot`"
          data-testid="group-note"
        />
      </UiList>

      <UiList
        :title="t('adminGroup.rules.notifySection')"
        :footer="t('adminGroup.rules.notifyHelp')"
        data-testid="notifications"
      >
        <UiListItem
          :checked="shown.notifyAllViewed ?? true"
          :title="t('adminGroup.rules.notifyAllViewed')"
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
  </AdminScreen>
</template>
