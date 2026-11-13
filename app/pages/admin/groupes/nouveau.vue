<script setup lang="ts">
import { z } from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';
import { useCreateGroupMutation } from '~/composables/queries/useGroups';
import { errorMessage } from '~/utils/errors';

definePageMeta({ middleware: 'admin', layout: 'admin' });
useHead({ title: 'Nouveau groupe — Secret Santa' });
const screen = computed(() => ({
  back: '/admin/groupes',
  crumbs: [
    { label: 'Groupes', to: '/admin/groupes' },
    { label: 'Nouveau groupe' },
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

const schema = z.object({
  name: z.string().trim().min(1, 'Nom requis').max(100),
  slug: z
    .string()
    .min(2, '2 caractères minimum')
    .max(40)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Minuscules, chiffres et tirets'),
  guardianPassword: z
    .string()
    .min(10, '10 caractères minimum')
    .or(z.literal('')),
});
type Schema = z.output<typeof schema>;
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
          title: 'Groupe créé',
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
    <h1 class="font-display text-3xl font-bold">Nouveau groupe</h1>
    <UForm
      :schema="schema"
      :state="state"
      class="flex flex-col gap-5"
      @submit="onSubmit"
    >
      <UFormField name="name" label="Nom de la famille" required>
        <UInput
          v-model="state.name"
          placeholder="Famille Rabin"
          class="w-full"
          autofocus
        />
      </UFormField>
      <UFormField
        name="slug"
        label="Identifiant"
        help="Le gardien s'en sert pour se connecter."
        required
      >
        <UInput v-model="state.slug" autocapitalize="none" class="w-full" />
      </UFormField>
      <UFormField
        name="guardianPassword"
        label="Mot de passe du gardien"
        help="Facultatif, 10 caractères minimum. Modifiable plus tard."
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
        label="Créer le groupe"
      />
    </UForm>
  </AdminScreen>
</template>
