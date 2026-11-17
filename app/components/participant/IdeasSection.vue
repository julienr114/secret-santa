<script setup lang="ts">
import {
  useSaveWishesMutation,
  type WishItem,
} from '~/composables/queries/usePersonal';
import { hostOf } from '#shared/utils/links';

// « Une idée précise, si tu sèches » (README 22.11): the precise ideas of
// the gift hints, one row each, then « Ajouter une idée ». A bottom sheet
// adds or changes one, saved with « Valider »; the server replaces the
// whole list each time.
const props = defineProps<{
  token: string;
  ideas: WishItem[];
  max: number;
  editable: boolean;
}>();
const { t } = useT();
const errorMessage = useErrorMessage();
const toast = useToast();
const save = useSaveWishesMutation(() => props.token);

const LABEL_MAX = 200;

// The list on screen. It follows the server, except while a save is on its
// way: changes show at once and are rolled back if the server refuses.
const list = ref<WishItem[]>([]);
watch(
  () => props.ideas,
  (next) => {
    if (!save.isPending.value) list.value = next;
  },
  { immediate: true },
);
const left = computed(() => props.max - list.value.length);

// The sheet edits one idea: `index` is null for a new one.
const open = ref(false);
const draft = reactive<{ index: number | null; label: string; url: string }>({
  index: null,
  label: '',
  url: '',
});
const isNew = computed(() => draft.index === null);

const push = (next: WishItem[]) => {
  const previous = list.value;
  list.value = next;
  save.mutate(next, {
    onError: (error) => {
      list.value = previous;
      toast.add({ title: errorMessage(error), color: 'error' });
    },
  });
};

// « Valider » saves the idea, if it has a text and something changed;
// closing the sheet any other way gives the change up.
const onValidate = () => {
  const idea = { label: draft.label.trim(), url: draft.url.trim() || null };
  const index = draft.index;
  open.value = false;
  if (!idea.label) return;
  if (index === null) {
    push([...list.value, idea]);
    return;
  }
  const current = list.value[index];
  if (current?.label === idea.label && current.url === idea.url) return;
  push(list.value.map((item, i) => (i === index ? idea : item)));
};

const openSheet = (index: number | null) => {
  const idea = index === null ? null : list.value[index];
  Object.assign(draft, {
    index,
    label: idea?.label ?? '',
    url: idea?.url ?? '',
  });
  open.value = true;
};
const onRemove = () => {
  const index = draft.index;
  open.value = false;
  push(list.value.filter((_, i) => i !== index));
};
</script>

<template>
  <section
    v-if="editable || list.length > 0"
    class="flex flex-col gap-1.5"
    data-testid="hints-ideas"
  >
    <UiSectionTitle>{{ t('hints.ideas.title') }}</UiSectionTitle>
    <ul
      class="-mx-4 divide-y divide-divider border-y border-default bg-default sm:mx-0 sm:overflow-hidden sm:rounded-lg sm:border"
    >
      <UiListItem
        v-for="(idea, index) in list"
        :key="index"
        :title="idea.label"
        :on-click="editable ? () => openSheet(index) : undefined"
        :chevron="editable"
      >
        <template #leading>
          <UiStar :size="16" />
        </template>
        <template v-if="idea.url" #subtitle>
          <UIcon
            name="i-lucide-link"
            class="size-3.5 shrink-0"
            aria-hidden="true"
          />
          <span class="truncate font-semibold text-primary-ink">{{
            hostOf(idea.url)
          }}</span>
        </template>
      </UiListItem>
      <UiListItem
        v-if="editable && left > 0"
        icon="i-lucide-plus"
        :title="t('hints.ideas.add')"
        :subtitle="
          list.length === 0
            ? t('hints.ideas.addHint')
            : t('hints.ideas.left', { count: left })
        "
        :chevron="true"
        :on-click="() => openSheet(null)"
      />
    </ul>
    <p v-if="editable" class="px-1 text-[13px] leading-[1.4] text-toned">
      {{ t('hints.ideas.why') }}
    </p>

    <UiSheet
      v-model:open="open"
      :title="
        isNew
          ? t('participant.wishes.sheet.new')
          : t('participant.wishes.sheet.edit')
      "
      :description="t('participant.wishes.sheet.description')"
    >
      <form
        id="idea-form"
        class="flex flex-col gap-5 py-2"
        novalidate
        @submit.prevent="onValidate"
      >
        <UFormField :label="t('participant.wishes.sheet.idea')">
          <UInput
            v-model="draft.label"
            :maxlength="LABEL_MAX"
            enterkeyhint="done"
            :placeholder="t('participant.wishes.sheet.ideaPlaceholder')"
            size="xl"
            class="w-full"
          />
        </UFormField>
        <UFormField :label="t('participant.wishes.sheet.link')">
          <UInput
            v-model="draft.url"
            inputmode="url"
            autocapitalize="off"
            enterkeyhint="done"
            placeholder="https://…"
            size="xl"
            class="w-full"
          />
        </UFormField>
      </form>
      <template #footer>
        <UButton
          type="submit"
          form="idea-form"
          block
          size="xl"
          class="min-h-12 justify-center font-bold"
          :disabled="!draft.label.trim()"
          :label="t('common.actions.validate')"
        />
        <UButton
          v-if="!isNew"
          block
          variant="ghost"
          color="error"
          icon="i-lucide-trash-2"
          class="min-h-11 justify-center"
          :label="t('participant.wishes.sheet.remove')"
          @click="onRemove"
        />
        <UButton
          v-else
          block
          variant="ghost"
          color="neutral"
          class="min-h-11 justify-center"
          :label="t('common.actions.cancel')"
          @click="open = false"
        />
      </template>
    </UiSheet>
  </section>
</template>
