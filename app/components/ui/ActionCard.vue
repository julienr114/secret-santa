<script setup lang="ts">
// What to do now, as a card: a small label in capitals, a title in the
// display font, what shows it (a sentence with a check, counters, a
// bar) in the default slot, the action in the `action` slot, and a line
// of help under it, and a last row across the card (`footer`), set apart
// by a line.
defineProps<{
  eyebrow: string;
  title: string;
  help?: string;
  /** `warning` when something must be fixed first: the label turns mustard. */
  tone?: 'primary' | 'warning';
}>();
</script>

<template>
  <UiCard padding="none" class="flex flex-col gap-4 p-5">
    <div class="flex flex-col gap-1">
      <p
        class="text-xs font-bold tracking-[0.04em] uppercase"
        :class="tone === 'warning' ? 'text-warning-ink' : 'text-primary-ink'"
      >
        {{ eyebrow }}
      </p>
      <h2 class="font-display text-[22px] leading-[1.2] font-semibold">
        {{ title }}
      </h2>
    </div>
    <slot />
    <div class="flex flex-col gap-1">
      <slot name="action" />
      <p v-if="help" class="text-center text-[13px] leading-[1.4] text-toned">
        {{ help }}
      </p>
    </div>
    <div v-if="$slots.footer" class="-mx-5 -mb-5 border-t border-divider">
      <slot name="footer" />
    </div>
  </UiCard>
</template>
