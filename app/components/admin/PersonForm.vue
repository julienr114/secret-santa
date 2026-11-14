<script setup lang="ts">
import { z } from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';
import { randomAvatar, type Avatar } from '#server/utils/avatars';
import { DEFAULT_LOCALE, LOCALES, type Locale } from '#shared/i18n';

// Shared by the "new person" and "person" screens.
export type PersonFormValue = {
  firstName: string;
  lastName: string | null;
  email?: string | null;
  avatarEmoji: Avatar['emoji'];
  avatarColor: Avatar['color'];
  /** Language of the person's page, messages and emails. */
  language: Locale;
};

// `autosave` (person screen): no submit button, changes are saved when a
// field loses focus, the avatar is confirmed or the language changes.
const props = defineProps<{
  autosave?: boolean;
  initial?: {
    firstName?: string;
    lastName?: string | null;
    email?: string | null;
    avatar?: Avatar;
    language?: Locale;
  };
  loading?: boolean;
  submitLabel?: string;
}>();
const emit = defineEmits<{ submit: [value: PersonFormValue] }>();

const { t, tk } = useT();

const schema = computed(() =>
  z.object({
    firstName: z
      .string()
      .trim()
      .min(1, t('adminGroup.personForm.firstNameRequired'))
      .max(60),
    lastName: z.string().trim().max(60),
    email: z
      .string()
      .trim()
      .max(254)
      .refine(
        (value) => value === '' || z.email().safeParse(value).success,
        t('adminGroup.personForm.emailInvalid'),
      ),
    language: z.enum(LOCALES),
  }),
);
type Schema = z.output<typeof schema.value>;
const state = reactive<Schema>({
  firstName: props.initial?.firstName ?? '',
  lastName: props.initial?.lastName ?? '',
  email: props.initial?.email ?? '',
  language: props.initial?.language ?? DEFAULT_LOCALE,
});
const languageItems = computed(() =>
  LOCALES.map((code) => ({
    value: code,
    label: tk(`common.language.${code}`),
  })),
);
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
  email: data.email.trim().toLowerCase() || null,
  avatarEmoji: avatar.value.emoji,
  avatarColor: avatar.value.color,
  language: data.language,
});
const onSubmit = (event: FormSubmitEvent<Schema>) =>
  emit('submit', valueOf(event.data));

// Autosave: send only valid values that differ from the last saved ones.
const lastSaved = ref(JSON.stringify(valueOf(state)));
const save = () => {
  const parsed = schema.value.safeParse(state);
  if (!parsed.success) return;
  const value = valueOf(parsed.data);
  if (JSON.stringify(value) === lastSaved.value) return;
  lastSaved.value = JSON.stringify(value);
  emit('submit', value);
};
const onBlur = () => {
  if (props.autosave) save();
};
const onLanguage = (language: Locale) => {
  state.language = language;
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
        :aria-label="t('adminGroup.personForm.changeAvatar')"
        @click="openPicker"
      >
        <UiAvatar :avatar="avatar" size="lg" />
        <span
          class="absolute -right-1 -bottom-1 flex size-8 items-center justify-center rounded-full bg-default shadow ring-1 ring-default"
        >
          <UIcon name="i-lucide-pencil" class="size-4 text-muted" />
        </span>
      </button>
      <UButton
        variant="link"
        color="neutral"
        :label="t('adminGroup.personForm.changeAvatar')"
        @click="openPicker"
      />
    </div>
    <UDrawer
      v-model:open="pickerOpen"
      :title="t('adminGroup.avatar.title')"
      :description="t('adminGroup.avatar.description')"
    >
      <template #body>
        <AdminAvatarPicker v-model="draft" />
      </template>
      <template #footer>
        <UButton
          block
          :label="t('common.actions.validate')"
          @click="confirmPicker"
        />
      </template>
    </UDrawer>
    <UFormField
      name="firstName"
      :label="t('adminGroup.personForm.firstNameLabel')"
      required
    >
      <UInput
        v-model="state.firstName"
        autocomplete="off"
        class="w-full"
        @blur="onBlur"
      />
    </UFormField>
    <UFormField
      name="lastName"
      :label="t('adminGroup.personForm.lastNameLabel')"
      :help="t('adminGroup.personForm.lastNameHelp')"
    >
      <UInput
        v-model="state.lastName"
        autocomplete="off"
        class="w-full"
        @blur="onBlur"
      />
    </UFormField>
    <UFormField
      name="email"
      :label="t('adminGroup.personForm.emailLabel')"
      :help="t('adminGroup.personForm.emailHelp')"
    >
      <UInput
        v-model="state.email"
        type="email"
        inputmode="email"
        autocomplete="off"
        autocapitalize="off"
        class="w-full"
        @blur="onBlur"
      />
    </UFormField>
    <UFormField
      name="language"
      :label="t('common.language.label')"
      :help="t('adminGroup.personForm.languageHelp')"
    >
      <USelect
        :model-value="state.language"
        :items="languageItems"
        class="w-full"
        @update:model-value="onLanguage"
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
