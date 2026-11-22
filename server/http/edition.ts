import type { H3Event } from 'h3';
import { findEdition } from '#server/database/editions';
import { requireGroupAccess, type GroupContext } from './auth';
import { notFound, unwrap } from './errors';
import { mergeRules, type Rules } from '#server/utils/rules';
import type { SecretSantaRow } from '#server/database/schema';
import { requireOpenYear } from '#server/database/years';

export type EditionContext = GroupContext & {
  edition: SecretSantaRow;
  rules: Rules;
};

/** Whether a request may change something. */
export const writes = (event: H3Event) =>
  !['GET', 'HEAD'].includes(event.method.toUpperCase());

/**
 * Group access + the edition of the route ([id]) + its effective rules.
 * A request that writes is refused once the year of the edition is over
 * (ticket 108), unless `afterTheYear`: closing and revealing stay as they
 * are.
 */
export const requireEdition = async (
  event: H3Event,
  options: { afterTheYear?: boolean } = {},
): Promise<EditionContext> => {
  const context = await requireGroupAccess(event);
  const edition = await findEdition(
    context.db,
    context.group.id,
    getRouterParam(event, 'id'),
  );
  if (!edition) throw notFound('edition_not_found');
  if (writes(event) && !options.afterTheYear) {
    await requireOpenYear(context.db, context.group.id, edition.yearId);
  }
  const rules = unwrap(mergeRules(edition.rules));
  return { ...context, edition, rules };
};
