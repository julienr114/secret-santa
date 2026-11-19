<script setup lang="ts">
import type { IdeaView } from '#server/utils/lists';
import {
  useCreateIdeaMutation,
  useDeleteIdeaMutation,
  useHolderTickMutation,
  useHolderUntickMutation,
  useUpdateIdeaMutation,
} from '~/composables/queries/useLists';

// One line of a person's ideas, written where it shows (README 22.19,
// maquettes ListeTeneur and ListeIdee): its box, its text and « lien »,
// and, for the holder, who gives it. The holder ticks too: the box gives
// the idea alone, touched again it unticks; never an idea meant for them.
// Touched, the text turns into a field;
// the return key saves it and goes to the next line; a line left empty
// goes. Without an idea, the empty line at the end, « Une autre idée… »,
// where a new one is written.
const props = defineProps<{
  listId: string;
  listPersonId: string;
  /** The idea, or null for the empty line at the end. */
  idea: {
    id: string;
    text: string;
    url: string | null;
    view: IdeaView;
    /** Whether the holder may tick it: not one meant for them. */
    tickable: boolean;
  } | null;
  /** The idea the new line comes after. */
  after?: string | null;
  placeholder?: string;
  /** Where the line is, for « retour » to find the next one. */
  line: string;
}>();
const emit = defineEmits<{ next: [] }>();
const { t } = useT();
const editing = useListEditing();
const create = useCreateIdeaMutation(() => props.listId);
const update = useUpdateIdeaMutation(() => props.listId);
const remove = useDeleteIdeaMutation(() => props.listId);
const tick = useHolderTickMutation(() => props.listId);
const untick = useHolderUntickMutation(() => props.listId);
const toast = useToast();
const errorMessage = useErrorMessage();

const field = ref<HTMLInputElement | null>(null);
const writing = ref(false);
const draft = ref('');
const view = computed(() => props.idea?.view ?? { kind: 'free' as const });
const mine = computed(() => view.value.kind === 'mine');
const taken = computed(
  () =>
    view.value.kind === 'taken' ||
    (view.value.kind === 'group' && view.value.closed),
);
/** Whether the box does something: give it alone, or no longer. */
const boxActive = computed(
  () =>
    Boolean(props.idea?.tickable) && (view.value.kind === 'free' || mine.value),
);
/** Ticks the idea for the holder, or unticks it. */
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
  if (mine.value) untick.mutate(props.idea.id, { onError });
  else tick.mutate(props.idea.id, { onError });
};
/** Who gives it, as the holder reads it. */
const who = computed(() => {
  const v = view.value;
  if (v.kind === 'mine') return t('lists.doc.you');
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
  editing.active.value = actions;
  await nextTick();
  field.value?.focus();
};
defineExpose({ start });

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
  writing.value = false;
  if (editing.active.value === actions) editing.active.value = null;
  if (next) emit('next');
};

const actions = {
  link: async () => {
    const url = await editing.askLink(props.idea?.url ?? null);
    if (url === undefined) return field.value?.focus();
    if (props.idea) {
      update.mutate({ ideaId: props.idea.id, url });
    } else if (draft.value.trim() || url) {
      create.mutate({
        listPersonId: props.listPersonId,
        text: draft.value.trim(),
        url,
        after: props.after ?? null,
      });
      draft.value = '';
    }
    field.value?.focus();
  },
  remove: async () => {
    writing.value = false;
    editing.active.value = null;
    await removeIdea();
  },
  done: () => field.value?.blur(),
};
const onBlur = () => {
  if (writing.value) commit(false);
};
</script>

<template>
  <li
    class="flex items-start gap-3 py-2"
    :class="
      writing
        ? '-mx-4 border-l-[3px] border-primary bg-default pr-4 pl-[13px]'
        : ''
    "
    :data-line="line"
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
              : view.kind === 'group' && !view.closed
                ? 'bg-warning-fill text-highlighted'
                : taken
                  ? 'bg-line-strong text-highlighted'
                  : 'border-[1.5px] border-accented bg-default'
        "
        aria-hidden="true"
      >
        <UIcon
          v-if="view.kind === 'group' && !view.closed"
          name="i-lucide-plus"
          class="size-3.5"
        />
        <UIcon
          v-else-if="mine || taken"
          name="i-lucide-check"
          class="size-3.5"
        />
      </span>
    </component>
    <div class="flex min-w-0 grow flex-col gap-0.5">
      <input
        v-if="writing || !idea"
        ref="field"
        v-model="draft"
        type="text"
        enterkeyhint="next"
        :maxlength="200"
        class="w-full bg-transparent text-base leading-[1.45] outline-none placeholder:text-dimmed"
        :placeholder="placeholder ?? t('lists.doc.anotherIdea')"
        :aria-label="placeholder ?? t('lists.doc.anotherIdea')"
        data-testid="idea-field"
        @focus="!writing && start()"
        @keydown.enter.prevent="commit(true)"
        @blur="onBlur"
      />
      <p
        v-else
        class="flex flex-wrap items-center gap-x-2 gap-y-1 text-base leading-[1.45]"
      >
        <button
          type="button"
          class="text-left"
          :class="
            taken ? 'text-toned line-through' : mine ? 'font-semibold' : ''
          "
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
          :class="taken ? 'line-through' : ''"
          >{{ t('lists.doc.linkWord') }}</a
        >
        <span
          v-if="who"
          class="rounded-full px-2 py-0.5 text-xs font-bold no-underline"
          :class="
            mine ? 'bg-success-soft text-success-ink' : 'bg-muted text-default'
          "
          data-testid="idea-who"
          >{{ who }}</span
        >
      </p>
      <p v-if="idea && view.kind === 'group'" class="text-[13px] text-toned">
        {{ view.closed ? t('lists.doc.groupClosed') : t('lists.doc.group') }}
      </p>
    </div>
  </li>
</template>
