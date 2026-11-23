import { useQueryClient } from '@tanstack/vue-query';
import type { MaybeRefOrGetter, Ref } from 'vue';
import { keys } from '~/composables/queries/keys';
import { api } from '~/composables/queries/useApi';
import {
  tourSeen,
  tourSteps,
  type TourKind,
  type TourStep,
} from '#shared/utils/listTour';

// The visit of a new list (docs/spec/v3/listes.md, « La visite d'une
// liste neuve », ticket 149), on the mechanism of the note of the first
// tick (useTickGuide, ListsVeilNote): the veil, one thing in the light,
// a note pointed at it. Here a series of steps, one at a time; each thing
// lights itself with `useTourStop`. Seen or skipped, the account keeps
// it, on every device. After the visit from « Créer », a note on the
// first line once the first person is added (V3ListeVisiteIdee).

/** Raised over the veil, as the line of the first tick. */
export const TOUR_RAISED = 'relative z-50 rounded-2xl bg-page';

type TourState = {
  kind: TourKind | null;
  steps: TourStep[];
  at: number;
  listId: string | null;
  /** The list whose first line waits for its note, once someone is on it. */
  firstLineOf: string | null;
};

/**
 * The visit under way, and how to move in it.
 * @returns Its state and its gestures.
 */
export const useListTour = () => {
  const state = useState<TourState>('list-tour', () => ({
    kind: null,
    steps: [],
    at: 0,
    listId: null,
    firstLineOf: null,
  }));
  const queryClient = useQueryClient();
  const remember = (seen: 'visit' | 'firstLine' | 'both', listId: string) =>
    api('/api/auth/tours', { method: 'POST', body: { seen } })
      .then(() =>
        queryClient.invalidateQueries({ queryKey: keys.list(listId) }),
      )
      .catch(() => undefined);
  const end = (how: 'done' | 'skipped') => {
    const { kind, listId } = state.value;
    if (!kind || !listId) return;
    const seen = tourSeen(kind, how);
    state.value = {
      kind: null,
      steps: [],
      at: 0,
      listId: null,
      firstLineOf: seen === 'visit' ? listId : null,
    };
    void remember(seen, listId);
  };
  return {
    /** The step in the light, or null. */
    current: computed(() =>
      state.value.kind ? (state.value.steps[state.value.at] ?? null) : null,
    ),
    kind: computed(() => state.value.kind),
    /** « 2 sur 6 ». */
    position: computed(() => ({
      at: state.value.at + 1,
      count: state.value.steps.length,
    })),
    firstLineOf: computed(() => state.value.firstLineOf),
    /**
     * Opens a visit on a list just made.
     * @param kind - The visit.
     * @param listId - The list.
     * @param resume - Whether « Repartir d'une liste » is there.
     */
    start: (kind: TourKind, listId: string, resume: boolean) => {
      state.value = {
        kind,
        steps: tourSteps(kind, resume),
        at: 0,
        listId,
        firstLineOf: null,
      };
    },
    /** « Suivant », or « Compris » at the last step. */
    next: () => {
      if (state.value.at + 1 < state.value.steps.length) {
        state.value = { ...state.value, at: state.value.at + 1 };
      } else end('done');
    },
    /** « Passer », or Échap: the visit stops. */
    skip: () => end('skipped'),
    /** « Compris » on the note of the first line. */
    firstLineSeen: () => {
      const listId = state.value.firstLineOf;
      state.value = { ...state.value, firstLineOf: null };
      if (listId) void remember('firstLine', listId);
    },
    /** Leaving the list: a visit not ended will not come back here. */
    leave: () => {
      if (state.value.kind) end('skipped');
      state.value = { ...state.value, firstLineOf: null };
    },
  };
};

/**
 * One thing of the list at a step of the visit: in the light, brought on
 * the screen, its note under it, or above when it is low on the screen.
 * @param step - The step it is, or null when it is none.
 * @param target - The element.
 * @returns Whether it is in the light, and where its note goes.
 */
export const useTourStop = (
  step: MaybeRefOrGetter<TourStep | null>,
  target: Ref<HTMLElement | null>,
) => {
  const tour = useListTour();
  const active = computed(() => {
    const own = toValue(step);
    return own !== null && tour.current.value === own;
  });
  const placement = ref<'below' | 'above'>('below');
  watch(
    active,
    async (on) => {
      if (!on || !import.meta.client) return;
      await nextTick();
      const el = target.value;
      if (!el) return;
      const reduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;
      el.scrollIntoView({
        block: 'center',
        behavior: reduced ? 'instant' : 'smooth',
      });
      const place = () => {
        const box = el.getBoundingClientRect();
        placement.value =
          box.bottom > window.innerHeight * 0.62 ? 'above' : 'below';
      };
      place();
      if (!reduced) window.setTimeout(place, 450);
    },
    { immediate: true },
  );
  return { active, placement };
};
