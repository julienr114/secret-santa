import { requireGroupAccess } from '../../../../http/auth.js';
import { notFound, unwrap } from '../../../../http/errors.js';
import {
  findEdition,
  listParticipants,
  publicEdition,
} from '../../../../database/editions.js';
import { mergeRules } from '../../../../utils/rules.js';

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
