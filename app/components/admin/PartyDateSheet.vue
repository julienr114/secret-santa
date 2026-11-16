<script setup lang="ts">
import { formatEventDate } from '#server/utils/rules';
import { useUpdateEditionMutation } from '~/composables/queries/useGroup';

// "Date de la fête", changed from the edition: the date sheet, with what
// the change does. The server writes it in the group journal.
const props = defineProps<{
  slug: string;
  editionId: string;
  /** The current day of the party (ISO), or empty. */
  value: string;
}>();
const open = defineModel<boolean>('open', { required: true });
const { t, locale } = useT();
const errorMessage = useErrorMessage();
const toast = useToast();
const update = useUpdateEditionMutation(() => props.slug);
const suggestion = computed(() => `${new Date().getFullYear()}-12-25`);
const error = computed(() =>
  update.isError.value ? errorMessage(update.error.value) : null,
);
/**
 * Saves the day chosen, then closes the sheet with a toast.
 * @param eventDate - The day chosen (ISO).
 * @returns Nothing: the mutation reports by itself.
 */
const onValidate = (eventDate: string) =>
  update.mutate(
    { id: props.editionId, eventDate },
    {
      onSuccess: () => {
        open.value = false;
        toast.add({
          title: t('adminEdition.screen.dateSheet.saved'),
          description: formatEventDate(eventDate, locale.value),
          color: 'success',
          icon: 'i-lucide-check',
        });
      },
    },
  );
</script>

<template>
  <AdminDateSheet
    v-model:open="open"
    :title="t('adminEdition.screen.dateSheet.title')"
    :description="t('adminEdition.screen.dateSheet.description')"
    :label="t('adminEdition.newEdition.dateLabel')"
    :value="value"
    :suggestion="suggestion"
    :error="error"
    :loading="update.isPending.value"
    @validate="onValidate"
  >
    <ul
      class="flex list-disc flex-col gap-1 pl-5 text-sm text-muted"
      data-testid="date-sheet"
    >
      <li>{{ t('adminEdition.screen.dateSheet.seen') }}</li>
      <li>{{ t('adminEdition.screen.dateSheet.journal') }}</li>
    </ul>
  </AdminDateSheet>
</template>
