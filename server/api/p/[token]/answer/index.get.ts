import { editionPersons, findAnswers } from '#server/database/answers';
import { dataKeyOf } from '#server/http/context';
import { unwrap } from '#server/http/errors';
import { requirePersonalLink } from '#server/http/personal';
import { answersAllow, validAnswers } from '#server/utils/answers';
import { avatarOf } from '#server/utils/avatars';
import { byName, displayName } from '#server/utils/people';

// A draw made elsewhere (README 22.12): the people the participant may
// name (everyone but themselves), and their own answer, shown only when
// they ask for it. Never anyone else's answer, never whether it clashes.
export default defineEventHandler(async (event) => {
  const { db, edition, person } = await requirePersonalLink(event);
  unwrap(answersAllow(edition, 'answer'));
  const people = await editionPersons(db, edition.id);
  const answers = validAnswers(
    people.map((p) => p.id),
    await findAnswers(db, edition.id, await dataKeyOf(event)),
  );
  const mine = answers.find((a) => a.giverId === person.id)?.receiverId;
  const choices = people
    .filter((p) => p.id !== person.id)
    .toSorted(byName)
    .map((p) => ({
      id: p.id,
      name: displayName(p, people),
      avatar: avatarOf(p),
    }));
  return {
    choices,
    receiver: choices.find((c) => c.id === mine) ?? null,
  };
});
