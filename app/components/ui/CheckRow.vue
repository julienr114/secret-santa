<script setup lang="ts">
import type { Avatar } from '#server/utils/avatars';

// A person to tick in a list: icon, name, a line below (or the
// `subtitle` slot, to give it an icon), and a 24 px box on the right. The
// whole row ticks. With `radio`, a round button instead of the box: one
// person among the rows that share its `name` (« Qui l'offre ? »).
// `small`, in the bar of a list (ticket 141): 48 px, its name in 15 px.
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
  /** Cannot be ticked: the box stays empty. */
  disabled?: boolean;
  small?: boolean;
}>();
const checked = defineModel<boolean>('checked', { required: true });
</script>

<template>
  <li>
    <label
      class="flex items-center gap-3"
      :class="[
        small ? 'min-h-12 px-3.5 py-1 text-[15px]' : 'min-h-15 px-4 py-2',
        disabled ? 'cursor-default' : 'cursor-pointer',
      ]"
    >
      <UiAvatar :avatar="avatar" :size="small ? 'sm' : 'md'" />
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
        :disabled="disabled"
        :aria-label="label"
      />
    </label>
  </li>
</template>
