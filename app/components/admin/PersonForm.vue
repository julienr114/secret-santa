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

// `autosave` (person screen): no submit button, changes are saved when a
// field loses focus or the avatar is confirmed.
const props = defineProps<{
  autosave?: boolean;
  initial?: { firstName?: string; lastName?: string | null; avatar?: Avatar };
  loading?: boolean;
  submitLabel?: string;
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
// The picker opens in a bottom sheet and edits a draft until "Valider".
const pickerOpen = ref(false);
const draft = ref<Avatar>(avatar.value);
const openPicker = () => {
  draft.value = avatar.value;
  pickerOpen.value = true;
};
const confirmPicker = () => {
  avatar.value = draft.value;
  pickerOpen.value = false;
  if (props.autosave) save();
};
const valueOf = (data: Schema): PersonFormValue => ({
  firstName: data.firstName.trim(),
  lastName: data.lastName.trim() || null,
  avatarEmoji: avatar.value.emoji,
  avatarColor: avatar.value.color,
});
const onSubmit = (event: FormSubmitEvent<Schema>) =>
  emit('submit', valueOf(event.data));

// Autosave: send only valid values that differ from the last saved ones.
const lastSaved = ref(JSON.stringify(valueOf(state)));
const save = () => {
  const parsed = schema.safeParse(state);
  if (!parsed.success) return;
  const value = valueOf(parsed.data);
  if (JSON.stringify(value) === lastSaved.value) return;
  lastSaved.value = JSON.stringify(value);
  emit('submit', value);
};
const onBlur = () => {
  if (props.autosave) save();
};
</script>

<template>
  <UForm
    :schema="schema"
    :state="state"
    class="flex flex-col gap-5"
    @submit="onSubmit"
  >
    <div class="flex items-center gap-4">
      <button
        type="button"
        class="relative rounded-full focus-visible:ring-2 focus-visible:ring-primary"
        aria-label="Changer l'avatar"
        @click="openPicker"
      >
        <AdminAvatar :avatar="avatar" size="lg" />
        <span
          class="absolute -right-1 -bottom-1 flex size-8 items-center justify-center rounded-full bg-default shadow ring-1 ring-default"
        >
          <UIcon name="i-lucide-pencil" class="size-4 text-muted" />
        </span>
      </button>
      <UButton
        variant="link"
        color="neutral"
        label="Changer l'avatar"
        @click="openPicker"
      />
    </div>
    <UDrawer
      v-model:open="pickerOpen"
      title="Avatar"
      description="Une emoji de Noël et une couleur."
    >
      <template #body>
        <AdminAvatarPicker v-model="draft" />
      </template>
      <template #footer>
        <UButton block label="Valider" @click="confirmPicker" />
      </template>
    </UDrawer>
    <UFormField name="firstName" label="Prénom" required>
      <UInput
        v-model="state.firstName"
        autocomplete="off"
        class="w-full"
        @blur="onBlur"
      />
    </UFormField>
    <UFormField
      name="lastName"
      label="Nom"
      help="Facultatif, sert seulement à départager deux prénoms identiques."
    >
      <UInput
        v-model="state.lastName"
        autocomplete="off"
        class="w-full"
        @blur="onBlur"
      />
    </UFormField>
    <slot />
    <UButton
      v-if="!autosave"
      type="submit"
      block
      :loading="loading"
      :label="submitLabel"
    />
  </UForm>
</template>
