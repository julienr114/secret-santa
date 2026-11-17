<script setup lang="ts">
import type { AnswerChoice } from '~/composables/queries/usePersonal';

// Saying who one gives to, for a draw made elsewhere (README 22.12,
// maquettes ManuelTirageChoisir and ManuelTirageConfirmer): everyone but
// oneself, a search past ten, then a sheet to confirm. Opened on the
// current answer, it starts on the confirmation, to see or change it.
// No message ever says an answer clashes with someone else's.
const props = defineProps<{
  choices: AnswerChoice[];
  saving: boolean;
}>();
/** Which sheet is open: the list, the confirmation, or none. */
const step = defineModel<'choose' | 'confirm' | null>('step', {
  required: true,
});
/** The person shown on the confirmation. */
const chosen = defineModel<AnswerChoice | null>('chosen', { required: true });
const emit = defineEmits<{ confirm: [personId: string] }>();
const { t } = useT();
const busy = useBusy(() => props.saving);

const pickerOpen = computed({
  get: () => step.value === 'choose',
  set: (open: boolean) => {
    if (!open && step.value === 'choose') step.value = null;
  },
});
const confirmOpen = computed({
  get: () => step.value === 'confirm',
  set: (open: boolean) => {
    if (!open && step.value === 'confirm') step.value = null;
  },
});
const selected = computed({
  get: () => chosen.value?.id ?? null,
  set: (id: string | null) => {
    const person = props.choices.find((c) => c.id === id);
    if (!person) return;
    chosen.value = person;
    step.value = 'confirm';
  },
});
</script>

<template>
  <UiPersonPicker
    v-model:open="pickerOpen"
    v-model:selected="selected"
    :title="t('participant.answer.choose.title')"
    :description="t('participant.answer.choose.description')"
    :people="choices"
    :search-label="t('participant.answer.choose.search')"
    :clear-label="t('adminEdition.screen.lists.clear')"
    :results-text="
      (shown, total) => t('participant.answer.choose.results', { shown, total })
    "
  />
  <UiSheet
    v-if="chosen"
    v-model:open="confirmOpen"
    :title="t('participant.answer.confirm.title', { name: chosen.name })"
    :busy="saving"
  >
    <template #header>
      <div class="flex flex-col items-start gap-4 pt-2">
        <UiAvatar :avatar="chosen.avatar" size="xl" class="self-center" />
        <div class="flex flex-col gap-1">
          <h2 class="font-display text-[22px] leading-[1.15] font-bold">
            {{ t('participant.answer.confirm.title', { name: chosen.name }) }}
          </h2>
          <p class="text-sm text-toned">
            {{ t('participant.answer.confirm.description') }}
          </p>
        </div>
      </div>
    </template>
    <p class="py-2 text-sm leading-[1.5] text-toned">
      {{ t('participant.answer.confirm.note') }}
    </p>
    <template #footer>
      <UButton
        block
        class="h-13 justify-center text-[17px] font-bold"
        :disabled="saving"
        :loading="busy"
        :label="t('participant.answer.confirm.yes', { name: chosen.name })"
        data-testid="answer-confirm"
        @click="emit('confirm', chosen.id)"
      />
      <UButton
        block
        variant="ghost"
        color="neutral"
        class="h-[46px] justify-center font-semibold"
        :disabled="saving"
        :label="t('participant.answer.confirm.other')"
        @click="step = 'choose'"
      />
    </template>
  </UiSheet>
</template>
