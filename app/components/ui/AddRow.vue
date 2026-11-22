<script setup lang="ts">
// The last row of a list that adds to it (V3): a plus and its words, in
// red, smaller than a row (« Un autre Secret Santa », « Nouvelle liste »,
// « Préparer Noël 2027 »). A link, or a button while `onClick` is given.
const props = withDefaults(
  defineProps<{
    to?: string;
    label: string;
    onClick?: () => void;
    /** Working: a wheel replaces the plus. */
    busy?: boolean;
  }>(),
  { to: undefined, onClick: undefined, busy: false },
);
// A string in <component :is> does not resolve global components.
const NuxtLink = resolveComponent('NuxtLink');
</script>

<template>
  <li>
    <component
      :is="to ? NuxtLink : 'button'"
      :to="to"
      :type="to ? undefined : 'button'"
      :disabled="busy || undefined"
      :aria-busy="busy || undefined"
      class="flex min-h-12 w-full items-center gap-2 pr-4 pl-5.5 text-left text-sm font-bold text-primary transition-colors active:bg-muted"
      @click="props.onClick?.()"
    >
      <UiSpinner v-if="busy" :label="label" />
      <UIcon v-else name="i-lucide-plus" class="size-4 shrink-0" />
      {{ label }}
    </component>
  </li>
</template>
