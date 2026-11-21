import { pageTitle } from '#shared/utils/titles';
import {
  useDashboardQuery,
  useEditionQuery,
} from '~/composables/queries/useGroup';
import type { ContextPart } from '~/components/ui/PageContext.vue';

/**
 * Where a screen of a group, or of one of its editions, belongs: the
 * parts of its context line, each a link back, and the tab's title.
 * @param slug - The group.
 * @param editionId - The edition, for a screen of an edition.
 * @returns `parts` for `UiPageContext`, and `titleOf` for `useHead`.
 */
export const useScreenContext = (
  slug: MaybeRefOrGetter<string>,
  editionId?: MaybeRefOrGetter<string>,
) => {
  const { t } = useT();
  const dashboard = useDashboardQuery(slug);
  const edition = useEditionQuery(
    slug,
    () => toValue(editionId) ?? '',
    () => Boolean(toValue(editionId)),
  );
  const parts = computed<ContextPart[]>(() => {
    const group = dashboard.data.value?.group.name;
    const label = editionId ? edition.data.value?.edition.label : undefined;
    const base = `/admin/${toValue(slug)}`;
    return [
      ...(group ? [{ label: group, to: `/e/${toValue(slug)}` }] : []),
      ...(label
        ? [{ label, to: `${base}/editions/${toValue(editionId)}` }]
        : []),
    ];
  });
  /**
   * The tab's title for a screen.
   * @param screen - The screen's title.
   * @returns « {Écran} — {Groupe} · {Édition} ».
   */
  const titleOf = (screen: string) =>
    pageTitle(
      screen,
      parts.value.map((part) => part.label),
      t('common.appName'),
    );
  return { parts, titleOf };
};
