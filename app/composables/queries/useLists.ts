import type {
  ElsewhereList,
  SharingOption,
} from '#server/database/listSharing';
import type {
  HolderView,
  ListDocument,
  MemberView,
  VisitorDocument,
} from '#server/http/lists';
import type { Avatar } from '#server/utils/avatars';
import type { LinePart } from '#shared/utils/lines';
import type { HolderLevel } from '#server/utils/listAccess';
import type { MemberRemoval, ShareAsk } from '#server/utils/lists';
import type { SharingAsk } from '#server/utils/listSharing';
import type { HintAnswer, HintQuestion, HintText } from '#shared/utils/hints';
import type { ListOrder } from '#shared/utils/reorder';
import { keys } from './keys';
import { api, useApiMutation, useApiQuery } from './useApi';

// Gift lists (README 22.19, lot 21): the document of a
// list for its holder, sharing it, the people of my family.

type Id = MaybeRefOrGetter<string>;

export const useListQuery = (
  id: Id,
  enabled: MaybeRefOrGetter<boolean> = true,
) =>
  useApiQuery<ListDocument>(
    () => keys.list(toValue(id)),
    () => `/api/lists/${toValue(id)}`,
    enabled,
  );

const listKeys = (id: string) => [keys.list(id), keys.lists()];
const linkKeys = (token: string) => [keys.link(token), keys.lists()];

/**
 * Where a list is ticked and written: by its link, or in the document of
 * those who hold it.
 */
export type ClaimRoute = { token: string } | { listId: string };
type Via = MaybeRefOrGetter<ClaimRoute>;
const claimsUrl = (via: ClaimRoute) =>
  'token' in via
    ? `/api/l/${via.token}/claims`
    : `/api/lists/${via.listId}/claims`;
const claimKeys = (via: ClaimRoute) =>
  'token' in via ? linkKeys(via.token) : listKeys(via.listId);

const ideasUrl = (via: ClaimRoute) =>
  'token' in via
    ? `/api/l/${via.token}/ideas`
    : `/api/lists/${via.listId}/ideas`;

export const useCreateListMutation = () =>
  useApiMutation<
    { id: string },
    {
      icon: { emoji: string; color: string };
      title?: string;
      eventDate?: string | null;
      /** « Reprendre cette liste »: the list to start from. */
      from?: string;
      /** The address of the event it is made for (ticket 106). */
      party?: string;
    }
  >(
    (body) => api('/api/lists', { method: 'POST', body }),
    () => [keys.lists(), keys.home()],
  );

/** A list one can start from, with what it would bring (lot 27). */
export type ResumableList = {
  id: string;
  icon: { emoji: string; color: string };
  title: string;
  /** The first names of its people, « moi » last (ticket 119). */
  names: LinePart | null;
  people: number;
  ideas: number;
  /** A list without people (lot 27 bis). */
  single: boolean;
};

export const useResumableQuery = (
  id: Id,
  enabled: MaybeRefOrGetter<boolean> = true,
) =>
  useApiQuery<ResumableList[]>(
    () => [...keys.list(toValue(id)), 'resumable'],
    () => `/api/lists/${toValue(id)}/resumable`,
    enabled,
  );

/** « Repartir d'une liste », in the empty document of a new list. */
export const useResumeMutation = (id: Id) =>
  useApiMutation<{ ok: true }, string>(
    (from) =>
      api(`/api/lists/${toValue(id)}/resume`, {
        method: 'POST',
        body: { from },
      }),
    () => listKeys(toValue(id)),
  );

export type ListPatch = {
  title?: string;
  eventDate?: string | null;
  note?: string | null;
  icon?: { emoji: string; color: string };
};

export const useUpdateListMutation = (id: Id) =>
  useApiMutation<{ ok: true }, ListPatch>(
    (body) => api(`/api/lists/${toValue(id)}`, { method: 'PATCH', body }),
    () => listKeys(toValue(id)),
  );

/** « Supprimer la liste », on purpose: any list, shared or not. */
export const useDeleteListForGoodMutation = () =>
  useApiMutation<{ ok: true }, string>(
    (id) => api(`/api/lists/${id}`, { method: 'DELETE', query: { sure: '1' } }),
    () => [keys.lists()],
  );

export const useDeleteListMutation = () =>
  useApiMutation<{ ok: true }, string>(
    (id) => api(`/api/lists/${id}`, { method: 'DELETE' }),
    () => [keys.lists()],
  );

export const useAddPersonMutation = (id: Id) =>
  useApiMutation<
    { id: string; memberId: string },
    { memberId: string } | { newMember: { firstName: string; avatar: Avatar } }
  >(
    (body) => api(`/api/lists/${toValue(id)}/people`, { method: 'POST', body }),
    () => [...listKeys(toValue(id)), keys.family()],
  );

/** « Une liste sans personne » (lot 27 bis). */
export const useMakeSingleMutation = (id: Id) =>
  useApiMutation<{ ok: true }, undefined>(
    () => api(`/api/lists/${toValue(id)}/single`, { method: 'POST' }),
    () => listKeys(toValue(id)),
  );

export const useRemovePersonMutation = (id: Id) =>
  useApiMutation<{ ok: true }, string>(
    (pid) =>
      api(`/api/lists/${toValue(id)}/people/${pid}`, { method: 'DELETE' }),
    () => listKeys(toValue(id)),
  );

/**
 * Those who hold a list, the invitations (waiting, expired or refused)
 * and, for those who manage it, my people who could be invited.
 */
export type ListHolders = {
  manages: boolean;
  holders: HolderView[];
  invites: {
    id: string;
    email: string;
    name: string | null;
    avatar: Avatar | null;
    level: HolderLevel;
    state: 'waiting' | 'expired' | 'declined';
    sentAt: string;
    expiresAt: string;
    declinedAt: string | null;
  }[];
  suggestions: { memberId: string; name: string; avatar: Avatar }[];
};
const holderKeys = (id: string) => [keys.holders(id), ...listKeys(id)];

export const useHoldersQuery = (id: Id) =>
  useApiQuery<ListHolders>(
    () => keys.holders(toValue(id)),
    () => `/api/lists/${toValue(id)}/holders`,
  );

/** Invites one of my people, or an address, at a level. */
export const useInviteHolderMutation = (id: Id) =>
  useApiMutation<
    { ok: true; devLink?: string },
    ({ email: string } | { memberId: string }) & { level: HolderLevel }
  >(
    (body) =>
      api(`/api/lists/${toValue(id)}/holders`, { method: 'POST', body }),
    () => holderKeys(toValue(id)),
  );

export const useRemoveHolderMutation = (id: Id) =>
  useApiMutation<{ ok: true }, string>(
    (accountId) =>
      api(`/api/lists/${toValue(id)}/holders/${accountId}`, {
        method: 'DELETE',
      }),
    () => holderKeys(toValue(id)),
  );

export const useHolderLevelMutation = (id: Id) =>
  useApiMutation<{ ok: true }, { accountId: string; level: HolderLevel }>(
    ({ accountId, level }) =>
      api(`/api/lists/${toValue(id)}/holders/${accountId}`, {
        method: 'PATCH',
        body: { level },
      }),
    () => holderKeys(toValue(id)),
  );

/** « Annuler l'invitation », or « Effacer » one refused. */
export const useCancelInviteMutation = (id: Id) =>
  useApiMutation<{ ok: true }, string>(
    (inviteId) =>
      api(`/api/lists/${toValue(id)}/invites/${inviteId}`, {
        method: 'DELETE',
      }),
    () => holderKeys(toValue(id)),
  );

/** « Renvoyer » an invitation that expired. */
export const useResendInviteMutation = (id: Id) =>
  useApiMutation<{ ok: true; devLink?: string }, string>(
    (inviteId) =>
      api(`/api/lists/${toValue(id)}/invites/${inviteId}/resend`, {
        method: 'POST',
      }),
    () => holderKeys(toValue(id)),
  );

/** What the page of an invitation shows. */
export type Invitation = {
  state: 'waiting' | 'accepted' | 'declined' | 'expired';
  by: string;
  title: string;
  icon: { emoji: string; color: string };
  level: HolderLevel;
  expiresAt: string;
  listId?: string;
  email?: string;
  account?: { name: string; avatar: Avatar } | null;
};

export const useInvitationQuery = (token: Id) =>
  useApiQuery<Invitation>(
    () => ['invitation', toValue(token)],
    () => `/api/invitations/${toValue(token)}`,
  );

export const useAcceptInvitationMutation = (token: Id) =>
  useApiMutation<{ listId: string }, { firstName?: string; language?: string }>(
    (body) =>
      api(`/api/invitations/${toValue(token)}/accept`, {
        method: 'POST',
        body,
      }),
    () => [['invitation', toValue(token)], keys.lists()],
  );

export const useDeclineInvitationMutation = (token: Id) =>
  useApiMutation<{ ok: true }>(
    () => api(`/api/invitations/${toValue(token)}/decline`, { method: 'POST' }),
    () => [['invitation', toValue(token)]],
  );

export const useCreateIdeaMutation = (via: Via) =>
  useApiMutation<
    { id: string },
    {
      listPersonId: string;
      text: string;
      url?: string | null;
      after: string | null;
    }
  >(
    (body) => api(ideasUrl(toValue(via)), { method: 'POST', body }),
    () => claimKeys(toValue(via)),
  );

export const useUpdateIdeaMutation = (via: Via) =>
  useApiMutation<
    { ok: true },
    { ideaId: string; text?: string; url?: string | null }
  >(
    ({ ideaId, ...body }) =>
      api(`${ideasUrl(toValue(via))}/${ideaId}`, { method: 'PATCH', body }),
    () => claimKeys(toValue(via)),
  );

export const useDeleteIdeaMutation = (via: Via) =>
  useApiMutation<{ ok: true }, string>(
    (ideaId) =>
      api(`${ideasUrl(toValue(via))}/${ideaId}`, { method: 'DELETE' }),
    () => claimKeys(toValue(via)),
  );

/** Saves the order of a list: its people, each with their ideas. */
export const useReorderMutation = (id: Id) =>
  useApiMutation<{ ok: true }, ListOrder>(
    (order) =>
      api(`/api/lists/${toValue(id)}/order`, {
        method: 'PUT',
        body: { order },
      }),
    () => listKeys(toValue(id)),
  );

export const useShareListMutation = (id: Id) =>
  useApiMutation<{ token: string | null; shared: boolean }, { ask: ShareAsk }>(
    (body) => api(`/api/lists/${toValue(id)}/share`, { method: 'POST', body }),
    () => listKeys(toValue(id)),
  );

/**
 * « Qui voit ta liste ? » (tickets 106, 139): the events offered, whether
 * it is public, whether I am on it, and whether « Quelqu'un d'autre » is
 * offered (ticket 117).
 */
export type ListSharing = {
  options: SharingOption[];
  isPublic: boolean;
  onList: boolean;
  invite: boolean;
};

export const useListSharingQuery = (
  id: Id,
  enabled: MaybeRefOrGetter<boolean>,
) =>
  useApiQuery<ListSharing>(
    () => keys.sharing(toValue(id)),
    () => `/api/lists/${toValue(id)}/sharing`,
    enabled,
  );

export const useSaveSharingMutation = (id: Id) =>
  useApiMutation<{ ok: true }, SharingAsk>(
    (body) => api(`/api/lists/${toValue(id)}/sharing`, { method: 'PUT', body }),
    () => [...listKeys(toValue(id)), keys.sharing(toValue(id)), keys.home()],
  );

/**
 * How many who ticked would lose the list with a narrower sharing.
 * @param id - The list.
 * @param ask - The sharing asked for.
 * @returns The count.
 */
export const sharingImpact = (
  id: string,
  ask: SharingAsk & { from?: string[] },
) =>
  api<{ members: number; claimers: number }>(
    `/api/lists/${id}/sharing/impact`,
    {
      method: 'POST',
      body: ask,
    },
  );

/** « Ce que j'offre ailleurs » (ticket 106). */
/** « Inviter quelqu'un » (ticket 117): whether its link lets in, and the
 * places left in its event. */
export type ListMembers = {
  partyId: string | null;
  partyName: string | null;
  open: boolean;
  placesLeft: number;
};

export const useListMembersQuery = (id: Id) =>
  useApiQuery<ListMembers>(
    () => keys.listMembers(toValue(id)),
    () => `/api/lists/${toValue(id)}/members`,
  );

/** « Par son adresse email »: a member of its event at once, by the list. */
export const useInviteToListMutation = (id: Id) =>
  useApiMutation<{ ok: true }, { firstName: string; email: string }>(
    (body) =>
      api(`/api/lists/${toValue(id)}/members`, { method: 'POST', body }),
    () => [keys.listMembers(toValue(id)), keys.sharing(toValue(id))],
  );

/** « Reprendre ceux d'un autre événement », into the list's event. */
export const useTakeToListMutation = (id: Id) =>
  useApiMutation<{ count: number }, string[]>(
    (personIds) =>
      api(`/api/lists/${toValue(id)}/members/taken`, {
        method: 'POST',
        body: { personIds },
      }),
    () => [keys.listMembers(toValue(id)), keys.sharing(toValue(id))],
  );

/** Coming into the event of a list by its link (ticket 117). */
export const useJoinByLinkMutation = (token: Token) =>
  useApiMutation<{ ok: true }>(
    () => api(`/api/l/${toValue(token)}/join`, { method: 'POST' }),
    () => [...linkKeys(toValue(token)), keys.home()],
  );

export const useElsewhereQuery = () =>
  useApiQuery<{ lists: ElsewhereList[] }>(
    () => keys.elsewhere(),
    () => '/api/lists/elsewhere',
  );

/** A person of « Mes proches », with on how many of my lists they are. */
export type FamilyEntry = MemberView & { lists: number };

export const useFamilyQuery = () =>
  useApiQuery<{ members: FamilyEntry[] }>(() => keys.family(), '/api/family');

export const useCreateMemberMutation = () =>
  useApiMutation<{ id: string }, { firstName: string; avatar: Avatar }>(
    (body) => api('/api/family', { method: 'POST', body }),
    () => [keys.family(), keys.lists()],
  );

export const useDeleteMemberMutation = () =>
  useApiMutation<{ ok: true }, string>(
    (id) => api(`/api/family/${id}`, { method: 'DELETE' }),
    () => [keys.family(), keys.lists()],
  );

export const useMemberQuery = (id: Id) =>
  useApiQuery<{ member: MemberView; mine: boolean; removal: MemberRemoval }>(
    () => keys.member(toValue(id)),
    () => `/api/family/${toValue(id)}`,
  );

export type MemberPatch = {
  firstName?: string;
  avatar?: Avatar;
  birthDate?: string | null;
  clothingSize?: string | null;
  shoeSize?: string | null;
  /** The address of their own account; null no longer links them. */
  email?: string | null;
  answers?: Partial<Record<HintQuestion, HintAnswer | null>>;
  texts?: Partial<Record<HintText, string | null>>;
};

export const useUpdateMemberMutation = (id: Id) =>
  useApiMutation<{ ok: true }, MemberPatch>(
    (body) => api(`/api/family/${toValue(id)}`, { method: 'PATCH', body }),
    // The member shows on every list: refetch them all. The icon of
    // « Moi » is the account's too.
    () => [keys.family(), keys.lists(), keys.account(), keys.home()],
  );

// A list by its link (lot 22): ticking, giving with others, off the list.
type Token = MaybeRefOrGetter<string>;

/** What the bar « Mode anonyme » shows; null without one. */
export type ListMode = { anonymous: boolean; notice: boolean } | null;
/** A list by its link, with my « mode anonyme » on it (lot 27 ter). */
export type LinkDocument = VisitorDocument & {
  mode: ListMode;
  /** My visit before this one, or null (ticket 120). */
  since: string | null;
};

/**
 * A list by its link.
 * @param token - The token of the link.
 * @param from - What the address carries from a draw (`anonyme`, `p`),
 *   sent along: the server alone decides what it makes of it.
 * @returns The query.
 */
export const useLinkQuery = (
  token: Token,
  from: MaybeRefOrGetter<string> = '',
) =>
  useApiQuery<LinkDocument>(
    () => keys.link(toValue(token)),
    () => `/api/l/${toValue(token)}${toValue(from)}`,
  );

/** The switch of « Mode anonyme », and « Compris » under its note. */
export const useListModeMutation = (token: Token) =>
  useApiMutation<
    NonNullable<ListMode>,
    { anonymous: boolean } | { noticeSeen: true }
  >(
    (body) => api(`/api/l/${toValue(token)}/mode`, { method: 'PUT', body }),
    () => [keys.link(toValue(token))],
  );

export const useTickMutation = (via: Via) =>
  useApiMutation<
    { ok: true; joined: boolean },
    {
      ideaId: string;
      mode?: 'alone' | 'group';
      anonymous?: boolean;
      note?: string | null;
    }
  >(
    (body) => api(claimsUrl(toValue(via)), { method: 'POST', body }),
    () => claimKeys(toValue(via)),
  );

export const useChangeClaimMutation = (via: Via) =>
  useApiMutation<
    { ok: true },
    {
      ideaId: string;
      mode?: 'alone' | 'group';
      anonymous?: boolean;
      note?: string | null;
      closed?: boolean;
    }
  >(
    ({ ideaId, ...body }) =>
      api(`${claimsUrl(toValue(via))}/${ideaId}`, { method: 'PATCH', body }),
    () => claimKeys(toValue(via)),
  );

export const useUntickMutation = (via: Via) =>
  useApiMutation<{ ok: true }, string>(
    (ideaId) =>
      api(`${claimsUrl(toValue(via))}/${ideaId}`, { method: 'DELETE' }),
    () => claimKeys(toValue(via)),
  );

/** Those who hold a list take the tick of someone else off an idea. */
export const useUntickForMutation = (id: Id) =>
  useApiMutation<{ ok: true }, { ideaId: string; claimId: string }>(
    ({ ideaId, claimId }) =>
      api(`/api/lists/${toValue(id)}/claims/${ideaId}`, {
        method: 'DELETE',
        query: { claim: claimId },
      }),
    () => listKeys(toValue(id)),
  );

/** Who gives an idea, as the sheet « Qui l'offre ? » saves it. */
export type GiversBody = {
  ideaId: string;
  /** Who the sheet showed as giving it. */
  from: string[];
  givers: ({ key: string } | { name: string; email: string | null })[];
  mode: 'alone' | 'group';
  closed: boolean;
};

/** « Qui l'offre ? » (21 November 2026), for those who hold the list. */
export const useSetGiversMutation = (id: Id) =>
  useApiMutation<{ ok: true }, GiversBody>(
    ({ ideaId, ...body }) =>
      api(`/api/lists/${toValue(id)}/claims/${ideaId}/givers`, {
        method: 'PUT',
        body,
      }),
    () => listKeys(toValue(id)),
  );

export const useAddOffListMutation = (token: Token) =>
  useApiMutation<
    { ok: true },
    { listPersonId: string; text: string; anonymous?: boolean }
  >(
    (body) =>
      api(`/api/l/${toValue(token)}/off-list`, { method: 'POST', body }),
    () => linkKeys(toValue(token)),
  );

export const useRemoveOffListMutation = (token: Token) =>
  useApiMutation<{ ok: true }, string>(
    (giftId) =>
      api(`/api/l/${toValue(token)}/off-list/${giftId}`, { method: 'DELETE' }),
    () => linkKeys(toValue(token)),
  );
