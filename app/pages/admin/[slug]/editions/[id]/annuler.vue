<script setup lang="ts">
import { z } from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';
import {
  useDashboardQuery,
  useEditionQuery,
} from '~/composables/queries/useGroup';
import { useCancelDrawMutation } from '~/composables/queries/useEdition';

// Cancel and redo the draw (README 6.5), with a double confirmation.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const id = computed(() => String(route.params.id));
const toast = useToast();
const { t } = useT();
const errorMessage = useErrorMessage();
const edition = useEditionQuery(slug, id);
const dashboard = useDashboardQuery(slug);
const cancel = useCancelDrawMutation(slug, id);

useHead({
  title: computed(
    () => `${t('adminEdition.cancelDraw.title')} — ${t('common.appName')}`,
  ),
});
const screen = computed(() => ({
  back: `/admin/${slug.value}/editions/${id.value}`,
  crumbs: [
    {
      label: dashboard.data.value?.group.name ?? slug.value,
      to: `/admin/${slug.value}`,
    },
    {
      label:
        edition.data.value?.edition.label ??
        t('adminEdition.general.editionFallback'),
      to: `/admin/${slug.value}/editions/${id.value}`,
    },
    { label: t('adminEdition.cancelDraw.title') },
  ],
}));

const schema = computed(() =>
  z.object({
    reason: z
      .string()
      .trim()
      .min(3, t('adminEdition.cancelDraw.reasonRequired'))
      .max(200),
    understood: z
      .boolean()
      .refine((v) => v, t('adminEdition.general.tickToConfirm')),
  }),
);
type Schema = z.output<typeof schema.value>;
const state = reactive<{ reason: string; understood: boolean }>({
  reason: '',
  understood: false,
});
const onSubmit = (event: FormSubmitEvent<Schema>) =>
  cancel.mutate(
    { reason: event.data.reason },
    {
      onSuccess: () => {
        toast.add({
          title: t('adminEdition.cancelDraw.done'),
          description: t('adminEdition.cancelDraw.doneDescription'),
          color: 'success',
        });
        navigateTo(`/admin/${slug.value}/editions/${id.value}`, {
          replace: true,
        });
      },
    },
  );
</script>

<template>
  <AdminScreen v-bind="screen">
    <h1 class="font-display text-3xl font-bold">
      {{ t('adminEdition.cancelDraw.title') }}
    </h1>
    <ul class="flex list-disc flex-col gap-1 pl-5 text-sm text-muted">
      <li>{{ t('adminEdition.cancelDraw.effectResults') }}</li>
      <li>{{ t('adminEdition.cancelDraw.effectLinks') }}</li>
      <li>{{ t('adminEdition.cancelDraw.effectJournal') }}</li>
      <li>
        {{
          t('adminEdition.cancelDraw.effectMessage', {
            message: t('common.messageType.redraw'),
          })
        }}
      </li>
    </ul>
    <UForm
      :schema="schema"
      :state="state"
      class="flex flex-col gap-5"
      @submit="onSubmit"
    >
      <UFormField
        name="reason"
        :label="t('adminEdition.cancelDraw.reasonLabel')"
        required
      >
        <UTextarea
          v-model="state.reason"
          :rows="2"
          :placeholder="t('adminEdition.cancelDraw.reasonPlaceholder')"
          class="w-full"
        />
      </UFormField>
      <UFormField name="understood">
        <UCheckbox
          v-model="state.understood"
          :label="t('adminEdition.cancelDraw.understood')"
        />
      </UFormField>
      <UAlert
        v-if="cancel.isError.value"
        color="error"
        variant="subtle"
        :description="errorMessage(cancel.error.value)"
      />
      <UButton
        type="submit"
        color="error"
        block
        :loading="cancel.isPending.value"
        :label="t('adminEdition.cancelDraw.submit')"
      />
    </UForm>
  </AdminScreen>
</template>
