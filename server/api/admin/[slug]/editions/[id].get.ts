import { requireGroupAccess } from '#server/http/auth';
import { notFound, unwrap } from '#server/http/errors';
import {
  findEdition,
  listParticipants,
  publicEdition,
} from '#server/database/editions';
import { mergeRules } from '#server/utils/rules';

export default defineEventHandler(async (event) => {
  const { group, db } = await requireGroupAccess(event);
  const edition = await findEdition(db, group.id, getRouterParam(event, 'id'));
  if (!edition) throw notFound('edition_not_found');
  const participants = await listParticipants(db, edition.id);
  return {
    edition: publicEdition(edition, participants.length),
    rules: unwrap(mergeRules(group.rules, edition.rulesOverride)),
    participants,
  };
});
