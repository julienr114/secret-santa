<script setup lang="ts">
// What only some can see, on a screen everyone sees: a dashed frame with
// its title on the border (a shield and « Super-admin »), and nothing to
// explain it. `flush` lays rows edge to edge inside the frame.
defineProps<{
  /** « Super-admin ». */
  label: string;
  flush?: boolean;
}>();
</script>

<template>
  <fieldset
    class="flex min-w-0 flex-col gap-2.5 rounded-xl border border-dashed border-restricted-ring bg-restricted"
    :class="flush ? 'overflow-hidden pt-1' : 'p-3.5'"
  >
    <legend
      class="mx-2 flex items-center gap-1.5 px-1.5 text-xs font-bold tracking-[0.04em] text-toned uppercase"
    >
      <UIcon name="i-lucide-shield" class="size-3.5" aria-hidden="true" />
      {{ label }}
    </legend>
    <slot />
  </fieldset>
</template>
