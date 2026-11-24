<script setup lang="ts">
import { useEditionQuery } from '~/composables/queries/useGroup';

// The budget and the word for the participants, as two rows of the
// edition screen (Correction 9, decided on 16 November 2026), saved as the
// edition's own rules, each on its own page: the budget's proposals
// (ticket 164), the word (README 23.3, Correction 18).
// Read only once the edition is closed.
const props = defineProps<{
  slug: string;
  editionId: string;
  readonly?: boolean;
  /**
   * As on the settings of a Secret Santa (V3TirageReglages): the value on
   * the right, no icon, the titles and « Aucun » of the creation form,
   * instead of the value under the title.
   */
  values?: boolean;
}>();
const { t } = useT();

const edition = useEditionQuery(
  () => props.slug,
  () => props.editionId,
);
const rules = computed(() => edition.data.value?.rules);

/** The two rules, each with its row's icon. */
const RULES = {
  budget: { icon: 'i-lucide-circle-euro' },
  guardianMessage: { icon: 'i-lucide-message-circle' },
} as const;
type Rule = keyof typeof RULES;

/**
 * What a row says: the value, or that there is none.
 * @param rule - The rule.
 * @returns The line.
 */
const valueOf = (rule: Rule) =>
  rules.value?.[rule] ||
  (props.values
    ? t('adminEdition.newEdition.messageNone')
    : t('adminEdition.screen.rules.none'));
</script>

<template>
  <UiListItem
    :icon="values ? undefined : RULES.budget.icon"
    icon-tone="neutral"
    :title="t('adminEdition.newEdition.budgetLabel')"
    :subtitle="values ? undefined : valueOf('budget')"
    :value="values ? valueOf('budget') : undefined"
    :chevron="!readonly"
    :to="readonly ? undefined : `/admin/${slug}/editions/${editionId}/budget`"
    data-testid="rule-budget"
  />
  <UiListItem
    :icon="values ? undefined : RULES.guardianMessage.icon"
    icon-tone="neutral"
    :title="t('adminEdition.newEdition.messageLabel')"
    :subtitle="values ? undefined : valueOf('guardianMessage')"
    :value="values ? valueOf('guardianMessage') : undefined"
    :chevron="!readonly"
    :to="readonly ? undefined : `/admin/${slug}/editions/${editionId}/mot`"
    data-testid="rule-word"
  />
</template>
