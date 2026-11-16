import type { Rules, RulesPatch } from '#server/utils/rules';
import {
  useRulesQuery,
  useUpdateRulesMutation,
} from '~/composables/queries/useGroup';

/**
 * The group's rules, each saved on its own as soon as it is chosen (no
 * « Enregistrer » button, README 23.3): the new value shows at once, the
 * row says it is saving, and an error puts the old value back with a toast.
 * @param slug - The group.
 * @returns The rules as shown, `save` for one change, and `saving`.
 */
export const useRuleSaver = (slug: MaybeRefOrGetter<string>) => {
  const rules = useRulesQuery(slug);
  const update = useUpdateRulesMutation(slug);
  const toast = useToast();
  const errorMessage = useErrorMessage();
  /** Values chosen and not yet confirmed by the server. */
  const pending = ref<RulesPatch>({});
  const shown = computed(
    () => ({ ...rules.data.value?.rules, ...pending.value }) as Partial<Rules>,
  );
  /**
   * Saves one change, shown at once.
   * @param patch - The rules that change.
   * @returns Nothing: errors are told in a toast.
   */
  const save = (patch: RulesPatch) => {
    pending.value = { ...pending.value, ...patch };
    const keys = Object.keys(patch);
    /** Forgets the values of this change, kept or not. */
    const settle = () => {
      pending.value = Object.fromEntries(
        Object.entries(pending.value).filter(([key]) => !keys.includes(key)),
      );
    };
    update.mutate(patch, {
      onSettled: settle,
      onError: (error) =>
        toast.add({ title: errorMessage(error), color: 'error' }),
    });
  };
  /**
   * Whether a rule is being saved.
   * @param key - The rule.
   * @returns True while its change is on its way.
   */
  const saving = (key: keyof Rules) => key in pending.value;
  return { rules, shown, save, saving };
};
