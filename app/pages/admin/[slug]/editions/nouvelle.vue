<script setup lang="ts">
import { z } from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';
import {
  useCreateEditionMutation,
  useDashboardQuery,
} from '~/composables/queries/useGroup';

definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const { t } = useT();
const errorMessage = useErrorMessage();
const slug = computed(() => String(route.params.slug));
const dashboard = useDashboardQuery(slug);
const create = useCreateEditionMutation(slug);
useHead({
  title: computed(
    () => `${t('adminEdition.newEdition.title')} — ${t('common.appName')}`,
  ),
});
const screen = computed(() => ({
  back: `/admin/${slug.value}`,
}));

const schema = computed(() =>
  z.object({
    label: z
      .string()
      .trim()
      .min(1, t('adminEdition.newEdition.nameRequired'))
      .max(60),
    year: z.coerce.number().int().min(2000).max(2100),
  }),
);
type Schema = z.output<typeof schema.value>;
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
    <UiPageTitle>
      {{ t('adminEdition.newEdition.title') }}
    </UiPageTitle>
    <p class="text-muted">{{ t('adminEdition.newEdition.intro') }}</p>
    <UForm
      :schema="schema"
      :state="state"
      class="flex flex-col gap-5"
      @submit="onSubmit"
    >
      <UFormField
        name="label"
        :label="t('adminEdition.newEdition.nameLabel')"
        required
      >
        <UInput v-model="state.label" class="w-full" />
      </UFormField>
      <UFormField
        name="year"
        :label="t('adminEdition.newEdition.yearLabel')"
        required
      >
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
        :label="t('adminEdition.newEdition.submit')"
      />
    </UForm>
  </AdminScreen>
</template>
