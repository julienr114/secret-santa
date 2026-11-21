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
  createList,
  ensureSelf,
  findList,
} from '#server/database/lists';
import { myListFor, occasionDate } from '#server/database/listSharing';
import { familyMembers } from '#server/database/schema';
import { optionalAccount } from '#server/http/auth';
import { nowIso } from '#server/http/context';
import { requirePersonalLink } from '#server/http/personal';
import { validatedBody } from '#server/http/validate';
import { avatarOf } from '#server/utils/avatars';
import { IDEA_TEXT_MAX, listIconOfParty } from '#server/utils/lists';
import { partyEmoji } from '#shared/utils/categories';
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
  const { db, person, group } = await requirePersonalLink(event);
  const { text, lately } = await validatedBody(event, bodySchema);
  if (await optionalAccount(event)) throw refuse('already_logged_in');
  if (!person.email) throw refuse('email_needed');
  if (await findAccountByEmail(db, person.email)) {
    throw refuse('account_exists');
  }
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
  const listId = await myListFor(
    db,
    account.id,
    group,
    async () =>
      createList(db, account.id, {
        icon: listIconOfParty(
          { emoji: partyEmoji(group), color: group.iconColor },
          (n) => crypto.getRandomValues(new Uint32Array(1))[0]! % n,
        ),
        title: group.name,
        eventDate: await occasionDate(db, group),
        partyId: group.id,
      }),
    now,
  );
  const list = await findList(db, listId);
  if (list && self) {
    const listPersonId = await addPersonToList(db, list, self.id);
    if (text) {
      await createIdea(db, listId, listPersonId, { text, url: null }, null);
    }
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
