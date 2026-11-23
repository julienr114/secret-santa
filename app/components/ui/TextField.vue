<script setup lang="ts">
defineOptions({ inheritAttrs: false });
// A field to write in, on a page of its own (README 23.3, « rédiger sur
// une page »): its name in small capitals, « (facultatif) » when it is,
// the field, then a word of help on the left and the characters used on
// the right. `multiline` gives a text area that grows; otherwise one line.
// The default slot goes between the label and the field (ready-made
// words). The texts come from the parent.
// `inline`, in the bar of a list (ticket 141): one line of 48 px, no
// frame, its name on the left in 15 px, what is written on the right,
// still in 16 px so that an iPhone does not zoom; touching the line
// anywhere puts the cursor in the field. The parent draws the lines
// between them.
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
    inline?: boolean;
  }>(),
  {
    optional: undefined,
    maxlength: undefined,
    placeholder: undefined,
    hint: undefined,
    multiline: true,
    rows: 4,
    inputmode: 'text',
    inline: false,
  },
);
const model = defineModel<string>({ required: true });
</script>

<template>
  <label
    v-if="inline"
    :for="id"
    class="flex min-h-12 cursor-text items-center gap-3 px-3.5"
  >
    <span class="w-28 shrink-0 text-[15px] font-semibold">{{ label }}</span>
    <input
      :id="id"
      v-model="model"
      :type="inputmode === 'email' ? 'email' : 'text'"
      :maxlength="maxlength"
      :inputmode="inputmode"
      :autocapitalize="inputmode === 'text' ? undefined : 'off'"
      :placeholder="placeholder"
      autocomplete="off"
      class="h-12 min-w-0 grow bg-transparent text-base outline-none placeholder:text-dimmed"
      v-bind="$attrs"
    />
  </label>
  <section v-else class="flex flex-col gap-1.5" v-bind="$attrs">
    <label :for="id" class="px-1">
      <span class="text-xs font-bold tracking-[0.04em] text-toned uppercase">{{
        label
      }}</span>
      <span v-if="optional" class="ml-1 text-xs font-semibold text-toned">
        {{ optional }}</span
      >
    </label>
    <slot />
    <UTextarea
      v-if="multiline"
      :id="id"
      v-model="model"
      :rows="rows"
      :maxlength="maxlength"
      autoresize
      :maxrows="6"
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
