import type {
  ElsewhereList,
  SharingOption,
} from '#server/database/listSharing';
import type {
  HolderView,
  IdeaLine,
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
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import {
  tickedLine,
  untickedLine,
  withLine,
} from '#shared/utils/optimisticTick';
import {
  withIdeaAdded,
  withIdeaChanged,
  withListChanged,
  withoutIdea,
} from '#shared/utils/optimisticList';
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

/**
 * « Modifier » a list: its name, date, icon or word show at once (ticket
 * 166); a failure says so, and the list read again puts it back.
 * @param id - The list.
 * @returns The mutation.
 */
export const useUpdateListMutation = (id: Id) => {
  const queryClient = useQueryClient();
  const toast = useMessages();
  const errorMessage = useErrorMessage();
  return useMutation<{ ok: true }, Error, ListPatch>({
    mutationFn: (body) =>
      api(`/api/lists/${toValue(id)}`, { method: 'PATCH', body }),
    onMutate: (body) => {
      const key = keys.list(toValue(id));
      const before = queryClient.getQueryData<ListDocument>(key);
      if (!before) return;
      void queryClient.cancelQueries(
        { queryKey: key, exact: true },
        { revert: false, silent: true },
      );
      queryClient.setQueryData(key, {
        ...before,
        list: withListChanged(before.list, body),
      });
    },
    onError: (error) => toast.failed(errorMessage(error)),
    onSettled: () =>
      Promise.all(
        listKeys(toValue(id)).map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
      ),
  });
};

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

/** A new idea: `tempId` names it on this screen until the server does. */
export type NewIdea = {
  listPersonId: string;
  text: string;
  url?: string | null;
  after: string | null;
  tempId?: string;
};

/**
 * Its line as it shows until the server answers (ticket 166).
 * @param idea - What was written.
 * @param id - Its id on this screen.
 * @returns The line.
 */
const draftLine = (idea: NewIdea, id: string): IdeaLine => ({
  id,
  text: idea.text,
  url: idea.url ?? null,
  createdAt: new Date().toISOString(),
  stars: 0,
  title: false,
  view: { kind: 'free' },
  mine: null,
  carried: false,
  claims: [],
  notes: [],
  who: null,
  pending: true,
});

export const useCreateIdeaMutation = (via: Via) =>
  useOptimisticEdit<{ id: string }, NewIdea>(
    via,
    ({ tempId, ...body }) => {
      const sent = inTurn(tempId ?? body.listPersonId, () =>
        api<{ id: string }>(ideasUrl(toValue(via)), { method: 'POST', body }),
      );
      if (tempId) {
        createdIds.set(
          tempId,
          sent.then((created) => {
            namedIds.set(tempId, created.id);
            return created.id;
          }),
        );
      }
      return sent;
    },
    (doc, idea) =>
      idea.tempId
        ? withIdeaAdded(
            doc,
            idea.listPersonId,
            idea.after,
            draftLine(idea, idea.tempId),
          )
        : doc,
  );

/** What a line changes: its text, its link, its stars, a title. */
export type IdeaPatch = {
  ideaId: string;
  text?: string;
  url?: string | null;
  /** Its stars, 0 to 3, and whether it is a title (ticket 152). */
  stars?: number;
  title?: boolean;
};

export const useUpdateIdeaMutation = (via: Via) =>
  useOptimisticEdit<{ ok: true }, IdeaPatch>(
    via,
    ({ ideaId, ...body }) =>
      inTurn(ideaId, async () =>
        api(`${ideasUrl(toValue(via))}/${await serverIdOf(ideaId)}`, {
          method: 'PATCH',
          body,
        }),
      ),
    (doc, { ideaId, ...patch }) =>
      withIdeaChanged(doc, ideaId, {
        ...patch,
        // A title has neither link nor stars (ticket 152).
        ...(patch.title ? { url: null, stars: 0 } : {}),
      }),
  );

export const useDeleteIdeaMutation = (via: Via) =>
  useOptimisticEdit<{ ok: true }, string>(
    via,
    (ideaId) =>
      inTurn(ideaId, async () =>
        api(`${ideasUrl(toValue(via))}/${await serverIdOf(ideaId)}`, {
          method: 'DELETE',
        }),
      ),
    (doc, ideaId) => withoutIdea(doc, ideaId),
  );

/**
 * Saves the order of a list: its people, each with their ideas. A line
 * just written is moved too: the order waits for the server to name it
 * (ticket 166). Counted with the other changes of the page: the list is
 * read again once they are all answered.
 * @param id - The list.
 * @returns The mutation.
 */
export const useReorderMutation = (id: Id) => {
  const queryClient = useQueryClient();
  return useMutation<{ ok: true }, Error, ListOrder>({
    mutationFn: async (order) =>
      api(`/api/lists/${toValue(id)}/order`, {
        method: 'PUT',
        body: {
          order: await Promise.all(
            order.map(async (section) => ({
              ...section,
              ideas: await Promise.all(section.ideas.map(serverIdOf)),
            })),
          ),
        },
      }),
    onMutate: () => {
      claimsPending.value += 1;
    },
    onSettled: async () => {
      claimsPending.value -= 1;
      if (claimsPending.value > 0) return;
      await Promise.all(
        listKeys(toValue(id)).map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
      );
    },
  });
};

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
 * « Lier à un Secret Santa » (tickets 148, 153): the list, to the Secret Santa
 * of an event; linked elsewhere, it moves here.
 * @param id - The list.
 * @returns The mutation, with the event of the Secret Santa.
 */
export const useLinkDrawMutation = (id: Id) =>
  useApiMutation<{ ok: true }, string>(
    (partyId) =>
      api(`/api/lists/${toValue(id)}/draw/${partyId}`, { method: 'PUT' }),
    () => [
      ...listKeys(toValue(id)),
      keys.sharing(toValue(id)),
      keys.home(),
      ['p'],
    ],
  );

/**
 * « Délier », and the cross of « Celui qui m'a tiré » (ticket 148).
 * @param id - The list.
 * @returns The mutation, with the event of the Secret Santa.
 */
export const useUnlinkDrawMutation = (id: Id) =>
  useApiMutation<{ ok: true }, string>(
    (partyId) =>
      api(`/api/lists/${toValue(id)}/draw/${partyId}`, { method: 'DELETE' }),
    () => [
      ...listKeys(toValue(id)),
      keys.sharing(toValue(id)),
      keys.home(),
      ['p'],
    ],
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
    // One after the other, in the order of the gestures (ticket 166).
    (body) =>
      inTurn(`member:${toValue(id)}`, () =>
        api(`/api/family/${toValue(id)}`, { method: 'PATCH', body }),
      ),
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

/** The page's own data of a list: what a line ticked changes at once. */
const docKey = (via: ClaimRoute) =>
  'token' in via ? keys.link(via.token) : keys.list(via.listId);

/** The requests of each line, one after the other, in the order of the taps. */
const claimQueues = new Map<string, Promise<unknown>>();
/** The ticks and unticks not answered yet, all lines together. */
const claimsPending = ref(0);

/**
 * Sends a request of a line after those of the same line still running:
 * tapped quickly several times, the server gets them in order and ends
 * on the last one.
 * @param ideaId - The line.
 * @param send - The request.
 * @returns Its answer.
 */
const inTurn = <T>(ideaId: string, send: () => Promise<T>): Promise<T> => {
  const next = (claimQueues.get(ideaId) ?? Promise.resolve())
    .catch(() => undefined)
    .then(send);
  claimQueues.set(ideaId, next);
  const clear = () => {
    if (claimQueues.get(ideaId) === next) claimQueues.delete(ideaId);
  };
  next.then(clear, clear);
  return next;
};

/**
 * A tick or an untick that shows at once (Julien, 23 November 2026): the
 * line changes in the page's data at the tap, before the server answers.
 * The requests of a line leave one after the other, in the order of the
 * taps; once the last one of the page is answered, the list is read
 * again, and the server has the last word (a refusal included).
 * @param via - The list, by its link or as one who holds it.
 * @param request - The request.
 * @param ideaOf - The line of the request.
 * @param change - What becomes of the line, from the variables and
 * whether the list is ticked anonymously here; null to wait.
 * @returns The mutation.
 */
const useOptimisticClaim = <TData, TVariables>(
  via: Via,
  request: (variables: TVariables) => Promise<TData>,
  ideaOf: (variables: TVariables) => string,
  change: (
    variables: TVariables,
    anonymous: boolean,
  ) => ((line: IdeaLine) => IdeaLine) | null,
) => {
  const queryClient = useQueryClient();
  return useMutation<TData, Error, TVariables>({
    mutationFn: (variables) =>
      inTurn(ideaOf(variables), () => request(variables)),
    onMutate: (variables) => {
      claimsPending.value += 1;
      const key = docKey(toValue(via));
      const before = queryClient.getQueryData<{
        mode?: { anonymous: boolean } | null;
        people: { ideas: IdeaLine[] }[];
      }>(key);
      const line = before
        ? change(variables, before.mode?.anonymous ?? false)
        : null;
      if (!before || !line) return;
      // A reading under way would bring the line back as it was.
      void queryClient.cancelQueries(
        { queryKey: key, exact: true },
        { revert: false, silent: true },
      );
      queryClient.setQueryData(key, withLine(before, ideaOf(variables), line));
    },
    onSettled: async () => {
      claimsPending.value -= 1;
      if (claimsPending.value > 0) return;
      await Promise.all(
        claimKeys(toValue(via)).map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
      );
    },
  });
};

/** The ids the server gives to the lines written on this screen. */
const createdIds = new Map<string, Promise<string>>();
/** Those it gave already: the order shown reads them at once. */
const namedIds = reactive(new Map<string, string>());
/**
 * The id of a line on the server: a line just written waits for it.
 * @param id - Its id on this screen.
 * @returns Its id on the server.
 */
const serverIdOf = (id: string) => createdIds.get(id) ?? Promise.resolve(id);
/**
 * The id a line has now: its server's once given, else its own.
 * @param id - Its id on this screen.
 * @returns The id.
 */
export const lineIdNow = (id: string) => namedIds.get(id) ?? id;

/** The page's data of a list, as these changes touch it. */
type EditedDoc = {
  people: { id: string; ideas: IdeaLine[]; lines?: string[] }[];
};

/**
 * A change of a list that shows at once (Julien, 24 November 2026,
 * ticket 166), as a tick does: the page's data changes at the gesture;
 * the requests of a line leave in the order of the gestures (the caller
 * puts them `inTurn`); once every change and tick of the page is
 * answered, the list is read again and the server has the last word. A
 * failure says so at the bottom; the reading puts the list back.
 * @param via - The list, by its link or as one who holds it.
 * @param request - The request.
 * @param change - What becomes of the page's data.
 * @returns The mutation.
 */
const useOptimisticEdit = <TData, TVariables>(
  via: Via,
  request: (variables: TVariables) => Promise<TData>,
  change: (doc: EditedDoc, variables: TVariables) => EditedDoc,
) => {
  const queryClient = useQueryClient();
  const toast = useMessages();
  const errorMessage = useErrorMessage();
  return useMutation<TData, Error, TVariables>({
    mutationFn: request,
    onMutate: (variables) => {
      claimsPending.value += 1;
      const key = docKey(toValue(via));
      const before = queryClient.getQueryData<EditedDoc>(key);
      if (!before) return;
      // A reading under way would bring the list back as it was.
      void queryClient.cancelQueries(
        { queryKey: key, exact: true },
        { revert: false, silent: true },
      );
      // The lines just written under the ids the server gave them, as
      // the screen shows them.
      const named: EditedDoc = {
        ...before,
        people: before.people.map((person) => ({
          ...person,
          ideas: person.ideas.map((idea) => ({
            ...idea,
            id: lineIdNow(idea.id),
          })),
          ...(person.lines ? { lines: person.lines.map(lineIdNow) } : {}),
        })),
      };
      queryClient.setQueryData(key, change(named, variables));
    },
    onError: (error) => toast.failed(errorMessage(error)),
    onSettled: async () => {
      claimsPending.value -= 1;
      if (claimsPending.value > 0) return;
      await Promise.all(
        claimKeys(toValue(via)).map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
      );
    },
  });
};

export const useTickMutation = (via: Via) =>
  useOptimisticClaim<
    { ok: true; joined: boolean },
    {
      ideaId: string;
      mode?: 'alone' | 'group';
      anonymous?: boolean;
      note?: string | null;
    }
  >(
    via,
    // A line just written is ticked once the server has named it.
    async (body) =>
      api(claimsUrl(toValue(via)), {
        method: 'POST',
        body: { ...body, ideaId: await serverIdOf(body.ideaId) },
      }),
    (body) => body.ideaId,
    // Alone only: a group waits for the server.
    (body, anonymous) =>
      body.mode === 'group'
        ? null
        : (line) => tickedLine(line, body.anonymous ?? anonymous),
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
  useOptimisticClaim<{ ok: true }, string>(
    via,
    async (ideaId) =>
      api(`${claimsUrl(toValue(via))}/${await serverIdOf(ideaId)}`, {
        method: 'DELETE',
      }),
    (ideaId) => ideaId,
    () => untickedLine,
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
