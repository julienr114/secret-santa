<script setup lang="ts">
// Where a screen belongs, in one small grey line above its title:
// « {Groupe} · {Édition} », each part a link back to it. The links are
// 44 px tall without making the line look taller. The texts come from
// the parent.

/** One part of the line: its name, and where it leads. */
export type ContextPart = { label: string; to?: string };
defineProps<{
  parts: ContextPart[];
  /** « Tu es ici », the name of the line for screen readers. */
  label: string;
}>();
// A string in <component :is> does not resolve global components.
const NuxtLink = resolveComponent('NuxtLink');
</script>

<template>
  <nav
    :aria-label="label"
    class="-mt-3.5 -mb-3 flex flex-wrap items-center gap-x-1.5 text-sm font-semibold text-toned"
  >
    <template v-for="(part, index) in parts" :key="part.label">
      <span v-if="index > 0" aria-hidden="true">·</span>
      <component
        :is="part.to ? NuxtLink : 'span'"
        :to="part.to"
        class="flex min-h-11 min-w-0 items-center truncate"
        :class="{ 'active:text-default': part.to }"
      >
        {{ part.label }}
      </component>
    </template>
  </nav>
</template>
