<script setup lang="ts">
import { LOCALES, type Locale } from '#shared/i18n';
import type { PersonDraft } from '~/composables/usePersonDraft';

// The fields of a person: first name, email address (optional), then a
// list whose first row is the language of their messages, picked in a
// sheet; the `rows` slot adds rows to that list.
defineProps<{
  errors: { firstName?: string; email?: string };
  emailHelp: string;
  emailPlaceholder?: string;
}>();
const draft = defineModel<PersonDraft>('draft', { required: true });
const { t, tk } = useT();
const languageOpen = ref(false);
const choices = computed(() =>
  LOCALES.map((value) => ({ value, label: tk(`common.language.${value}`) })),
);
/**
 * Keeps the language picked.
 * @param language - The language.
 * @returns Nothing.
 */
const onLanguage = (language: Locale) => {
  draft.value.language = language;
  languageOpen.value = false;
};
</script>

<template>
  <UFormField
    :label="t('adminGroup.personForm.firstNameLabel')"
    :error="errors.firstName"
    :ui="{ label: 'text-[15px] font-semibold' }"
  >
    <UInput
      v-model="draft.firstName"
      size="xl"
      autocomplete="off"
      class="w-full"
      :ui="{ base: 'h-12' }"
    />
  </UFormField>
  <UFormField
    :help="emailHelp"
    :error="errors.email"
    :ui="{ help: 'text-[13px] leading-[1.4] text-toned' }"
  >
    <template #label>
      <span class="text-[15px] font-semibold"
        >{{ t('adminGroup.personForm.emailLabel') }}
        <span class="font-normal text-toned">{{
          t('adminEdition.newEdition.optional')
        }}</span></span
      >
    </template>
    <UInput
      v-model="draft.email"
      type="email"
      inputmode="email"
      autocomplete="off"
      autocapitalize="off"
      size="xl"
      class="w-full"
      :placeholder="emailPlaceholder"
      :ui="{ base: 'h-12' }"
    />
  </UFormField>
  <UiList>
    <UiListItem
      :title="t('adminGroup.personForm.languageRow')"
      :value="tk(`common.language.${draft.language}`)"
      :on-click="() => (languageOpen = true)"
    />
    <slot name="rows" />
  </UiList>
  <UiChoiceSheet
    v-model:open="languageOpen"
    :title="t('adminGroup.personForm.languageRow')"
    :description="t('adminGroup.personForm.languageHelp')"
    :choices="choices"
    :value="draft.language"
    :validate-label="t('common.actions.validate')"
    :cancel-label="t('common.actions.cancel')"
    @validate="onLanguage"
  />
</template>
