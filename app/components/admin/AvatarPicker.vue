<script setup lang="ts">
import {
  AVATAR_COLORS,
  AVATAR_GROUP_KEYS,
  AVATAR_GROUPS,
  type Avatar,
} from '#server/utils/avatars';
import { AVATAR_SHADES } from '~/utils/avatars';

// The emojis ranged by family, like a keyboard (18 November 2026): three
// rows that scroll sideways, each family under its name, opened on the one
// chosen; then the colours on one line. Each target is 44 px. A row of the
// families on top, to jump to one, was tried and removed: it read as more
// icons to choose.
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
      class="-mx-4 flex gap-5 overflow-x-auto px-4 py-1"
    >
      <section
        v-for="key in AVATAR_GROUP_KEYS"
        :key="key"
        :data-group="key"
        class="flex shrink-0 flex-col gap-1.5"
        :aria-label="tk(`adminGroup.avatar.groups.${key}`)"
      >
        <p
          class="sticky left-0 text-xs font-bold tracking-[0.04em] text-toned uppercase"
          aria-hidden="true"
        >
          {{ tk(`adminGroup.avatar.groups.${key}`) }}
        </p>
        <div
          class="grid auto-cols-[44px] grid-flow-col grid-rows-[repeat(3,44px)] gap-x-[7px] gap-y-1.5"
        >
          <button
            v-for="emoji in AVATAR_GROUPS[key]"
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
            <UiEmoji :emoji="emoji" />
          </button>
        </div>
      </section>
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
