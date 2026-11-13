import { requireGroupAccess } from '#server/http/auth';
import {
  listEditions,
  participantCounts,
  publicEdition,
} from '#server/database/editions';

export default defineEventHandler(async (event) => {
  const { group, db } = await requireGroupAccess(event);
  const rows = await listEditions(db, group.id);
  const counts = await participantCounts(
    db,
    rows.map((e) => e.id),
  );
  return { editions: rows.map((e) => publicEdition(e, counts[e.id] ?? 0)) };
});
