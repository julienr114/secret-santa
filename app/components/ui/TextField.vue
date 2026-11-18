<script setup lang="ts">
// A field to write in, on a page of its own (README 23.3, « rédiger sur
// une page »): its name in small capitals, « (facultatif) » when it is,
// the field, then a word of help on the left and the characters used on
// the right. `multiline` gives a text area that grows; otherwise one line.
// The texts come from the parent.
withDefaults(
  defineProps<{
    id: string;
    label: string;
    /** « (facultatif) », after the label. */
    optional?: string;
    maxlength?: number;
    placeholder?: string;
    hint?: string;
    multiline?: boolean;
    rows?: number;
    inputmode?: 'text' | 'url' | 'email';
  }>(),
  {
    optional: undefined,
    maxlength: undefined,
    placeholder: undefined,
    hint: undefined,
    multiline: true,
    rows: 4,
    inputmode: 'text',
  },
);
const model = defineModel<string>({ required: true });
</script>

<template>
  <section class="flex flex-col gap-1.5">
    <label :for="id" class="px-1">
      <span class="text-xs font-bold tracking-[0.04em] text-toned uppercase">{{
        label
      }}</span>
      <span v-if="optional" class="ml-1 text-xs font-semibold text-toned">
        {{ optional }}</span
      >
    </label>
    <UTextarea
      v-if="multiline"
      :id="id"
      v-model="model"
      :rows="rows"
      :maxlength="maxlength"
      autoresize
      :maxrows="0"
      size="xl"
      :placeholder="placeholder"
      class="w-full"
      :ui="{ base: 'text-base leading-[1.45]' }"
    />
    <UInput
      v-else
      :id="id"
      v-model="model"
      :maxlength="maxlength"
      :inputmode="inputmode"
      :autocapitalize="inputmode === 'text' ? undefined : 'off'"
      size="xl"
      :placeholder="placeholder"
      class="w-full"
      :ui="{ base: 'text-base' }"
    />
    <div
      v-if="hint || maxlength"
      class="flex justify-between gap-3 px-1 text-[13px] leading-[1.4] text-toned"
    >
      <span>{{ hint }}</span>
      <span v-if="maxlength" class="shrink-0 tabular-nums" aria-hidden="true"
        >{{ model.length }} / {{ maxlength }}</span
      >
    </div>
  </section>
</template>
