<script setup lang="ts">
import type { ListDocument } from '#server/http/lists';
import { LIST_NOTE_MAX } from '#server/utils/lists';
import { useUpdateListMutation } from '~/composables/queries/useLists';

// The word for the family, in option (docs/spec/v3/listes.md, « Une
// nouvelle liste », ticket 147; V3ListeNouvelle, V3ListeMotAccueil): none
// at first, « Ajouter un mot d'accueil » under the date. Touched, the
// field opens in the white card of writing (ticket 144), filled with the
// starting word, the cursor at its end; it is saved when left. Emptied,
// the list has no word and the line comes back.
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
  props.note.kind === 'text' ? props.note.text : '',
);
// Live (lot 26): while someone else who holds the list writes the word,
// it is theirs.
const { lockedBy } = useLiveWriting(
  useListLiveLine(),
  () => 'note',
  draft,
  writing,
  () => field.value?.textareaRef,
);
const start = async () => {
  if (lockedBy.value) return;
  draft.value = shown.value || t('lists.doc.noteDefault');
  writing.value = true;
  await nextTick();
  const area = field.value?.textareaRef;
  area?.focus();
  area?.setSelectionRange(draft.value.length, draft.value.length);
};
/** Saves the word when it changed; emptied, the list has none. */
const onBlur = () => {
  writing.value = false;
  const text = draft.value.trim();
  if (text === shown.value) return;
  update.mutate({ note: text || null });
};
</script>

<template>
  <ListsLiveLock
    v-if="lockedBy"
    :by="lockedBy"
    class="text-base leading-[1.5]"
  />
  <div
    v-else-if="writing"
    class="my-1 -mr-2 -ml-2.5 rounded-[16px] bg-default py-2.5 pr-2 pl-2.5 shadow-line-card"
    data-testid="note-card"
  >
    <UTextarea
      ref="field"
      v-model="draft"
      autoresize
      :rows="1"
      :maxlength="LIST_NOTE_MAX"
      variant="none"
      :aria-label="t('lists.doc.noteLabel')"
      class="w-full"
      :ui="{ base: 'p-0 text-base md:text-base leading-[1.5]' }"
      data-testid="note-field"
      @blur="onBlur"
    />
  </div>
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
    class="flex min-h-8 items-center gap-1.25 self-start text-sm leading-[1.4] text-dimmed italic"
    data-testid="note-add"
    @click="start"
  >
    <UIcon name="i-lucide-pencil" class="size-3 shrink-0" aria-hidden="true" />
    {{ t('lists.doc.noteAdd') }}
  </button>
</template>
