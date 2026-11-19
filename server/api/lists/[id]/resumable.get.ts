import { listsHeldBy, resumableOfLists } from '#server/database/lists';
import { requireHeldList } from '#server/http/lists';
import { resumeSummary } from '#server/utils/lists';

// « Repartir d'une liste » (lot 27, maquette ListeNouvelleReprendre): the
// other lists I hold that have someone on them, the most recent first,
// each with what taking it up again would bring: « 4 personnes · 6 idées
// pas encore offertes ».
export default defineEventHandler(async (event) => {
  const { db, user, list } = await requireHeldList(event);
  const others = (await listsHeldBy(db, user.accountId)).filter(
    (other) => other.id !== list.id,
  );
  const people = await resumableOfLists(
    db,
    others.map((other) => other.id),
  );
  return (
    others
      .map((other) => ({
        id: other.id,
        icon: { emoji: other.iconEmoji, color: other.iconColor },
        title: other.title,
        ...resumeSummary(people.get(other.id) ?? []),
      }))
      .filter((one) => one.people > 0)
      // A short block: the five most recent are the ones one starts from.
      .slice(0, 5)
  );
});
