import type { H3Event } from 'h3';
import { findParticipation } from '#server/database/participations';
import { requireGroupAccess, type GroupContext } from './auth';
import { notFound } from './errors';
import { writes } from './edition';
import { requireOpenYear } from '#server/database/years';

export type ParticipationContext = GroupContext &
  NonNullable<Awaited<ReturnType<typeof findParticipation>>>;

/** Group access + the participation of the route ([participationId]). */
export const requireParticipation = async (
  event: H3Event,
): Promise<ParticipationContext> => {
  const context = await requireGroupAccess(event);
  const row = await findParticipation(
    context.db,
    context.group.id,
    getRouterParam(event, 'participationId') ?? '',
  );
  if (!row) throw notFound('participation_not_found');
  // Nothing changes in a year over (ticket 108).
  if (writes(event)) {
    await requireOpenYear(context.db, context.group.id, row.edition.yearId);
  }
  return { ...context, ...row };
};
