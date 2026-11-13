<script setup lang="ts">
import {
  useSaveWishesMutation,
  useWishesQuery,
  type WishItem,
} from '~/composables/queries/usePersonal';
import { errorMessage } from '~/utils/errors';
import { plural } from '~/utils/labels';

// The participant's own wish list (README 6 bis.4), built like the other
// lists of the app: one row per idea, and a bottom sheet to add or change
// one. Every change is saved at once; the server replaces the whole list.
const route = useRoute();
const token = computed(() => String(route.params.token));
const query = useWishesQuery(token);
const save = useSaveWishesMutation(token);

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
const sheetTitle = computed(() =>
  isNew.value ? 'Nouvelle idée' : 'Modifier l’idée',
);

const push = (next: WishItem[]) => {
  const previous = wishes.value;
  wishes.value = next;
  save.mutate(next, {
    onError: (error) => {
      wishes.value = previous;
      if (draft.index !== null && draft.index >= previous.length) {
        draft.index = null;
      }
      toast.add({ title: errorMessage(error), color: 'error' });
    },
  });
};

// No save button: the idea is saved when a field loses focus and when the
// sheet closes, if it has a text and something changed.
const commit = () => {
  const wish = { label: draft.label.trim(), url: draft.url.trim() || null };
  if (!wish.label) return;
  if (draft.index === null) {
    draft.index = wishes.value.length;
    push([...wishes.value, wish]);
    return;
  }
  const current = wishes.value[draft.index];
  if (current?.label === wish.label && current.url === wish.url) return;
  push(wishes.value.map((w, i) => (i === draft.index ? wish : w)));
};
watch(open, (isOpen) => {
  if (!isOpen) commit();
});

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
  // Emptied first, so that closing the sheet does not save it back.
  Object.assign(draft, { index: null, label: '', url: '' });
  close();
  push(wishes.value.filter((_, i) => i !== index));
};
</script>

<template>
  <ParticipantScreen
    :back="`/p/${token}`"
    :pending="query.isPending.value"
    :error="query.error.value"
  >
    <h1 class="font-display text-3xl font-bold">Ma liste de souhaits</h1>
    <p class="text-sm text-muted">
      <template v-if="editable">
        Quelques idées pour aider la personne qui t'offre un cadeau. Elle seule
        les verra.
      </template>
      <template v-else>
        La liste n'est plus modifiable pour cette édition.
      </template>
    </p>

    <MobileList
      :title="wishes.length > 0 ? plural(wishes.length, 'idée') : undefined"
      :footer="editable && !canAdd ? `${maxWishes} idées au plus.` : undefined"
    >
      <li v-if="wishes.length === 0" class="px-4 py-3 text-sm text-muted">
        {{
          editable
            ? 'Aucune idée pour l’instant.'
            : "Tu n'avais noté aucune idée."
        }}
      </li>
      <MobileListItem
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
            :aria-label="`Ouvrir le lien de « ${wish.label} »`"
          />
        </template>
      </MobileListItem>
      <MobileListItem
        v-if="editable && canAdd"
        icon="i-lucide-plus"
        title="Ajouter une idée"
        @click="openSheet(null)"
      />
    </MobileList>

    <UDrawer
      v-model:open="open"
      :title="sheetTitle"
      description="Une idée courte, et un lien si tu en as un. C'est enregistré tout seul."
    >
      <template #body>
        <form
          class="flex flex-col gap-5 py-2"
          novalidate
          @submit.prevent="close"
        >
          <UFormField label="Idée">
            <UInput
              v-model="draft.label"
              :maxlength="LABEL_MAX"
              enterkeyhint="done"
              placeholder="Un livre, des chaussettes…"
              class="w-full"
              @blur="commit"
            />
          </UFormField>
          <UFormField label="Lien (facultatif)">
            <UInput
              v-model="draft.url"
              inputmode="url"
              autocapitalize="off"
              enterkeyhint="done"
              placeholder="https://…"
              class="w-full"
              @blur="commit"
            />
          </UFormField>
          <!-- Lets the keyboard's "done" key close the sheet. -->
          <button type="submit" class="sr-only" tabindex="-1">Terminé</button>
        </form>
      </template>
      <template v-if="!isNew" #footer>
        <UButton
          block
          variant="ghost"
          color="error"
          icon="i-lucide-trash-2"
          label="Supprimer l’idée"
          @click="onRemove"
        />
      </template>
    </UDrawer>
  </ParticipantScreen>
</template>
