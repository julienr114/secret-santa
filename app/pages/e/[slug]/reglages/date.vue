<script setup lang="ts">
import {
  birthParts,
  dateOf,
  partyYears,
  type BirthParts,
} from '#shared/utils/memberFields';
import {
  usePartyQuery,
  useUpdatePartyMutation,
} from '~/composables/queries/useParty';

// The date of the event, from its settings (ticket 160): one field, the
// date in full under it, on a page of its own since a sheet never
// carries a field (regles-d-ecran.md). « Valider » saves it and goes
// back; « Retour » gives it up.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t } = useT();
const route = useRoute();
const toast = useMessages();
const errorMessage = useErrorMessage();
const goBack = useGoBack();
const slug = computed(() => String(route.params.slug));
const settings = computed(() => `/e/${slug.value}/reglages`);
const context = useScreenContext(slug);
useHead({ title: () => context.titleOf(t('party.reglages.date')) });
const screen = computed(() => ({ back: settings.value }));
const parts = computed(() => [
  ...context.parts.value,
  { label: t('party.reglages.short'), to: settings.value },
]);
const party = usePartyQuery(slug);
const update = useUpdatePartyMutation(slug);
// Not in the past (Julien, 25 November 2026).
const today = new Date().toLocaleDateString('sv-SE');
const years = partyYears(Number(new Date().toISOString().slice(0, 4)));
const date = ref<BirthParts>({ day: null, month: null, year: null });
const filled = ref(false);
watch(
  () => party.data.value?.year?.date,
  (value) => {
    if (filled.value || value === undefined) return;
    date.value = birthParts(value ?? null);
    filled.value = true;
  },
  { immediate: true },
);
/** Saves the date and goes back. */
const onValidate = () => {
  const iso = dateOf(date.value);
  if (!iso) return;
  update.mutate(
    { date: iso },
    {
      onSuccess: () => goBack(settings.value),
      onError: (error) => toast.failed(errorMessage(error)),
    },
  );
};
</script>

<template>
  <AdminScreen v-bind="screen">
    <AdminQueryState
      :pending="party.isPending.value"
      :error="party.error.value"
      :skeleton="['title', 'card']"
    >
      <div class="flex flex-col gap-1">
        <UiPageContext :parts="parts" :label="t('common.context')" />
        <UiPageTitle>{{ t('party.reglages.date') }}</UiPageTitle>
      </div>
      <UiDateField
        v-if="filled"
        v-model="date"
        :years="years"
        weekday
        :since="today"
        :label="t('party.reglages.date')"
        testid="party-date"
      />
      <UiStickyFooter inline>
        <UButton
          block
          size="xl"
          class="h-13 justify-center text-[17px] font-bold"
          :disabled="!dateOf(date) || update.isPending.value"
          :loading="update.isPending.value"
          :label="t('common.actions.validate')"
          data-testid="party-date-validate"
          @click="onValidate"
        />
      </UiStickyFooter>
    </AdminQueryState>
  </AdminScreen>
</template>
