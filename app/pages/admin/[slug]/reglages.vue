<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui';
import { rulesSchema, type Rules } from '#server/utils/rules';
import {
  useRulesQuery,
  useUpdateRulesMutation,
} from '~/composables/queries/useGroup';
import { errorMessage } from '~/utils/errors';
import { RULE_LABELS } from '~/utils/labels';

definePageMeta({ middleware: 'admin', layout: 'admin' });
useHead({ title: 'Réglages — Secret Santa' });
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const rules = useRulesQuery(slug);
const update = useUpdateRulesMutation(slug);
const toast = useToast();

const state = reactive<Partial<Rules>>({});
watch(
  () => rules.data.value?.rules,
  (value) => value && Object.assign(state, value),
  { immediate: true },
);
const onSubmit = (event: FormSubmitEvent<Rules>) =>
  update.mutate(event.data, {
    onSuccess: () =>
      toast.add({ title: 'Réglages enregistrés', color: 'success' }),
    onError: (error) =>
      toast.add({ title: errorMessage(error), color: 'error' }),
  });
</script>

<template>
  <div class="flex flex-col gap-4">
    <h1 class="font-display text-2xl font-bold">Réglages du groupe</h1>
    <p class="text-sm text-muted">
      Valeurs par défaut pour chaque édition ; une édition peut les surcharger.
    </p>
    <AdminQueryState
      :pending="rules.isPending.value"
      :error="rules.error.value"
    >
      <UForm
        :schema="rulesSchema"
        :state="state"
        class="flex flex-col gap-4"
        @submit="onSubmit"
      >
        <UCard>
          <template #header><h2 class="font-semibold">Tirage</h2></template>
          <div class="flex flex-col gap-4">
            <UCheckbox
              v-model="state.excludeSpouse"
              :label="RULE_LABELS.excludeSpouse"
            />
            <UFormField
              name="excludePreviousYears"
              :label="RULE_LABELS.excludePreviousYears"
              hint="0 pour désactiver"
            >
              <UInput
                v-model.number="state.excludePreviousYears"
                type="number"
                min="0"
                max="10"
                inputmode="numeric"
                class="w-32"
              />
            </UFormField>
            <UCheckbox
              v-model="state.registrationRequired"
              :label="RULE_LABELS.registrationRequired"
            />
          </div>
        </UCard>
        <UCard>
          <template #header
            ><h2 class="font-semibold">Affiché avec le résultat</h2></template
          >
          <div class="flex flex-col gap-4">
            <UFormField name="budget" :label="RULE_LABELS.budget"
              ><UInput
                v-model="state.budget"
                placeholder="20 € max"
                class="w-full"
            /></UFormField>
            <UFormField name="eventDate" :label="RULE_LABELS.eventDate"
              ><UInput
                v-model="state.eventDate"
                placeholder="24 décembre"
                class="w-full"
            /></UFormField>
            <UFormField
              name="guardianMessage"
              :label="RULE_LABELS.guardianMessage"
              ><UTextarea
                v-model="state.guardianMessage"
                :rows="3"
                class="w-full"
            /></UFormField>
          </div>
        </UCard>
        <UCard>
          <template #header
            ><h2 class="font-semibold">Sécurité et souhaits</h2></template
          >
          <div class="flex flex-col gap-4">
            <UFormField
              name="maxPinAttempts"
              :label="RULE_LABELS.maxPinAttempts"
              ><UInput
                v-model.number="state.maxPinAttempts"
                type="number"
                min="1"
                max="20"
                inputmode="numeric"
                class="w-32"
            /></UFormField>
            <UCheckbox v-model="state.wishlist" :label="RULE_LABELS.wishlist" />
            <UFormField name="maxWishes" :label="RULE_LABELS.maxWishes"
              ><UInput
                v-model.number="state.maxWishes"
                type="number"
                min="1"
                max="50"
                inputmode="numeric"
                class="w-32"
            /></UFormField>
          </div>
        </UCard>
        <UButton
          type="submit"
          :loading="update.isPending.value"
          label="Enregistrer"
          class="self-start"
        />
      </UForm>
    </AdminQueryState>
  </div>
</template>
