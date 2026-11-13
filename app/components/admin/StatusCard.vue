<script setup lang="ts">
// Where the edition stands, as a card in the app's own style: an emoji in
// a round badge, a title in the display font, a line of explanation, an
// optional progress bar, then the action of the moment in the slot.
withDefaults(
  defineProps<{
    emoji: string;
    title: string;
    description?: string;
    tone?: 'ready' | 'problem' | 'quiet';
    /** A share already done, shown as a bar (e.g. results viewed). */
    progress?: { value: number; total: number };
  }>(),
  { description: undefined, tone: 'ready', progress: undefined },
);
const BADGES = {
  ready: 'bg-secondary/15',
  problem: 'bg-error/10',
  quiet: 'bg-[var(--color-kraft-100)]',
};
</script>

<template>
  <section
    class="flex flex-col gap-4 rounded-2xl bg-default p-4 shadow-sm ring-1 ring-black/5"
  >
    <div class="flex items-start gap-3">
      <span
        class="flex size-11 shrink-0 items-center justify-center rounded-full text-xl"
        :class="BADGES[tone]"
        aria-hidden="true"
        >{{ emoji }}</span
      >
      <div class="min-w-0 grow">
        <p class="font-display text-xl leading-snug font-semibold">
          {{ title }}
        </p>
        <p v-if="description" class="text-sm text-muted">{{ description }}</p>
      </div>
    </div>
    <div
      v-if="progress && progress.total > 0"
      class="h-2 overflow-hidden rounded-full bg-[var(--color-kraft-200)]"
      role="progressbar"
      :aria-valuenow="progress.value"
      aria-valuemin="0"
      :aria-valuemax="progress.total"
    >
      <div
        class="h-full rounded-full bg-secondary transition-[width]"
        :style="{ width: `${(progress.value / progress.total) * 100}%` }"
      />
    </div>
    <slot />
  </section>
</template>
