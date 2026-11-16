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
    <UFormField :label="label" :ui="{ label: 'text-[15px] font-semibold' }">
      <UTextarea
        v-model="draft"
        :maxlength="maxlength"
        :placeholder="placeholder"
        :rows="3"
        autoresize
        size="xl"
        class="w-full"
      />
    </UFormField>
    <div class="-mt-2 flex justify-between gap-3 text-[13px] text-toned">
      <span>{{ hint }}</span>
      <span class="shrink-0 tabular-nums" aria-hidden="true"
        >{{ draft.length }} / {{ maxlength }}</span
      >
    </div>
    <slot />
  </UiSettingSheet>
</template>
