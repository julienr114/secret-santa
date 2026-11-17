<script setup lang="ts">
// One thing to do on the page of a draw (README 22.16), as a tile: an
// icon, its name in the display font, and where it stands. `todo` waits
// for an action: framed in brick, its call in brick (« À remplir »);
// `done` carries a check and its state; `idle` only tells; `award`, in
// pine, the colour of the palmarès alone (« Le palmarès t'attend »,
// README 22.17). Alone, a tile
// takes the whole width, on one line with a chevron; side by side
// (`compact`), the icon goes on top and the chevron away. The texts come
// from the parent.
withDefaults(
  defineProps<{
    to: string;
    icon: string;
    title: string;
    state: 'todo' | 'done' | 'idle' | 'award';
    /** Its call, or its state. */
    text: string;
    compact?: boolean;
  }>(),
  { compact: false },
);
</script>

<template>
  <NuxtLink
    :to="to"
    class="flex rounded-2xl bg-default text-default transition-colors active:bg-muted"
    :class="[
      compact
        ? 'min-h-33 flex-col gap-2 p-3.5'
        : 'items-center gap-3 px-4 py-3.5',
      state === 'todo'
        ? 'ring-2 ring-primary'
        : state === 'award'
          ? 'ring-2 ring-pine-700'
          : 'shadow-[0_1px_2px_rgba(60,30,10,0.08)] ring-1 ring-black/5',
    ]"
    :data-state="state"
    data-testid="tile"
  >
    <span
      class="flex size-10 shrink-0 items-center justify-center rounded-full"
      :class="{
        'bg-primary text-inverted': state === 'todo',
        'bg-success-soft text-success-ink': state === 'done',
        'bg-muted text-toned': state === 'idle',
        'bg-pine-700 text-white': state === 'award',
      }"
      aria-hidden="true"
    >
      <UIcon :name="icon" class="size-5" />
    </span>
    <span
      class="flex min-w-0 grow flex-col gap-0.5"
      :class="compact ? 'mt-auto' : ''"
    >
      <span class="font-display text-lg leading-[1.15] font-bold">{{
        title
      }}</span>
      <span
        v-if="state === 'todo' || state === 'award'"
        class="text-sm font-bold"
        :class="state === 'todo' ? 'text-primary-ink' : 'text-pine-700'"
        >{{ text }}</span
      >
      <span v-else class="flex items-start gap-1 text-sm text-toned">
        <UIcon
          v-if="state === 'done'"
          name="i-lucide-check"
          class="mt-0.75 size-3.5 shrink-0 text-success-ink"
          aria-hidden="true"
        />
        <span>{{ text }}</span>
      </span>
    </span>
    <UIcon
      v-if="!compact"
      name="i-lucide-chevron-right"
      class="size-5 shrink-0 text-dimmed"
      aria-hidden="true"
    />
  </NuxtLink>
</template>
