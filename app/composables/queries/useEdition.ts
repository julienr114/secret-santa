import { toValue, type MaybeRefOrGetter } from 'vue';
import type { MessageType } from '#server/utils/messages';
import { keys } from './keys';
import { api, useApiMutation, useApiQuery } from './useApi';

// Edition cockpit: lifecycle actions and per-participant actions (step 4).

type Ref = MaybeRefOrGetter<string>;
export type DrawCheck = {
  participantCount: number;
  problem: { reason: string; blocked: string[]; constrained: string[] } | null;
  ready: boolean;
};
export type Via = 'share' | 'copy';
export type ShareableMessage = { text: string; link: string };

const base = (slug: Ref) => `/api/admin/${toValue(slug)}`;
const groupKeys = (slug: Ref) => [keys.group(toValue(slug))];
const participation = (slug: Ref, pid: string): string =>
  `${base(slug)}/participations/${pid}`;

export const useCheckQuery = (slug: Ref, id: Ref) =>
  useApiQuery<DrawCheck>(
    () => keys.check(toValue(slug), toValue(id)),
    () => `${base(slug)}/editions/${toValue(id)}/check`,
  );

/** Texts ready to share, per participation, for the chosen message type. */
export const useMessagesQuery = (
  slug: Ref,
  id: Ref,
  type: MaybeRefOrGetter<MessageType>,
) =>
  useApiQuery<{ messages: Record<string, ShareableMessage> }>(
    () => [
      ...keys.edition(toValue(slug), toValue(id)),
      'messages',
      toValue(type),
    ],
    () =>
      `${base(slug)}/editions/${toValue(id)}/messages?type=${toValue(type)}`,
  );

const editionAction = <TBody = void>(slug: Ref, id: Ref, action: string) =>
  useApiMutation<unknown, TBody>(
    (body) =>
      api(`${base(slug)}/editions/${toValue(id)}/${action}`, {
        method: 'POST',
        ...(body ? { body } : {}),
      }),
    () => groupKeys(slug),
  );

export const useOpenMutation = (slug: Ref, id: Ref) =>
  editionAction(slug, id, 'open');
export const useDrawMutation = (slug: Ref, id: Ref) =>
  editionAction(slug, id, 'draw');
export const useCloseMutation = (slug: Ref, id: Ref) =>
  editionAction(slug, id, 'close');
export const useCancelDrawMutation = (slug: Ref, id: Ref) =>
  editionAction<{ reason: string }>(slug, id, 'redraw');

export const useAddParticipantMutation = (slug: Ref, id: Ref) =>
  useApiMutation<{ participationId: string }, string>(
    (personId) =>
      api(`${base(slug)}/editions/${toValue(id)}/participants`, {
        method: 'POST',
        body: { personId },
      }),
    () => groupKeys(slug),
  );

export const useRemoveParticipantMutation = (slug: Ref, id: Ref) =>
  useApiMutation<{ ok: true }, string>(
    (participationId) =>
      api(
        `${base(slug)}/editions/${toValue(id)}/participants/${participationId}`,
        {
          method: 'DELETE',
        },
      ),
    () => groupKeys(slug),
  );

export const useMarkSentMutation = (slug: Ref) =>
  useApiMutation<
    { ok: true },
    { participationId: string; type: MessageType; via: Via }
  >(
    ({ participationId, ...body }) =>
      api(`${participation(slug, participationId)}/message`, {
        method: 'POST',
        body,
      }),
    () => groupKeys(slug),
  );

export const useUnsendMutation = (slug: Ref) =>
  useApiMutation<{ ok: true }, string>(
    (pid) => api(`${participation(slug, pid)}/message`, { method: 'DELETE' }),
    () => groupKeys(slug),
  );

/** Journals a copied link (the link itself comes from the messages query). */
export const useLinkCopiedMutation = (slug: Ref) =>
  useApiMutation<{ link: string }, string>(
    (pid) => api(`${participation(slug, pid)}/link`),
    () => groupKeys(slug),
  );

export const useRegenerateMutation = (slug: Ref) =>
  useApiMutation<{ link: string }, string>(
    (pid) => api(`${participation(slug, pid)}/regenerate`, { method: 'POST' }),
    () => groupKeys(slug),
  );
