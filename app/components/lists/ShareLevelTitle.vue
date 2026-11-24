<script setup lang="ts">
// The title of a level of the bar of a list, past the first (« On reste
// dans la barre », ticket 139): « ‹ Quelqu'un d'autre », in 16 px
// (ticket 141). The arrow goes
// back one level; the title takes the focus on arrival.
defineProps<{ title: string }>();
const emit = defineEmits<{ back: [] }>();
const { t } = useT();
</script>

<template>
  <div class="flex items-center pr-3.5 pl-1.5">
    <button
      type="button"
      class="-mr-2 flex size-11 shrink-0 items-center justify-center"
      :aria-label="t('common.actions.back')"
      data-testid="share-back"
      @click="emit('back')"
    >
      <UIcon name="i-lucide-chevron-left" class="size-5" />
    </button>
    <h2
      tabindex="-1"
      class="truncate text-base font-bold outline-none"
      data-share-title
    >
      {{ title }}
    </h2>
  </div>
</template>
