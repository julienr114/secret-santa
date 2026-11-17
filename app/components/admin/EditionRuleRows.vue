<script setup lang="ts">
import {
  useEditionQuery,
  useUpdateEditionMutation,
} from '~/composables/queries/useGroup';

// The budget and the word for the participants, as two rows of the
// edition screen (Correction 9, decided on 16 November 2026): each opens
// its sheet and is saved with « Valider », as the edition's own rules.
// Read only once the edition is closed.
const props = defineProps<{
  slug: string;
  editionId: string;
  readonly?: boolean;
}>();
const { t } = useT();
const errorMessage = useErrorMessage();

const edition = useEditionQuery(
  () => props.slug,
  () => props.editionId,
);
const update = useUpdateEditionMutation(() => props.slug);
const rules = computed(() => edition.data.value?.rules);

/** The two rules, each with what its row and its sheet say. */
const RULES = {
  budget: { max: 60, icon: 'i-lucide-circle-euro' },
  guardianMessage: { max: 300, icon: 'i-lucide-message-circle' },
} as const;
type Rule = keyof typeof RULES;

const editing = ref<Rule | null>(null);
const failure = ref<unknown>(null);
const saving = ref<Rule | null>(null);
const sheet = (rule: Rule) =>
  computed({
    get: () => editing.value === rule,
    set: (value) => {
      editing.value = value ? rule : null;
      failure.value = null;
    },
  });
const budgetOpen = sheet('budget');
const wordOpen = sheet('guardianMessage');

/**
 * What a row says under its title: the value, or that there is none.
 * @param rule - The rule.
 * @returns The line.
 */
const valueOf = (rule: Rule) =>
  rules.value?.[rule] || t('adminEdition.screen.rules.none');

/**
 * Saves one rule as the edition's own, keeping its other own rules (the
 * route replaces them all).
 * @param rule - The rule changed.
 * @param value - Its new value.
 * @returns Nothing: the sheet closes once saved, or shows the error.
 */
const onValidate = (rule: Rule, value: string) => {
  saving.value = rule;
  failure.value = null;
  update.mutate(
    {
      id: props.editionId,
      rulesOverride: {
        ...(edition.data.value?.edition.rulesOverride ?? {}),
        [rule]: value,
      },
    },
    {
      onSuccess: () => {
        editing.value = null;
      },
      onError: (error) => {
        failure.value = error;
      },
      onSettled: () => {
        saving.value = null;
      },
    },
  );
};
</script>

<template>
  <UiListItem
    :icon="RULES.budget.icon"
    icon-tone="neutral"
    :title="t('adminEdition.newEdition.budgetLabel')"
    :subtitle="valueOf('budget')"
    :chevron="!readonly"
    :busy="saving === 'budget'"
    :busy-label="t('common.actions.saving')"
    :on-click="readonly ? undefined : () => (editing = 'budget')"
    data-testid="rule-budget"
  />
  <UiListItem
    :icon="RULES.guardianMessage.icon"
    icon-tone="neutral"
    :title="t('adminEdition.newEdition.messageLabel')"
    :subtitle="valueOf('guardianMessage')"
    :chevron="!readonly"
    :busy="saving === 'guardianMessage'"
    :busy-label="t('common.actions.saving')"
    :on-click="readonly ? undefined : () => (editing = 'guardianMessage')"
    data-testid="rule-word"
  />
  <UiTextSheet
    v-if="!readonly"
    v-model:open="budgetOpen"
    :title="t('adminEdition.newEdition.budgetLabel')"
    :description="t('adminEdition.screen.rules.budgetHelp')"
    :label="t('adminEdition.newEdition.budgetLabel')"
    :value="rules?.budget ?? ''"
    :maxlength="RULES.budget.max"
    :placeholder="t('adminEdition.screen.rules.budgetPlaceholder')"
    :validate-label="t('common.actions.validate')"
    :cancel-label="t('common.actions.cancel')"
    :loading="saving === 'budget'"
    :error="failure ? errorMessage(failure) : null"
    @validate="(value) => onValidate('budget', value)"
  />
  <UiTextSheet
    v-if="!readonly"
    v-model:open="wordOpen"
    :title="t('adminEdition.newEdition.messageLabel')"
    :description="t('adminEdition.screen.rules.wordHelp')"
    :label="t('adminEdition.screen.rules.wordLabel')"
    :value="rules?.guardianMessage ?? ''"
    :maxlength="RULES.guardianMessage.max"
    :placeholder="t('adminEdition.newEdition.messagePlaceholder')"
    :validate-label="t('common.actions.validate')"
    :cancel-label="t('common.actions.cancel')"
    :loading="saving === 'guardianMessage'"
    :error="failure ? errorMessage(failure) : null"
    @validate="(value) => onValidate('guardianMessage', value)"
  />
</template>
