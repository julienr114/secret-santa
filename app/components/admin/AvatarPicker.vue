<script setup lang="ts">
import {
  AVATAR_COLORS,
  AVATAR_EMOJIS,
  type Avatar,
} from '#server/utils/avatars';
import { AVATAR_SHADES } from '~/utils/avatars';

// The emojis on three rows that scroll sideways (the last column cut by
// the edge, so more can be guessed), opened on the one chosen; then the
// colours on one line. Each target is 44 px; each group has a name for
// screen readers, none on screen.
const model = defineModel<Avatar>({ required: true });
const { t, tk } = useT();
const grid = ref<HTMLElement | null>(null);
onMounted(() => {
  const chosen = grid.value?.querySelector<HTMLElement>(
    '[aria-checked="true"]',
  );
  chosen?.scrollIntoView({ block: 'nearest', inline: 'center' });
});
</script>

<template>
  <div class="flex flex-col gap-3.5">
    <div
      ref="grid"
      role="radiogroup"
      :aria-label="t('adminGroup.avatar.emoji')"
      class="-mx-4 grid auto-cols-[44px] grid-flow-col grid-rows-[repeat(3,44px)] gap-x-[7px] gap-y-1.5 overflow-x-auto px-4 py-1"
    >
      <button
        v-for="emoji in AVATAR_EMOJIS"
        :key="emoji"
        type="button"
        role="radio"
        :aria-checked="model.emoji === emoji"
        :aria-label="emoji"
        class="flex size-11 items-center justify-center rounded-full text-[21px] focus-visible:outline-2 focus-visible:outline-primary"
        :class="
          model.emoji === emoji
            ? 'ring-2 ring-primary ring-offset-2 ring-offset-default'
            : 'bg-muted'
        "
        :style="
          model.emoji === emoji
            ? { backgroundColor: AVATAR_SHADES[model.color].bg }
            : undefined
        "
        @click="model = { ...model, emoji }"
      >
        {{ emoji }}
      </button>
    </div>
    <div
      role="radiogroup"
      :aria-label="t('adminGroup.avatar.color')"
      class="flex justify-between"
    >
      <button
        v-for="color in AVATAR_COLORS"
        :key="color"
        type="button"
        role="radio"
        :aria-checked="model.color === color"
        :aria-label="tk(`adminGroup.avatar.colors.${color}`)"
        class="flex size-11 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-primary"
        @click="model = { ...model, color }"
      >
        <span
          class="size-8 rounded-full"
          :class="
            model.color === color
              ? 'ring-2 ring-primary ring-offset-2 ring-offset-default'
              : 'ring-1'
          "
          :style="{
            backgroundColor: AVATAR_SHADES[color].bg,
            '--tw-ring-color':
              model.color === color
                ? 'var(--ui-primary)'
                : AVATAR_SHADES[color].ring,
          }"
        />
      </button>
    </div>
  </div>
</template>
