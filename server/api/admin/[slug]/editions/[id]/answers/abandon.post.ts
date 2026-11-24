import { eq } from 'drizzle-orm';
import { secretSantas } from '#server/database/schema';
import { deleteAnswersOf } from '#server/database/answers';
import { recordEvent } from '#server/database/audit';
import { requireEdition } from '#server/http/edition';
import { unwrap } from '#server/http/errors';
import { answersAllow } from '#server/utils/answers';

// « Abandonner et tirer avec l'application » (README 22.12): the answers
// are deleted, as long as nothing is validated, and the edition is drawn
// by the app again.
export default defineEventHandler(async (event) => {
  const { user, group, db, edition } = await requireEdition(event);
  unwrap(answersAllow(edition, 'abandon'));
  await db.batch([
    deleteAnswersOf(db, edition.id),
    db
      .update(secretSantas)
      .set({ drawMode: 'app' })
      .where(eq(secretSantas.id, edition.id)),
  ]);
  await recordEvent(db, {
    type: 'answers_abandoned',
    groupId: group.id,
    editionId: edition.id,
    actor: user.role,
  });
  return { drawMode: 'app' as const };
});
