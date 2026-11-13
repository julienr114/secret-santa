import { requireGroupAccess } from '../../../http/auth.js';
import { unwrap } from '../../../http/errors.js';
import { nowIso } from '../../../http/context.js';
import { publicGroup } from '../../../database/groups.js';
import {
  listEditions,
  participantCounts,
  publicEdition,
} from '../../../database/editions.js';
import {
  currentEdition,
  nextEditionDefaults,
} from '../../../utils/editions.js';
import { mergeRules } from '../../../utils/rules.js';

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
