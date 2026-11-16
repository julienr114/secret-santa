<script setup lang="ts">
import { daysUntil, isIsoDay } from '#server/utils/rules';

// A day in a settings sheet: the field with its calendar, the day in
// words and how far it is, whatever else the setting says (the slot),
// then "Valider" and "Annuler". With `clearLabel`, the day is optional
// and a link takes it away. The day is only kept with "Valider".
const props = defineProps<{
  title: string;
  description?: string;
  /** The name of the field. */
  label: string;
  /** The day saved now (ISO), or empty. */
  value: string;
  /** A day offered in one tap in the calendar. */
  suggestion?: string;
  /** "Pas de date limite": the day may be left out. */
  clearLabel?: string;
  error?: string | null;
  loading?: boolean;
}>();
const open = defineModel<boolean>('open', { required: true });
const emit = defineEmits<{ validate: [value: string] }>();
const { t, locale } = useT();

const draft = ref('');
watch(open, (isOpen) => {
  if (isOpen) draft.value = isIsoDay(props.value) ? props.value : '';
});
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
</script>

<template>
  <UiSettingSheet
    v-model:open="open"
    :title="title"
    :description="description"
    :validate-label="t('common.actions.validate')"
    :cancel-label="t('common.actions.cancel')"
    :error="error"
    :loading="loading"
    :disabled="!draft && !clearLabel"
    @validate="emit('validate', draft)"
  >
    <UFormField :label="label" :help="helper || undefined">
      <AdminDateField v-model="draft" :suggestion="suggestion" />
    </UFormField>
    <UButton
      v-if="clearLabel && draft"
      variant="link"
      class="min-h-11 self-start px-0"
      :label="clearLabel"
      @click="draft = ''"
    />
    <slot />
  </UiSettingSheet>
</template>
