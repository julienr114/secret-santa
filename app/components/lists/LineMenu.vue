<script setup lang="ts">
// The menu of the handle of a line (docs/spec/v3/listes.md, « La poignée
// de la ligne qu'on écrit », ticket 152; V3ListeLigneMenu,
// V3ListeLigneEtoiles, V3ListeLigneTitre). Under the handle, above it
// when there is no room below. For an idea: « Envie » and its three
// stars, « En faire un titre », « Monter », « Descendre », « Déplacer
// vers… », then « Supprimer la ligne ». A title has no stars, and turns
// back into an idea. A touch outside or Échap closes it; the arrows go
// from one item to the next.
const props = defineProps<{
  stars: number;
  title: boolean;
  canUp: boolean;
  canDown: boolean;
  canMove: boolean;
  /** Above the handle: no room under it. */
  above: boolean;
}>();
const emit = defineEmits<{
  stars: [count: number];
  title: [];
  up: [];
  down: [];
  move: [];
  remove: [];
  close: [];
}>();
const { t } = useT();
const menu = ref<HTMLElement | null>(null);
/** Touching the n-th star gives n; touching the last one lit takes all. */
const onStar = (n: number) => emit('stars', n === props.stars ? 0 : n);

const items = () => [
  ...(menu.value?.querySelectorAll<HTMLElement>(
    '[role="menuitem"], [role="menuitemradio"]',
  ) ?? []),
];
const onKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    event.preventDefault();
    event.stopPropagation();
    emit('close');
    return;
  }
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
  event.preventDefault();
  const all = items();
  const at = all.indexOf(document.activeElement as HTMLElement);
  const step = event.key === 'ArrowDown' ? 1 : -1;
  all[(at + step + all.length) % all.length]?.focus();
};
/** A touch outside closes it; the handle closes it by itself. */
const onOutside = (event: PointerEvent) => {
  const target = event.target as Node | null;
  if (!menu.value || (target && menu.value.contains(target))) return;
  if (target instanceof Element && target.closest('[data-line-handle]')) {
    return;
  }
  emit('close');
};
onMounted(() => {
  items()[0]?.focus({ preventScroll: true });
  document.addEventListener('pointerdown', onOutside, true);
});
onBeforeUnmount(() =>
  document.removeEventListener('pointerdown', onOutside, true),
);
</script>

<template>
  <div
    ref="menu"
    role="menu"
    :aria-label="t('lists.line.menu')"
    class="absolute right-0 z-30 flex w-[236px] flex-col rounded-2xl bg-default p-1.5 shadow-[0_0_0_1px_var(--color-peach-200),0_12px_28px_rgb(90_40_60/0.22)]"
    :class="above ? 'bottom-full mb-1' : 'top-full mt-1'"
    data-testid="line-menu"
    data-no-drag
    @keydown="onKey"
  >
    <template v-if="!title">
      <div class="flex flex-col px-2.5 pt-1.5 pb-0.5">
        <span
          class="text-xs font-bold tracking-[0.04em] text-toned uppercase"
          aria-hidden="true"
          >{{ t('lists.line.wish') }}</span
        >
        <div
          class="-ml-2 flex items-center"
          role="group"
          :aria-label="t('lists.line.wish')"
        >
          <button
            v-for="n in 3"
            :key="n"
            type="button"
            role="menuitemradio"
            :aria-checked="stars === n"
            :aria-label="t('lists.line.star', { count: n })"
            class="flex size-11 items-center justify-center rounded-[10px] outline-none focus-visible:bg-muted"
            :class="n <= stars ? 'text-rating' : 'text-rating-off'"
            :data-testid="`line-star-${n}`"
            @click="onStar(n)"
          >
            <UiRatingStar :full="n <= stars" class="size-[22px]" />
          </button>
        </div>
      </div>
      <span class="my-1 h-px bg-divider" aria-hidden="true" />
    </template>
    <button
      type="button"
      role="menuitem"
      class="flex h-11 items-center gap-2.5 rounded-[10px] px-2.5 text-left text-[15px] font-semibold outline-none hover:bg-muted focus-visible:bg-muted"
      data-testid="line-title"
      @click="emit('title')"
    >
      <UIcon
        :name="title ? 'i-lucide-list' : 'i-lucide-heading'"
        class="size-[18px] text-dimmed"
        aria-hidden="true"
      />
      {{ title ? t('lists.line.toIdea') : t('lists.line.toTitle') }}
    </button>
    <button
      v-if="canUp"
      type="button"
      role="menuitem"
      class="flex h-11 items-center gap-2.5 rounded-[10px] px-2.5 text-left text-[15px] font-semibold outline-none hover:bg-muted focus-visible:bg-muted"
      data-testid="line-up"
      @click="emit('up')"
    >
      <UIcon
        name="i-lucide-arrow-up"
        class="size-[18px] text-dimmed"
        aria-hidden="true"
      />
      {{ t('lists.line.up') }}
    </button>
    <button
      v-if="canDown"
      type="button"
      role="menuitem"
      class="flex h-11 items-center gap-2.5 rounded-[10px] px-2.5 text-left text-[15px] font-semibold outline-none hover:bg-muted focus-visible:bg-muted"
      data-testid="line-down"
      @click="emit('down')"
    >
      <UIcon
        name="i-lucide-arrow-down"
        class="size-[18px] text-dimmed"
        aria-hidden="true"
      />
      {{ t('lists.line.down') }}
    </button>
    <button
      v-if="canMove"
      type="button"
      role="menuitem"
      class="flex h-11 items-center gap-2.5 rounded-[10px] px-2.5 text-left text-[15px] font-semibold outline-none hover:bg-muted focus-visible:bg-muted"
      data-testid="line-move"
      @click="emit('move')"
    >
      <UIcon
        name="i-lucide-corner-down-right"
        class="size-[18px] text-dimmed"
        aria-hidden="true"
      />
      {{ t('lists.line.moveTo') }}
    </button>
    <span class="my-1 h-px bg-divider" aria-hidden="true" />
    <button
      type="button"
      role="menuitem"
      class="flex h-11 items-center gap-2.5 rounded-[10px] px-2.5 text-left text-[15px] font-semibold text-error-ink outline-none hover:bg-muted focus-visible:bg-muted"
      data-testid="line-remove"
      @click="emit('remove')"
    >
      <UIcon name="i-lucide-trash-2" class="size-[18px]" aria-hidden="true" />
      {{ t('lists.line.remove') }}
    </button>
  </div>
</template>
