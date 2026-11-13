<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui';
import { rulesSchema, type Rules } from '#server/utils/rules';
import {
  useDashboardQuery,
  useRulesQuery,
  useUpdateRulesMutation,
} from '~/composables/queries/useGroup';
import { errorMessage } from '~/utils/errors';
import { RULE_LABELS } from '~/utils/labels';

definePageMeta({ middleware: 'admin', layout: 'admin' });
useHead({ title: 'Règles — Secret Santa' });
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const rules = useRulesQuery(slug);
const dashboard = useDashboardQuery(slug);
const update = useUpdateRulesMutation(slug);
const toast = useToast();
const screen = computed(() => ({
  back: `/admin/${slug.value}`,
  crumbs: [
    {
      label: dashboard.data.value?.group.name ?? slug.value,
      to: `/admin/${slug.value}`,
    },
    { label: 'Règles' },
  ],
}));

// Forms start from loaded data: wait for it (also during server rendering).
await rules.suspense();
const state = reactive<Partial<Rules>>({ ...rules.data.value?.rules });
const onSubmit = (event: FormSubmitEvent<Rules>) =>
  update.mutate(event.data, {
    onSuccess: () =>
      toast.add({
        title: 'Règles enregistrées',
        color: 'success',
        icon: 'i-lucide-check',
      }),
    onError: (error) =>
      toast.add({ title: errorMessage(error), color: 'error' }),
  });
const sectionTitle =
  'px-1 text-xs font-semibold tracking-wide text-muted uppercase';
</script>

<template>
  <AdminScreen v-bind="screen">
    <h1 class="font-display text-3xl font-bold">Règles du tirage</h1>
    <p class="text-muted">
      Valeurs par défaut pour chaque édition ; une édition peut les surcharger.
    </p>
    <AdminQueryState
      :pending="rules.isPending.value"
      :error="rules.error.value"
    >
      <UForm
        :schema="rulesSchema"
        :state="state"
        class="flex flex-col gap-8"
        @submit="onSubmit"
      >
        <section class="flex flex-col gap-4">
          <h2 :class="sectionTitle">Tirage</h2>
          <USwitch
            v-model="state.excludeSpouse"
            :label="RULE_LABELS.excludeSpouse"
          />
          <UFormField
            name="excludePreviousYears"
            :label="RULE_LABELS.excludePreviousYears"
            help="0 pour désactiver."
          >
            <UInputNumber
              v-model="state.excludePreviousYears"
              :min="0"
              :max="10"
              class="w-36"
            />
          </UFormField>
        </section>
        <section class="flex flex-col gap-4">
          <h2 :class="sectionTitle">Affiché avec le résultat</h2>
          <UFormField name="budget" :label="RULE_LABELS.budget">
            <UInput
              v-model="state.budget"
              placeholder="20 € max"
              class="w-full"
            />
          </UFormField>
          <UFormField name="eventDate" :label="RULE_LABELS.eventDate">
            <UInput
              v-model="state.eventDate"
              placeholder="24 décembre"
              class="w-full"
            />
          </UFormField>
          <UFormField
            name="guardianMessage"
            :label="RULE_LABELS.guardianMessage"
          >
            <UTextarea
              v-model="state.guardianMessage"
              :rows="3"
              class="w-full"
            />
          </UFormField>
        </section>
        <section class="flex flex-col gap-4">
          <h2 :class="sectionTitle">Listes de souhaits</h2>
          <USwitch v-model="state.wishlist" :label="RULE_LABELS.wishlist" />
          <UFormField name="maxWishes" :label="RULE_LABELS.maxWishes">
            <UInputNumber
              v-model="state.maxWishes"
              :min="1"
              :max="50"
              class="w-36"
            />
          </UFormField>
        </section>
        <UButton
          type="submit"
          block
          :loading="update.isPending.value"
          label="Enregistrer"
        />
      </UForm>
    </AdminQueryState>
  </AdminScreen>
</template>
