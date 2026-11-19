<script setup lang="ts">
import {
  useEditionQuery,
  useUpdateEditionMutation,
} from '~/composables/queries/useGroup';

// The budget and the word for the participants, as two rows of the
// edition screen (Correction 9, decided on 16 November 2026), saved as the
// edition's own rules: the budget in its sheet, shown at once; the word on
// its own page (README 23.3, Correction 18).
// Read only once the edition is closed.
const props = defineProps<{
  slug: string;
  editionId: string;
  readonly?: boolean;
  /**
   * The value on the right and short titles, as on « Réglages de
   * l'édition » (README 22.16), instead of the value under the title.
   */
  values?: boolean;
}>();
const { t } = useT();
const errorMessage = useErrorMessage();
const toast = useMessages();

const edition = useEditionQuery(
  () => props.slug,
  () => props.editionId,
);
const update = useUpdateEditionMutation(() => props.slug);
const rules = computed(() => edition.data.value?.rules);

/** The two rules, each with its length and its row's icon. */
const RULES = {
  budget: { max: 60, icon: 'i-lucide-circle-euro' },
  guardianMessage: { max: 300, icon: 'i-lucide-message-circle' },
} as const;
type Rule = keyof typeof RULES;

const editing = ref<Rule | null>(null);
/** Values chosen and not yet confirmed by the server: shown at once. */
const pending = ref<Partial<Record<Rule, string>>>({});
const budgetOpen = computed({
  get: () => editing.value === 'budget',
  set: (value) => {
    editing.value = value ? 'budget' : null;
  },
});

/**
 * A rule as shown: the value being saved, or the edition's.
 * @param rule - The rule.
 * @returns Its value, maybe empty.
 */
const shownOf = (rule: Rule) =>
  pending.value[rule] ?? rules.value?.[rule] ?? '';
/**
 * What a row says under its title: the value, or that there is none.
 * @param rule - The rule.
 * @returns The line.
 */
const valueOf = (rule: Rule) =>
  shownOf(rule) || t('adminEdition.screen.rules.none');
/**
 * Whether a rule is being saved.
 * @param rule - The rule.
 * @returns True while its change is on its way.
 */
const saving = (rule: Rule) => rule in pending.value;

/**
 * Saves one rule as the edition's own, keeping its other own rules (the
 * route replaces them all). Like every setting (README 23.3): the sheet
 * closes, the new value shows at once with the wheel on its row, and a
 * failure puts the old one back with a toast.
 * @param rule - The rule changed.
 * @param value - Its new value.
 * @returns Nothing.
 */
const onValidate = (rule: Rule, value: string) => {
  editing.value = null;
  pending.value = { ...pending.value, [rule]: value };
  update.mutate(
    {
      id: props.editionId,
      rulesOverride: {
        ...(edition.data.value?.edition.rulesOverride ?? {}),
        [rule]: value,
      },
    },
    {
      onError: (error) => toast.failed(errorMessage(error)),
      onSettled: () => {
        pending.value = Object.fromEntries(
          Object.entries(pending.value).filter(([key]) => key !== rule),
        );
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
    :subtitle="values ? undefined : valueOf('budget')"
    :value="values ? valueOf('budget') : undefined"
    :chevron="!readonly"
    :busy="saving('budget')"
    :busy-label="t('common.actions.saving')"
    :on-click="readonly ? undefined : () => (editing = 'budget')"
    data-testid="rule-budget"
  />
  <UiListItem
    :icon="RULES.guardianMessage.icon"
    icon-tone="neutral"
    :title="
      values
        ? t('adminEdition.settings.wordTitle')
        : t('adminEdition.newEdition.messageLabel')
    "
    :subtitle="values ? undefined : valueOf('guardianMessage')"
    :value="values ? valueOf('guardianMessage') : undefined"
    :chevron="!readonly"
    :busy="saving('guardianMessage')"
    :busy-label="t('common.actions.saving')"
    :to="readonly ? undefined : `/admin/${slug}/editions/${editionId}/mot`"
    data-testid="rule-word"
  />
  <UiTextSheet
    v-if="!readonly"
    v-model:open="budgetOpen"
    :title="t('adminEdition.newEdition.budgetLabel')"
    :description="t('adminEdition.screen.rules.budgetHelp')"
    :label="t('adminEdition.newEdition.budgetLabel')"
    :value="shownOf('budget')"
    :maxlength="RULES.budget.max"
    :placeholder="t('adminEdition.screen.rules.budgetPlaceholder')"
    :validate-label="t('common.actions.validate')"
    :cancel-label="t('common.actions.cancel')"
    @validate="(value) => onValidate('budget', value)"
  />
</template>
