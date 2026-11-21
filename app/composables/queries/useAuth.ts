import type { PartyCategory } from '#shared/utils/categories';
import type { EditionStatus } from '#server/utils/editions';
import type { SessionUser } from '#server/utils/auth';
import type { Avatar } from '#server/utils/avatars';
import type { Locale } from '#shared/i18n';
import { keys } from './keys';
import { api, useApiMutation, useApiQuery } from './useApi';

// Accounts: login by a magic link, and the sessions of the account
// (README 22.5).

export type AccountSession = {
  id: string;
  current: boolean;
  device: string | null;
  createdAt: string;
  lastSeenAt: string;
};
export type AccountPayload = {
  email: string;
  firstName: string | null;
  lastName: string | null;
  language: Locale;
  avatar: Avatar;
  isSuperAdmin: boolean;
  sessions: AccountSession[];
};

/**
 * Asks for a login link. The answer never says whether the address has
 * an account; `devLink` only exists in development mode.
 */
export const useRequestLinkMutation = () =>
  useApiMutation<
    { ok: true; devLink?: string },
    { email: string; next?: string | null; firstName?: string }
  >(({ email, next, firstName }) =>
    api('/api/auth/link', {
      method: 'POST',
      body: {
        email,
        ...(next ? { next } : {}),
        ...(firstName ? { firstName } : {}),
      },
    }),
  );

/**
 * The address a login link logs in with, read without using the link up.
 * Fails with `login_link_invalid` when it can no longer be used.
 */
export const useLinkEmailQuery = (token: MaybeRefOrGetter<string>) =>
  useApiQuery<{ email: string }>(
    () => ['login-link', toValue(token)],
    () => `/api/auth/link-email?token=${encodeURIComponent(toValue(token))}`,
  );

/** Consumes a login link and loads the new session. */
export const useConfirmLinkMutation = () => {
  const { fetch } = useUserSession();
  return useApiMutation<{ user: SessionUser }, string>(async (token) => {
    const result = await api<{ user: SessionUser }>('/api/auth/confirm', {
      method: 'POST',
      body: { token },
    });
    await fetch();
    return result;
  });
};

/** A draw of the account, for « Tirages passés ». */
export type HomeDraw = {
  id: string;
  /** The personal page of the draw. */
  path: string;
  groupName: string;
  editionLabel: string;
  year: number;
  status: EditionStatus;
};
export type HomePayload = {
  draws: HomeDraw[];
};

/** The draws of the account, for « Tirages passés ». */
export const useHomeQuery = (enabled: MaybeRefOrGetter<boolean> = true) =>
  useApiQuery<HomePayload>(
    () => keys.home(),
    () => '/api/auth/home',
    enabled,
  );

/** "My account": the address and the devices it is logged in on. */
export const useAccountQuery = () =>
  useApiQuery<AccountPayload>(
    () => keys.account(),
    () => '/api/auth/sessions',
  );

/** What the profile form sends. */
/** What a profile screen sends: only the part it shows. */
export type ProfileBody = Partial<{
  firstName: string;
  lastName: string | null;
  language: Locale;
  avatarEmoji: Avatar['emoji'];
  avatarColor: Avatar['color'];
}>;

/** Saves the profile of the account. */
export const useSaveProfileMutation = () =>
  useApiMutation<{ ok: true }, ProfileBody>(
    (body) => api('/api/auth/profile', { method: 'PUT', body }),
    // « Moi », among my people and on my lists, has the account's icon.
    () => [keys.account(), keys.home(), keys.family(), keys.lists()],
  );

/** Logs one other device of the account out. */
export const useRevokeSessionMutation = () =>
  useApiMutation<{ ok: true }, string>(
    (id) => api(`/api/auth/sessions/${id}/revoke`, { method: 'POST' }),
    () => [keys.account()],
  );

/** Closes every session of the account, this one included. */
export const useRevokeAllMutation = () => {
  const { clear } = useUserSession();
  return useApiMutation<{ ok: true }, undefined>(async () => {
    const result = await api<{ ok: true }>('/api/auth/sessions/revoke-all', {
      method: 'POST',
    });
    await clear();
    return result;
  });
};

/** What an invitation link shows. */
export type InvitePayload = {
  groupName: string;
  /** The party (V3): its category, the date of its year, its members. */
  party: {
    category: PartyCategory;
    iconEmoji: string | null;
    date: string | null;
    members: number;
  };
  /** How many organisers the group has (« tes organisateurs »). */
  organizers: number;
  /** The organiser's words, if any. */
  message: string | null;
  /** The draw in progress of the group, if any. */
  edition: {
    label: string;
    status: 'preparing' | 'drawn' | 'closed';
    /** Whether the participants may leave gift hints. */
    hintsOn: boolean;
    eventDate: string;
    participants: number;
  } | null;
  /** Why the link no longer lets anyone in, or null. */
  /** The last day an expired link worked. */
  expiredAfter: string | null;
  closed: 'invite_expired' | 'invite_full' | null;
  /** For a logged-in account: its first name, and whether it is in. */
  account: {
    email: string;
    firstName: string | null;
    member: boolean;
    path: string | null;
  } | null;
};

/** The group an invitation link leads to. */
export const useInviteQuery = (code: MaybeRefOrGetter<string>) =>
  useApiQuery<InvitePayload>(
    () => ['invite', toValue(code)],
    () => `/api/invite/${toValue(code)}`,
  );

/** Joins the group of an invitation link. */
export const useJoinMutation = (code: MaybeRefOrGetter<string>) =>
  useApiMutation<{ ok: true; path: string | null }, { firstName: string }>(
    (body) =>
      api(`/api/invite/${toValue(code)}/join`, { method: 'POST', body }),
    () => [keys.home()],
  );

/** Adds a draw opened by its personal link to the logged-in account. */
export const useClaimMutation = (token: MaybeRefOrGetter<string>) =>
  useApiMutation<{ ok: true }, undefined>(
    () => api(`/api/p/${toValue(token)}/claim`, { method: 'POST' }),
    () => [keys.personal(toValue(token)), keys.home()],
  );
