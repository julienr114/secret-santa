<script setup lang="ts">
import type { IdeaLine } from '#server/http/lists';
import {
  useCreateIdeaMutation,
  useDeleteIdeaMutation,
  useTickMutation,
  useUntickMutation,
  useUpdateIdeaMutation,
  type ClaimRoute,
} from '~/composables/queries/useLists';
import { asAddress } from '~/utils/ideaLink';

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
const toast = useToast();
const errorMessage = useErrorMessage();

const row = ref<HTMLElement | null>(null);
const field = ref<HTMLTextAreaElement | null>(null);
/** The copy of the text under its field, which gives the field its height. */
const mirror = ref<HTMLElement | null>(null);
const linkField = ref<HTMLInputElement | null>(null);
const writing = ref(false);
/** The address is being written, at the end of the line. */
const linking = ref(false);
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
  if (!props.idea || !boxActive.value) return;
  const onError = (error: unknown) =>
    toast.add({
      title:
        (error as { statusMessage?: string }).statusMessage === 'taken'
          ? t('lists.visitor.takenNow')
          : errorMessage(error),
      color: 'error',
    });
  if (inGroup.value) editing.change(props.idea, props.forName);
  else if (openGroup.value) editing.join(props.idea, props.forName);
  else if (mine.value) untick.mutate(props.idea.id, { onError });
  else tick.mutate({ ideaId: props.idea.id }, { onError });
};
/** Who gives it, as the holder reads it. */
const who = computed(() => {
  const v = view.value;
  if (v.kind === 'taken') return v.by ?? t('lists.doc.anonymous');
  if (v.kind === 'group') return v.people.map((p) => p.name).join(', ');
  return null;
});

/**
 * Starts writing the line.
 * @returns Once the field has the focus.
 */
const start = async () => {
  draft.value = props.idea?.text ?? draft.value;
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
  linking.value = false;
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
 * Saves what was written: a new idea, a change, or nothing.
 * @param next - Whether to go on to the next line (the return key).
 * @returns Once saved.
 */
const commit = async (next: boolean) => {
  const text = written.value;
  if (props.idea) {
    if (!text && !props.idea.url) await removeIdea();
    else if (text !== props.idea.text) {
      update.mutate({ ideaId: props.idea.id, text });
    }
  } else if (text) {
    create.mutate({
      listPersonId: props.listPersonId,
      text,
      after: props.after ?? null,
    });
    draft.value = '';
  }
  if (next && !props.idea) return;
  // The return key goes on to the line below.
  const below = next ? neighbour(1) : undefined;
  leave();
  if (below) enter(below);
};

/**
 * « Ajouter un lien », « Changer le lien »: the address is written at the
 * end of the line.
 * @returns Once its field has the focus.
 */
const startLink = async () => {
  address.value = props.idea?.url ?? '';
  linking.value = true;
  await nextTick();
  linkField.value?.focus();
  linkField.value?.select();
};
/**
 * « Annuler »: back to the text, the link as it was.
 * @returns Once the text has the focus.
 */
const cancelLink = async () => {
  linking.value = false;
  address.value = '';
  await nextTick();
  field.value?.focus();
};
/**
 * Saves the address written, with the text as it stands.
 * @returns Whether there was an address to save.
 */
const saveLink = (): boolean => {
  const url = asAddress(address.value);
  if (!url) return false;
  const text = written.value;
  if (props.idea) {
    update.mutate({
      ideaId: props.idea.id,
      url,
      ...(text && text !== props.idea.text ? { text } : {}),
    });
  } else {
    create.mutate({
      listPersonId: props.listPersonId,
      text,
      url,
      after: props.after ?? null,
    });
    draft.value = '';
  }
  return true;
};
/**
 * The return key in the address: it becomes the word « lien ». Nothing
 * written cancels; what is not an address stays in its field.
 * @returns Once saved, the text back in focus.
 */
const setLink = async () => {
  if (!address.value.trim()) return cancelLink();
  if (!saveLink()) {
    toast.add({ title: t('lists.doc.linkInvalid'), color: 'error' });
    return;
  }
  await cancelLink();
};
/**
 * « Retirer le lien »: the text stays; alone, the idea goes with it.
 * @returns Once done.
 */
const removeLink = async () => {
  if (!props.idea) return;
  if (!written.value) {
    leave();
    await removeIdea();
    return;
  }
  update.mutate({ ideaId: props.idea.id, url: null });
  field.value?.focus();
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
  if (props.idea?.url) return;
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
  // An address being written is saved on leaving, like the text.
  if (linking.value && saveLink()) leave();
  else commit(false);
};
</script>

<template>
  <li
    ref="row"
    class="group relative flex scroll-mt-32 items-start gap-3 py-2"
    :class="[
      writing
        ? '-mr-4 -ml-9 border-l-[3px] border-primary bg-default pr-4 pl-[33px]'
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
                : t('lists.visitor.tick', { idea: idea.text }),
              disabled: !boxActive,
            }
          : { 'aria-hidden': 'true' }
      "
      class="-m-2.5 flex size-[42px] shrink-0 items-center justify-center"
      data-testid="holder-box"
      @click="onBox"
    >
      <span
        class="flex size-[22px] items-center justify-center rounded-sm"
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
    <div class="flex min-w-0 grow flex-col gap-0.5">
      <template v-if="writing || !idea">
        <!-- The address is written at the end of the line: the text as it
             stands, « : », then its field, on the next row when the text
             leaves it no room. -->
        <div
          v-if="writing && linking"
          class="flex flex-wrap items-baseline gap-x-1.5 text-base leading-[1.45]"
        >
          <span class="break-words">{{ written }}</span>
          <span aria-hidden="true">:</span>
          <input
            ref="linkField"
            v-model="address"
            type="url"
            inputmode="url"
            autocapitalize="none"
            autocomplete="off"
            enterkeyhint="done"
            :maxlength="2000"
            class="min-w-44 grow basis-0 bg-transparent text-primary outline-none placeholder:text-dimmed"
            :placeholder="t('lists.doc.linkPlaceholder')"
            :aria-label="t('lists.doc.linkLabel')"
            data-testid="idea-link-field"
            @keydown.enter.prevent="setLink"
            @keydown.esc.prevent="cancelLink"
          />
        </div>
        <div v-else class="flex items-end gap-x-1.5">
          <!-- A long text goes on to the next row: the field is as tall as
               its text, measured by a copy of it under the field. -->
          <div class="grid min-w-0 grow text-base leading-[1.45]">
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
              @keydown.delete="onErase"
              @beforeinput="
                ($event as InputEvent).inputType === 'deleteContentBackward' &&
                onErase($event)
              "
              @keydown.up="onMove($event, -1, true)"
              @keydown.down="onMove($event, 1, true)"
              @keydown.tab="onMove($event, $event.shiftKey ? -1 : 1, false)"
              @focus="!writing && start()"
              @keydown.enter.prevent="commit(true)"
            />
          </div>
          <template v-if="writing && idea?.url">
            <span class="text-base leading-[1.45]" aria-hidden="true">:</span>
            <span
              class="shrink-0 text-base leading-[1.45] text-primary underline"
              >{{ t('lists.doc.linkWord') }}</span
            >
          </template>
        </div>
        <!-- What the line can do, while one is in it. The links keep the
             focus in the line (no blur before the tap), and are out of the
             way of the tab key, which goes from line to line. -->
        <div
          v-if="writing"
          class="flex flex-wrap gap-x-5 text-sm font-bold"
          data-testid="line-actions"
        >
          <button
            v-if="linking"
            type="button"
            class="flex min-h-11 items-center text-toned underline underline-offset-2"
            tabindex="-1"
            @pointerdown.prevent
            @click="cancelLink"
          >
            {{ t('common.actions.cancel') }}
          </button>
          <template v-else>
            <button
              type="button"
              class="flex min-h-11 items-center text-primary underline underline-offset-2"
              tabindex="-1"
              @pointerdown.prevent
              @click="startLink"
            >
              {{
                idea?.url ? t('lists.doc.changeLink') : t('lists.doc.addLink')
              }}
            </button>
            <button
              v-if="idea?.url"
              type="button"
              class="flex min-h-11 items-center text-toned underline underline-offset-2"
              tabindex="-1"
              @pointerdown.prevent
              @click="removeLink"
            >
              {{ t('lists.doc.removeLink') }}
            </button>
          </template>
        </div>
      </template>
      <p
        v-else
        class="flex flex-wrap items-center gap-x-2 gap-y-1 text-base leading-[1.45]"
      >
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
          {{ idea.text
          }}<template v-if="idea.url && idea.text">&nbsp;:</template>
        </button>
        <a
          v-if="idea.url"
          :href="idea.url"
          target="_blank"
          rel="noopener noreferrer"
          draggable="false"
          class="-ml-1 text-primary-ink underline"
          :class="taken && !mine ? 'line-through' : ''"
          >{{ t('lists.doc.linkWord') }}</a
        >
        <span
          v-if="who"
          class="rounded-full bg-muted px-2 py-0.5 text-xs font-bold text-default no-underline"
          data-testid="idea-who"
          >{{ who }}</span
        >
        <button
          v-if="openGroup"
          type="button"
          class="font-bold text-primary-ink underline underline-offset-2"
          data-testid="idea-join"
          @click="editing.join(idea, forName)"
        >
          {{ t('lists.visitor.join') }}
        </button>
        <span
          v-else-if="inGroup"
          class="text-sm font-bold text-success-ink"
          data-testid="idea-joined"
          >{{ t('lists.visitor.joined') }}</span
        >
      </p>
      <p
        v-if="idea && mine && !writing"
        class="text-[13px] text-toned"
        data-testid="idea-mine"
      >
        {{ t('lists.visitor.giving') }} ·
        {{ inGroup ? t('lists.doc.givingGroup') : t('lists.doc.givingAlone') }}
        ·
        <button
          type="button"
          class="font-bold text-primary-ink underline"
          @click="editing.change(idea, forName)"
        >
          {{ t('lists.visitor.change') }}
        </button>
      </p>
      <p
        v-else-if="idea && view.kind === 'group' && !writing"
        class="text-[13px] text-toned"
      >
        {{ view.closed ? t('lists.doc.groupClosed') : t('lists.doc.group') }}
      </p>
    </div>
  </li>
</template>
