<script setup lang="ts">
import type { ListDocument } from '#server/http/lists';
import { LIST_NOTE_MAX } from '#server/utils/lists';
import { useUpdateListMutation } from '~/composables/queries/useLists';

// The word for the family (README 22.19, maquettes ListeNouvelle and
// ListeTeneur): the starting text in a dashed frame while untouched,
// the holder's own text once changed, nothing once erased. Touched, it
// is written in place; it is saved when the field is left.
const props = defineProps<{
  listId: string;
  note: ListDocument['list']['note'];
}>();
const { t } = useT();
const update = useUpdateListMutation(() => props.listId);
const writing = ref(false);
const draft = ref('');
const field = ref<{ textareaRef?: HTMLTextAreaElement } | null>(null);
const shown = computed(() =>
  props.note.kind === 'text'
    ? props.note.text
    : props.note.kind === 'default'
      ? t('lists.doc.noteDefault')
      : '',
);
const start = async () => {
  draft.value = shown.value;
  writing.value = true;
  await nextTick();
  field.value?.textareaRef?.focus();
};
/** Saves the word, unless the starting text was left as it was. */
const onBlur = () => {
  writing.value = false;
  const text = draft.value.trim();
  if (props.note.kind === 'default' && text === shown.value) return;
  if (props.note.kind !== 'default' && text === shown.value) return;
  update.mutate({ note: text || null });
};
</script>

<template>
  <div v-if="writing" class="flex flex-col gap-1">
    <UTextarea
      ref="field"
      v-model="draft"
      autoresize
      :rows="3"
      :maxlength="LIST_NOTE_MAX"
      :aria-label="t('lists.doc.noteLabel')"
      class="w-full"
      :ui="{ base: 'text-base leading-[1.5]' }"
      data-testid="note-field"
      @blur="onBlur"
    />
    <p class="px-1 text-[13px] text-toned">{{ t('lists.doc.noteHelp') }}</p>
  </div>
  <button
    v-else-if="note.kind === 'default'"
    type="button"
    class="flex flex-col gap-1.5 rounded-xl border border-dashed border-[#d8c49b] p-3.5 text-left"
    data-testid="note-default"
    @click="start"
  >
    <span
      class="flex items-center gap-1.5 text-xs font-bold tracking-[0.04em] text-primary-ink uppercase"
    >
      <UIcon name="i-lucide-pencil-line" class="size-3.5" />
      {{ t('lists.doc.noteLabel') }}
    </span>
    <span class="text-base leading-[1.5]">{{ shown }}</span>
    <span class="text-[13px] text-toned">{{
      t('lists.doc.noteDefaultHint')
    }}</span>
  </button>
  <button
    v-else-if="note.kind === 'text'"
    type="button"
    class="text-left text-base leading-[1.5] whitespace-pre-line"
    data-testid="note-text"
    @click="start"
  >
    {{ shown }}
  </button>
  <button
    v-else
    type="button"
    class="self-start text-[15px] font-semibold text-primary-ink"
    data-testid="note-add"
    @click="start"
  >
    {{ t('lists.doc.noteAdd') }}
  </button>
</template>
