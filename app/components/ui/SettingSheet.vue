<script setup lang="ts">
// The frame of every settings sheet: a title, what the setting does, the
// field in the slot, then "Valider" and "Annuler". A failed save shows as
// a red line above the button; the sheet stays open and keeps what was
// typed. The texts come from the parent.
defineProps<{
  title: string;
  description?: string;
  validateLabel: string;
  cancelLabel: string;
  /** Why the last save failed, if it did. */
  error?: string | null;
  loading?: boolean;
  /** The value cannot be saved as it is. */
  disabled?: boolean;
}>();
const open = defineModel<boolean>('open', { required: true });
const emit = defineEmits<{ validate: [] }>();
</script>

<template>
  <UiSheet v-model:open="open" :title="title" :description="description">
    <div class="flex flex-col gap-4 py-2">
      <slot />
    </div>
    <template #footer>
      <p
        v-if="error"
        class="flex items-start gap-2 text-sm font-medium text-error"
        role="alert"
      >
        <UIcon
          name="i-lucide-circle-alert"
          class="mt-0.5 size-4 shrink-0"
          aria-hidden="true"
        />
        {{ error }}
      </p>
      <UButton
        block
        size="xl"
        class="min-h-12 justify-center font-bold"
        :disabled="disabled"
        :loading="loading"
        :label="validateLabel"
        @click="emit('validate')"
      />
      <UButton
        block
        variant="ghost"
        color="neutral"
        class="min-h-11 justify-center"
        :label="cancelLabel"
        @click="open = false"
      />
    </template>
  </UiSheet>
</template>
