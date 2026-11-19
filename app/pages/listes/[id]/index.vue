<script setup lang="ts">
import type { IdeaLine, PersonLine } from '#server/http/lists';
import { formatEventDate } from '#server/utils/rules';
import {
  LIST_COLORS,
  LIST_ICON_GROUP_KEYS,
  LIST_ICON_GROUPS,
  LIST_TITLE_MAX,
  isWorthKeeping,
} from '#server/utils/lists';
import {
  useDeleteListMutation,
  useListQuery,
  useRemovePersonMutation,
  useReorderMutation,
  useUntickForMutation,
  useUpdateListMutation,
} from '~/composables/queries/useLists';
import { LIST_EDITING } from '~/composables/useListEditing';
import { LIST_SHADES } from '~/utils/listShades';
import {
  applyOrder,
  moveIdea,
  movePerson,
  placeOfIdea,
  sameOrder,
  stepIdea,
  stepPerson,
  type ListOrder,
} from '#shared/utils/reorder';
import type { DropPlace, Lifted } from '~/composables/useListDrag';

// The document of a list, for the one who holds it (README 22.19,
// maquettes ListeNouvelle, ListeTeneur, ListeIdee, ListeIcone). A
// document, not a form: the bar « Partage par lien » on top, with its
// switch (ListsShareBar); then its square tile, its name, its day, the word for the
// family, the people and their ideas, « Ajouter quelqu'un ». Every text
// changes by touching it, and is saved as it is left: no « Enregistrer ».
// Left without a name and without anyone, a draft is not kept.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const id = computed(() => String(route.params.id));
const { t, tk, locale } = useT();
const query = useListQuery(id);
const update = useUpdateListMutation(id);
const remove = useDeleteListMutation();
const doc = computed(() => query.data.value);
const list = computed(() => doc.value?.list);
useHead({
  title: () =>
    `${list.value?.title || t('lists.doc.titlePlaceholder')} — ${t('common.appName')}`,
});

// The name, written in place.
const title = ref('');
watch(
  () => list.value?.title,
  (value) => {
    title.value = value ?? '';
  },
  { immediate: true },
);
const titleField = ref<{ textareaRef?: HTMLTextAreaElement } | null>(null);
const saveTitle = () => {
  const value = title.value.replace(/\s+/g, ' ').trim();
  if (value !== (list.value?.title ?? '')) update.mutate({ title: value });
};
onMounted(async () => {
  await query.suspense();
  if (route.query.nouvelle && !list.value?.title) {
    titleField.value?.textareaRef?.focus();
  }
});

// The day.
const dateOpen = ref(false);
const dateLine = computed(() =>
  list.value?.eventDate
    ? t('lists.home.on', {
        date: formatEventDate(list.value.eventDate, locale.value),
      })
    : '',
);
const onDate = (date: string) => {
  dateOpen.value = false;
  update.mutate({ eventDate: date || null });
};

// The icon, on its square tile.
const iconOpen = ref(false);
const families = computed(() =>
  LIST_ICON_GROUP_KEYS.map((key) => ({
    key,
    label: tk(`lists.icon.groups.${key}`),
    emojis: LIST_ICON_GROUPS[key],
  })),
);
const colors = computed(() =>
  LIST_COLORS.map((key) => ({
    key,
    label: tk(`lists.icon.colors.${key}`),
    ...LIST_SHADES[key],
  })),
);
const onIcon = (icon: { emoji: string; color: string }) => {
  iconOpen.value = false;
  update.mutate({ icon });
};

// What a line of the document asks the page: a confirmation before
// deleting an idea someone ticked, and the sheets of what the holder gives.
const confirm = ref<((ok: boolean) => void) | null>(null);
provide(LIST_EDITING, {
  confirmRemove: () =>
    new Promise<boolean>((resolve) => {
      confirm.value = resolve;
    }),
  change: (idea, forName) => {
    changing.value = { idea, forName };
  },
  join: (idea, forName) => {
    joining.value = { idea, forName };
  },
  removePerson: (person) => onRemovePerson(person),
  untickFor: (idea, claim) => onUntickFor(idea, claim),
});

// « Retirer de cette liste » (README 22.19): the person goes at once,
// with « Annuler » in the toast.
const toast = useToast();
const errorMessage = useErrorMessage();
const removePerson = useRemovePersonMutation(id);
const removal = useDelayedRemoval((personId, done) =>
  removePerson.mutate(personId, { onSettled: done }),
);
// The order of the list (lot 24 ter, README 22.20): ideas and people
// move by dragging, a long press on a phone, a handle with a mouse, or
// from the keyboard and the menu. The screen shows the new order at
// once; the list is read again once it is saved.
const reorder = useReorderMutation(id);
const wanted = ref<ListOrder | null>(null);
// « Décocher » for someone (Correction 25, README 22.19, maquettes
// ListeDecocher, ListeDecocheFait): the tick goes from the screen at
// once, and from the server only once « Annuler » is gone, so that giving
// up puts it back exactly as it was (same person, same way, same date),
// an anonymous one included.
const untickFor = useUntickForMutation(id);
const unticking = useDelayedRemoval((key, done) => {
  const [ideaId = '', claimId = ''] = key.split(':');
  untickFor.mutate(
    { ideaId, claimId },
    {
      onError: (error) =>
        toast.add({ title: errorMessage(error), color: 'error' }),
      onSettled: done,
    },
  );
});
const onUntickFor = (idea: IdeaLine, claim: IdeaLine['claims'][number]) =>
  unticking.start(
    `${idea.id}:${claim.id}`,
    claim.by === null
      ? t('lists.doc.untickedAnonymous')
      : t('lists.doc.unticked', { name: claim.by }),
  );
/** The line as it will be once the tick that is leaving is gone. */
const withoutLeaving = (idea: IdeaLine): IdeaLine => {
  const [ideaId, claimId] = (unticking.leaving.value ?? '').split(':');
  const leaving =
    ideaId === idea.id ? idea.claims.find((c) => c.id === claimId) : null;
  return leaving
    ? {
        ...idea,
        view: leaving.after,
        claims: idea.claims.filter((c) => c.id !== claimId),
      }
    : idea;
};
const people = computed(() => {
  const there = (doc.value?.people ?? [])
    .filter((p) => p.id !== removal.leaving.value)
    .map((person) =>
      unticking.leaving.value
        ? { ...person, ideas: person.ideas.map(withoutLeaving) }
        : person,
    );
  return wanted.value
    ? applyOrder(there, wanted.value, (idea) => idea.id)
    : there;
});
const orderNow = (): ListOrder =>
  people.value.map((person) => ({
    id: person.id,
    ideas: person.ideas.map((idea) => idea.id),
  }));
// The order shown stays until the list read again says the same: letting
// go of it sooner would put the lines back for an instant, and take the
// line being written from under the keyboard.
watch(doc, (fresh) => {
  if (!wanted.value || !fresh) return;
  const stored = fresh.people.map((person) => ({
    id: person.id,
    ideas: person.ideas.map((idea) => idea.id),
  }));
  if (sameOrder(stored, wanted.value)) wanted.value = null;
});
/** What was just moved, said to screen readers. */
const announced = ref('');
const nameOf = (what: Lifted) =>
  what.kind === 'person'
    ? (people.value.find((p) => p.id === what.id)?.member.firstName ?? '')
    : (people.value.flatMap((p) => p.ideas).find((i) => i.id === what.id)
        ?.text ?? '');
/**
 * Shows an order and saves it; « Annuler » puts the one before back.
 * @param next - The order wanted.
 * @param what - What moved, to say so; nothing when undoing.
 */
const saveOrder = (next: ListOrder, what: Lifted | null) => {
  const before = orderNow();
  if (sameOrder(before, next)) return;
  const name = what ? nameOf(what) : '';
  wanted.value = next;
  reorder.mutate(next, {
    onError: (error) => {
      wanted.value = null;
      toast.add({
        title:
          (error as { statusMessage?: string }).statusMessage === 'list_changed'
            ? t('lists.doc.drag.changed')
            : errorMessage(error),
        color: 'error',
      });
    },
  });
  if (!what) return;
  const place =
    what.kind === 'idea'
      ? placeOfIdea(next, what.id)
      : {
          index: next.findIndex((section) => section.id === what.id),
          count: next.length,
        };
  announced.value = t('lists.doc.drag.placed', {
    name,
    position: (place?.index ?? 0) + 1,
    count: place?.count ?? 0,
  });
  toast.add({
    id: 'moved',
    title: t('lists.doc.drag.moved', { name }),
    duration: 5000,
    ...undoBar(t('common.actions.cancel'), () => {
      toast.remove('moved');
      saveOrder(before, null);
    }),
  });
};
const board = ref<HTMLElement | null>(null);
const onDrop = (what: Lifted, place: DropPlace) =>
  saveOrder(
    what.kind === 'idea' && place.kind === 'idea'
      ? moveIdea(orderNow(), what.id, place)
      : what.kind === 'person' && place.kind === 'person'
        ? movePerson(orderNow(), what.id, place.index)
        : orderNow(),
    what,
  );
const onStep = async (what: Lifted, step: -1 | 1) => {
  saveOrder(
    what.kind === 'idea'
      ? stepIdea(orderNow(), what.id, step)
      : stepPerson(orderNow(), what.id, step),
    what,
  );
  if (what.kind !== 'idea') return;
  // The line moved under the keyboard, which took the caret from it:
  // once the move shows and the line has let go, writing goes on in it.
  await nextTick();
  window.setTimeout(() => {
    const start = board.value?.querySelector<HTMLElement>(
      `[data-drag="idea"][data-drag-id="${what.id}"] [data-line-start]`,
    );
    if (start instanceof HTMLTextAreaElement) start.focus();
    else start?.click();
  }, 60);
};
const dragging = useListDrag(board, { drop: onDrop, step: onStep });
/** The card under the finger: what it says, and where the list is. */
const ghost = computed(() => {
  const what = dragging.lifted.value;
  const box = board.value?.getBoundingClientRect();
  if (!what || !box) return null;
  const person =
    what.kind === 'person'
      ? people.value.find((p) => p.id === what.id)
      : undefined;
  return {
    left: box.left,
    width: box.width,
    label: nameOf(what),
    avatar: person?.member.avatar,
    detail: person
      ? t('lists.doc.drag.ideas', { count: person.ideas.length })
      : undefined,
  };
});
/** The people, with the red line where the person lifted would fall. */
const sections = computed(() => {
  const place = dragging.drop.value;
  const lifted = dragging.lifted.value;
  const at = place?.kind === 'person' ? place.index : -1;
  const laid = people.value.reduce<{
    rows: ({ person: PersonLine; index: number } | null)[];
    others: number;
  }>(
    (acc, person, index) => {
      const isLifted = lifted?.kind === 'person' && lifted.id === person.id;
      return {
        rows: [
          ...acc.rows,
          ...(!isLifted && acc.others === at ? [null] : []),
          { person, index },
        ],
        others: acc.others + (isLifted ? 0 : 1),
      };
    },
    { rows: [], others: 0 },
  );
  return at === laid.others ? [...laid.rows, null] : laid.rows;
});
const onRemovePerson = (person: PersonLine) =>
  removal.start(
    person.id,
    t('lists.doc.removed', { name: person.member.firstName }),
  );
// The sheets of what the holder gives: « Changer » and « Se joindre », the
// same as by the link (README 22.19). They follow the list as it is
// refetched.
const via = computed(() => ({ listId: id.value }));
const changing = ref<{ idea: IdeaLine; forName: string } | null>(null);
const joining = ref<{ idea: IdeaLine; forName: string } | null>(null);
const changeOpen = computed({
  get: () => changing.value !== null,
  set: (open) => {
    if (!open) changing.value = null;
  },
});
const joinOpen = computed({
  get: () => joining.value !== null,
  set: (open) => {
    if (!open) joining.value = null;
  },
});
watch(
  () => query.data.value,
  (current) => {
    const fresh = (ideaId: string) =>
      current?.people.flatMap((p) => p.ideas).find((i) => i.id === ideaId);
    if (changing.value) {
      const idea = fresh(changing.value.idea.id);
      changing.value = idea?.mine ? { ...changing.value, idea } : null;
    }
    if (joining.value) {
      const idea = fresh(joining.value.idea.id);
      if (idea) joining.value = { ...joining.value, idea };
    }
  },
);
const confirmOpen = computed({
  get: () => confirm.value !== null,
  set: (open) => {
    if (!open) answerConfirm(false);
  },
});
const answerConfirm = (ok: boolean) => {
  confirm.value?.(ok);
  confirm.value = null;
};

// A draft left with nothing in it goes, once the list itself is left.
onBeforeRouteLeave((to) => {
  const current = doc.value;
  // Its own pages (its message, a person's tastes) are still the list.
  const within =
    to.path.startsWith(`/listes/${id.value}/`) ||
    to.path.startsWith('/famille/');
  if (
    current &&
    // Deleting a list is for those who manage it.
    current.manages &&
    !within &&
    current.list.status === 'draft' &&
    !isWorthKeeping({
      title: title.value,
      peopleCount: current.people.length,
    })
  ) {
    remove.mutate(current.list.id);
  }
});
</script>

<template>
  <AdminScreen back="/listes">
    <AdminQueryState
      :pending="query.isPending.value"
      :error="query.error.value"
      :skeleton="['card', 'title', 'card']"
    >
      <template v-if="doc && list">
        <ListsShareBar :doc="doc" :readonly="!doc.manages" />
        <ListsHoldersLine
          v-if="doc.manages || doc.holders.length > 1"
          :list-id="list.id"
          :holders="doc.holders"
        />

        <div class="flex flex-col gap-2">
          <button
            type="button"
            class="relative self-start"
            :aria-label="t('lists.doc.changeIcon')"
            data-testid="list-icon"
            @click="iconOpen = true"
          >
            <ListsTile :icon="list.icon" size="lg" />
            <span
              class="absolute -right-2 -bottom-2 flex size-7 items-center justify-center rounded-full bg-default ring-1 ring-default"
              aria-hidden="true"
            >
              <UIcon name="i-lucide-pencil" class="size-3.5" />
            </span>
          </button>
          <UTextarea
            ref="titleField"
            v-model="title"
            autoresize
            :rows="1"
            :maxlength="LIST_TITLE_MAX"
            variant="none"
            :placeholder="t('lists.doc.titlePlaceholder')"
            :aria-label="t('lists.doc.titleLabel')"
            class="w-full"
            :ui="{
              base: 'overflow-hidden p-0 font-display text-[36px] md:text-[36px] leading-[1.1] font-bold placeholder:text-dimmed',
            }"
            data-testid="list-title"
            @keydown.enter.prevent="($event.target as HTMLElement).blur()"
            @blur="saveTitle"
          />
          <button
            type="button"
            class="self-start text-[15px]"
            :class="
              list.eventDate ? 'text-toned' : 'font-semibold text-primary-ink'
            "
            data-testid="list-date"
            @click="dateOpen = true"
          >
            {{ dateLine || t('lists.doc.addDate') }}
          </button>
        </div>

        <ListsNote :list-id="list.id" :note="list.note" />

        <div
          v-if="people.length > 0"
          class="flex flex-col gap-0.5 text-sm text-toned"
        >
          <p v-if="doc.planned > 0">
            {{ t('lists.doc.plannedHolder', { count: doc.planned }) }}
          </p>
          <p>{{ t('lists.doc.touchToEdit') }}</p>
        </div>

        <!-- The board: what moves by dragging. A long press must lift a
             line, not select its text nor open the browser's menu. -->
        <div
          ref="board"
          class="flex flex-col gap-6 select-none [-webkit-touch-callout:none]"
          data-testid="drag-board"
        >
          <template v-for="row in sections" :key="row ? row.person.id : 'drop'">
            <div
              v-if="!row"
              class="-my-2.5 h-1 rounded-full bg-primary"
              aria-hidden="true"
              data-testid="drop-line"
            />
            <ListsPersonSection
              v-else
              :list-id="list.id"
              :person="row.person"
              :first="row.index === 0"
              :last="row.index === people.length - 1"
            />
          </template>
        </div>
        <p class="sr-only" aria-live="polite">{{ announced }}</p>

        <ListsAddSomeone
          :list-id="list.id"
          :family="doc.family"
          :on-list="people"
        />
      </template>
    </AdminQueryState>

    <ListsDragGhost v-if="ghost" :y="dragging.pointer.value.y" v-bind="ghost" />
    <AdminDateSheet
      v-if="list"
      v-model:open="dateOpen"
      :title="t('lists.doc.date')"
      :description="t('lists.doc.dateHelp')"
      :label="t('lists.doc.date')"
      :value="list.eventDate ?? ''"
      :clear-label="t('lists.doc.noDate')"
      @validate="onDate"
    />
    <UiIconSheet
      v-if="list"
      v-model:open="iconOpen"
      :initial="list.icon"
      :title="t('lists.doc.iconTitle')"
      :families="families"
      :colors="colors"
      shape="square"
      @validate="onIcon"
    />
    <UiSheet
      v-model:open="confirmOpen"
      :title="t('lists.doc.confirmRemove.title')"
      :description="t('lists.doc.confirmRemove.body')"
    >
      <template #footer>
        <div class="grid grid-cols-2 gap-2.5">
          <UButton
            variant="outline"
            color="neutral"
            class="h-12 justify-center font-semibold"
            :label="t('lists.doc.confirmRemove.keep')"
            @click="answerConfirm(false)"
          />
          <UButton
            color="error"
            class="h-12 justify-center font-bold"
            :label="t('lists.doc.confirmRemove.remove')"
            @click="answerConfirm(true)"
          />
        </div>
      </template>
    </UiSheet>
    <ListsClaimSheet
      v-if="changing"
      v-model:open="changeOpen"
      :via="via"
      :idea="changing.idea"
      :for-name="changing.forName"
    />
    <ListsJoinSheet
      v-if="joining"
      v-model:open="joinOpen"
      :via="via"
      :idea="joining.idea"
      :for-name="joining.forName"
    />
  </AdminScreen>
</template>
