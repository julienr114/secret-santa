<script setup lang="ts">
import {
  usePersonalQuery,
  useSaveWishesMutation,
  useWishesQuery,
  type WishItem,
} from '~/composables/queries/usePersonal';

// The participant's own wish list (README 6 bis.4), built like the other
// lists of the app: one row per idea, and a bottom sheet to add or change
// one, saved with "Valider". The server replaces the whole list each time.
const route = useRoute();
const token = computed(() => String(route.params.token));
const query = useWishesQuery(token);
const save = useSaveWishesMutation(token);
// Which draw the list belongs to: it can be opened straight from home.
const personal = usePersonalQuery(token);
const drawName = computed(() =>
  personal.data.value
    ? `${personal.data.value.groupName} · ${personal.data.value.editionLabel}`
    : null,
);
const { t } = useT();
const errorMessage = useErrorMessage();

const LABEL_MAX = 200;
const toast = useToast();
const maxWishes = computed(() => query.data.value?.maxWishes ?? 10);
const editable = computed(() => query.data.value?.editable ?? false);

// The list on screen. It follows the server, except while a save is on its
// way: changes show at once and are rolled back if the server refuses.
const wishes = ref<WishItem[]>([]);
watch(
  () => query.data.value,
  (data) => {
    if (data && !save.isPending.value) wishes.value = data.wishes;
  },
  { immediate: true },
);
const canAdd = computed(() => wishes.value.length < maxWishes.value);

// The sheet edits one idea: `index` is null for a new one.
const open = ref(false);
const draft = reactive<{ index: number | null; label: string; url: string }>({
  index: null,
  label: '',
  url: '',
});
const isNew = computed(() => draft.index === null);
const canValidate = computed(() => draft.label.trim().length > 0);
const sheetTitle = computed(() =>
  isNew.value
    ? t('participant.wishes.sheet.new')
    : t('participant.wishes.sheet.edit'),
);

const push = (next: WishItem[]) => {
  const previous = wishes.value;
  wishes.value = next;
  save.mutate(next, {
    onError: (error) => {
      wishes.value = previous;
      toast.add({ title: errorMessage(error), color: 'error' });
    },
  });
};

// "Valider" saves the idea, if it has a text and something changed;
// closing the sheet any other way gives the change up.
const onValidate = () => {
  const wish = { label: draft.label.trim(), url: draft.url.trim() || null };
  const index = draft.index;
  close();
  if (!wish.label) return;
  if (index === null) {
    push([...wishes.value, wish]);
    return;
  }
  const current = wishes.value[index];
  if (current?.label === wish.label && current.url === wish.url) return;
  push(wishes.value.map((w, i) => (i === index ? wish : w)));
};

const openSheet = (index: number | null) => {
  const wish = index === null ? null : wishes.value[index];
  Object.assign(draft, {
    index,
    label: wish?.label ?? '',
    url: wish?.url ?? '',
  });
  open.value = true;
};
const close = () => {
  open.value = false;
};
const onRemove = () => {
  const index = draft.index;
  close();
  push(wishes.value.filter((_, i) => i !== index));
};
</script>

<template>
  <ParticipantScreen
    :token="token"
    :back="`/p/${token}`"
    :pending="query.isPending.value"
    :error="query.error.value"
  >
    <div>
      <p v-if="drawName" class="text-sm text-muted" data-testid="draw-name">
        {{ drawName }}
      </p>
      <UiPageTitle>
        {{ t('participant.wishes.title') }}
      </UiPageTitle>
    </div>
    <p class="text-sm text-muted">
      {{
        editable
          ? t('participant.wishes.intro')
          : t('participant.wishes.readOnly')
      }}
    </p>

    <UiList
      :title="
        wishes.length > 0
          ? t('common.count.ideas', { count: wishes.length })
          : undefined
      "
      :footer="
        editable && !canAdd
          ? t('participant.wishes.max', { count: maxWishes })
          : undefined
      "
    >
      <li v-if="wishes.length === 0" class="px-4 py-3 text-sm text-muted">
        {{
          editable
            ? t('participant.wishes.empty')
            : t('participant.wishes.emptyReadOnly')
        }}
      </li>
      <UiListItem
        v-for="(wish, index) in wishes"
        :key="index"
        emoji="🎁"
        :title="wish.label"
        :subtitle="wish.url ?? undefined"
        :on-click="editable ? () => openSheet(index) : undefined"
      >
        <template v-if="editable" #trailing>
          <UIcon
            name="i-lucide-pencil"
            class="size-4 shrink-0 text-dimmed"
            aria-hidden="true"
          />
        </template>
        <template v-else-if="wish.url" #trailing>
          <UButton
            :to="wish.url"
            target="_blank"
            rel="noopener noreferrer nofollow"
            variant="ghost"
            color="neutral"
            icon="i-lucide-external-link"
            :aria-label="
              t('participant.wishes.openLink', { label: wish.label })
            "
          />
        </template>
      </UiListItem>
      <UiListItem
        v-if="editable && canAdd"
        icon="i-lucide-plus"
        :title="t('participant.wishes.add')"
        @click="openSheet(null)"
      />
    </UiList>

    <UDrawer
      v-model:open="open"
      :title="sheetTitle"
      :description="t('participant.wishes.sheet.description')"
    >
      <template #body>
        <form
          id="wish-form"
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
              class="w-full"
            />
          </UFormField>
        </form>
      </template>
      <template #footer>
        <UButton
          type="submit"
          form="wish-form"
          block
          :disabled="!canValidate"
          :label="t('common.actions.validate')"
        />
        <UButton
          v-if="!isNew"
          block
          variant="ghost"
          color="error"
          icon="i-lucide-trash-2"
          :label="t('participant.wishes.sheet.remove')"
          @click="onRemove"
        />
      </template>
    </UDrawer>
  </ParticipantScreen>
</template>
