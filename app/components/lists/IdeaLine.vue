<script setup lang="ts">
import type { IdeaLine } from '#server/http/lists';
import {
  useCreateIdeaMutation,
  useDeleteIdeaMutation,
  useTickMutation,
  useUntickMutation,
  useUpdateIdeaMutation,
} from '~/composables/queries/useLists';

// One line of a person's ideas, written where it shows (README 22.19,
// maquettes ListeTeneur and ListeIdee): its box, its text and « lien »,
// and, for the holder, who gives it. The holder ticks too, their « Moi »
// included: the box gives the idea alone, touched again it unticks. What
// they give says so under it, as by the link (maquette ListeVisiteurMes):
// « Tu l'offres · seul · Changer »; a gift given by several is joined
// from here too. Touched, the text turns into a field; the return key
// saves it and goes to the next line; a line left empty goes. Without an
// idea, the empty line at the end, « Une autre idée… », where a new one
// is written.
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

const field = ref<HTMLInputElement | null>(null);
const writing = ref(false);
const draft = ref('');
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
        v-if="idea && mine"
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
        v-else-if="idea && view.kind === 'group'"
        class="text-[13px] text-toned"
      >
        {{ view.closed ? t('lists.doc.groupClosed') : t('lists.doc.group') }}
      </p>
    </div>
  </li>
</template>
