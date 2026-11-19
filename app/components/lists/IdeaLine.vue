<script setup lang="ts">
import type { IdeaLine } from '#server/http/lists';
import {
  useCreateIdeaMutation,
  useDeleteIdeaMutation,
  useTickMutation,
  useUntickMutation,
  useUpdateIdeaMutation,
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
// goes. Nothing sits above the keyboard: while one is in the line, its
// actions are under it, as text links. « Ajouter un lien » extends the
// line with « : » and a field for the address; once set, the address is
// the word « lien », with « Changer le lien », « Retirer le lien » and
// « Supprimer » under it. Without an idea, the empty line at the end,
// « Une autre idée… », where a new one is written.
const props = defineProps<{
  listId: string;
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
const emit = defineEmits<{ next: [] }>();
const { t } = useT();
const editing = useListEditing();
const via = computed(() => ({ listId: props.listId }));
const create = useCreateIdeaMutation(() => props.listId);
const update = useUpdateIdeaMutation(() => props.listId);
const remove = useDeleteIdeaMutation(() => props.listId);
const tick = useTickMutation(via);
const untick = useUntickMutation(via);
const toast = useToast();
const errorMessage = useErrorMessage();

const row = ref<HTMLElement | null>(null);
const field = ref<HTMLInputElement | null>(null);
const linkField = ref<HTMLInputElement | null>(null);
const writing = ref(false);
/** The address is being written, at the end of the line. */
const linking = ref(false);
const draft = ref('');
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
  const text = draft.value.trim();
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
  leave();
  if (next) emit('next');
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
  const text = draft.value.trim();
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
  if (!draft.value.trim()) {
    leave();
    await removeIdea();
    return;
  }
  update.mutate({ ideaId: props.idea.id, url: null });
  field.value?.focus();
};
/**
 * « Supprimer »: the whole line.
 * @returns Once done, or given up.
 */
const removeLine = async () => {
  leave();
  await removeIdea();
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
    class="flex items-start gap-3 py-2"
    :class="
      writing
        ? '-mx-4 border-l-[3px] border-primary bg-default pr-4 pl-[13px]'
        : ''
    "
    :data-line="line"
    @focusout="onFocusOut"
  >
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
          <span class="break-words">{{ draft.trim() }}</span>
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
        <div v-else class="flex items-baseline gap-x-1.5">
          <input
            ref="field"
            v-model="draft"
            type="text"
            enterkeyhint="next"
            :maxlength="200"
            class="min-w-0 grow bg-transparent text-base leading-[1.45] outline-none placeholder:text-dimmed"
            :placeholder="placeholder ?? t('lists.doc.anotherIdea')"
            :aria-label="placeholder ?? t('lists.doc.anotherIdea')"
            data-testid="idea-field"
            @focus="!writing && start()"
            @keydown.enter.prevent="commit(true)"
          />
          <template v-if="writing && idea?.url">
            <span aria-hidden="true">:</span>
            <span class="shrink-0 text-primary underline">{{
              t('lists.doc.linkWord')
            }}</span>
          </template>
        </div>
        <!-- What the line can do, while one is in it. The links keep the
             focus in the line (no blur before the tap). -->
        <div
          v-if="writing"
          class="flex flex-wrap gap-x-5 text-sm font-bold"
          data-testid="line-actions"
        >
          <button
            v-if="linking"
            type="button"
            class="flex min-h-11 items-center text-toned underline underline-offset-2"
            @pointerdown.prevent
            @click="cancelLink"
          >
            {{ t('common.actions.cancel') }}
          </button>
          <template v-else>
            <button
              type="button"
              class="flex min-h-11 items-center text-primary underline underline-offset-2"
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
              @pointerdown.prevent
              @click="removeLink"
            >
              {{ t('lists.doc.removeLink') }}
            </button>
            <button
              type="button"
              class="flex min-h-11 items-center text-toned underline underline-offset-2"
              @pointerdown.prevent
              @click="removeLine"
            >
              {{ t('lists.doc.removeLine') }}
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
