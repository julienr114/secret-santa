import { z } from 'zod';
import { listParticipants } from '#server/database/editions';
import { personalLink } from '#server/database/participations';
import { participations } from '#server/database/schema';
import { requireEdition } from '#server/http/edition';
import { dataKeyOf } from '#server/http/context';
import { unwrap } from '#server/http/errors';
import { validatedQuery } from '#server/http/validate';
import {
  MESSAGE_TYPES,
  buildMessage,
  messageTypesFor,
} from '#server/utils/messages';
import { eq } from 'drizzle-orm';

// Texts ready to share, one per participant, read without side effects.
// The app loads them beforehand so the phone share sheet can open right on
// tap (Safari refuses it after an await).
const querySchema = z.object({ type: z.enum(MESSAGE_TYPES) });

export default defineEventHandler(async (event) => {
  const { group, db, edition, rules } = await requireEdition(event);
  const { type } = await validatedQuery(event, querySchema);
  // Nothing to share for a message that does not fit the edition's stage;
  // the reminder of « Devine qui » while the game is on (README 22.17).
  const game = type === 'guessReminder' && edition.guessMode !== 'none';
  if (
    !game &&
    !messageTypesFor(edition.status, edition.drawMode).includes(type)
  ) {
    return { messages: {} };
  }
  const dataKey = await dataKeyOf(event);
  const [people, rows] = await Promise.all([
    listParticipants(db, edition.id),
    db
      .select()
      .from(participations)
      .where(eq(participations.secretSantaId, edition.id)),
  ]);
  const entries = await Promise.all(
    rows.map(async (row) => {
      const person = people.find((p) => p.participationId === row.id);
      const link = await personalLink(event, row, dataKey);
      const text = unwrap(
        buildMessage(
          type,
          {
            firstName: person?.firstName ?? '',
            groupName: group.name,
            editionLabel: edition.label,
            link,
            budget: rules.budget,
            eventDate: rules.eventDate,
            // « Devine qui » is on: a line in « Tirage fait » (22.17).
            guessEndsAt:
              edition.guessMode === 'none' ? null : edition.guessEndsAt,
            guessTimeZone: edition.guessTimeZone,
            guessMode: edition.guessMode as 'none' | 'santa' | 'all',
          },
          // Written in the recipient's language, not the guardian's.
          person?.language,
        ),
      );
      return [row.id, { text, link }] as const;
    }),
  );
  return { messages: Object.fromEntries(entries) };
});
