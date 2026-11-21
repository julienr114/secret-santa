<script setup lang="ts">
import { namesInOne } from '~/utils/givers';
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
  useCreateListMutation,
  useUntickForMutation,
  useUpdateListMutation,
} from '~/composables/queries/useLists';
import { keys } from '~/composables/queries/keys';
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
// document, not a form: the bar of its sharing on top, its stage and its
// link (ListsShareBar, ticket 106); then its square tile, its name, its
// day, the word for the family, the people and their ideas, « Ajouter
// quelqu'un ». Every text
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
  untickFor: (idea) => onUntickFor(idea),
});

// « Retirer de cette liste » (README 22.19): the person goes at once,
// with « Annuler » in the toast.
const toast = useMessages();
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
// Live (lot 26, README 22.20): what the others do arrives by itself, and
// those who hold the list see who else is there, and who writes what.
const live = useListLive(
  () => `/api/lists/${id.value}/live`,
  () => [keys.list(id.value)],
  () => doc.value?.holders.find((holder) => holder.me)?.accountId ?? null,
);
/** The others who hold the list and have it open now. */
const here = computed(() => {
  const mine = doc.value?.holders.find((holder) => holder.me)?.accountId;
  return (live.presence.value?.holders ?? []).filter(
    (holder) => holder.accountId !== mine,
  );
});
const hereNames = computed(() => {
  const names = here.value.map((holder) => holder.name);
  return names.length > 1
    ? `${names.slice(0, -1).join(', ')} ${t('lists.share.and')} ${names.at(-1)}`
    : (names[0] ?? '');
});
const visitors = computed(() => live.presence.value?.visitors ?? 0);
// The name of the list, while someone else who holds it writes it.
const titleActive = ref(false);
const { lockedBy: titleLock } = useLiveWriting(
  live,
  () => 'title',
  title,
  titleActive,
  () =>
    (titleField.value as { textareaRef?: HTMLTextAreaElement } | null)
      ?.textareaRef,
);

// « Reprendre cette liste » (lot 27): a new draft, started from this
// one, which does not change.
const again = useCreateListMutation();
const onAgain = () => {
  const current = doc.value;
  if (!current) return;
  again.mutate(
    { icon: current.list.icon, from: current.list.id },
    {
      onSuccess: ({ id: created }) =>
        navigateTo(`/listes/${created}?nouvelle=1`),
      onError: (error) => toast.failed(errorMessage(error)),
    },
  );
};
// « Décocher » for someone (Correction 25, README 22.19, maquettes
// ListeDecocher, ListeDecocheFait): the tick goes from the screen at
// once, and from the server only once « Annuler » is gone, so that giving
// up puts it back exactly as it was (same person, same way, same date),
// an anonymous one included.
const untickFor = useUntickForMutation(id);
/** The ticks of an idea that may be taken off, as the list has them now. */
const claimsOf = (ideaId: string) =>
  doc.value?.people.flatMap((p) => p.ideas).find((i) => i.id === ideaId)
    ?.claims ?? [];
// The whole tick goes (Correction 30): each of a group in turn, once
// « Annuler » is gone.
const unticking = useDelayedRemoval((ideaId, done) => {
  claimsOf(ideaId)
    .reduce<Promise<unknown>>(
      (before, claim) =>
        before.then(() => untickFor.mutateAsync({ ideaId, claimId: claim.id })),
      Promise.resolve(),
    )
    .catch((error: unknown) => toast.failed(errorMessage(error)))
    .finally(done);
});
const onUntickFor = (idea: IdeaLine) => {
  const names = idea.claims.flatMap((claim) => (claim.by ? [claim.by] : []));
  unticking.start(
    idea.id,
    names.length === 0
      ? t('lists.doc.untickedAnonymous')
      : t('lists.doc.unticked', {
          name: namesInOne(names, t('lists.share.and')),
        }),
  );
};
/** The line as it will be once the tick that is leaving is gone. */
const withoutLeaving = (idea: IdeaLine): IdeaLine =>
  unticking.leaving.value === idea.id
    ? { ...idea, view: { kind: 'free' }, claims: [] }
    : idea;
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
      toast.failed(
        (error as { statusMessage?: string }).statusMessage === 'list_changed'
          ? t('lists.doc.drag.changed')
          : errorMessage(error),
      );
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
  toast.undo(
    t('lists.doc.drag.moved', { name }),
    () => {
      toast.remove('moved');
      saveOrder(before, null);
    },
    { id: 'moved', duration: 5000 },
  );
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
        <ListsShareBar
          :doc="doc"
          :readonly="!doc.manages"
          :manager-name="
            doc.holders.find((holder) => holder.level === 'manage')?.name
          "
        />
        <ListsHoldersLine
          v-if="doc.manages || doc.holders.length > 1"
          :list-id="list.id"
          :holders="doc.holders"
        />
        <!-- Who is there now (lot 26): those who hold the list by their
             first name, the visitors by their number only. -->
        <p
          v-if="here.length > 0 || visitors > 0"
          class="-mt-2 flex flex-wrap items-center gap-x-2 text-sm text-toned"
          data-testid="live-presence"
        >
          <template v-if="here.length > 0">
            <span
              class="size-2 shrink-0 rounded-full bg-success"
              aria-hidden="true"
            />
            <span data-testid="live-here">{{
              t('lists.live.here', { count: here.length, names: hereNames })
            }}</span>
          </template>
          <span v-if="visitors > 0" data-testid="live-visitors">{{
            t('lists.live.visitors', { count: visitors })
          }}</span>
        </p>

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
          <ListsLiveLock
            v-if="titleLock"
            :by="titleLock"
            :fallback="t('lists.doc.titlePlaceholder')"
            class="font-display text-[36px] leading-[1.1] font-bold"
          />
          <UTextarea
            v-else
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
            @focus="titleActive = true"
            @blur="
              titleActive = false;
              saveTitle();
            "
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

        <!-- A list taken up from an old one (lot 27, maquette
             ListeReprise): where it comes from, and what the mark says. -->
        <p
          v-if="doc.resumedFrom"
          class="text-sm leading-[1.45] text-toned"
          data-testid="resumed-from"
        >
          {{
            doc.resumedFrom.title
              ? t('lists.resume.from', { title: doc.resumedFrom.title })
              : t('lists.resume.fromUntitled')
          }}
          {{ t('lists.resume.marksBefore') }}
          <UIcon
            name="i-lucide-rotate-ccw"
            class="inline-block size-3.5 align-[-2px]"
            aria-hidden="true"
          />
          {{ t('lists.resume.marksAfter') }}
        </p>
        <!-- A past list is taken up again from here. -->
        <UButton
          v-if="list.status === 'past'"
          variant="outline"
          color="neutral"
          icon="i-lucide-rotate-ccw"
          class="h-12 justify-center self-start px-5 text-base font-bold"
          :loading="again.isPending.value"
          :label="t('lists.resume.again')"
          data-testid="resume-again"
          @click="onAgain"
        />

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
          class="flex flex-col gap-16 select-none [-webkit-touch-callout:none]"
          data-testid="drag-board"
        >
          <template v-for="row in sections" :key="row ? row.person.id : 'drop'">
            <div
              v-if="!row"
              class="-my-[30px] h-1 rounded-full bg-primary"
              aria-hidden="true"
              data-testid="drop-line"
            />
            <ListsPersonSection
              v-else
              :list-id="list.id"
              :person="row.person"
              :first="row.index === 0"
              :last="row.index === people.length - 1"
              :single="doc.single"
            />
          </template>
        </div>
        <p class="sr-only" aria-live="polite">{{ announced }}</p>

        <!-- An empty draft may start from another list. -->
        <ListsResumeFrom
          v-if="people.length === 0 && list.status === 'draft'"
          :list-id="list.id"
        />
        <!-- A list without people keeps the block until it is shared:
             its shape no longer changes then (lot 27 bis). -->
        <ListsAddSomeone
          v-if="!(doc.single && list.status !== 'draft')"
          :list-id="list.id"
          :family="doc.family"
          :on-list="people"
          :single="doc.single"
        />
        <!-- The red line of what cannot be taken back, for those who
             manage the list; it leads to the page that says what is lost. -->
        <UiList v-if="doc.manages">
          <UiListItem
            icon="i-lucide-trash-2"
            tone="danger"
            :title="t('lists.delete.row')"
            :to="`/listes/${list.id}/supprimer`"
            data-testid="list-remove"
          />
        </UiList>
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
