<script setup lang="ts" generic="T extends string | number">
// One value among a few, each on its row with a radio and, when it needs
// one, a word of help, on a white card; the row chosen is tinted (not
// when `plain`). A title above names the
// choice when the list sits under something else. The texts come from the
// parent.

/** One choice of the list. */
export type Choice<V> = {
  value: V;
  label: string;
  hint?: string;
  /** Shown greyed, not choosable. */
  disabled?: boolean;
  /** An icon at the end of the row. */
  icon?: string;
  /** « En anonyme » (Correction 30): tinted aubergine once chosen. */
  incognito?: boolean;
};
defineProps<{
  choices: Choice<T>[];
  /** What is chosen: shown above, or read by screen readers only. */
  label: string;
  /** Shows the label above the list. */
  titled?: boolean;
  /** On the page itself: only the radio says what is chosen, no tint. */
  plain?: boolean;
}>();
const model = defineModel<T>({ required: true });
const name = useId();
</script>

<template>
  <fieldset class="flex flex-col gap-1.5">
    <legend :class="titled ? 'mb-1.5 text-[15px] font-semibold' : 'sr-only'">
      {{ label }}
    </legend>
    <div
      :class="plain ? 'rounded-[18px]' : 'rounded-xl'"
      class="divide-y divide-divider overflow-hidden bg-default ring-1 ring-default"
    >
      <label
        v-for="choice in choices"
        :key="choice.value"
        class="flex min-h-14 gap-3 px-3.5"
        :class="[
          plain ? 'items-start py-3' : 'items-center py-2.5',
          model === choice.value && !plain
            ? choice.incognito
              ? 'bg-incognito-tint'
              : 'bg-primary-tint'
            : '',
          choice.disabled ? 'opacity-50' : 'cursor-pointer',
        ]"
      >
        <input
          v-model="model"
          type="radio"
          :name="name"
          :value="choice.value"
          :disabled="choice.disabled"
          class="shrink-0"
          :class="[
            plain ? 'mt-px size-[22px]' : 'size-5',
            choice.incognito
              ? 'accent-(--color-incognito)'
              : 'accent-(--ui-primary)',
          ]"
        />
        <span class="flex min-w-0 grow flex-col">
          <span :class="plain ? 'font-bold' : 'font-semibold'">{{
            choice.label
          }}</span>
          <span
            v-if="choice.hint"
            class="text-toned"
            :class="plain ? 'text-sm leading-[1.4]' : 'text-[13px]'"
            >{{ choice.hint }}</span
          >
        </span>
        <UIcon
          v-if="choice.icon"
          :name="choice.icon"
          class="size-5 shrink-0"
          :class="choice.incognito ? 'text-incognito' : 'text-toned'"
          aria-hidden="true"
        />
      </label>
    </div>
  </fieldset>
</template>
