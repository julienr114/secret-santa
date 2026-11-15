<script setup lang="ts">
import {
  AVATAR_COLORS,
  AVATAR_EMOJIS,
  type Avatar,
} from '#server/utils/avatars';
import { AVATAR_SHADES } from '~/utils/avatars';

// Emoji grid and colour swatches, with a live preview.
const model = defineModel<Avatar>({ required: true });
const { t, tk } = useT();
</script>

<template>
  <div class="flex flex-col gap-6 py-2">
    <div class="flex justify-center">
      <UiAvatar :avatar="model" size="xl" />
    </div>
    <div
      role="radiogroup"
      :aria-label="t('adminGroup.avatar.emoji')"
      class="grid grid-cols-6 gap-2 sm:grid-cols-8"
    >
      <button
        v-for="emoji in AVATAR_EMOJIS"
        :key="emoji"
        type="button"
        role="radio"
        :aria-checked="model.emoji === emoji"
        :aria-label="emoji"
        class="flex aspect-square min-h-11 items-center justify-center rounded-md text-2xl transition"
        :class="
          model.emoji === emoji
            ? 'bg-primary/15 ring-2 ring-primary'
            : 'hover:bg-muted'
        "
        @click="model = { ...model, emoji }"
      >
        {{ emoji }}
      </button>
    </div>
    <div
      role="radiogroup"
      :aria-label="t('adminGroup.avatar.color')"
      class="flex flex-wrap justify-center gap-3"
    >
      <button
        v-for="color in AVATAR_COLORS"
        :key="color"
        type="button"
        role="radio"
        :aria-checked="model.color === color"
        :aria-label="tk(`adminGroup.avatar.colors.${color}`)"
        :title="tk(`adminGroup.avatar.colors.${color}`)"
        class="size-11 rounded-full ring-1 transition"
        :class="
          model.color === color
            ? 'ring-3 ring-offset-2 ring-offset-default'
            : ''
        "
        :style="{
          backgroundColor: AVATAR_SHADES[color].bg,
          '--tw-ring-color':
            model.color === color
              ? 'var(--ui-primary)'
              : AVATAR_SHADES[color].ring,
        }"
        @click="model = { ...model, color }"
      />
    </div>
  </div>
</template>
