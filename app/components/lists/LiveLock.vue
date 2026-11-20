<script setup lang="ts">
import type { LivePerson } from '#server/utils/live';
import { AVATAR_SHADES } from '~/utils/avatars';

// A text of a list that someone else who holds it is writing now (lot 26,
// maquette ListeLiveTeneur): it is theirs. Tinted with the light colour
// of their icon, what they type shown as they type it, their caret where
// it is, and under it their icon and « Hugo écrit… ». It cannot be
// touched, and offers nothing to do. `fallback` shows while they have
// typed nothing.
const props = defineProps<{
  by: LivePerson & { text: string; caret: number };
  fallback?: string;
}>();
const { t } = useT();
const shade = computed(() =>
  props.by.avatar ? AVATAR_SHADES[props.by.avatar.color] : null,
);
</script>

<template>
  <div
    class="pointer-events-none -mx-2 flex flex-col gap-0.5 rounded-xl px-2 py-1"
    :style="
      shade
        ? {
            backgroundColor: `color-mix(in srgb, ${shade.bg} 55%, transparent)`,
          }
        : undefined
    "
    aria-live="polite"
    data-testid="live-lock"
  >
    <p class="break-words whitespace-pre-line">
      <slot
        :before="by.text.slice(0, by.caret)"
        :after="by.text.slice(by.caret)"
      >
        {{ by.text ? by.text.slice(0, by.caret) : ''
        }}<span
          class="live-caret"
          :style="{ backgroundColor: shade?.ring ?? 'currentColor' }"
          aria-hidden="true"
        />{{ by.text ? by.text.slice(by.caret) : (fallback ?? '') }}
      </slot>
    </p>
    <span
      class="flex items-center gap-1.5 font-sans text-[13px] leading-[1.4] font-normal text-toned"
      data-testid="line-writing"
    >
      <UiAvatar v-if="by.avatar" :avatar="by.avatar" :px="18" flat />
      {{ t('lists.live.writing', { name: by.name }) }}
    </span>
  </div>
</template>
