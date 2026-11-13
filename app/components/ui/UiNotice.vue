<script setup>
defineProps({ tone: { type: String, default: 'error' } }); // error | success | info
const TONES = {
  error: 'bg-red-50 text-red-800 ring-red-200',
  success: 'bg-green-50 text-green-800 ring-green-200',
  info: 'bg-neutral-50 text-neutral-700 ring-neutral-200',
};
</script>

<template>
  <p
    role="status"
    class="rounded-lg px-3 py-2 text-sm ring-1"
    :class="TONES[tone]"
  >
    <slot />
  </p>
</template>
