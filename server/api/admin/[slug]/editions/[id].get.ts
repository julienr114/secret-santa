import { requireGroupAccess } from '#server/http/auth';
import { notFound, unwrap } from '#server/http/errors';
import {
  findEdition,
  listParticipants,
  publicEdition,
} from '#server/database/editions';
import { mergeRules } from '#server/utils/rules';
import { wasDrawCancelled } from '#server/database/audit';

export default defineEventHandler(async (event) => {
  const { group, db } = await requireGroupAccess(event);
  const edition = await findEdition(db, group.id, getRouterParam(event, 'id'));
  if (!edition) throw notFound('edition_not_found');
  const [participants, cancelled] = await Promise.all([
    listParticipants(db, edition.id),
    wasDrawCancelled(db, group.id, edition.id),
  ]);
  return {
    edition: publicEdition(edition, participants.length),
    rules: unwrap(mergeRules(group.rules, edition.rulesOverride)),
    participants,
    // Drawn again after a cancelled draw: « Nouveau tirage » is the
    // message to send.
    redrawn: edition.status === 'drawn' && cancelled,
  };
});
