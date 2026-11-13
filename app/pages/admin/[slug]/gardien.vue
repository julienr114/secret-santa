<script setup lang="ts">
import { z } from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';
import { useDashboardQuery } from '~/composables/queries/useGroup';
import { useUpdateGroupMutation } from '~/composables/queries/useGroups';
import { errorMessage } from '~/utils/errors';

// Super-admin only: set or reset the guardian password of a group.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const { user } = useUserSession();
if (user.value?.role !== 'super_admin')
  await navigateTo(`/admin/${slug.value}`, { replace: true });

const dashboard = useDashboardQuery(slug);
const update = useUpdateGroupMutation();
const toast = useToast();
const name = computed(() => dashboard.data.value?.group.name ?? slug.value);
useHead({ title: 'Mot de passe du gardien — Secret Santa' });
const screen = computed(() => ({
  back: `/admin/${slug.value}`,
  crumbs: [
    { label: 'Groupes', to: '/admin/groupes' },
    { label: name.value, to: `/admin/${slug.value}` },
    { label: 'Gardien' },
  ],
}));

const schema = z.object({
  password: z.string().min(10, '10 caractères minimum').max(200),
});
type Schema = z.output<typeof schema>;
const state = reactive<Schema>({ password: '' });
const onSubmit = (event: FormSubmitEvent<Schema>) => {
  const id = dashboard.data.value?.group.id;
  if (!id) return;
  update.mutate(
    { id, guardianPassword: event.data.password },
    {
      onSuccess: () => {
        toast.add({
          title: 'Mot de passe du gardien enregistré',
          color: 'success',
          icon: 'i-lucide-check',
        });
        navigateTo(`/admin/${slug.value}`);
      },
    },
  );
};
</script>

<template>
  <AdminScreen v-bind="screen">
    <h1 class="font-display text-3xl font-bold">Mot de passe du gardien</h1>
    <p class="text-muted">
      Le gardien de {{ name }} se connecte avec l'identifiant
      <code>{{ slug }}</code> et ce mot de passe.
    </p>
    <UForm
      :schema="schema"
      :state="state"
      class="flex flex-col gap-5"
      @submit="onSubmit"
    >
      <UFormField
        name="password"
        label="Nouveau mot de passe"
        help="10 caractères minimum."
        required
      >
        <UInput
          v-model="state.password"
          type="password"
          autocomplete="new-password"
          class="w-full"
          autofocus
        />
      </UFormField>
      <UAlert
        v-if="update.isError.value"
        color="error"
        variant="subtle"
        :description="errorMessage(update.error.value)"
      />
      <UButton
        type="submit"
        block
        :loading="update.isPending.value"
        label="Enregistrer"
      />
    </UForm>
  </AdminScreen>
</template>
