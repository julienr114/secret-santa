import { requireGroupAccess } from '#server/http/auth';
import { unwrap } from '#server/http/errors';
import { nowIso } from '#server/http/context';
import { publicGroup } from '#server/database/groups';
import {
  listEditions,
  participantCounts,
  publicEdition,
} from '#server/database/editions';
import { currentEdition, nextEditionDefaults } from '#server/utils/editions';
import { mergeRules } from '#server/utils/rules';

// Group dashboard: editions, the one in progress, defaults for the next.
export default defineEventHandler(async (event) => {
  const { group, db } = await requireGroupAccess(event);
  const rows = await listEditions(db, group.id);
  const counts = await participantCounts(
    db,
    rows.map((e) => e.id),
  );
  const all = rows.map((e) => publicEdition(e, counts[e.id] ?? 0));
  const current = currentEdition(rows);
  return {
    group: publicGroup(group),
    rules: unwrap(mergeRules(group.rules)),
    editions: all,
    currentEditionId: current?.id ?? null,
    nextEdition: nextEditionDefaults(rows, nowIso()),
  };
});
