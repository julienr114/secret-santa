<script setup lang="ts">
import type { ContextPart } from '~/components/ui/PageContext.vue';
import {
  birthParts,
  dateOf,
  partyYears,
  type BirthParts,
} from '#shared/utils/memberFields';

// A date on a page of its own (ticket 160): a sheet never carries a field
// (regles-d-ecran.md). Where it belongs, its title, the date in one field
// with the date in full under it, what the setting says (the slot),
// « Valider » under it; with `clearLabel`, the date may be taken away.
// « Retour » gives it up. The years: this one and the two to come.
const props = defineProps<{
  parts: ContextPart[];
  back: string;
  title: string;
  /** The day saved now (ISO), or nothing. */
  value: string | null | undefined;
  /** Whether the value is read yet. */
  ready: boolean;
  /** « Pas de date »: the date may be left out. */
  clearLabel?: string;
  busy?: boolean;
  error?: string | null;
  testid: string;
}>();
const emit = defineEmits<{ validate: [iso: string | null] }>();
const { t } = useT();
const years = partyYears(Number(new Date().toISOString().slice(0, 4)));
const date = ref<BirthParts>({ day: null, month: null, year: null });
const filled = ref(false);
watch(
  () => [props.ready, props.value] as const,
  ([ready, value]) => {
    if (filled.value || !ready) return;
    date.value = birthParts(value ?? null);
    filled.value = true;
  },
  { immediate: true },
);
</script>

<template>
  <AdminScreen :back="back">
    <div class="flex flex-col gap-1">
      <UiPageContext :parts="parts" :label="t('common.context')" />
      <UiPageTitle>{{ title }}</UiPageTitle>
    </div>
    <template v-if="filled">
      <UiDateField
        v-model="date"
        :years="years"
        weekday
        :label="title"
        :testid="testid"
      />
      <slot />
      <p v-if="error" class="text-sm font-medium text-error" role="alert">
        {{ error }}
      </p>
      <UiStickyFooter inline>
        <UButton
          block
          size="xl"
          class="h-13 justify-center text-[17px] font-bold"
          :disabled="!dateOf(date) || busy"
          :loading="busy"
          :label="t('common.actions.validate')"
          :data-testid="`${testid}-validate`"
          @click="emit('validate', dateOf(date))"
        />
        <UButton
          v-if="clearLabel && value"
          variant="link"
          color="neutral"
          class="min-h-11 self-center font-bold"
          :label="clearLabel"
          :data-testid="`${testid}-clear`"
          @click="emit('validate', null)"
        />
      </UiStickyFooter>
    </template>
  </AdminScreen>
</template>
