<script setup lang="ts">
import { z } from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';

// Shared by the "new person" and "person" screens.
export type PersonFormValue = {
  firstName: string;
  lastName: string | null;
};

const props = defineProps<{
  initial?: Partial<PersonFormValue>;
  loading?: boolean;
  submitLabel: string;
}>();
const emit = defineEmits<{ submit: [value: PersonFormValue] }>();

const schema = z.object({
  firstName: z.string().trim().min(1, 'Prénom requis').max(60),
  lastName: z.string().trim().max(60),
});
type Schema = z.output<typeof schema>;
const state = reactive<Schema>({
  firstName: props.initial?.firstName ?? '',
  lastName: props.initial?.lastName ?? '',
});
const onSubmit = (event: FormSubmitEvent<Schema>) =>
  emit('submit', {
    firstName: event.data.firstName,
    lastName: event.data.lastName || null,
  });
</script>

<template>
  <UForm
    :schema="schema"
    :state="state"
    class="flex flex-col gap-5"
    @submit="onSubmit"
  >
    <UFormField name="firstName" label="Prénom" required>
      <UInput v-model="state.firstName" autocomplete="off" class="w-full" />
    </UFormField>
    <UFormField
      name="lastName"
      label="Nom"
      help="Facultatif, sert seulement à départager deux prénoms identiques."
    >
      <UInput v-model="state.lastName" autocomplete="off" class="w-full" />
    </UFormField>
    <slot />
    <UButton type="submit" block :loading="loading" :label="submitLabel" />
  </UForm>
</template>
