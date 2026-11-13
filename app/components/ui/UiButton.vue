<script setup>
defineProps({
  variant: { type: String, default: 'primary' }, // primary | secondary | danger | ghost
  type: { type: String, default: 'button' },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
});

const VARIANTS = {
  primary: 'bg-red-700 text-white hover:bg-red-800 disabled:bg-red-300',
  secondary:
    'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 disabled:text-neutral-400',
  danger:
    'bg-white text-red-700 ring-1 ring-red-300 hover:bg-red-50 disabled:text-red-300',
  ghost: 'bg-transparent text-neutral-700 hover:bg-neutral-100',
};
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition disabled:cursor-not-allowed"
    :class="VARIANTS[variant]"
  >
    <span
      v-if="loading"
      class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
      aria-hidden="true"
    />
    <slot />
  </button>
</template>
