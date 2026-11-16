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
 * @returns The previous edition (null for a first one) and its rules, the
 * members taken over, and whether it is still loading.
 */
export const useTakenOver = (slug: MaybeRefOrGetter<string>) => {
  const dashboard = useDashboardQuery(slug);
  const people = usePeopleQuery(slug);
  const previous = computed(() => {
    const data = dashboard.data.value;
    return data ? previousEdition(data.editions, data.nextEdition.year) : null;
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
  return { previous, previousRules, members, pending };
};
