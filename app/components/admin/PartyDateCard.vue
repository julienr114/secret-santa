<script setup lang="ts">
import { useUpdateEditionMutation } from '~/composables/queries/useGroup';
import {
  dateOf,
  partyYears,
  type BirthParts,
} from '#shared/utils/memberFields';

// An edition from before the party date was required: the screen asks
// "Quand a lieu la fête ?" until it is given, in one field (ticket 160).
const props = defineProps<{ slug: string; editionId: string }>();
const { t } = useT();
const errorMessage = useErrorMessage();
const update = useUpdateEditionMutation(() => props.slug);
const years = partyYears(new Date().getFullYear());
const date = ref<BirthParts>({ day: null, month: null, year: null });
/**
 * Saves the day given for the party.
 * @returns Nothing: the mutation reports by itself.
 */
const onValidate = () => {
  const eventDate = dateOf(date.value);
  if (eventDate) update.mutate({ id: props.editionId, eventDate });
};
</script>

<template>
  <UiNotice
    variant="warning"
    :title="t('adminEdition.screen.missingDate.title')"
    data-testid="missing-date"
  >
    <p class="text-sm">{{ t('adminEdition.screen.missingDate.body') }}</p>
    <UiDateField
      v-model="date"
      :years="years"
      weekday
      :label="t('adminEdition.newEdition.dateLabel')"
      testid="missing-date-field"
    />
    <UButton
      class="self-start"
      :disabled="!dateOf(date)"
      :loading="update.isPending.value"
      :label="t('adminEdition.screen.missingDate.validate')"
      @click="onValidate"
    />
    <UAlert
      v-if="update.isError.value"
      color="error"
      variant="subtle"
      :description="errorMessage(update.error.value)"
    />
  </UiNotice>
</template>
