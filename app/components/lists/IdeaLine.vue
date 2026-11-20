<script setup lang="ts">
import { useQueryClient } from '@tanstack/vue-query';
import type { IdeaLine } from '#server/http/lists';
import { keys } from '~/composables/queries/keys';
import {
  useCreateIdeaMutation,
  useDeleteIdeaMutation,
  useTickMutation,
  useUntickMutation,
  useUpdateIdeaMutation,
  type ClaimRoute,
} from '~/composables/queries/useLists';
import { AVATAR_SHADES } from '~/utils/avatars';
import { ideaChips, namesInOne } from '~/utils/givers';
import { asAddress, linkHost, shownAddress } from '~/utils/ideaLink';
import { splitIdea } from '#server/utils/lists';

// One line of a person's ideas, written where it shows (README 22.19 and
// 22.20, maquettes ListeIdee, ListeIdeeLien, ListeIdeeLienFait): its box,
// its text and « lien », and, for the holder, who gives it. The holder
// ticks too, their « Moi » included: the box gives the idea alone,
// touched again it unticks. What they give says so under it, as by the
// link: « Tu l'offres · seul · Changer »; a gift given by several is
// joined from here too.
// Touched, the text turns into a field; the return key saves it and goes
// to the next line, touching elsewhere saves it too; a line left empty
// goes, and so does a line with nothing in it when the erase key is
// pressed again, the caret going up to the line above. Nothing sits above
// the keyboard: while one is in the line, its
// actions are under it, as text links. « Ajouter un lien » extends the
// line with « : » and a field for the address; once set, the address is
// the word « lien », with « Changer le lien » and « Retirer le lien »
// under it. No « Supprimer »: a line emptied goes. Without an idea, the empty line at the end,
// « Une autre idée… », where a new one is written. Where the list is
// held, a line moves: lifted by a long press, pulled by its handle with a
// mouse, or `Alt` + an arrow while it is written (lot 24 ter).
const props = defineProps<{
  /** Where the list is written: its document, or its link. */
  via: ClaimRoute;
  listPersonId: string;
  /** Who receives the ideas of this line. */
  forName: string;
  /** The idea, or null for the empty line at the end. */
  idea: IdeaLine | null;
  /** The idea the new line comes after. */
  after?: string | null;
  placeholder?: string;
  /** Where the line is, for « retour » to find the next one. */
  line: string;
}>();
const { t } = useT();
const editing = useListEditing();
// Moved by dragging, where the list is held (lot 24 ter); not by its link.
const drag = useListDragging();
const liftedHere = computed(
  () =>
    Boolean(props.idea) &&
    drag?.lifted.value?.kind === 'idea' &&
    drag.lifted.value.id === props.idea?.id,
);
const via = computed(() => props.via);
const create = useCreateIdeaMutation(via);
const update = useUpdateIdeaMutation(via);
const remove = useDeleteIdeaMutation(via);
const tick = useTickMutation(via);
const untick = useUntickMutation(via);
const toast = useMessages();
const errorMessage = useErrorMessage();
const queryClient = useQueryClient();
const afterRelease = usePointerHeld();

const row = ref<HTMLElement | null>(null);
const field = ref<HTMLTextAreaElement | null>(null);
/** The copy of the text under its field, which gives the field its height. */
const mirror = ref<HTMLElement | null>(null);
const linkField = ref<HTMLInputElement | null>(null);
const writing = ref(false);
/** The caret is in the field of the link. */
const linkFocused = ref(false);
/** What is written in the field of the link is not an address. */
const linkError = ref(false);
const draft = ref('');
/** What is written, on one line: a text pasted may come with line breaks. */
const written = computed(() => draft.value.replace(/\s+/g, ' ').trim());
const address = ref('');
const view = computed(() => props.idea?.view ?? { kind: 'free' as const });
/** In a gift given by several, with me in it. */
const inGroup = computed(() => view.value.kind === 'group' && view.value.mine);
/** What I give, alone or with others: a green tick, the text in bold. */
const mine = computed(() => view.value.kind === 'mine' || inGroup.value);
/** A gift given by several that I may still join. */
const openGroup = computed(
  () => view.value.kind === 'group' && !view.value.closed && !view.value.mine,
);
const taken = computed(
  () =>
    view.value.kind === 'taken' ||
    (view.value.kind === 'group' && view.value.closed),
);
/** Whether the box does something: give, give up, change or join. */
const boxActive = computed(
  () =>
    Boolean(props.idea) &&
    (view.value.kind === 'free' || mine.value || openGroup.value),
);
/** The box: ticks alone, unticks, or opens the sheet of a group. */
const onBox = () => {
  if (!props.idea || lockedBy.value) return;
  // Ticked by someone else: the box unfolds « Décocher » too, like the
  // first name (the box is what one reaches for first: Julien, 19
  // November 2026). It does not untick by itself.
  if (!boxActive.value) {
    const first = claims.value[0];
    if (first) unfolded.value = unfolded.value ? null : first.id;
    return;
  }
  const onError = (error: unknown) =>
    // Ticked by someone else in the same instant: the first wins, and
    // the box turns to « pris » by itself, without a message (lot 26).
    (error as { statusMessage?: string }).statusMessage === 'taken'
      ? void Promise.all([
          queryClient.invalidateQueries({ queryKey: keys.lists() }),
          queryClient.invalidateQueries({ queryKey: ['l'] }),
        ])
      : toast.failed(errorMessage(error));
  // What I give unticks at once, without the sheet (Julien, 20 November
  // 2026); the sheet opens from the pill of my state.
  if (mine.value) untick.mutate(props.idea.id, { onError });
  else if (openGroup.value) editing.join(props.idea, props.forName);
  else tick.mutate({ ideaId: props.idea.id }, { onError });
};
// « Décocher » for someone (Correction 25, maquette ListeDecocher): the
// first name on a ticked idea is touched, turns dark, and unfolds in the
// line a light band, « Coché par Mamie, le 12 novembre » and « Décocher »
// (one row each for a gift given by several, with « Retirer »). No
// bubble, no question: it acts at once, « Annuler » is the net. An
// anonymous tick says neither who nor when.
const { locale } = useT();
const claims = computed(() =>
  editing.untickFor ? (props.idea?.claims ?? []) : [],
);
/** The tick whose pill was touched: its line is unfolded. */
const unfolded = ref<string | null>(null);
const unfoldedClaim = computed(
  () => claims.value.find((claim) => claim.id === unfolded.value) ?? null,
);
watch(unfoldedClaim, (claim) => {
  if (!claim) unfolded.value = null;
});
// Under the idea, aligned to its text (Corrections 28 and 29, maquettes
// ListeTeneur, ListeDecocher): its link on a line of its own, the name
// of the site in italics; then one row of pills, the others who give it
// by first name, my own state in one pill, « Se joindre » last.
const chips = computed(() => ideaChips(view.value, claims.value));
const host = computed(() => (props.idea?.url ? linkHost(props.idea.url) : ''));
/** The first names of the others who give it, in one go. */
const giverNames = computed(() =>
  namesInOne(
    chips.value.givers.map((pill) => pill.name ?? t('lists.doc.anonymous')),
    t('lists.share.and'),
  ),
);
/** « Se joindre à Mamie et Tonton pour Vélo 16 pouces ». */
const joinLabel = computed(() =>
  giverNames.value
    ? t('lists.chips.joinWith', {
        names: giverNames.value,
        idea: props.idea?.text ?? '',
      })
    : t('lists.chips.joinIdea', { idea: props.idea?.text ?? '' }),
);
/** « Offert par Mamie et Tonton », for a screen reader. */
const givenBy = computed(() =>
  giverNames.value ? t('lists.doc.givenBy', { names: giverNames.value }) : '',
);
const tickDay = (iso: string) =>
  new Intl.DateTimeFormat(locale.value, {
    day: 'numeric',
    month: 'long',
  }).format(new Date(iso));
/** « Coché par » and «, le 12 novembre », around the name in bold. */
const tickedBy = (claim: { by: string | null; at: string | null }) => {
  const [before = '', after = ''] = t(
    view.value.kind === 'group' ? 'lists.doc.joinedBy' : 'lists.doc.tickedBy',
    { name: '\u0000', date: claim.at ? tickDay(claim.at) : '' },
  ).split('\u0000');
  return { before, after };
};

// Live (lot 26, maquette ListeLiveTeneur): while someone else who holds
// the list writes this line, it is theirs: tinted with the light colour
// of their icon, their icon and « Hugo écrit… » under it, their caret at
// its end; it cannot be touched, and nothing to do on it is offered
// (who gives it, « Se joindre », « Changer »: Julien, 20 November 2026). It is free again when they validate
// or leave it, or after 30 seconds without a key. What they type
// shows as they type it (Julien, 20 November 2026).
const live = useListLiveLine();
const lockedBy = computed(() =>
  props.idea
    ? (live?.writingBy(props.idea.id, props.listPersonId) ?? null)
    : null,
);
const lockShade = computed(() =>
  lockedBy.value?.avatar ? AVATAR_SHADES[lockedBy.value.avatar.color] : null,
);
/** What names this line to the others: its idea, or « a new one ». */
const liveKey = computed(() =>
  props.idea ? props.idea.id : `new:${props.listPersonId}`,
);
/** Says what I am typing: a new line only once it has a letter. */
const sayWriting = () => {
  if (!live || !writing.value) return;
  if (props.idea || draft.value.trim()) {
    live.writing(
      liveKey.value,
      draft.value,
      field.value?.selectionStart ?? draft.value.length,
      props.listPersonId,
    );
  } else live.idle();
};
watch(writing, (on) => {
  if (!live) return;
  if (on) sayWriting();
  else live.idle();
});
watch(draft, sayWriting);
onBeforeUnmount(() => {
  if (writing.value) live?.idle();
});
// A text that changes shows it by a short movement, not on arrival.
const settled = ref(false);
onMounted(() => {
  window.setTimeout(() => {
    settled.value = true;
  }, 400);
});

/**
 * Starts writing the line.
 * @returns Once the field has the focus.
 */
const start = async () => {
  if (lockedBy.value) return;
  draft.value = props.idea?.text ?? draft.value;
  address.value = shownAddress(props.idea?.url ?? '') || address.value;
  linkError.value = false;
  writing.value = true;
  await nextTick();
  field.value?.focus();
  // The caret at the end, wherever the line was entered from.
  field.value?.setSelectionRange(draft.value.length, draft.value.length);
};
defineExpose({ start });

/** Leaves the line: nothing is being written any more. */
const leave = () => {
  writing.value = false;
  linkFocused.value = false;
  linkError.value = false;
  address.value = '';
};

/**
 * Deletes the idea, after asking when someone already ticked it.
 * @returns Once done, or given up.
 */
const removeIdea = async () => {
  if (!props.idea) {
    draft.value = '';
    return;
  }
  if (view.value.kind !== 'free' && !(await editing.confirmRemove())) return;
  remove.mutate(props.idea.id);
};

/**
 * The link as it would be saved: the address written, null when the
 * field is empty, and `false` when what is written is not an address.
 * @returns The address, null, or false.
 */
const linkWritten = (): string | null | false => {
  const typed = address.value.trim();
  return typed ? (asAddress(typed) ?? false) : null;
};
/**
 * Saves the text and the link of the line together: a new idea, a
 * change, or nothing. What is not an address is not saved: the link
 * stays as it was.
 * @returns False when the idea itself went (nothing left in it).
 */
const save = async (): Promise<boolean> => {
  const text = written.value;
  const link = linkWritten();
  if (props.idea) {
    const url = link === false ? props.idea.url : link;
    if (!text && !url) {
      await removeIdea();
      return false;
    }
    const patch = {
      ...(text === props.idea.text ? {} : { text }),
      ...(url === props.idea.url ? {} : { url }),
    };
    if (Object.keys(patch).length > 0) {
      update.mutate({ ideaId: props.idea.id, ...patch });
    }
    return true;
  }
  const url = link || null;
  if (text || url) {
    create.mutate({
      listPersonId: props.listPersonId,
      text,
      ...(url ? { url } : {}),
      after: props.after ?? null,
    });
    draft.value = '';
    address.value = '';
  }
  return true;
};
/**
 * Leaves the line, saving it.
 * @param next - Whether to go on to the next line (the return key).
 * @returns Once saved.
 */
const commit = async (next: boolean) => {
  if (linkWritten() === false) toast.failed(t('lists.doc.linkInvalid'));
  await save();
  if (next && !props.idea) return;
  // The return key goes on to the line below.
  const below = next ? neighbour(1) : undefined;
  leave();
  if (below) enter(below);
};

/**
 * The return key in the field of the link: saved, and back to the text.
 * What is not an address keeps the field open, marked, and saves
 * nothing.
 * @returns Once the text has the focus.
 */
const onLinkEnter = async () => {
  if (linkWritten() === false) {
    linkError.value = true;
    return;
  }
  if (!(await save())) {
    leave();
    return;
  }
  await nextTick();
  field.value?.focus();
};
/**
 * An address pasted in the text goes at once to the field of the link,
 * which is in sight (README 22.20; Correction 29); the text keeps the
 * rest. Not when the field already has an address: it is not replaced.
 * @param event - The paste.
 */
const onPaste = (event: ClipboardEvent) => {
  const pasted = event.clipboardData?.getData('text') ?? '';
  const input = field.value;
  if (!input || address.value.trim() || !/https?:\/\//i.test(pasted)) return;
  const split = splitIdea(
    `${draft.value.slice(0, input.selectionStart)}${pasted}${draft.value.slice(input.selectionEnd)}`,
  );
  if (!split?.url) return;
  event.preventDefault();
  draft.value = split.text;
  address.value = shownAddress(split.url);
};
/**
 * The cross « Retirer le lien »: the field is emptied, and saved with
 * the line.
 * @returns Once the field has the focus.
 */
const clearLink = async () => {
  address.value = '';
  linkError.value = false;
  await nextTick();
  linkField.value?.focus();
};
/**
 * How high the row of a character of the text is, read on its copy.
 * @param at - The place of the character.
 * @returns Its top on the screen, 0 when unknown.
 */
const rowTop = (at: number): number => {
  const text = mirror.value?.firstChild;
  if (!(text instanceof Text)) return 0;
  const from = Math.min(at, text.length - 1);
  const range = document.createRange();
  range.setStart(text, from);
  range.setEnd(text, from + 1);
  return Math.round(range.getBoundingClientRect().top);
};
/**
 * The line above or below this one, of this person or the next.
 * @param step - -1 for the line above, 1 for the one below.
 * @returns Its row, or undefined at either end of the document.
 */
const neighbour = (step: -1 | 1): HTMLElement | undefined => {
  if (!row.value) return undefined;
  const all = [...document.querySelectorAll<HTMLElement>('[data-line]')];
  return all[all.indexOf(row.value) + step];
};
/**
 * Starts writing another line, from its row.
 * @param target - The row of the line.
 */
const enter = (target: HTMLElement) => {
  const starter = target.querySelector<HTMLElement>('[data-line-start]');
  if (starter instanceof HTMLTextAreaElement) starter.focus();
  else starter?.click();
};
/** The line is asking before it goes: the erase key waits. */
const erasing = ref(false);
/**
 * The arrows and the tab key: on to the line above or below, of this
 * person or the next, saving this one. An arrow moves in the text first,
 * and only leaves from its first or last row; at either end of the
 * document the key does what it always does.
 * @param event - The key pressed.
 * @param step - -1 for the line above, 1 for the one below.
 * @param fromEdge - Whether the caret must be on the row at that edge.
 * @returns Once the other line has the focus.
 */
const onMove = async (
  event: KeyboardEvent,
  step: -1 | 1,
  fromEdge: boolean,
) => {
  const input = field.value;
  if (event.isComposing || !input || !row.value) return;
  // `Alt` + an arrow moves the idea itself, one place up or down.
  if (event.altKey) {
    if (!fromEdge || !props.idea || !drag) return;
    event.preventDefault();
    drag.step({ kind: 'idea', id: props.idea.id }, step);
    return;
  }
  const target = neighbour(step);
  if (!target) return;
  if (fromEdge) {
    const [caret, edge] =
      step < 0
        ? [input.selectionStart, 0]
        : [input.selectionEnd, input.value.length];
    if (rowTop(caret) !== rowTop(edge)) return;
  }
  event.preventDefault();
  await commit(false);
  enter(target);
};

/**
 * The erase key in a line with nothing in it, as in a document: the line
 * goes, and the caret is at the end of the one above. The empty line at
 * the end only goes up. An idea someone ticked asks first, as always.
 * @param event - The key pressed, or what it was about to erase.
 * @returns Once the line above has the focus.
 */
const onErase = async (event: Event) => {
  if (!writing.value || erasing.value || draft.value !== '') return;
  if ('isComposing' in event && event.isComposing) return;
  if (address.value.trim()) return;
  event.preventDefault();
  const target = neighbour(-1);
  if (props.idea) {
    erasing.value = true;
    const sure = view.value.kind === 'free' || (await editing.confirmRemove());
    erasing.value = false;
    if (!sure) return;
    remove.mutate(props.idea.id);
  }
  leave();
  if (target) enter(target);
};

/**
 * The focus leaves a field of the line: saved, unless it went to another
 * part of the same line (the address, a link under it).
 * @param event - The loss of focus.
 */
const onFocusOut = (event: FocusEvent) => {
  if (!writing.value) return;
  // Only the fields count: the text touched to start writing is a button
  // that goes as the field comes, and loses the focus too.
  if (event.target !== field.value && event.target !== linkField.value) return;
  const to = event.relatedTarget;
  if (to instanceof Node && row.value?.contains(to)) return;
  // Left by touching something else: the line closes once the finger is
  // up. Closing under the press would move the page, and the touch
  // would land beside what was aimed at.
  afterRelease(() => {
    if (!writing.value) return;
    // The text and the link are saved together.
    void commit(false);
  });
};
</script>

<template>
  <li
    ref="row"
    class="group relative flex scroll-mt-32 items-start gap-3 py-[13px]"
    :style="
      lockShade
        ? {
            backgroundColor: `color-mix(in srgb, ${lockShade.bg} 55%, transparent)`,
          }
        : undefined
    "
    :aria-busy="lockedBy ? true : undefined"
    :data-locked="lockedBy ? '' : undefined"
    :class="[
      lockedBy ? 'pointer-events-none -mx-2 rounded-xl px-2' : '',
      writing
        ? '-mr-4 -ml-[22px] border-l-[3px] border-primary bg-default pr-4 pb-2.5 pl-[19px]'
        : '',
      // Unfolded to untick for someone (maquette ListeDecocher): the tint
      // takes the whole line, its box included, which does not move.
      unfoldedClaim && !writing && !lockedBy
        ? '-mx-2.5 my-1 rounded-[10px] bg-muted px-2.5 pb-0.5'
        : '',
      liftedHere ? 'opacity-30' : '',
    ]"
    :data-line="line"
    :data-drag="idea && drag ? 'idea' : undefined"
    :data-drag-id="idea && drag ? idea.id : undefined"
    @focusout="onFocusOut"
  >
    <!-- With a mouse, a handle shows on the left as the line is hovered;
         on a phone a long press lifts the line. -->
    <button
      v-if="idea && drag && !writing"
      type="button"
      tabindex="-1"
      class="absolute top-1.5 -left-6 hidden size-7 cursor-grab items-center justify-center rounded-md text-toned group-hover:flex"
      :aria-label="t('lists.doc.drag.handle', { name: idea.text })"
      data-testid="drag-handle"
      data-no-drag
      @mousedown="drag.grab($event, { kind: 'idea', id: idea.id })"
    >
      <UIcon name="i-lucide-grip-vertical" class="size-4" />
    </button>
    <component
      :is="idea ? 'button' : 'span'"
      v-bind="
        idea
          ? {
              type: 'button',
              role: 'checkbox',
              'aria-checked': mine || taken,
              'aria-label': mine
                ? t('lists.visitor.untick', { idea: idea.text })
                : openGroup
                  ? joinLabel
                  : t('lists.visitor.tick', { idea: idea.text }),
              disabled: !boxActive && claims.length === 0,
            }
          : { 'aria-hidden': 'true' }
      "
      class="-m-2.5 flex size-[42px] shrink-0 items-center justify-center"
      :class="lockedBy ? 'opacity-50' : ''"
      data-testid="holder-box"
      @click="onBox"
    >
      <span
        class="flex size-[22px] items-center justify-center rounded-sm motion-safe:transition-colors motion-safe:duration-200"
        :class="
          !idea
            ? 'border-[1.5px] border-default'
            : mine
              ? 'bg-success text-white'
              : openGroup
                ? 'bg-warning-fill text-highlighted'
                : taken
                  ? 'bg-line-strong text-highlighted'
                  : 'border-[1.5px] border-accented bg-default'
        "
        aria-hidden="true"
      >
        <UIcon v-if="openGroup" name="i-lucide-plus" class="size-3.5" />
        <UIcon
          v-else-if="mine || taken"
          name="i-lucide-check"
          class="size-3.5"
        />
      </span>
    </component>
    <div class="flex min-w-0 grow flex-col">
      <template v-if="writing || !idea">
        <!-- A long text goes on to the next row: the field is as tall as
             its text, measured by a copy of it under the field. -->
        <div class="grid min-w-0 text-base/[22px]">
          <span
            ref="mirror"
            class="invisible col-start-1 row-start-1 break-words whitespace-pre-wrap"
            aria-hidden="true"
            >{{ draft }}&nbsp;</span
          >
          <textarea
            ref="field"
            v-model="draft"
            rows="1"
            enterkeyhint="next"
            :maxlength="200"
            class="col-start-1 row-start-1 block w-full resize-none overflow-hidden bg-transparent p-0 outline-none select-text placeholder:text-dimmed"
            :placeholder="placeholder ?? t('lists.doc.anotherIdea')"
            :aria-label="placeholder ?? t('lists.doc.anotherIdea')"
            data-testid="idea-field"
            data-line-start
            @keyup="sayWriting"
            @click="sayWriting"
            @keydown.delete="onErase"
            @beforeinput="
              ($event as InputEvent).inputType === 'deleteContentBackward' &&
              onErase($event)
            "
            @keydown.up="onMove($event, -1, true)"
            @keydown.down="onMove($event, 1, true)"
            @keydown.tab="onMove($event, $event.shiftKey ? -1 : 1, false)"
            @focus="!writing && start()"
            @paste="onPaste"
            @keydown.enter.prevent="commit(true)"
          />
        </div>
        <!-- The link, always there while one is in the line (maquettes
             ListeIdee, ListeIdeeLien, ListeIdeeLienFait): a field under
             the text and a thin line. Empty, « Ajouter un lien »; with the
             caret in it, « Colle ou écris l'adresse »; filled, the whole
             address and a cross to take it off. Out of the way of the tab
             key, which goes from line to line. -->
        <div
          v-if="writing"
          class="mt-1.5 flex min-h-8 items-center gap-1.5 border-t pt-1.5 text-sm/[1.4]"
          :class="linkError ? 'border-error' : 'border-muted'"
          data-testid="idea-link-row"
        >
          <UIcon
            name="i-lucide-link"
            class="size-3.5 shrink-0"
            :class="
              linkError
                ? 'text-error'
                : linkFocused || address
                  ? 'text-idea-link'
                  : 'text-muted'
            "
            aria-hidden="true"
          />
          <input
            ref="linkField"
            v-model="address"
            type="text"
            inputmode="url"
            autocapitalize="none"
            autocorrect="off"
            autocomplete="off"
            spellcheck="false"
            enterkeyhint="done"
            tabindex="-1"
            :maxlength="2000"
            class="min-w-0 grow bg-transparent outline-none select-text placeholder:text-muted placeholder:italic"
            :class="linkError ? 'text-error' : ''"
            :placeholder="
              linkFocused
                ? t('lists.doc.linkPlaceholder')
                : t('lists.doc.addLink')
            "
            :aria-label="t('lists.doc.linkLabel')"
            :aria-invalid="linkError ? true : undefined"
            data-testid="idea-link-field"
            @focus="linkFocused = true"
            @blur="linkFocused = false"
            @input="linkError = false"
            @keydown.enter.prevent="onLinkEnter"
            @keydown.esc.prevent="field?.focus()"
          />
          <button
            v-if="address"
            type="button"
            class="-my-1.5 -mr-2 flex size-8 shrink-0 items-center justify-center text-muted"
            tabindex="-1"
            :aria-label="t('lists.doc.removeLink')"
            data-testid="idea-link-remove"
            @pointerdown.prevent
            @click="clearLink"
          >
            <UIcon name="i-lucide-x" class="size-4" />
          </button>
        </div>
      </template>
      <template v-else>
        <p class="text-base/[22px]">
          <button
            type="button"
            class="text-left"
            :class="[
              taken && !mine ? 'text-toned line-through' : '',
              mine ? 'font-semibold' : '',
            ]"
            data-testid="idea-text"
            data-line-start
            @click="start"
          >
            <span
              :key="lockedBy ? 'live' : idea.text"
              :class="settled && !lockedBy ? 'text-changed' : ''"
              ><template v-if="lockedBy"
                >{{ lockedBy.text.slice(0, lockedBy.caret)
                }}<span
                  class="live-caret"
                  :style="{
                    backgroundColor: lockShade?.ring ?? 'currentColor',
                  }"
                  aria-hidden="true"
                  data-testid="live-caret"
                />{{ lockedBy.text.slice(lockedBy.caret) }}</template
              ><template v-else>{{ idea.text }}</template></span
            >
          </button>
          <!-- Taken from an old list and not changed since (lot 27): a small
               grey mark, for those who hold the list only. -->
          <UIcon
            v-if="idea.carried"
            name="i-lucide-rotate-ccw"
            class="ml-2 inline-block size-3.5 shrink-0 align-[-2px] text-muted"
            role="img"
            :aria-label="t('lists.resume.mark')"
            data-testid="idea-carried"
          />
        </p>
        <ListsIdeaLink v-if="idea.url && host" :url="idea.url" :host="host" />
        <!-- The row of pills: never struck through. -->
        <div
          v-if="
            !lockedBy &&
            (chips.givers.length > 0 ||
              chips.crowd ||
              chips.closed ||
              chips.mine ||
              chips.join)
          "
          class="mt-1.5 flex flex-wrap items-center gap-1.5"
          data-testid="idea-pills"
        >
          <span v-if="givenBy" class="sr-only">{{ givenBy }}</span>
          <template v-for="(pill, index) in chips.givers" :key="index">
            <UiChip
              v-if="pill.claimId"
              button
              :kind="unfolded === pill.claimId ? 'selected' : 'info'"
              :aria-expanded="unfolded === pill.claimId"
              :aria-label="
                t('lists.doc.tickOf', {
                  name: pill.name ?? t('lists.doc.anonymous'),
                })
              "
              data-testid="idea-who"
              data-no-drag
              @click="
                unfolded = unfolded === pill.claimId ? null : pill.claimId
              "
              >{{ pill.name ?? t('lists.doc.anonymous') }}</UiChip
            >
            <UiChip v-else aria-hidden="true" data-testid="idea-who">{{
              pill.name ?? t('lists.doc.anonymous')
            }}</UiChip>
          </template>
          <UiChip v-if="chips.crowd" icon="i-lucide-users">{{
            t('lists.visitor.groupMany', { count: chips.crowd })
          }}</UiChip>
          <UiChip
            v-if="chips.closed"
            icon="i-lucide-users"
            data-testid="idea-closed"
            >{{ t('lists.chips.closed') }}</UiChip
          >
          <!-- My state opens the sheet of what I give (no « Changer »):
               alone or with others. -->
          <ListsMineChip
            v-if="chips.mine"
            :state="chips.mine"
            button
            :aria-label="
              chips.mine === 'group'
                ? t('lists.chips.mineGroupLabel', { idea: idea.text })
                : t('lists.chips.mineLabel', { idea: idea.text })
            "
            :data-testid="chips.mine === 'group' ? 'idea-joined' : 'idea-mine'"
            data-no-drag
            @click="editing.change(idea, forName)"
          />
          <UiChip
            v-if="chips.join"
            button
            kind="action"
            icon="i-lucide-plus"
            :aria-label="joinLabel"
            data-testid="idea-join"
            data-no-drag
            @click="editing.join(idea, forName)"
            >{{ t('lists.visitor.join') }}</UiChip
          >
        </div>
      </template>
      <p
        v-if="lockedBy"
        class="flex items-center gap-1.5 text-[13px] text-toned"
        data-testid="line-writing"
      >
        <UiAvatar
          v-if="lockedBy.avatar"
          :avatar="lockedBy.avatar"
          :px="18"
          flat
        />
        {{ t('lists.live.writing', { name: lockedBy.name }) }}
      </p>
      <!-- « Coché par Mamie, le 12 novembre » and « Décocher », for the
           pill touched, without a background of their own. -->
      <p
        v-if="idea && unfoldedClaim && !writing && !lockedBy"
        class="mt-2 flex items-center justify-between gap-3 text-sm leading-[1.35] text-toned"
        data-testid="untick-band"
        data-no-drag
      >
        <span v-if="unfoldedClaim.by === null">{{
          t('lists.doc.tickedAnonymous')
        }}</span>
        <span v-else
          >{{ tickedBy(unfoldedClaim).before
          }}<strong class="font-bold text-highlighted">{{
            unfoldedClaim.by
          }}</strong
          >{{ tickedBy(unfoldedClaim).after }}</span
        >
        <button
          type="button"
          class="min-h-9 shrink-0 rounded-full bg-default px-3 text-sm font-bold text-primary-ink ring-1 ring-default"
          data-testid="untick-for"
          @click="editing.untickFor?.(idea, unfoldedClaim)"
        >
          {{
            view.kind === 'group'
              ? t('lists.doc.removeTick')
              : t('lists.doc.untick')
          }}
        </button>
      </p>
    </div>
  </li>
</template>
