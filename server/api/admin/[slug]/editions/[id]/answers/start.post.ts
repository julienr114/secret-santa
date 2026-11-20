import { eq } from 'drizzle-orm';
import { secretSantas } from '#server/database/schema';
import { recordEvent } from '#server/database/audit';
import { requireEdition } from '#server/http/edition';
import { unwrap } from '#server/http/errors';
import { answersAllow } from '#server/utils/answers';

// « Le tirage a déjà été fait ailleurs » (README 22.12): from now on each
// participant says on their page who they give to. The exclusions are not
// applied; they stay saved for the next editions.
export default defineEventHandler(async (event) => {
  const { user, group, db, edition } = await requireEdition(event);
  unwrap(answersAllow(edition, 'start'));
  await db
    .update(secretSantas)
    .set({ drawMode: 'elsewhere' })
    .where(eq(secretSantas.id, edition.id));
  await recordEvent(db, {
    type: 'answers_started',
    groupId: group.id,
    editionId: edition.id,
    actor: user.role,
  });
  return { drawMode: 'elsewhere' as const };
});
