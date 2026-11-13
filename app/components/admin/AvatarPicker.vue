<script setup lang="ts">
import {
  AVATAR_COLORS,
  AVATAR_EMOJIS,
  type Avatar,
} from '#server/utils/avatars';
import { AVATAR_SHADES } from '~/utils/avatars';

// Emoji grid and colour swatches, with a live preview.
const model = defineModel<Avatar>({ required: true });
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center gap-3">
      <AdminAvatar :avatar="model" size="lg" />
      <p class="text-sm text-muted">Choisis une emoji et une couleur.</p>
    </div>
    <div role="radiogroup" aria-label="Emoji" class="grid grid-cols-8 gap-1">
      <button
        v-for="emoji in AVATAR_EMOJIS"
        :key="emoji"
        type="button"
        role="radio"
        :aria-checked="model.emoji === emoji"
        :aria-label="emoji"
        class="flex aspect-square min-h-10 items-center justify-center rounded-md text-xl transition"
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
    <div role="radiogroup" aria-label="Couleur" class="flex flex-wrap gap-2">
      <button
        v-for="color in AVATAR_COLORS"
        :key="color"
        type="button"
        role="radio"
        :aria-checked="model.color === color"
        :aria-label="AVATAR_SHADES[color].label"
        :title="AVATAR_SHADES[color].label"
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
