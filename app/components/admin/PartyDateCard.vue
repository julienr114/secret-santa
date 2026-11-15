<script setup lang="ts">
import { useUpdateEditionMutation } from '~/composables/queries/useGroup';

// An edition from before the party date was required: the screen asks
// "Quand a lieu la fête ?" until it is given.
const props = defineProps<{ slug: string; editionId: string }>();
const { t } = useT();
const errorMessage = useErrorMessage();
const update = useUpdateEditionMutation(() => props.slug);
const date = ref('');
const suggestion = computed(() => `${new Date().getFullYear()}-12-25`);
const onValidate = () =>
  update.mutate({ id: props.editionId, eventDate: date.value });
</script>

<template>
  <UiNotice
    variant="warning"
    :title="t('adminEdition.screen.missingDate.title')"
    data-testid="missing-date"
  >
    <p class="text-sm">{{ t('adminEdition.screen.missingDate.body') }}</p>
    <UFormField :label="t('adminEdition.newEdition.dateLabel')">
      <div class="flex gap-2">
        <AdminDateField
          v-model="date"
          :suggestion="suggestion"
          class="min-w-0 grow"
        />
        <UButton
          :disabled="!date"
          :loading="update.isPending.value"
          :label="t('adminEdition.screen.missingDate.validate')"
          @click="onValidate"
        />
      </div>
    </UFormField>
    <UAlert
      v-if="update.isError.value"
      color="error"
      variant="subtle"
      :description="errorMessage(update.error.value)"
    />
  </UiNotice>
</template>
