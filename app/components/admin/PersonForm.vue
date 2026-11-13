<script setup lang="ts">
import { z } from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';
import { randomAvatar, type Avatar } from '#server/utils/avatars';

// Shared by the "new person" and "person" screens.
export type PersonFormValue = {
  firstName: string;
  lastName: string | null;
  avatarEmoji: Avatar['emoji'];
  avatarColor: Avatar['color'];
};

const props = defineProps<{
  initial?: { firstName?: string; lastName?: string | null; avatar?: Avatar };
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
// A new person starts with a random Christmas avatar; Math.random is fine
// for a cosmetic default (the draw itself never uses it).
const avatar = ref<Avatar>(
  props.initial?.avatar ?? randomAvatar((n) => Math.floor(Math.random() * n)),
);
const onSubmit = (event: FormSubmitEvent<Schema>) =>
  emit('submit', {
    firstName: event.data.firstName,
    lastName: event.data.lastName || null,
    avatarEmoji: avatar.value.emoji,
    avatarColor: avatar.value.color,
  });
</script>

<template>
  <UForm
    :schema="schema"
    :state="state"
    class="flex flex-col gap-5"
    @submit="onSubmit"
  >
    <UFormField label="Avatar">
      <AdminAvatarPicker v-model="avatar" />
    </UFormField>
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
