import { loadDrawContext } from '#server/database/draw';
import { requireEdition } from '#server/http/edition';
import { dataKeyOf } from '#server/http/context';
import { checkFeasibility } from '#server/utils/draw';
import { parseWaivers } from '#server/utils/editions';

// "Vérification" box (README section 11): can we draw, and if not, why.
// Names only, never a pair.
export default defineEventHandler(async (event) => {
  const { group, db, edition, rules } = await requireEdition(event);
  const { participants, input, closedPairs } = await loadDrawContext(
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
  // Pairs excluded because of previous years. Those of closed editions are
  // named below; those of a drawn but not closed edition are only counted.
  const ids = new Set(input.participants);
  const historyExclusions = Object.entries(input.history ?? {})
    .filter(([giver]) => ids.has(giver))
    .reduce(
      (n, [, receivers]) => n + receivers.filter((r) => ids.has(r)).length,
      0,
    );
  // Closed editions are no longer secret: their pairs are listed by name.
  const waivers = parseWaivers(edition.historyWaivers);
  const waived = (a: { giverId: string; receiverId: string }) =>
    waivers.some(
      (w) => w.giverId === a.giverId && w.receiverId === a.receiverId,
    );
  const previousPairs = closedPairs
    .filter((a) => ids.has(a.giverId) && ids.has(a.receiverId) && !waived(a))
    // Most recent draw first.
    .toSorted((a, b) => b.editionYear - a.editionYear)
    .map((a) => ({
      giverId: a.giverId,
      receiverId: a.receiverId,
      editionLabel: a.editionLabel,
    }));
  return {
    participantCount: participants.length,
    historyExclusions: historyExclusions - previousPairs.length,
    previousPairs,
    waivedCount: waivers.length,
    problem,
    ready: feasibility.ok,
  };
});
