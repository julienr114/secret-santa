import { and, eq } from 'drizzle-orm';
import type { H3Event } from 'h3';
import { useDb, type Db } from '#server/database/client';
import {
  accounts,
  parties,
  persons,
  type AccountRow,
  type PartyRow,
  type PersonRow,
} from '#server/database/schema';
import { isOrganizer } from '#server/database/groups';
import type { SessionUser } from '#server/utils/auth';
import { requireAccount } from './auth';

// Who may open a party (docs/spec/v3/fete.md, ticket 104): its organisers
// and the super-admin manage it; its members, the people of the party at
// my address, see it. Nobody else: 403, whether the party exists or not,
// so its address cannot be probed.

export type PartyRole = 'organiser' | 'member';

export type PartyContext = {
  user: SessionUser;
  account: AccountRow;
  party: PartyRow;
  role: PartyRole;
  /** My person in the party, if I am one of its people. */
  me: PersonRow | null;
  db: Db;
};

const forbidden = () =>
  createError({ statusCode: 403, statusMessage: 'forbidden' });

/**
 * Loads the party named in the route (`[slug]`) for a logged-in account.
 * @param event - The request.
 * @param need - `organiser` for what only organisers do.
 * @returns The party, my role and my person.
 */
export const requireParty = async (
  event: H3Event,
  need: PartyRole = 'member',
): Promise<PartyContext> => {
  const user = await requireAccount(event);
  const db = useDb(event);
  const slug = getRouterParam(event, 'slug') ?? '';
  const [party] = await db
    .select()
    .from(parties)
    .where(eq(parties.slug, slug))
    .limit(1);
  const [account] = await db
    .select()
    .from(accounts)
    .where(eq(accounts.id, user.accountId))
    .limit(1);
  if (!party || !account) throw forbidden();
  const [me] = await db
    .select()
    .from(persons)
    .where(and(eq(persons.partyId, party.id), eq(persons.email, account.email)))
    .limit(1);
  const organiser =
    user.role === 'super_admin' ||
    (await isOrganizer(db, party.id, account.id));
  const role: PartyRole | null = organiser ? 'organiser' : me ? 'member' : null;
  if (!role || (need === 'organiser' && role !== 'organiser')) {
    throw forbidden();
  }
  return { user, account, party, role, me: me ?? null, db };
};
