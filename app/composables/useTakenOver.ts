import { previousEdition } from '#server/utils/editions';
import { carriedOver } from '#shared/utils/participants';
import {
  useDashboardQuery,
  useEditionQuery,
  usePeopleQuery,
} from '~/composables/queries/useGroup';

/**
 * Who the next edition of a group starts with, as the server will take
 * them: those of the previous edition still active, or every active
 * member for a first one.
 * @param slug - The group.
 * @param year - The year of the new edition; the one the group expects
 * by default.
 * @returns The previous edition (null for a first one), its rules and its
 * « Devine qui », the members taken over, and whether it is still loading.
 */
export const useTakenOver = (
  slug: MaybeRefOrGetter<string>,
  year?: MaybeRefOrGetter<number | null>,
) => {
  const dashboard = useDashboardQuery(slug);
  const people = usePeopleQuery(slug);
  const previous = computed(() => {
    const data = dashboard.data.value;
    return data
      ? previousEdition(data.editions, toValue(year) ?? data.nextEdition.year)
      : null;
  });
  const previousEditionQuery = useEditionQuery(
    slug,
    () => previous.value?.id ?? '',
    () => Boolean(previous.value),
  );
  const pending = computed(
    () =>
      dashboard.isPending.value ||
      people.isPending.value ||
      (Boolean(previous.value) && previousEditionQuery.isPending.value),
  );
  const members = computed(() =>
    carriedOver(
      people.data.value?.persons ?? [],
      previous.value
        ? (previousEditionQuery.data.value?.participants ?? []).map((p) => p.id)
        : null,
    ),
  );
  const previousRules = computed(
    () => previousEditionQuery.data.value?.rules ?? null,
  );
  const previousGuessMode = computed(
    // A first Secret Santa plays every pair (ticket 150).
    () => previousEditionQuery.data.value?.guess.mode ?? 'all',
  );
  return { previous, previousRules, previousGuessMode, members, pending };
};
