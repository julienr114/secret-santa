<script setup lang="ts">
import type { Avatar } from '#server/utils/avatars';

// A person to tick in a list: icon, name, a line below (or the
// `subtitle` slot, to give it an icon), and a 24 px box on the right. The
// whole row ticks.
defineProps<{
  avatar: Avatar;
  title: string;
  subtitle?: string;
  /** "Sélectionner Inès", the name of the box. */
  label: string;
}>();
const checked = defineModel<boolean>('checked', { required: true });
</script>

<template>
  <li>
    <label class="flex min-h-15 cursor-pointer items-center gap-3 px-4 py-2">
      <UiAvatar :avatar="avatar" />
      <span class="flex min-w-0 grow flex-col">
        <span class="truncate font-semibold">{{ title }}</span>
        <span
          v-if="$slots.subtitle"
          class="flex min-w-0 items-center gap-1.25 text-[13px] text-toned"
        >
          <slot name="subtitle" />
        </span>
        <span v-else-if="subtitle" class="truncate text-[13px] text-toned">{{
          subtitle
        }}</span>
      </span>
      <input
        v-model="checked"
        type="checkbox"
        class="size-6 shrink-0 accent-primary"
        :aria-label="label"
      />
    </label>
  </li>
</template>
