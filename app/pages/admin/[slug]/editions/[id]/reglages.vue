<script setup lang="ts">
import { formatEventDate } from '#server/utils/rules';
import { usePartyQuery } from '~/composables/queries/useParty';
import { useUpdateEditionMutation } from '~/composables/queries/useGroup';

// The settings of a Secret Santa (docs/spec/v3/secret-santa.md, « Ses
// réglages », V3TirageReglages), its own and no longer the party's: first
// what the creation form chose, in its order (« Nom », « Date »,
// « Budget », « Petit mot pour les participants », Q-015), then the draw
// (« Éviter la même personne »), « Devine qui », the word added to the
// messages, the emails to me (« Quelqu'un s'inscrit par le lien », ticket
// 116, then the others). Each saved at once, in its sheet, with its
// switch or on its own page. Once the Secret Santa is closed, read only;
// the game no longer changes once the draw is revealed. At the bottom,
// while it is not drawn, « Supprimer ce Secret Santa » (ticket 108).
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const id = computed(() => String(route.params.id));
const { t, locale } = useT();
const party = usePartyQuery(slug);
const { edition, shown, save, saving } = useEditionRuleSaver(slug, id);
const closed = computed(() => edition.data.value?.edition.status === 'closed');
const year = computed(() => edition.data.value?.edition.year ?? '');
const parts = computed(() => [
  {
    label: party.data.value?.party.name ?? '',
    to: `/e/${slug.value}`,
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

const rename = useUpdateEditionMutation(slug);
const name = computed(() => edition.data.value?.edition.label ?? '');
/**
 * Saves the name written on its row (ticket 162); the row says the
 * error, if any, under itself.
 * @param label - The name written.
 * @returns Once saved.
 */
const onRename = (label: string) => rename.mutateAsync({ id: id.value, label });
const guess = computed(() => edition.data.value?.guess);
const gameFixed = computed(
  () => closed.value || Boolean(edition.data.value?.edition.revealedAt),
);
const guessOpen = ref(false);
/** Not drawn yet: it may still be deleted (Q-008). */
const deletable = computed(
  () =>
    edition.data.value?.edition.status === 'preparing' &&
    !edition.data.value.edition.drawnAt,
);
const deleting = ref(false);

const editing = ref<null | 'years'>(null);
const sheet = (which: 'years') =>
  computed({
    get: () => editing.value === which,
    set: (value) => {
      editing.value = value ? which : null;
    },
  });
const yearsOpen = sheet('years');

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
    <AdminQueryState
      :pending="edition.isPending.value"
      :error="edition.error.value"
      :skeleton="['title', 'settings', 'settings', 'settings']"
      :rows="2"
    >
      <div class="flex flex-col gap-1">
        <UiPageContext :parts="parts" :label="t('common.context')" />
        <UiPageTitle>{{ t('party.secretSanta.settings') }}</UiPageTitle>
      </div>

      <UiList
        :title="t('party.secretSantaTitle', { count: 1 })"
        data-testid="edition-settings"
      >
        <UiInlineTextRow
          :label="t('adminEdition.newEdition.nameRow')"
          :value="name"
          required
          :maxlength="60"
          :disabled="closed"
          :save="onRename"
          data-testid="setting-name"
        />
        <UiListItem
          :title="t('adminEdition.newEdition.dateLabel')"
          :value="
            eventDate
              ? formatEventDate(eventDate, locale)
              : t('adminEdition.newEdition.dateToChoose')
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
      </UiList>

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
          :checked="shown.notifyJoined ?? true"
          :title="t('party.secretSanta.joined')"
          :busy="saving('notifyJoined')"
          @update:checked="(on) => save({ notifyJoined: on })"
        />
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

      <UiList v-if="deletable">
        <UiListItem
          icon="i-lucide-trash-2"
          tone="danger"
          :title="t('adminEdition.delete.row')"
          :on-click="() => (deleting = true)"
          data-testid="delete-secret-santa"
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
    <AdminPartyDateSheet
      v-if="!closed"
      v-model:open="dateOpen"
      :slug="slug"
      :edition-id="id"
      :value="eventDate"
    />
    <AdminDeleteSecretSantaSheet
      v-if="deletable && edition.data.value"
      v-model:open="deleting"
      :slug="slug"
      :edition-id="id"
      :label="edition.data.value.edition.label"
      :participants="edition.data.value.participants.length"
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
