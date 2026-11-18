<script setup lang="ts">
import type { IdeaView } from '#server/utils/lists';
import {
  useCreateIdeaMutation,
  useDeleteIdeaMutation,
  useUpdateIdeaMutation,
} from '~/composables/queries/useLists';

// One line of a person's ideas, written where it shows (README 22.19,
// maquettes ListeTeneur and ListeIdee): its box, its text and « lien »,
// and, for the holder, who gives it. Touched, the text turns into a field;
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

const field = ref<HTMLInputElement | null>(null);
const writing = ref(false);
const draft = ref('');
const view = computed(() => props.idea?.view ?? { kind: 'free' as const });
const taken = computed(
  () =>
    view.value.kind === 'taken' ||
    view.value.kind === 'mine' ||
    (view.value.kind === 'group' && view.value.closed),
);
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
    <span
      class="mt-0.5 flex size-[22px] shrink-0 items-center justify-center rounded-[5px]"
      :class="
        !idea
          ? 'border-[1.5px] border-[#e2d3b6]'
          : view.kind === 'group' && !view.closed
            ? 'bg-[#e6b94a] text-[#292524]'
            : taken
              ? 'bg-[#a8a29e] text-white'
              : 'border-[1.5px] border-[#a8a29e] bg-default'
      "
      aria-hidden="true"
    >
      <UIcon
        v-if="view.kind === 'group' && !view.closed"
        name="i-lucide-plus"
        class="size-3.5"
      />
      <UIcon v-else-if="taken" name="i-lucide-check" class="size-3.5" />
    </span>
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
          :class="taken ? 'text-toned line-through' : ''"
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
          class="rounded-full bg-[#ece2cf] px-2 py-0.5 text-xs font-bold text-[#44403c] no-underline"
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
