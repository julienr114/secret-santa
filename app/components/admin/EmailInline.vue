<script setup lang="ts">
import { useUpdatePersonMutation } from '~/composables/queries/useGroup';

// A person's email address, typed in place in the send sheet: its label,
// the field and « Enregistrer » side by side, what it is for below. A
// refused address (invalid, already taken) shows in red under the field
// and the field stays. Saving goes through the person's own update.
const props = defineProps<{
  slug: string;
  personId: string;
  /** The address to correct; empty to add one. */
  initial?: string | null;
  label: string;
  help: string;
}>();
const emit = defineEmits<{ saved: [] }>();
const { t } = useT();
const errorMessage = useErrorMessage();
const update = useUpdatePersonMutation(() => props.slug);
const busy = useBusy(() => update.isPending.value);
const email = ref(props.initial ?? '');
const error = ref<string | null>(null);
const inputId = useId();
/**
 * Saves the address, then gives the sheet back its state with an address.
 * @returns Nothing: the mutation reports by itself.
 */
const onSave = () =>
  update.mutate(
    { id: props.personId, email: email.value.trim() },
    {
      onSuccess: () => {
        error.value = null;
        emit('saved');
      },
      onError: (failure: unknown) => {
        error.value = errorMessage(failure);
      },
    },
  );
</script>

<template>
  <form
    class="flex flex-col gap-1.5 rounded-md bg-muted p-3"
    novalidate
    data-testid="email-inline"
    @submit.prevent="onSave"
  >
    <label :for="inputId" class="text-sm font-bold">{{ label }}</label>
    <div class="flex gap-2">
      <UInput
        :id="inputId"
        v-model="email"
        type="email"
        inputmode="email"
        autocomplete="off"
        size="xl"
        autofocus
        class="min-w-0 grow"
        :color="error ? 'error' : 'primary'"
        :highlight="Boolean(error)"
        :aria-invalid="Boolean(error) || undefined"
        :ui="{ base: 'h-12' }"
      />
      <UButton
        type="submit"
        size="xl"
        class="h-12 shrink-0 px-3.5 text-[15px] font-bold"
        :disabled="!email.trim() || update.isPending.value"
        :loading="busy"
        :label="busy ? t('common.actions.saving') : t('common.actions.save')"
      />
    </div>
    <p v-if="error" class="text-sm font-medium text-error" role="alert">
      {{ error }}
    </p>
    <p class="text-[13px] leading-[1.4] text-toned">{{ help }}</p>
  </form>
</template>
