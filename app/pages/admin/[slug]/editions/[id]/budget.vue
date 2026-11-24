<script setup lang="ts">
import {
  useEditionQuery,
  useUpdateEditionMutation,
} from '~/composables/queries/useGroup';

// The budget of a Secret Santa, from its settings (ticket 164,
// V3TirageBudget): the same page of proposals as at its creation;
// « Valider » saves the choice as the edition's own rule and goes back,
// « Retour » gives it up.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const id = computed(() => String(route.params.id));
const { t } = useT();
const errorMessage = useErrorMessage();
const goBack = useGoBack();
const context = useScreenContext(slug, id);
useHead({
  title: () => context.titleOf(t('adminEdition.newEdition.budgetLabel')),
});
const parent = computed(
  () => `/admin/${slug.value}/editions/${id.value}/reglages`,
);
const screen = computed(() => ({ back: parent.value }));

const edition = useEditionQuery(slug, id);
const update = useUpdateEditionMutation(slug);
/** The budget chosen on the page, from the edition's once it is read. */
const budget = ref<string | null>(null);
watch(
  () => edition.data.value?.rules.budget,
  (value) => {
    if (budget.value === null && value !== undefined) budget.value = value;
  },
  { immediate: true },
);
const failure = computed(() =>
  update.isError.value ? errorMessage(update.error.value) : null,
);

/**
 * Keeps the budget as the edition's own rule (keeping its other own
 * rules: the route replaces them all), then goes back.
 * @returns Nothing: the mutation reports by itself.
 */
const onValidate = () =>
  update.mutate(
    {
      id: id.value,
      rulesOverride: {
        ...(edition.data.value?.edition.rulesOverride ?? {}),
        budget: (budget.value ?? '').trim(),
      },
    },
    { onSuccess: () => goBack(parent.value) },
  );
</script>

<template>
  <AdminScreen v-bind="screen">
    <AdminQueryState
      :pending="edition.isPending.value"
      :error="edition.error.value"
      :skeleton="['title', 'card']"
    >
      <div class="flex flex-col gap-1">
        <UiPageContext
          :parts="context.parts.value"
          :label="t('common.context')"
        />
        <UiPageTitle>{{
          t('adminEdition.newEdition.budgetLabel')
        }}</UiPageTitle>
      </div>
      <AdminBudgetPicker v-if="budget !== null" v-model="budget" />
      <p v-if="failure" class="text-sm font-medium text-error" role="alert">
        {{ failure }}
      </p>
      <UiStickyFooter inline>
        <UButton
          block
          size="xl"
          class="h-13 justify-center text-[17px] font-bold"
          :loading="update.isPending.value"
          :disabled="
            update.isPending.value ||
            edition.data.value?.edition.status === 'closed'
          "
          :label="t('common.actions.validate')"
          data-testid="budget-validate"
          @click="onValidate"
        />
      </UiStickyFooter>
    </AdminQueryState>
  </AdminScreen>
</template>
