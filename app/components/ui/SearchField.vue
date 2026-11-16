<script setup lang="ts">
// The search field above a long list of people: a magnifier, the hint as
// its name, and a cross to empty it. The texts come from the parent.
defineProps<{
  /** "Chercher un prénom": the name of the field, and its placeholder. */
  label: string;
  /** Name of the button that empties the field. */
  clearLabel: string;
}>();
const query = defineModel<string>({ default: '' });
</script>

<template>
  <UInput
    v-model="query"
    type="search"
    size="xl"
    icon="i-lucide-search"
    :placeholder="label"
    :aria-label="label"
    class="w-full"
    :ui="{
      base: 'h-12 ps-[42px] text-base ring-accented placeholder:text-dimmed',
      leading: 'ps-3.5',
      leadingIcon: 'size-[18px] text-toned',
    }"
  >
    <template v-if="query" #trailing>
      <UButton
        variant="ghost"
        color="neutral"
        icon="i-lucide-x"
        class="-mr-1.5 size-9 justify-center"
        :aria-label="clearLabel"
        @click="query = ''"
      />
    </template>
  </UInput>
</template>
