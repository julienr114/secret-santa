<script setup lang="ts">
import {
  useEditionQuery,
  useUpdateEditionMutation,
} from '~/composables/queries/useGroup';

// The budget and the word for the participants, as two rows of the
// edition screen (Correction 9, decided on 16 November 2026): each opens
// its sheet and is saved with « Valider », as the edition's own rules,
// shown at once.
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
const toast = useToast();

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
/** Values chosen and not yet confirmed by the server: shown at once. */
const pending = ref<Partial<Record<Rule, string>>>({});
const sheet = (rule: Rule) =>
  computed({
    get: () => editing.value === rule,
    set: (value) => {
      editing.value = value ? rule : null;
    },
  });
const budgetOpen = sheet('budget');
const wordOpen = sheet('guardianMessage');

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
      onError: (error) =>
        toast.add({ title: errorMessage(error), color: 'error' }),
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
    :on-click="readonly ? undefined : () => (editing = 'guardianMessage')"
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
  <UiTextSheet
    v-if="!readonly"
    v-model:open="wordOpen"
    :title="t('adminEdition.newEdition.messageLabel')"
    :description="t('adminEdition.screen.rules.wordHelp')"
    :label="t('adminEdition.screen.rules.wordLabel')"
    :value="shownOf('guardianMessage')"
    :maxlength="RULES.guardianMessage.max"
    :placeholder="t('adminEdition.newEdition.messagePlaceholder')"
    :validate-label="t('common.actions.validate')"
    :cancel-label="t('common.actions.cancel')"
    @validate="(value) => onValidate('guardianMessage', value)"
  />
</template>
