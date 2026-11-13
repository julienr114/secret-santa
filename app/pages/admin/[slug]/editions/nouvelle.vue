<script setup lang="ts">
import { z } from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';
import {
  useCreateEditionMutation,
  useDashboardQuery,
} from '~/composables/queries/useGroup';
import { errorMessage } from '~/utils/errors';

definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const dashboard = useDashboardQuery(slug);
const create = useCreateEditionMutation(slug);
const name = computed(() => dashboard.data.value?.group.name ?? slug.value);
useHead({ title: 'Nouvelle édition — Secret Santa' });
const screen = computed(() => ({
  back: `/admin/${slug.value}`,
  crumbs: [
    { label: name.value, to: `/admin/${slug.value}` },
    { label: 'Nouvelle édition' },
  ],
}));

const schema = z.object({
  label: z.string().trim().min(1, 'Nom requis').max(60),
  year: z.coerce.number().int().min(2000).max(2100),
});
type Schema = z.output<typeof schema>;
await dashboard.suspense();
const state = reactive({
  label: dashboard.data.value?.nextEdition.label ?? '',
  year: dashboard.data.value?.nextEdition.year ?? new Date().getFullYear(),
});
const onSubmit = (event: FormSubmitEvent<Schema>) =>
  create.mutate(event.data, {
    onSuccess: ({ edition }) =>
      navigateTo(`/admin/${slug.value}/editions/${edition.id}`, {
        replace: true,
      }),
  });
</script>

<template>
  <AdminScreen v-bind="screen">
    <h1 class="font-display text-3xl font-bold">Nouvelle édition</h1>
    <p class="text-muted">
      Les participants de l'édition précédente encore actifs sont repris ; tu
      pourras ajuster la liste ensuite.
    </p>
    <UForm
      :schema="schema"
      :state="state"
      class="flex flex-col gap-5"
      @submit="onSubmit"
    >
      <UFormField name="label" label="Nom de l'édition" required>
        <UInput v-model="state.label" class="w-full" />
      </UFormField>
      <UFormField name="year" label="Année" required>
        <UInput
          v-model="state.year"
          type="number"
          inputmode="numeric"
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
        label="Créer l'édition"
      />
    </UForm>
  </AdminScreen>
</template>
