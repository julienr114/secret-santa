<script setup lang="ts" generic="T extends string | number">
// One value among a few, in a settings sheet: each choice on its row,
// with a word of help when it needs one. The choice is only kept with
// "Valider".

/** One choice of the sheet. */
export type Choice<V> = { value: V; label: string; hint?: string };
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
const name = useId();
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
    <fieldset
      class="divide-y divide-divider overflow-hidden rounded-xl ring-1 ring-default"
    >
      <legend class="sr-only">{{ title }}</legend>
      <label
        v-for="choice in choices"
        :key="choice.value"
        class="flex min-h-14 cursor-pointer items-center gap-3 px-3.5 py-2.5"
        :class="draft === choice.value ? 'bg-primary-tint' : ''"
      >
        <input
          v-model="draft"
          type="radio"
          :name="name"
          :value="choice.value"
          class="size-5 shrink-0 accent-(--ui-primary)"
        />
        <span class="flex min-w-0 flex-col">
          <span class="font-semibold">{{ choice.label }}</span>
          <span v-if="choice.hint" class="text-sm text-muted">{{
            choice.hint
          }}</span>
        </span>
      </label>
    </fieldset>
  </UiSettingSheet>
</template>
