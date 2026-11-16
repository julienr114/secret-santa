<script setup lang="ts">
// The box to tick before an action that cannot be taken back: « Je
// comprends que… ». The text comes from the parent.
defineProps<{ label: string }>();
const checked = defineModel<boolean>({ required: true });
</script>

<template>
  <label
    class="flex min-h-11 cursor-pointer items-start gap-3 text-[15px] leading-[1.4]"
  >
    <input
      v-model="checked"
      type="checkbox"
      class="mt-px size-5.5 shrink-0 accent-primary"
    />
    {{ label }}
  </label>
</template>
