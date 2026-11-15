<script setup lang="ts">
import { daysUntil, formatEventDate, isIsoDay } from '#server/utils/rules';
import { useUpdateEditionMutation } from '~/composables/queries/useGroup';

// "Date de la fête", changed from the edition: a calendar, the day and
// how far it is, what it changes, then "Valider" or "Annuler". The change
// is written in the group journal by the server.
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

const draft = ref('');
watch(open, (isOpen) => {
  if (isOpen) draft.value = isIsoDay(props.value) ? props.value : '';
});
const suggestion = computed(() => `${new Date().getFullYear()}-12-25`);
// "Vendredi 25 décembre 2026 · dans 40 jours".
const helper = computed(() => {
  if (!isIsoDay(draft.value)) return '';
  const day = new Intl.DateTimeFormat(locale.value, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${draft.value}T12:00:00Z`));
  const days = daysUntil(draft.value, new Date().toLocaleDateString('sv-SE'));
  const when =
    days === null
      ? null
      : new Intl.RelativeTimeFormat(locale.value, { numeric: 'auto' }).format(
          days,
          'day',
        );
  return [day.charAt(0).toUpperCase() + day.slice(1), when]
    .filter(Boolean)
    .join(' · ');
});
const onValidate = () =>
  update.mutate(
    { id: props.editionId, eventDate: draft.value },
    {
      onSuccess: () => {
        open.value = false;
        toast.add({
          title: t('adminEdition.screen.dateSheet.saved'),
          description: formatEventDate(draft.value, locale.value),
          color: 'success',
          icon: 'i-lucide-check',
        });
      },
    },
  );
</script>

<template>
  <UiSheet
    v-model:open="open"
    :title="t('adminEdition.screen.dateSheet.title')"
    :description="t('adminEdition.screen.dateSheet.description')"
  >
    <div class="flex flex-col gap-4 py-2" data-testid="date-sheet">
      <UFormField
        :label="t('adminEdition.newEdition.dateLabel')"
        :help="helper || undefined"
      >
        <AdminDateField v-model="draft" :suggestion="suggestion" />
      </UFormField>
      <ul class="flex list-disc flex-col gap-1 pl-5 text-sm text-muted">
        <li>{{ t('adminEdition.screen.dateSheet.seen') }}</li>
        <li>{{ t('adminEdition.screen.dateSheet.journal') }}</li>
      </ul>
      <UAlert
        v-if="update.isError.value"
        color="error"
        variant="subtle"
        :description="errorMessage(update.error.value)"
      />
    </div>
    <template #footer>
      <UButton
        block
        :disabled="!draft"
        :loading="update.isPending.value"
        :label="t('adminEdition.screen.dateSheet.validate')"
        @click="onValidate"
      />
      <UButton
        block
        variant="ghost"
        color="neutral"
        :label="t('adminEdition.screen.dateSheet.cancel')"
        @click="open = false"
      />
    </template>
  </UiSheet>
</template>
