<script setup lang="ts">
// The line the whole group will read in the journal, shown before an
// action that writes it: a small title, then the line in a white card,
// after its icon when given. The texts come from the parent.
defineProps<{
  /** "Ce que le groupe lira dans le journal". */
  label: string;
  text: string;
  icon?: string;
}>();
</script>

<template>
  <section class="flex flex-col gap-1.5">
    <UiSectionTitle>{{ label }}</UiSectionTitle>
    <div
      class="flex items-start gap-2.5 rounded-xl bg-default px-3.5 py-3 ring-1 ring-default"
      aria-live="polite"
    >
      <span
        v-if="icon"
        class="flex size-8 shrink-0 items-center justify-center rounded-full bg-star text-mustard-950"
        aria-hidden="true"
      >
        <UIcon :name="icon" class="size-4" />
      </span>
      <p class="font-display text-base leading-[1.35] font-semibold">
        {{ text }}
      </p>
    </div>
  </section>
</template>
