<script setup lang="ts">
// A few short words side by side, each in a peach pill, wrapping to the
// next line: the answers of « Moi et les cadeaux ». A tag with `to` is a
// link, with a small grey pencil (its 44 px target reaches past the pill
// without making it look bigger); a `missing` one is dashed in coral,
// after a « + », without pencil. The texts
// come from the parent.

/** One tag: a plain word, or a link, or what is still missing. */
export type Tag = string | { label: string; to?: string; missing?: boolean };
defineProps<{ tags: Tag[] }>();
const labelOf = (tag: Tag) => (typeof tag === 'string' ? tag : tag.label);
// A string in <component :is> does not resolve global components.
const NuxtLink = resolveComponent('NuxtLink');
</script>

<template>
  <ul class="flex flex-wrap gap-2">
    <li v-for="tag in tags" :key="labelOf(tag)" class="flex">
      <component
        :is="typeof tag !== 'string' && tag.to ? NuxtLink : 'span'"
        :to="typeof tag !== 'string' ? tag.to : undefined"
        class="relative flex min-h-9 items-center gap-1 rounded-full px-3 text-sm leading-[1.3] font-semibold"
        :class="[
          typeof tag !== 'string' && tag.missing
            ? 'border border-dashed border-primary text-primary-ink'
            : 'bg-muted ring-1 ring-default',
          typeof tag !== 'string' && tag.to
            ? 'before:absolute before:inset-x-0 before:-inset-y-1 active:bg-elevated'
            : '',
        ]"
      >
        <span
          v-if="typeof tag !== 'string' && tag.missing"
          aria-hidden="true"
          class="tag-text"
          >+</span
        >
        <span class="tag-text">{{ labelOf(tag) }}</span>
        <UIcon
          v-if="typeof tag !== 'string' && tag.to && !tag.missing"
          name="i-lucide-pen-line"
          class="ml-0.5 size-3.25 text-dimmed"
          aria-hidden="true"
        />
      </component>
    </li>
  </ul>
</template>

<style scoped>
/* Centres the letters themselves in the pill: Nunito's line box leaves
   them a little low. Ignored where unsupported. */
.tag-text {
  text-box: trim-both cap alphabetic;
}
</style>
