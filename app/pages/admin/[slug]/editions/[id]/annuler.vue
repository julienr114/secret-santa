<script setup lang="ts">
import { z } from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';
import {
  useDashboardQuery,
  useEditionQuery,
} from '~/composables/queries/useGroup';
import { useCancelDrawMutation } from '~/composables/queries/useEdition';
import { errorMessage } from '~/utils/errors';

// Cancel and redo the draw (README 6.5), with a double confirmation.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const id = computed(() => String(route.params.id));
const toast = useToast();
const edition = useEditionQuery(slug, id);
const dashboard = useDashboardQuery(slug);
const cancel = useCancelDrawMutation(slug, id);

useHead({ title: 'Annuler le tirage — Secret Santa' });
const screen = computed(() => ({
  back: `/admin/${slug.value}/editions/${id.value}`,
  crumbs: [
    {
      label: dashboard.data.value?.group.name ?? slug.value,
      to: `/admin/${slug.value}`,
    },
    {
      label: edition.data.value?.edition.label ?? 'Édition',
      to: `/admin/${slug.value}/editions/${id.value}`,
    },
    { label: 'Annuler le tirage' },
  ],
}));

const schema = z.object({
  reason: z.string().trim().min(3, 'Explique en quelques mots').max(200),
  understood: z.boolean().refine((v) => v, 'Coche pour confirmer'),
});
type Schema = z.output<typeof schema>;
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
          title: 'Tirage annulé',
          description: 'Ajuste la liste puis relance le tirage.',
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
    <h1 class="font-display text-3xl font-bold">Annuler le tirage</h1>
    <ul class="flex list-disc flex-col gap-1 pl-5 text-sm text-muted">
      <li>Tous les résultats sont effacés, la liste redevient modifiable.</li>
      <li>Les liens et les codes restent valables.</li>
      <li>Le motif est affiché dans le journal, visible de tout le groupe.</li>
      <li>
        Après le nouveau tirage, envoie à chacun le message « Nouveau tirage ».
      </li>
    </ul>
    <UForm
      :schema="schema"
      :state="state"
      class="flex flex-col gap-5"
      @submit="onSubmit"
    >
      <UFormField name="reason" label="Motif" required>
        <UTextarea
          v-model="state.reason"
          :rows="2"
          placeholder="Désistement de Tom"
          class="w-full"
        />
      </UFormField>
      <UFormField name="understood">
        <UCheckbox
          v-model="state.understood"
          label="Je comprends que les résultats actuels seront perdus"
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
        label="Annuler le tirage"
      />
    </UForm>
  </AdminScreen>
</template>
