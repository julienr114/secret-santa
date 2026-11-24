import type { Rules, RulesPatch } from '#server/utils/rules';
import {
  useEditionQuery,
  useUpdateEditionMutation,
} from '~/composables/queries/useGroup';

/**
 * The rules of one Secret Santa (docs/spec/v3/secret-santa.md, « Ses
 * réglages »), each saved on its own as soon as it is chosen (README
 * 23.3): the new value shows at once, the row says it is saving, and an
 * error puts the old value back with a toast. The route replaces all its
 * rules, so each change is sent with the others.
 * @param slug - The party.
 * @param id - The Secret Santa.
 * @returns The rules as shown, `save` for one change, and `saving`.
 */
export const useEditionRuleSaver = (
  slug: MaybeRefOrGetter<string>,
  id: MaybeRefOrGetter<string>,
) => {
  const edition = useEditionQuery(slug, id);
  const update = useUpdateEditionMutation(slug);
  const toast = useMessages();
  const errorMessage = useErrorMessage();
  /** Values chosen and not yet confirmed by the server. */
  const pending = ref<RulesPatch>({});
  const shown = computed(
    () =>
      ({ ...edition.data.value?.rules, ...pending.value }) as Partial<Rules>,
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
    update.mutate(
      {
        id: toValue(id),
        rulesOverride: {
          ...(edition.data.value?.edition.rulesOverride ?? {}),
          ...pending.value,
        },
      },
      {
        onSettled: settle,
        onError: (error) => toast.failed(errorMessage(error)),
      },
    );
  };
  /**
   * Whether a rule is being saved.
   * @param key - The rule.
   * @returns True while its change is on its way.
   */
  const saving = (key: keyof Rules) => key in pending.value;
  return { edition, shown, save, saving };
};
