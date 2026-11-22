import {
  listsHeldBy,
  peopleOfLists,
  resumableOfLists,
} from '#server/database/lists';
import { eventsOfLists } from '#server/database/listParties';
import { requireHeldList } from '#server/http/lists';
import { resumeSummary } from '#server/utils/lists';
import { peopleNames } from '#shared/utils/lines';
import { resumeChoices } from '#shared/utils/resumeChoices';
import { listYear } from '#shared/utils/years';

// « Repartir d'une liste » (docs/spec/v3/listes.md, ticket 119, maquette
// ListeNouvelleReprendre): the other lists I hold with someone on them
// that look like this one, three at most, each with the first names of
// its people and what taking it up again would bring: « Léo, Zoé et moi ·
// 6 idées pas encore offertes ».
export default defineEventHandler(async (event) => {
  const { db, user, list } = await requireHeldList(event);
  const others = (await listsHeldBy(db, user.accountId)).filter(
    (other) => other.id !== list.id,
  );
  const all = [list, ...others];
  const [resumable, people, events] = await Promise.all([
    resumableOfLists(
      db,
      others.map((other) => other.id),
    ),
    peopleOfLists(
      db,
      all.map((one) => one.id),
    ),
    eventsOfLists(db, all),
  ]);
  const compared = (one: (typeof all)[number]) => ({
    id: one.id,
    year: listYear(one),
    createdAt: one.createdAt,
    events: events.get(one.id) ?? [],
    memberIds: (people.get(one.id) ?? [])
      .filter((person) => !person.member.placeholder)
      .map((person) => person.member.id),
  });
  const withPeople = others.filter(
    (other) => (resumable.get(other.id) ?? []).length > 0,
  );
  return resumeChoices(compared(list), withPeople.map(compared)).flatMap(
    (id) => {
      const other = withPeople.find((one) => one.id === id);
      if (!other) return [];
      return [
        {
          id: other.id,
          icon: { emoji: other.iconEmoji, color: other.iconColor },
          title: other.title,
          names: peopleNames(
            'lists.resume.names',
            (people.get(id) ?? [])
              .filter((person) => !person.member.placeholder)
              .map((person) => ({
                name: person.member.firstName,
                me: person.member.accountId === user.accountId,
              })),
          ),
          ...resumeSummary(resumable.get(id) ?? []),
        },
      ];
    },
  );
});
