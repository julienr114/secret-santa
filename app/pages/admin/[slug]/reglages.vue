<script setup>
import {
  useRulesQuery,
  useUpdateRulesMutation,
} from '../../../composables/queries/useGroup.js';
import { errorMessage } from '../../../utils/errors.js';
import { RULE_LABELS } from '../../../utils/labels.js';

definePageMeta({ middleware: 'admin', layout: 'admin' });
useHead({ title: 'Réglages — Secret Santa' });
const route = useRoute();
const slug = computed(() => route.params.slug);
const rules = useRulesQuery(slug);
const update = useUpdateRulesMutation(slug);

const form = reactive({});
watch(
  () => rules.data.value?.rules,
  (value) => value && Object.assign(form, value),
  { immediate: true },
);
const saved = ref(false);
const submit = () =>
  update.mutate(
    {
      ...form,
      excludePreviousYears: Number(form.excludePreviousYears),
      maxPinAttempts: Number(form.maxPinAttempts),
      maxWishes: Number(form.maxWishes),
    },
    {
      onSuccess: () => {
        saved.value = true;
        setTimeout(() => (saved.value = false), 3000);
      },
    },
  );
const checkbox = 'flex min-h-11 items-center gap-3 text-sm';
</script>

<template>
  <div class="flex flex-col gap-4">
    <h1 class="text-xl font-bold">Réglages du groupe</h1>
    <p class="text-sm text-neutral-600">
      Valeurs par défaut pour chaque édition ; une édition peut les surcharger.
    </p>
    <UiNotice v-if="rules.isError.value">{{
      errorMessage(rules.error.value)
    }}</UiNotice>
    <p v-else-if="rules.isPending.value" class="text-sm text-neutral-500">
      Chargement…
    </p>
    <form v-else class="flex flex-col gap-4" @submit.prevent="submit">
      <UiCard>
        <template #title>Tirage</template>
        <div class="flex flex-col gap-2">
          <label :class="checkbox"
            ><input
              v-model="form.excludeSpouse"
              type="checkbox"
              class="size-5"
            />
            {{ RULE_LABELS.excludeSpouse }}</label
          >
          <UiField
            id="epy"
            :label="RULE_LABELS.excludePreviousYears"
            hint="0 pour désactiver"
          >
            <UiInput
              id="epy"
              v-model="form.excludePreviousYears"
              type="number"
              min="0"
              max="10"
              inputmode="numeric"
            />
          </UiField>
          <label :class="checkbox"
            ><input
              v-model="form.registrationRequired"
              type="checkbox"
              class="size-5"
            />
            {{ RULE_LABELS.registrationRequired }}</label
          >
        </div>
      </UiCard>
      <UiCard>
        <template #title>Affiché avec le résultat</template>
        <div class="flex flex-col gap-3">
          <UiField id="budget" :label="RULE_LABELS.budget"
            ><UiInput id="budget" v-model="form.budget" placeholder="20 € max"
          /></UiField>
          <UiField id="date" :label="RULE_LABELS.eventDate"
            ><UiInput
              id="date"
              v-model="form.eventDate"
              placeholder="24 décembre"
          /></UiField>
          <UiField id="msg" :label="RULE_LABELS.guardianMessage">
            <textarea
              id="msg"
              v-model="form.guardianMessage"
              rows="3"
              class="w-full rounded-lg border border-neutral-300 px-3 py-2 text-base outline-none focus:border-red-700 focus:ring-2 focus:ring-red-200"
            />
          </UiField>
        </div>
      </UiCard>
      <UiCard>
        <template #title>Sécurité et souhaits</template>
        <div class="flex flex-col gap-3">
          <UiField id="mpa" :label="RULE_LABELS.maxPinAttempts"
            ><UiInput
              id="mpa"
              v-model="form.maxPinAttempts"
              type="number"
              min="1"
              max="20"
              inputmode="numeric"
          /></UiField>
          <label :class="checkbox"
            ><input v-model="form.wishlist" type="checkbox" class="size-5" />
            {{ RULE_LABELS.wishlist }}</label
          >
          <UiField id="mw" :label="RULE_LABELS.maxWishes"
            ><UiInput
              id="mw"
              v-model="form.maxWishes"
              type="number"
              min="1"
              max="50"
              inputmode="numeric"
          /></UiField>
        </div>
      </UiCard>
      <UiNotice v-if="update.isError.value">{{
        errorMessage(update.error.value)
      }}</UiNotice>
      <UiNotice v-if="saved" tone="success">Réglages enregistrés.</UiNotice>
      <UiButton type="submit" :loading="update.isPending.value"
        >Enregistrer</UiButton
      >
    </form>
  </div>
</template>
