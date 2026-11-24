<script setup lang="ts">
import { z } from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';
import { useAddOrganizerMutation } from '~/composables/queries/useGroup';

// « Nouvel organisateur » (docs/spec/v3/fete.md, « Les réglages de
// l'événement », ticket 161, V3FeteOrganisateurNouveau): a page, not a
// sheet, since a sheet never carries a field. Their first name and their
// address, both required: a new account takes that first name, one that
// exists keeps its own. They log in with a link sent to the address. Back
// to the settings, the new organiser in the list.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t } = useT();
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const settings = computed(() => `/e/${slug.value}/reglages`);
const context = useScreenContext(slug);
useHead({
  title: () => context.titleOf(t('adminGroup.organizers.addTitle')),
});
const screen = computed(() => ({ back: settings.value }));
const parts = computed(() => [
  ...context.parts.value,
  { label: t('party.reglages.short'), to: settings.value },
]);
const errorMessage = useErrorMessage();
const toast = useMessages();
const add = useAddOrganizerMutation(slug);

const schema = computed(() =>
  z.object({
    firstName: z
      .string()
      .trim()
      .min(1, t('adminGroup.organizers.firstNameRequired'))
      .max(60),
    email: z.email(t('auth.login.emailInvalid')),
  }),
);
type Schema = z.output<typeof schema.value>;
const state = reactive({ firstName: '', email: '' });
const onSubmit = (event: FormSubmitEvent<Schema>) =>
  add.mutate(
    { firstName: event.data.firstName, email: event.data.email.trim() },
    {
      onSuccess: () => {
        toast.done(
          t('adminGroup.organizers.added', { name: event.data.firstName }),
        );
        navigateTo(settings.value, { replace: true });
      },
    },
  );
</script>

<template>
  <AdminScreen v-bind="screen">
    <div class="flex flex-col gap-1">
      <UiPageContext :parts="parts" :label="t('common.context')" />
      <UiPageTitle>{{ t('adminGroup.organizers.addTitle') }}</UiPageTitle>
    </div>
    <UForm
      :schema="schema"
      :state="state"
      :validate-on-input-delay="0"
      class="flex flex-col gap-6"
      data-testid="organizer-form"
      @submit="onSubmit"
    >
      <UFormField
        name="firstName"
        :label="t('adminGroup.organizers.firstNameLabel')"
        :ui="{ label: 'text-[15px] font-semibold' }"
      >
        <UInput
          v-model="state.firstName"
          autocomplete="off"
          size="xl"
          class="w-full"
          :ui="{ base: 'h-12' }"
          autofocus
        />
      </UFormField>
      <UFormField
        name="email"
        :label="t('adminGroup.organizers.emailLabel')"
        :ui="{ label: 'text-[15px] font-semibold' }"
      >
        <UInput
          v-model="state.email"
          type="email"
          inputmode="email"
          autocomplete="off"
          autocapitalize="none"
          size="xl"
          :placeholder="t('adminGroup.personForm.emailPlaceholder')"
          class="w-full"
          :ui="{ base: 'h-12' }"
        />
      </UFormField>
      <p class="text-[15px] leading-[1.45] text-toned">
        {{ t('adminGroup.organizers.noResults') }}
      </p>
      <UAlert
        v-if="add.isError.value"
        color="error"
        variant="subtle"
        :description="errorMessage(add.error.value)"
      />
      <UButton
        type="submit"
        block
        size="xl"
        class="h-12 justify-center font-bold"
        :loading="add.isPending.value"
        :label="t('common.actions.add')"
        data-testid="organizer-submit"
      />
    </UForm>
  </AdminScreen>
</template>
