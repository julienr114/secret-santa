/**
 * How many members a group has, said the same everywhere (decided on 17
 * November 2026): the active ones, and those who no longer take part,
 * when there are some.
 * @returns `membersLine`, giving « 5 membres · 1 ne participe plus ».
 */
export const useMembersLine = () => {
  const { t } = useT();
  /**
   * The members of a group, in a few words.
   * @param persons - Everyone in the group, active or not.
   * @returns The count of active members, then of the others if any.
   */
  const membersLine = (persons: readonly { active: boolean }[]) => {
    const active = persons.filter((p) => p.active).length;
    const inactive = persons.length - active;
    return [
      t('adminGroup.dashboard.members', { count: active }),
      ...(inactive > 0
        ? [t('adminGroup.dashboard.inactive', { count: inactive })]
        : []),
    ].join(' · ');
  };
  return { membersLine };
};
