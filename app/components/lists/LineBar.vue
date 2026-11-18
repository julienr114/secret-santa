<script setup lang="ts">
// The bar above the keyboard while a line is written (README 22.19,
// maquette ListeIdee): « Lien », « Supprimer la ligne », « Terminé ». Its
// buttons keep the focus in the line (no blur before the tap).
const { t } = useT();
const editing = useListEditing();
const inset = useKeyboardInset(() => editing.active.value !== null, 'keyboard');
</script>

<template>
  <div
    v-if="editing.active.value"
    class="fixed inset-x-0 z-30 border-t border-default bg-default"
    :style="{ bottom: `${inset.lift}px` }"
    role="toolbar"
    :aria-label="t('lists.doc.bar.label')"
    data-testid="line-bar"
  >
    <div class="mx-auto flex h-12 max-w-md items-center gap-1 px-2">
      <button
        type="button"
        class="flex h-11 items-center gap-1.5 px-2 text-[15px] font-semibold"
        @pointerdown.prevent
        @click="editing.active.value?.link()"
      >
        <UIcon name="i-lucide-link" class="size-4" />
        {{ t('lists.doc.bar.link') }}
      </button>
      <button
        type="button"
        class="flex h-11 items-center px-2 text-[15px] font-semibold text-toned"
        @pointerdown.prevent
        @click="editing.active.value?.remove()"
      >
        {{ t('lists.doc.bar.removeLine') }}
      </button>
      <button
        type="button"
        class="ml-auto flex h-11 items-center px-2 text-[15px] font-bold text-primary-ink"
        @pointerdown.prevent
        @click="editing.active.value?.done()"
      >
        {{ t('lists.doc.bar.done') }}
      </button>
    </div>
  </div>
</template>
