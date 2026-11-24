import { countIdeas } from '#server/database/caps';
import { requireRoom } from '#server/http/caps';
import type { H3Event } from 'h3';
import { eq } from 'drizzle-orm';
import type { Db } from '#server/database/client';
import { deleteClaimsOfIdeas } from '#server/database/claims';
import {
  claimedIdeas,
  createIdea,
  findIdea,
  findListPerson,
} from '#server/database/lists';
import { giftListIdeas, type GiftListRow } from '#server/database/schema';
import { notFound } from '#server/http/errors';
import { markKindSeen } from '#server/database/news';
import { tellNewIdeas } from '#server/database/newsEvents';
import { dataKeyOf, nowIso } from '#server/http/context';
import { validatedBody } from '#server/http/validate';
import { splitIdea } from '#server/utils/lists';
import { ideaPatchSchema, newIdeaSchema } from '#server/utils/listSchemas';

// Writing the ideas of a list (README 22.19, 22.20), the same for those
// who hold it, in its document, and for a person linked to their account,
// by the link, in their own section. `may` says whether the one asking
// may write for a person of the list.

/** Whether the one asking may write the ideas of a person of the list. */
type May = (listPersonId: string) => boolean | Promise<boolean>;

/**
 * A new idea for a person of the list, after another one or last. An
 * address in the text becomes its link; a line left empty is not kept.
 * @param event - The request.
 * @param db - The database.
 * @param list - The list.
 * @param may - Who may write for whom.
 * @param by - The account that writes.
 * @returns The id of the idea.
 */
export const addIdea = async (
  event: H3Event,
  db: Db,
  list: GiftListRow,
  may: May,
  by: string,
) => {
  const body = await validatedBody(event, newIdeaSchema);
  if (
    !(await findListPerson(db, list.id, body.listPersonId)) ||
    !(await may(body.listPersonId))
  ) {
    throw notFound();
  }
  const split = splitIdea(body.text);
  const url = body.url ?? split?.url ?? null;
  if (!split && !url) {
    throw createError({ statusCode: 400, statusMessage: 'empty_idea' });
  }
  await requireRoom('ideas', countIdeas(db, list.id));
  const id = await createIdea(
    db,
    list.id,
    body.listPersonId,
    { text: split?.text ?? '', url },
    body.after,
  );
  // The news (ticket 120): those who may open the list are told; and
  // whoever asked me for ideas has had some.
  const now = nowIso();
  await tellNewIdeas(
    db,
    { listId: list.id, by, dataKey: await dataKeyOf(event) },
    now,
  );
  await markKindSeen(db, by, 'hint_request', now);
  setResponseStatus(event, 201);
  return { id };
};

const ideaOf = async (event: H3Event, db: Db, list: GiftListRow, may: May) => {
  const idea = await findIdea(
    db,
    list.id,
    getRouterParam(event, 'ideaId') ?? '',
  );
  if (!idea || !(await may(idea.listPersonId))) throw notFound();
  return idea;
};

/**
 * An idea corrected by touching it, even once ticked; an address pasted
 * in it becomes its link.
 * @param event - The request.
 * @param db - The database.
 * @param list - The list.
 * @param may - Who may write for whom.
 * @returns Once saved.
 */
export const changeIdea = async (
  event: H3Event,
  db: Db,
  list: GiftListRow,
  may: May,
) => {
  const idea = await ideaOf(event, db, list, may);
  const body = await validatedBody(event, ideaPatchSchema);
  // Someone gives it: it stays an idea (ticket 152).
  if (body.title && (await claimedIdeas(db, [idea.id])).size > 0) {
    throw createError({ statusCode: 409, statusMessage: 'idea_claimed' });
  }
  const split = body.text === undefined ? null : splitIdea(body.text);
  const title = body.title ?? idea.isTitle;
  await db
    .update(giftListIdeas)
    .set({
      // Changed, it is no longer the idea taken from an old list (lot 27).
      carriedFrom: null,
      ...(body.text === undefined ? {} : { text: split?.text ?? '' }),
      ...(body.url !== undefined
        ? { url: body.url }
        : split?.url
          ? { url: split.url }
          : {}),
      ...(body.stars === undefined ? {} : { stars: body.stars }),
      ...(body.title === undefined ? {} : { isTitle: body.title }),
      // A title has neither link nor stars.
      ...(title ? { url: null, stars: 0 } : {}),
    })
    .where(eq(giftListIdeas.id, idea.id));
  return { ok: true };
};

/**
 * An idea deleted, with who gave it. An idea already ticked asks for a
 * confirmation on the screen first.
 * @param event - The request.
 * @param db - The database.
 * @param list - The list.
 * @param may - Who may write for whom.
 * @returns Once deleted.
 */
export const dropIdea = async (
  event: H3Event,
  db: Db,
  list: GiftListRow,
  may: May,
) => {
  const idea = await ideaOf(event, db, list, may);
  await db.batch([
    ...deleteClaimsOfIdeas(db, [idea.id]),
    db.delete(giftListIdeas).where(eq(giftListIdeas.id, idea.id)),
  ]);
  return { ok: true };
};
