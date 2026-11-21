<script setup lang="ts">
import type { Avatar } from '#server/utils/avatars';

// A person to tick in a list: icon, name, a line below (or the
// `subtitle` slot, to give it an icon), and a 24 px box on the right. The
// whole row ticks. With `radio`, a round button instead of the box: one
// person among the rows that share its `name` (« Qui l'offre ? »).
defineProps<{
  /** Null for someone without an icon of their own. */
  avatar: Avatar | null;
  title: string;
  subtitle?: string;
  /** "Sélectionner Inès", the name of the box. */
  label: string;
  /** A round button: one among the rows of the same `name`. */
  radio?: boolean;
  /** The group of the round buttons. */
  name?: string;
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
        v-if="radio"
        type="radio"
        :name="name"
        :checked="checked"
        class="size-6 shrink-0 accent-(--ui-primary)"
        :aria-label="label"
        @change="checked = true"
      />
      <input
        v-else
        v-model="checked"
        type="checkbox"
        class="size-6 shrink-0 tick"
        :aria-label="label"
      />
    </label>
  </li>
</template>
