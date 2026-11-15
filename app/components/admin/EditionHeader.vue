<script setup lang="ts">
// Top of the edition screen: its name, the group and the budget, then
// the day of the party as a pill that opens the date sheet. Without a
// real date there is no pill: the screen asks for one instead.
defineProps<{
  title: string;
  subtitle: string;
  /** The day of the party, written out; null when unknown. */
  dateText: string | null;
}>();
const emit = defineEmits<{ editDate: [] }>();
const { t } = useT();
</script>

<template>
  <div class="flex flex-col items-start gap-3">
    <div class="flex flex-col gap-1">
      <UiPageTitle>{{ title }}</UiPageTitle>
      <p v-if="subtitle" class="text-[15px] text-muted">{{ subtitle }}</p>
    </div>
    <button
      v-if="dateText"
      type="button"
      class="inline-flex min-h-11 items-center gap-2 rounded-full bg-default px-4 text-[15px] font-semibold ring-1 ring-default transition-colors active:bg-muted"
      :aria-label="t('adminEdition.screen.changeDate', { date: dateText })"
      data-testid="party-date"
      @click="emit('editDate')"
    >
      <UIcon name="i-lucide-calendar" class="size-4 text-primary" />
      {{ t('adminEdition.screen.partyOn', { date: dateText }) }}
      <UIcon name="i-lucide-pencil" class="size-3.5 text-muted" />
    </button>
  </div>
</template>
