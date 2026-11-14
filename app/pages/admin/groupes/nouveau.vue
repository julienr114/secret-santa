<script setup lang="ts">
import { z } from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';
import { useCreateGroupMutation } from '~/composables/queries/useGroups';

definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t } = useT();
const errorMessage = useErrorMessage();
useHead({
  title: computed(
    () => `${t('adminGroup.newGroup.title')} — ${t('common.appName')}`,
  ),
});
const screen = computed(() => ({
  back: '/',
  crumbs: [
    { label: t('auth.home.title'), to: '/' },
    { label: t('adminGroup.newGroup.title') },
  ],
}));

const create = useCreateGroupMutation();
const toast = useToast();

const slugify = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const schema = computed(() =>
  z.object({
    name: z
      .string()
      .trim()
      .min(1, t('adminGroup.newGroup.nameRequired'))
      .max(100),
    slug: z
      .string()
      .min(2, t('adminGroup.newGroup.slugMin'))
      .max(40)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, t('adminGroup.newGroup.slugFormat')),
    organizer: z
      .string()
      .trim()
      .refine(
        (value) => value === '' || z.email().safeParse(value).success,
        t('auth.login.emailInvalid'),
      ),
  }),
);
type Schema = z.output<typeof schema.value>;
const state = reactive<Schema>({ name: '', slug: '', organizer: '' });
watch(
  () => state.name,
  (name) => {
    state.slug = slugify(name);
  },
);

const onSubmit = (event: FormSubmitEvent<Schema>) =>
  create.mutate(
    {
      name: event.data.name,
      slug: event.data.slug,
      organizers: event.data.organizer ? [event.data.organizer] : [],
    },
    {
      onSuccess: ({ group }) => {
        toast.add({
          title: t('adminGroup.newGroup.created'),
          color: 'success',
          icon: 'i-lucide-check',
        });
        navigateTo(`/admin/${group.slug}`, { replace: true });
      },
    },
  );
</script>

<template>
  <AdminScreen v-bind="screen">
    <UiPageTitle>
      {{ t('adminGroup.newGroup.title') }}
    </UiPageTitle>
    <UForm
      :schema="schema"
      :state="state"
      class="flex flex-col gap-5"
      @submit="onSubmit"
    >
      <UFormField
        name="name"
        :label="t('adminGroup.newGroup.nameLabel')"
        required
      >
        <UInput
          v-model="state.name"
          :placeholder="t('adminGroup.newGroup.namePlaceholder')"
          class="w-full"
          autofocus
        />
      </UFormField>
      <UFormField
        name="slug"
        :label="t('adminGroup.newGroup.slugLabel')"
        :help="t('adminGroup.newGroup.slugHelp')"
        required
      >
        <UInput v-model="state.slug" autocapitalize="none" class="w-full" />
      </UFormField>
      <UFormField
        name="organizer"
        :label="t('adminGroup.newGroup.organizerLabel')"
        :help="t('adminGroup.newGroup.organizerHelp')"
      >
        <UInput
          v-model="state.organizer"
          type="email"
          inputmode="email"
          autocomplete="off"
          autocapitalize="none"
          class="w-full"
        />
      </UFormField>
      <UAlert
        v-if="create.isError.value"
        color="error"
        variant="subtle"
        :description="errorMessage(create.error.value)"
      />
      <UButton
        type="submit"
        block
        :loading="create.isPending.value"
        :label="t('adminGroup.newGroup.submit')"
      />
    </UForm>
  </AdminScreen>
</template>
