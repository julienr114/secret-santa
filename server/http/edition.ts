import type { H3Event } from 'h3';
import { findEdition } from '#server/database/editions';
import { requireGroupAccess, type GroupContext } from './auth';
import { notFound, unwrap } from './errors';
import { mergeRules, type Rules } from '#server/utils/rules';
import type { SecretSantaRow } from '#server/database/schema';

export type EditionContext = GroupContext & {
  edition: SecretSantaRow;
  rules: Rules;
};

/** Group access + the edition of the route ([id]) + its effective rules. */
export const requireEdition = async (
  event: H3Event,
): Promise<EditionContext> => {
  const context = await requireGroupAccess(event);
  const edition = await findEdition(
    context.db,
    context.group.id,
    getRouterParam(event, 'id'),
  );
  if (!edition) throw notFound('edition_not_found');
  const rules = unwrap(mergeRules(edition.rules));
  return { ...context, edition, rules };
};
