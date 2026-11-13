<script setup>
defineProps({
  modelValue: { type: [String, Number], default: '' },
  type: { type: String, default: 'text' },
});
defineEmits(['update:modelValue']);
</script>

<template>
  <input
    :type="type"
    :value="modelValue"
    class="min-h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 text-base text-neutral-900 outline-none focus:border-red-700 focus:ring-2 focus:ring-red-200"
    v-bind="$attrs"
    @input="$emit('update:modelValue', $event.target.value)"
  />
</template>
