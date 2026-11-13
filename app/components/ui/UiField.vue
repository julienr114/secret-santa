<script setup>
// Labelled form field. The input is passed in the default slot and must
// carry the given id.
defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  hint: { type: String, default: '' },
});
</script>

<template>
  <div class="flex flex-col gap-1">
    <label :for="id" class="text-sm font-medium text-neutral-800">{{
      label
    }}</label>
    <slot />
    <p v-if="hint" class="text-xs text-neutral-500">{{ hint }}</p>
  </div>
</template>
