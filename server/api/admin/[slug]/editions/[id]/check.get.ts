import { loadDrawContext } from '#server/database/draw';
import { requireEdition } from '#server/http/edition';
import { dataKeyOf } from '#server/http/context';
import { checkFeasibility } from '#server/utils/draw';

// "Vérification" box (README section 11): can we draw, and if not, why.
// Names only, never a pair.
export default defineEventHandler(async (event) => {
  const { group, db, edition, rules } = await requireEdition(event);
  const { participants, input } = await loadDrawContext(
    db,
    group.id,
    edition,
    rules,
    await dataKeyOf(event),
  );
  const nameOf = (id: string) =>
    participants.find((p) => p.id === id)?.firstName ?? '?';
  const feasibility = checkFeasibility(input);
  const problem = feasibility.ok
    ? null
    : {
        reason: feasibility.reason,
        blocked: (
          (feasibility.details.blocked as string[] | undefined) ?? []
        ).map(nameOf),
        constrained: (
          (feasibility.details.constrained as string[] | undefined) ?? []
        ).map(nameOf),
      };
  return {
    participantCount: participants.length,
    problem,
    ready: feasibility.ok,
  };
});
