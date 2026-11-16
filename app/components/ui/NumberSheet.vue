<script setup lang="ts">
// A number in a settings sheet: minus, the number in large, plus, within
// bounds, and a word of help under it. The number is only kept with
// "Valider".
const props = defineProps<{
  title: string;
  description?: string;
  /** The number saved now. */
  value: number;
  min: number;
  max: number;
  hint?: string;
  decreaseLabel: string;
  increaseLabel: string;
  validateLabel: string;
  cancelLabel: string;
  error?: string | null;
  loading?: boolean;
}>();
const open = defineModel<boolean>('open', { required: true });
const emit = defineEmits<{ validate: [value: number] }>();
const draft = ref(props.value);
watch(open, (isOpen) => {
  if (isOpen) draft.value = props.value;
});
/**
 * Moves the number by one step, within its bounds.
 * @param step - +1 or -1.
 * @returns Nothing.
 */
const move = (step: number) => {
  draft.value = Math.min(props.max, Math.max(props.min, draft.value + step));
};
</script>

<template>
  <UiSettingSheet
    v-model:open="open"
    :title="title"
    :description="description"
    :validate-label="validateLabel"
    :cancel-label="cancelLabel"
    :error="error"
    :loading="loading"
    @validate="emit('validate', draft)"
  >
    <div class="flex items-center justify-center gap-6">
      <UButton
        variant="outline"
        color="neutral"
        icon="i-lucide-minus"
        class="size-12 justify-center rounded-full"
        :disabled="draft <= min"
        :aria-label="decreaseLabel"
        @click="move(-1)"
      />
      <output
        class="w-20 text-center font-display text-5xl font-bold tabular-nums"
        aria-live="polite"
        >{{ draft }}</output
      >
      <UButton
        variant="outline"
        color="neutral"
        icon="i-lucide-plus"
        class="size-12 justify-center rounded-full"
        :disabled="draft >= max"
        :aria-label="increaseLabel"
        @click="move(1)"
      />
    </div>
    <p v-if="hint" class="text-center text-sm text-muted">{{ hint }}</p>
  </UiSettingSheet>
</template>
