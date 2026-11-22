import { and, eq, sql } from 'drizzle-orm';
import { assignments, participations } from '#server/database/schema';
import { listEditionPeople } from '#server/database/participations';
import { resultHelp } from '#server/http/hints';
import { recordEvent } from '#server/database/audit';
import { requirePersonalLink } from '#server/http/personal';
import { appUrl, dataKeyOf, nowIso } from '#server/http/context';
import { notifyOrganizers } from '#server/http/notify';
import { viewCounts } from '#server/database/notify';
import {
  buildAllViewedEmail,
  isEveryoneViewed,
} from '#server/utils/notifications';
import { notFound, unwrap } from '#server/http/errors';
import { avatarOf } from '#server/utils/avatars';
import { decrypt } from '#server/utils/crypto';
import { displayName } from '#server/utils/people';
import { canReveal } from '#server/utils/personal';

// The "Découvrir" button (README 4.3): the only place a participant's
// result is decrypted for display. Every call is counted; the first one is
// journaled.
export default defineEventHandler(async (event) => {
  const { db, participation, edition, person, group, rules } =
    await requirePersonalLink(event, { afterTheYear: true });
  unwrap(canReveal(edition.status));
  const [assignment] = await db
    .select()
    .from(assignments)
    .where(
      and(
        eq(assignments.secretSantaId, edition.id),
        eq(assignments.giverPersonId, person.id),
      ),
    )
    .limit(1);
  if (!assignment) throw notFound('result_not_found');
  const receiverId = await decrypt(
    { enc: assignment.receiverEnc, iv: assignment.receiverIv },
    await dataKeyOf(event),
  );
  const people = await listEditionPeople(db, edition.id);
  const receiver = people.find(
    (p) => receiverId.ok && p.person.id === receiverId.value,
  );
  if (!receiver) {
    throw createError({ statusCode: 500, statusMessage: 'result_unreadable' });
  }
  // « Pour t'aider à choisir » (ticket 107): their list, their tastes.
  const help = await resultHelp(event, db, {
    receiver: {
      participationId: receiver.participationId,
      email: receiver.person.email,
    },
    partyId: edition.partyId,
    giverParticipationId: participation.id,
    giverEmail: person.email,
  });

  const now = nowIso();
  const [updated] = await db
    .update(participations)
    .set({
      viewCount: sql`${participations.viewCount} + 1`,
      firstViewedAt: sql`coalesce(${participations.firstViewedAt}, ${now})`,
      lastViewedAt: now,
    })
    .where(eq(participations.id, participation.id))
    .returning({ viewCount: participations.viewCount });
  const viewCount = updated?.viewCount ?? participation.viewCount + 1;
  // Only the first consultation goes to the public journal. Later ones are
  // still counted for the organiser, but journaling them would let the
  // group match "Léa updated her list" with "Tom viewed his result" and
  // guess who gives to whom.
  if (viewCount === 1) {
    // The last one to look completes the edition: the organisers are told.
    if (
      rules.notifyAllViewed &&
      isEveryoneViewed(await viewCounts(db, edition.id))
    ) {
      await notifyOrganizers({ db, event }, group.id, (locale) =>
        buildAllViewedEmail(
          {
            groupName: group.name,
            editionLabel: edition.label,
            link: appUrl(event, `/admin/${group.slug}/editions/${edition.id}`),
          },
          locale,
        ),
      );
    }
    await recordEvent(db, {
      type: 'result_viewed',
      groupId: group.id,
      editionId: edition.id,
      personId: person.id,
      actor: 'participant',
    });
  }

  return {
    receiver: {
      name: displayName(
        receiver.person,
        people.map((p) => p.person),
      ),
      avatar: avatarOf(receiver.person),
    },
    budget: rules.budget,
    eventDate: rules.eventDate,
    guardianMessage: rules.guardianMessage,
    // « La liste de cadeaux d'Inès »: a line, nothing of the list.
    list: help.list,
    hints: help.hints,
    // For the words under « Lui demander des idées ».
    receiverHasEmail: Boolean(receiver.person.email),
    requesterHasEmail: Boolean(person.email),
    viewCount,
  };
});
