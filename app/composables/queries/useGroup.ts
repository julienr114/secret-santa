import type { JournalPersonCard } from '#server/database/journal';
import { toValue, type MaybeRefOrGetter } from 'vue';
import type { PublicGroup } from '#server/database/groups';
import type { Participant, PublicEdition } from '#server/database/editions';
import type { ExclusionRow } from '#server/database/schema';
import type { JournalEntry } from '#server/utils/audit';
import type { PublicPerson } from '#server/utils/people';
import type { Rules, RulesPatch } from '#server/utils/rules';
import type { AnswerStatus, AnswersCard } from '#server/utils/answers';
import type { GuessMode } from '#server/utils/guesses';
import type { Locale } from '#shared/i18n';
import { keys } from './keys';
import { api, useApiMutation, useApiQuery } from './useApi';

// Reads and writes scoped to one group. `slug` may be a ref or a getter.

export type Dashboard = {
  group: PublicGroup;
  rules: Rules;
  editions: PublicEdition[];
  currentEditionId: string | null;
  nextEdition: { label: string; year: number };
};
export type PeoplePayload = {
  persons: PublicPerson[];
  exclusions: ExclusionRow[];
};
/** A participant, with their answer status while answers are collected. */
export type EditionParticipant = Participant & {
  answerStatus?: AnswerStatus;
  /** Made at least one guess in « Devine qui » (never which). */
  played?: boolean;
  /** Passed their turn (Correction 15). */
  skipped?: boolean;
};
/** « Devine qui » on the edition (README 22.17). */
export type GuessSummary = {
  mode: GuessMode;
  /** The end of the guesses (instant), and the zone it was chosen in. */
  endsAt: string | null;
  timeZone: string | null;
  open: boolean;
  /** How many have played, out of those who did not pass their turn. */
  players: number;
  total: number;
  /** Not played, not passed their turn: left to remind. */
  left: number;
  /** The organiser's last reminder (no limit, Correction 15). */
  reminderSentAt: string | null;
  /** The automatic reminder is on. */
  autoReminder: boolean;
  /** « Me tenir au courant », this organiser's; null when not a member. */
  news: boolean | null;
  /** Five days before the end, someone left: suggest a reminder. */
  nudge: boolean;
  /** The game can be turned on: before the draw, or four people drawn. */
  possible: boolean;
  /** A Christmas party: elsewhere, never « Père Noël » (vocabulaire.md). */
  christmas: boolean;
};
/** Where the answers of a draw made elsewhere stand (README 22.12). */
export type AnswersSummary = {
  card: AnswersCard;
  /** Persons whose answers clash. */
  conflicts: string[];
  /** The one person left, when their answer follows from the others. */
  deducedFor: string | null;
};
export type EditionPayload = {
  edition: PublicEdition;
  rules: Rules;
  participants: EditionParticipant[];
  /** While the answers of a draw made elsewhere are collected. */
  answers: AnswersSummary | null;
  guess: GuessSummary;
  /** Drawn again after a cancelled draw. */
  redrawn: boolean;
  /** Its name, when the event has several the same year. */
  santaName: string | null;
  /** Its invitation link (ticket 116). */
  invite: {
    /** Null when closed. */
    code: string | null;
    until: string | null;
    places: number | null;
    message: string | null;
    /** The places the link really offers: none at 30 members. */
    placesLeft: number;
    /** What the event can still take before 30 members. */
    room: number;
  };
};

type Slug = MaybeRefOrGetter<string>;
const base = (slug: Slug) => `/api/admin/${toValue(slug)}`;
const groupKeys = (slug: Slug) => [keys.group(toValue(slug))];

export const useDashboardQuery = (slug: Slug) =>
  useApiQuery<Dashboard>(
    () => keys.dashboard(toValue(slug)),
    () => base(slug),
  );

export type GroupJournal = {
  entries: JournalEntry[];
  editions: { id: string; label: string }[];
  people: JournalPersonCard[];
  currentEditionId: string | null;
  language: Locale;
};

/** The public journal, in the language the admin is used in. */
export const useGroupJournalQuery = (
  slug: Slug,
  locale: MaybeRefOrGetter<Locale>,
) =>
  useApiQuery<GroupJournal>(
    () => [...keys.group(toValue(slug)), 'journal', toValue(locale)],
    () => `${base(slug)}/journal?locale=${toValue(locale)}`,
  );

/** An organiser of the group; `me` marks the logged-in account. */
export type OrganizerRow = { accountId: string; email: string; me: boolean };

/** The organisers of a group. */
export const useOrganizersQuery = (slug: Slug) =>
  useApiQuery<{ organizers: OrganizerRow[] }>(
    () => [...keys.group(toValue(slug)), 'organizers'],
    () => `${base(slug)}/organizers`,
  );

/** Makes the owner of an address an organiser of the group. */
export const useAddOrganizerMutation = (slug: Slug) =>
  useApiMutation<unknown, string>(
    (email) =>
      api(`${base(slug)}/organizers`, { method: 'POST', body: { email } }),
    () => groupKeys(slug),
  );

/** Takes an organiser off the group, by account. */
export const useRemoveOrganizerMutation = (slug: Slug) =>
  useApiMutation<{ ok: true }, string>(
    (accountId) =>
      api(`${base(slug)}/organizers/${accountId}`, { method: 'DELETE' }),
    () => groupKeys(slug),
  );

export const usePeopleQuery = (slug: Slug) =>
  useApiQuery<PeoplePayload>(
    () => keys.people(toValue(slug)),
    () => `${base(slug)}/persons`,
  );

export const useEditionQuery = (
  slug: Slug,
  id: Slug,
  enabled: MaybeRefOrGetter<boolean> = true,
) =>
  useApiQuery<EditionPayload>(
    () => keys.edition(toValue(slug), toValue(id)),
    () => `${base(slug)}/editions/${toValue(id)}`,
    enabled,
  );

export type PersonBody = {
  firstName: string;
  lastName: string | null;
  email?: string | null;
  language?: Locale;
  avatarEmoji?: string;
  avatarColor?: string;
};
export type PersonPatch = Partial<PersonBody & { active: boolean }> & {
  id: string;
};

export const useCreatePersonMutation = (slug: Slug) =>
  useApiMutation<{ person: PublicPerson }, PersonBody>(
    (body) => api(`${base(slug)}/persons`, { method: 'POST', body }),
    () => groupKeys(slug),
  );

export const useUpdatePersonMutation = (slug: Slug) =>
  useApiMutation<{ person: PublicPerson }, PersonPatch>(
    ({ id, ...body }) =>
      api(`${base(slug)}/persons/${id}`, { method: 'PATCH', body }),
    () => groupKeys(slug),
  );

export const useDeletePersonMutation = (slug: Slug) =>
  useApiMutation<{ ok: true }, string>(
    (id) => api(`${base(slug)}/persons/${id}`, { method: 'DELETE' }),
    () => groupKeys(slug),
  );

export type ExclusionBody = {
  giverId: string;
  receiverId: string;
  reciprocal: boolean;
};

export const useCreateExclusionMutation = (slug: Slug) =>
  useApiMutation<{ exclusion: ExclusionRow }, ExclusionBody>(
    (body) => api(`${base(slug)}/exclusions`, { method: 'POST', body }),
    () => groupKeys(slug),
  );

export const useDeleteExclusionMutation = (slug: Slug) =>
  useApiMutation<{ ok: true }, string>(
    (id) => api(`${base(slug)}/exclusions/${id}`, { method: 'DELETE' }),
    () => groupKeys(slug),
  );

export const useCreateEditionMutation = (slug: Slug) =>
  useApiMutation<
    { edition: PublicEdition },
    {
      label: string;
      year: number;
      eventDate: string;
      budget?: string;
      guardianMessage?: string;
      messageNote?: string;
      guess?:
        | { mode: 'none' }
        | { mode: 'santa' | 'all'; endsAt: string; timeZone: string };
    }
  >(
    (body) => api(`${base(slug)}/editions`, { method: 'POST', body }),
    () => groupKeys(slug),
  );

export const useUpdateEditionMutation = (slug: Slug) =>
  useApiMutation<
    { edition: PublicEdition },
    {
      id: string;
      label?: string;
      rulesOverride?: RulesPatch | null;
      eventDate?: string;
    }
  >(
    ({ id, ...body }) =>
      api(`${base(slug)}/editions/${id}`, { method: 'PATCH', body }),
    () => groupKeys(slug),
  );

/** Opens, renews or closes the invitation link of a Secret Santa. */
export const useInviteLinkMutation = (slug: Slug, id: Slug) =>
  useApiMutation<
    { inviteCode: string | null },
    {
      open: boolean;
      renew?: boolean;
      until?: string | null;
      places?: number;
      message?: string | null;
    }
  >(
    (body) =>
      api(`${base(slug)}/editions/${toValue(id)}/invite`, {
        method: 'POST',
        body,
      }),
    () => groupKeys(slug),
  );
