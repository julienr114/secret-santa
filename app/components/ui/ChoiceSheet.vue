<script setup lang="ts" generic="T extends string | number">
// One value among a few, in a settings sheet: each choice on its row,
// with a word of help when it needs one. The choice is only kept with
// "Valider".

import type { Choice } from './ChoiceList.vue';
const props = defineProps<{
  title: string;
  description?: string;
  choices: Choice<T>[];
  /** The value saved now. */
  value: T;
  validateLabel: string;
  cancelLabel: string;
  error?: string | null;
  loading?: boolean;
}>();
const open = defineModel<boolean>('open', { required: true });
const emit = defineEmits<{ validate: [value: T] }>();
const draft = ref(props.value) as Ref<T>;
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
    @validate="emit('validate', draft)"
  >
    <UiChoiceList v-model="draft" :choices="choices" :label="title" />
  </UiSettingSheet>
</template>
