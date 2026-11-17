<script setup lang="ts">
// A few short words side by side, each in a kraft pill, wrapping to the
// next line: the answers of « Moi et les cadeaux ». A tag with `to` is a
// link (its 44 px target reaches past the pill without making it look
// bigger); a `missing` one is dashed in brick, after a « + ». The texts
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
        class="relative flex items-center gap-1 rounded-full px-3 text-sm leading-[1.3] font-semibold"
        :class="[
          typeof tag !== 'string' && tag.missing
            ? 'border border-dashed border-primary text-primary-ink'
            : 'bg-muted',
          typeof tag !== 'string' && tag.to
            ? 'min-h-9 ring-1 ring-default before:absolute before:inset-x-0 before:-inset-y-1 active:bg-elevated'
            : 'py-1.5',
          typeof tag !== 'string' && tag.missing ? 'ring-0' : '',
        ]"
      >
        <span v-if="typeof tag !== 'string' && tag.missing" aria-hidden="true"
          >+</span
        >
        {{ labelOf(tag) }}
      </component>
    </li>
  </ul>
</template>
