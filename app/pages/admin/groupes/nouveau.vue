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
  back: '/admin/groupes',
  crumbs: [
    { label: t('adminGroup.groups.title'), to: '/admin/groupes' },
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
    guardianPassword: z
      .string()
      .min(10, t('adminGroup.newGroup.passwordMin'))
      .or(z.literal('')),
  }),
);
type Schema = z.output<typeof schema.value>;
const state = reactive<Schema>({ name: '', slug: '', guardianPassword: '' });
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
      ...(event.data.guardianPassword
        ? { guardianPassword: event.data.guardianPassword }
        : {}),
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
        name="guardianPassword"
        :label="t('adminGroup.newGroup.passwordLabel')"
        :help="t('adminGroup.newGroup.passwordHelp')"
      >
        <UInput
          v-model="state.guardianPassword"
          type="password"
          autocomplete="new-password"
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
