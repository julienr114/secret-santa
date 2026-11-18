import type {
  ListCard,
  ListDocument,
  MemberView,
  VisitorDocument,
} from '#server/http/lists';
import type { Avatar } from '#server/utils/avatars';
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

export const useCreateIdeaMutation = (id: Id) =>
  useApiMutation<
    { id: string },
    {
      listPersonId: string;
      text: string;
      url?: string | null;
      after: string | null;
    }
  >(
    (body) => api(`/api/lists/${toValue(id)}/ideas`, { method: 'POST', body }),
    () => listKeys(toValue(id)),
  );

export const useUpdateIdeaMutation = (id: Id) =>
  useApiMutation<
    { ok: true },
    { ideaId: string; text?: string; url?: string | null }
  >(
    ({ ideaId, ...body }) =>
      api(`/api/lists/${toValue(id)}/ideas/${ideaId}`, {
        method: 'PATCH',
        body,
      }),
    () => listKeys(toValue(id)),
  );

export const useDeleteIdeaMutation = (id: Id) =>
  useApiMutation<{ ok: true }, string>(
    (ideaId) =>
      api(`/api/lists/${toValue(id)}/ideas/${ideaId}`, { method: 'DELETE' }),
    () => listKeys(toValue(id)),
  );

export const useShareListMutation = (id: Id) =>
  useApiMutation<{ token: string }, { renew?: boolean }>(
    (body) => api(`/api/lists/${toValue(id)}/share`, { method: 'POST', body }),
    () => listKeys(toValue(id)),
  );

export const useMemberQuery = (id: Id) =>
  useApiQuery<{ member: MemberView }>(
    () => keys.member(toValue(id)),
    () => `/api/family/${toValue(id)}`,
  );

export type MemberPatch = {
  firstName?: string;
  avatar?: Avatar;
  birthDate?: string | null;
  clothingSize?: string | null;
  shoeSize?: string | null;
  answers?: Partial<Record<HintQuestion, HintAnswer | null>>;
  texts?: Partial<Record<HintText, string | null>>;
};

export const useUpdateMemberMutation = (id: Id) =>
  useApiMutation<{ ok: true }, MemberPatch>(
    (body) => api(`/api/family/${toValue(id)}`, { method: 'PATCH', body }),
    // The member shows on every list: refetch them all.
    () => [keys.family(), keys.lists()],
  );

// A list by its link (lot 22): ticking, giving with others, off the list.
type Token = MaybeRefOrGetter<string>;
const linkKeys = (token: string) => [keys.link(token), keys.lists()];

export const useLinkQuery = (token: Token) =>
  useApiQuery<VisitorDocument>(
    () => keys.link(toValue(token)),
    () => `/api/l/${toValue(token)}`,
  );

export const useTickMutation = (token: Token) =>
  useApiMutation<
    { ok: true; joined: boolean },
    {
      ideaId: string;
      mode?: 'alone' | 'group';
      anonymous?: boolean;
      note?: string | null;
    }
  >(
    (body) => api(`/api/l/${toValue(token)}/claims`, { method: 'POST', body }),
    () => linkKeys(toValue(token)),
  );

export const useChangeClaimMutation = (token: Token) =>
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
      api(`/api/l/${toValue(token)}/claims/${ideaId}`, {
        method: 'PATCH',
        body,
      }),
    () => linkKeys(toValue(token)),
  );

export const useUntickMutation = (token: Token) =>
  useApiMutation<{ ok: true }, string>(
    (ideaId) =>
      api(`/api/l/${toValue(token)}/claims/${ideaId}`, { method: 'DELETE' }),
    () => linkKeys(toValue(token)),
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
