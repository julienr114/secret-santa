import { refuseWhileSignupsPaused } from '#server/http/pauses';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import {
  createAccount,
  findAccountByEmail,
  openSessionFor,
} from '#server/database/accounts';
import {
  addPersonToList,
  createIdea,
  ensureSelf,
  findList,
} from '#server/database/lists';
import { newListForDraw } from '#server/database/drawLists';
import { santaNameForSubject } from '#server/database/editions';
import { myListFor } from '#server/database/listSharing';
import { familyMembers } from '#server/database/schema';
import { optionalAccount } from '#server/http/auth';
import { dataKeyOf, nowIso } from '#server/http/context';
import { tellNewIdeas } from '#server/database/newsEvents';
import { requirePersonalLink } from '#server/http/personal';
import { validatedBody } from '#server/http/validate';
import { avatarOf } from '#server/utils/avatars';
import { drawListTitle, IDEA_TEXT_MAX } from '#server/utils/lists';
import { localeOf } from '#shared/i18n';
import { HINT_TEXT_MAX } from '#shared/utils/hints';

// The first thing written from a personal link, without an account
// (docs/spec/v3/listes.md, « Sans compte », V3ListeCompteCree; Q-018,
// answered by Julien on 21 November 2026): an idea, a taste (« En ce
// moment »), or both. It makes the account with the address the organiser
// gave, opens its session, and makes the list for the event, kept for the
// one who drew them, with the idea on it; the taste goes on the « Moi »
// card. Never
// an account that already exists: that one logs in by its own link. Not
// at the opening of the link: only what is written makes an account.
// The first thing written (« un goût, une idée »): an idea for the list,
// « En ce moment » for the « Moi » card, or both.
const bodySchema = z
  .object({
    text: z.string().trim().max(IDEA_TEXT_MAX).default(''),
    lately: z.string().trim().max(HINT_TEXT_MAX).default(''),
  })
  .refine((body) => body.text || body.lately, 'nothing written');

const refuse = (statusMessage: string) =>
  createError({ statusCode: 409, statusMessage });

export default defineEventHandler(async (event) => {
  const { db, person, group, edition } = await requirePersonalLink(event);
  const { text, lately } = await validatedBody(event, bodySchema);
  if (await optionalAccount(event)) throw refuse('already_logged_in');
  if (!person.email) throw refuse('email_needed');
  if (await findAccountByEmail(db, person.email)) {
    throw refuse('account_exists');
  }
  // No new account while sign-ups are suspended (ticket 129).
  await refuseWhileSignupsPaused(db);
  const now = nowIso();
  const account = await createAccount(db, {
    email: person.email,
    isSuperAdmin: false,
    language: localeOf(person.language),
    firstName: person.firstName,
    // The face it had in the Secret Santa.
    avatar: avatarOf(person),
    now,
  });
  await ensureSelf(db, account.id);
  const [self] = await db
    .select({ id: familyMembers.id, texts: familyMembers.texts })
    .from(familyMembers)
    .where(
      and(
        eq(familyMembers.accountId, account.id),
        eq(familyMembers.isSelf, true),
      ),
    )
    .limit(1);
  // A new list, with me on it already, first (ticket 136).
  const made = { selfPersonId: null as string | null };
  const listId = await myListFor(
    db,
    account.id,
    group,
    async () => {
      const list = await newListForDraw(
        db,
        account.id,
        group,
        drawListTitle(
          localeOf(person.language),
          await santaNameForSubject(db, edition),
        ),
      );
      made.selfPersonId = list.selfPersonId;
      return list.id;
    },
    now,
  );
  const list = await findList(db, listId);
  const listPersonId =
    made.selfPersonId ??
    (list && self ? await addPersonToList(db, list, self.id) : null);
  if (listPersonId && text) {
    await createIdea(db, listId, listPersonId, { text, url: null }, null);
    await tellNewIdeas(
      db,
      { listId, listPersonId, by: account.id, dataKey: await dataKeyOf(event) },
      now,
    );
  }
  // Their tastes are theirs, the same on every list: on the « Moi » card.
  if (self && lately) {
    await db
      .update(familyMembers)
      .set({ texts: { ...(self.texts ?? {}), lately } })
      .where(eq(familyMembers.id, self.id));
  }
  const sessionId = await openSessionFor(db, {
    accountId: account.id,
    userAgent: getRequestHeader(event, 'user-agent') ?? null,
    now,
  });
  await setUserSession(event, {
    user: { role: 'member', accountId: account.id, sessionId },
    loggedInAt: now,
  });
  setResponseHeader(event, 'Cache-Control', 'no-store');
  setResponseStatus(event, 201);
  return { id: listId };
});
