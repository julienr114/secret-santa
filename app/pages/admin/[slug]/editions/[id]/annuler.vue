<script setup lang="ts">
import { z } from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';
import { useCancelDrawMutation } from '~/composables/queries/useEdition';

// Cancel and redo the draw (README 6.5), with a double confirmation.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const id = computed(() => String(route.params.id));
const toast = useToast();
const { t } = useT();
// Back to the list the form was opened from, not to a second copy of it.
const goBack = useGoBack();
const errorMessage = useErrorMessage();
const cancel = useCancelDrawMutation(slug, id);

useHead({
  title: computed(
    () => `${t('adminEdition.cancelDraw.title')} — ${t('common.appName')}`,
  ),
});
const screen = computed(() => ({
  back: `/admin/${slug.value}/editions/${id.value}`,
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
        goBack(`/admin/${slug.value}/editions/${id.value}`);
      },
    },
  );
</script>

<template>
  <AdminScreen v-bind="screen">
    <UiPageTitle>
      {{ t('adminEdition.cancelDraw.title') }}
    </UiPageTitle>
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
