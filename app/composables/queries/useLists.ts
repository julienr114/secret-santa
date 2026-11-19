import type {
  HolderView,
  ListCard,
  ListDocument,
  MemberView,
  VisitorDocument,
} from '#server/http/lists';
import type { Avatar } from '#server/utils/avatars';
import type { MemberRemoval, ShareAsk } from '#server/utils/lists';
import type { HintAnswer, HintQuestion, HintText } from '#shared/utils/hints';
import { keys } from './keys';
import { api, useApiMutation, useApiQuery } from './useApi';

// Gift lists (README 22.19, lot 21): the « Listes » tab, the document of a
// list for its holder, sharing it, the people of my family.

type Id = MaybeRefOrGetter<string>;

export const useListsQuery = () =>
  useApiQuery<{ coming: ListCard[]; past: ListCard[] }>(
    () => keys.lists(),
    '/api/lists',
  );

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
    }
  >(
    (body) => api('/api/lists', { method: 'POST', body }),
    () => [keys.lists()],
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

export const useRemovePersonMutation = (id: Id) =>
  useApiMutation<{ ok: true }, string>(
    (pid) =>
      api(`/api/lists/${toValue(id)}/people/${pid}`, { method: 'DELETE' }),
    () => listKeys(toValue(id)),
  );

/** Those who hold a list, and the invitations waiting. */
export type ListHolders = {
  holders: HolderView[];
  invites: { id: string; email: string; createdAt: string }[];
};
const holderKeys = (id: string) => [keys.holders(id), ...listKeys(id)];

export const useHoldersQuery = (id: Id) =>
  useApiQuery<ListHolders>(
    () => keys.holders(toValue(id)),
    () => `/api/lists/${toValue(id)}/holders`,
  );

export const useInviteHolderMutation = (id: Id) =>
  useApiMutation<{ ok: true }, string>(
    (email) =>
      api(`/api/lists/${toValue(id)}/holders`, {
        method: 'POST',
        body: { email },
      }),
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

export const useCancelInviteMutation = (id: Id) =>
  useApiMutation<{ ok: true }, string>(
    (inviteId) =>
      api(`/api/lists/${toValue(id)}/invites/${inviteId}`, {
        method: 'DELETE',
      }),
    () => holderKeys(toValue(id)),
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

export const useShareListMutation = (id: Id) =>
  useApiMutation<{ token: string | null; shared: boolean }, { ask: ShareAsk }>(
    (body) => api(`/api/lists/${toValue(id)}/share`, { method: 'POST', body }),
    () => listKeys(toValue(id)),
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

export const useLinkQuery = (token: Token) =>
  useApiQuery<VisitorDocument>(
    () => keys.link(toValue(token)),
    () => `/api/l/${toValue(token)}`,
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

export const useAddOffListMutation = (token: Token) =>
  useApiMutation<
    { ok: true },
    { listPersonId: string; text: string; anonymous: boolean }
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
