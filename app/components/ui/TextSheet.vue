<script setup lang="ts">
// A text in a settings sheet: the field, a word of help, how many
// characters are left, then whatever else the setting needs (the slot).
// The text is only kept with "Valider".
const props = defineProps<{
  title: string;
  description?: string;
  /** The name of the field. */
  label: string;
  /** The text saved now. */
  value: string;
  maxlength: number;
  hint?: string;
  placeholder?: string;
  validateLabel: string;
  cancelLabel: string;
  error?: string | null;
  loading?: boolean;
}>();
const open = defineModel<boolean>('open', { required: true });
const emit = defineEmits<{ validate: [value: string] }>();
const draft = ref(props.value);
watch(open, (isOpen) => {
  if (isOpen) draft.value = props.value;
});
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
    @validate="emit('validate', draft.trim())"
  >
    <UFormField :label="label" :help="hint">
      <UTextarea
        v-model="draft"
        :maxlength="maxlength"
        :placeholder="placeholder"
        :rows="3"
        autoresize
        class="w-full"
      />
      <template #hint>
        <span class="tabular-nums" aria-hidden="true"
          >{{ draft.length }} / {{ maxlength }}</span
        >
      </template>
    </UFormField>
    <slot />
  </UiSettingSheet>
</template>
