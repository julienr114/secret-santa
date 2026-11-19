<script setup lang="ts">
import type { IdeaLine } from '#server/http/lists';
import { formatEventDate } from '#server/utils/rules';
import {
  LIST_COLORS,
  LIST_ICON_GROUP_KEYS,
  LIST_ICON_GROUPS,
  LIST_TITLE_MAX,
  isWorthKeeping,
} from '#server/utils/lists';
import {
  useDeleteListMutation,
  useListQuery,
  useUpdateListMutation,
} from '~/composables/queries/useLists';
import { LIST_EDITING, type LineActions } from '~/composables/useListEditing';
import { LIST_SHADES } from '~/utils/listShades';

// The document of a list, for the one who holds it (README 22.19,
// maquettes ListeNouvelle, ListeTeneur, ListeIdee, ListeIcone). A
// document, not a form: one button on top says its state and leads to
// sharing it; then its square tile, its name, its day, the word for the
// family, the people and their ideas, « Ajouter quelqu'un ». Every text
// changes by touching it, and is saved as it is left: no « Enregistrer ».
// Left without a name and without anyone, a draft is not kept.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const id = computed(() => String(route.params.id));
const { t, tk, locale } = useT();
const query = useListQuery(id);
const update = useUpdateListMutation(id);
const remove = useDeleteListMutation();
const doc = computed(() => query.data.value);
const list = computed(() => doc.value?.list);
useHead({
  title: () =>
    `${list.value?.title || t('lists.doc.titlePlaceholder')} — ${t('common.appName')}`,
});

// The name, written in place.
const title = ref('');
watch(
  () => list.value?.title,
  (value) => {
    title.value = value ?? '';
  },
  { immediate: true },
);
const titleField = ref<{ textareaRef?: HTMLTextAreaElement } | null>(null);
const saveTitle = () => {
  const value = title.value.replace(/\s+/g, ' ').trim();
  if (value !== (list.value?.title ?? '')) update.mutate({ title: value });
};
onMounted(async () => {
  await query.suspense();
  if (route.query.nouvelle && !list.value?.title) {
    titleField.value?.textareaRef?.focus();
  }
});

// The day.
const dateOpen = ref(false);
const dateLine = computed(() =>
  list.value?.eventDate
    ? t('lists.home.on', {
        date: formatEventDate(list.value.eventDate, locale.value),
      })
    : '',
);
const onDate = (date: string) => {
  dateOpen.value = false;
  update.mutate({ eventDate: date || null });
};

// The icon, on its square tile.
const iconOpen = ref(false);
const families = computed(() =>
  LIST_ICON_GROUP_KEYS.map((key) => ({
    key,
    label: tk(`lists.icon.groups.${key}`),
    emojis: LIST_ICON_GROUPS[key],
  })),
);
const colors = computed(() =>
  LIST_COLORS.map((key) => ({
    key,
    label: tk(`lists.icon.colors.${key}`),
    ...LIST_SHADES[key],
  })),
);
const onIcon = (icon: { emoji: string; color: string }) => {
  iconOpen.value = false;
  update.mutate({ icon });
};

// The line being written, the bar above the keyboard, and what it asks.
// Shallow: the line compares its own actions with the one active.
const active = shallowRef<LineActions | null>(null);
const confirm = ref<((ok: boolean) => void) | null>(null);
const linkAsk = ref<{
  url: string;
  answer: (url: string | null | undefined) => void;
} | null>(null);
provide(LIST_EDITING, {
  active,
  confirmRemove: () =>
    new Promise<boolean>((resolve) => {
      confirm.value = resolve;
    }),
  askLink: (current) =>
    new Promise((resolve) => {
      linkAsk.value = { url: current ?? '', answer: resolve };
    }),
  change: (idea, forName) => {
    changing.value = { idea, forName };
  },
  join: (idea, forName) => {
    joining.value = { idea, forName };
  },
});
// The sheets of what the holder gives: « Changer » and « Se joindre », the
// same as by the link (README 22.19). They follow the list as it is
// refetched.
const via = computed(() => ({ listId: id.value }));
const changing = ref<{ idea: IdeaLine; forName: string } | null>(null);
const joining = ref<{ idea: IdeaLine; forName: string } | null>(null);
const changeOpen = computed({
  get: () => changing.value !== null,
  set: (open) => {
    if (!open) changing.value = null;
  },
});
const joinOpen = computed({
  get: () => joining.value !== null,
  set: (open) => {
    if (!open) joining.value = null;
  },
});
watch(
  () => query.data.value,
  (current) => {
    const fresh = (ideaId: string) =>
      current?.people.flatMap((p) => p.ideas).find((i) => i.id === ideaId);
    if (changing.value) {
      const idea = fresh(changing.value.idea.id);
      changing.value = idea?.mine ? { ...changing.value, idea } : null;
    }
    if (joining.value) {
      const idea = fresh(joining.value.idea.id);
      if (idea) joining.value = { ...joining.value, idea };
    }
  },
);
const confirmOpen = computed({
  get: () => confirm.value !== null,
  set: (open) => {
    if (!open) answerConfirm(false);
  },
});
const answerConfirm = (ok: boolean) => {
  confirm.value?.(ok);
  confirm.value = null;
};
const linkOpen = computed({
  get: () => linkAsk.value !== null,
  set: (open) => {
    if (!open) answerLink(undefined);
  },
});
const linkUrl = computed(() => linkAsk.value?.url ?? '');
const onLink = (url: string) => answerLink(url.trim() || null);
const answerLink = (url: string | null | undefined) => {
  linkAsk.value?.answer(url);
  linkAsk.value = null;
};

// A draft left with nothing in it goes, once the list itself is left.
onBeforeRouteLeave((to) => {
  const current = doc.value;
  // Its own pages (sharing it, a person's tastes) are still the list.
  const within =
    to.path.startsWith(`/listes/${id.value}/`) ||
    to.path.startsWith('/famille/');
  if (
    current &&
    !within &&
    current.list.status === 'draft' &&
    !isWorthKeeping({
      title: title.value,
      peopleCount: current.people.length,
    })
  ) {
    remove.mutate(current.list.id);
  }
});
</script>

<template>
  <AdminScreen back="/listes">
    <AdminQueryState
      :pending="query.isPending.value"
      :error="query.error.value"
      :skeleton="['card', 'title', 'card']"
    >
      <template v-if="doc && list">
        <NuxtLink
          :to="`/listes/${list.id}/partager`"
          class="-mt-1 flex min-h-13 items-center gap-2.5 rounded-full bg-default py-1.5 pr-1.5 pl-4 ring-1 ring-default"
          data-testid="list-state"
        >
          <span
            class="size-2.5 shrink-0 rounded-full"
            :class="list.status === 'draft' ? 'bg-line-strong' : 'bg-success'"
            aria-hidden="true"
          />
          <span class="grow text-[15px] font-semibold">{{
            list.status === 'draft'
              ? t('lists.doc.draft')
              : list.status === 'past'
                ? t('lists.doc.past')
                : t('lists.doc.shared')
          }}</span>
          <span
            v-if="list.status === 'draft'"
            class="flex h-10 items-center gap-1.5 rounded-full bg-primary px-4 font-bold text-inverted"
          >
            <UIcon name="i-lucide-send" class="size-4" />
            {{ t('lists.doc.share') }}
          </span>
          <span
            v-else
            class="flex h-10 items-center gap-1 px-3 font-bold text-primary-ink"
          >
            {{ t('lists.doc.link') }}
            <UIcon name="i-lucide-chevron-right" class="size-4" />
          </span>
        </NuxtLink>

        <div class="flex flex-col gap-2">
          <button
            type="button"
            class="relative self-start"
            :aria-label="t('lists.doc.changeIcon')"
            data-testid="list-icon"
            @click="iconOpen = true"
          >
            <ListsTile :icon="list.icon" size="lg" />
            <span
              class="absolute -right-2 -bottom-2 flex size-7 items-center justify-center rounded-full bg-default ring-1 ring-default"
              aria-hidden="true"
            >
              <UIcon name="i-lucide-pencil" class="size-3.5" />
            </span>
          </button>
          <UTextarea
            ref="titleField"
            v-model="title"
            autoresize
            :rows="1"
            :maxlength="LIST_TITLE_MAX"
            variant="none"
            :placeholder="t('lists.doc.titlePlaceholder')"
            :aria-label="t('lists.doc.titleLabel')"
            class="w-full"
            :ui="{
              base: 'p-0 font-display text-[36px] leading-[1.1] font-bold placeholder:text-dimmed',
            }"
            data-testid="list-title"
            @keydown.enter.prevent="($event.target as HTMLElement).blur()"
            @blur="saveTitle"
          />
          <button
            type="button"
            class="self-start text-[15px]"
            :class="
              list.eventDate ? 'text-toned' : 'font-semibold text-primary-ink'
            "
            data-testid="list-date"
            @click="dateOpen = true"
          >
            {{ dateLine || t('lists.doc.addDate') }}
          </button>
        </div>

        <ListsNote :list-id="list.id" :note="list.note" />

        <div
          v-if="doc.people.length > 0"
          class="flex flex-col gap-0.5 text-sm text-toned"
        >
          <p v-if="doc.planned > 0">
            {{ t('lists.doc.plannedHolder', { count: doc.planned }) }}
          </p>
          <p>{{ t('lists.doc.touchToEdit') }}</p>
        </div>

        <ListsPersonSection
          v-for="person in doc.people"
          :key="person.id"
          :list-id="list.id"
          :person="person"
        />

        <ListsAddSomeone
          :list-id="list.id"
          :family="doc.family"
          :on-list="doc.people"
        />
        <div class="h-12" aria-hidden="true" />
      </template>
    </AdminQueryState>

    <ListsLineBar />
    <AdminDateSheet
      v-if="list"
      v-model:open="dateOpen"
      :title="t('lists.doc.date')"
      :description="t('lists.doc.dateHelp')"
      :label="t('lists.doc.date')"
      :value="list.eventDate ?? ''"
      :clear-label="t('lists.doc.noDate')"
      @validate="onDate"
    />
    <UiIconSheet
      v-if="list"
      v-model:open="iconOpen"
      :initial="list.icon"
      :title="t('lists.doc.iconTitle')"
      :families="families"
      :colors="colors"
      shape="square"
      @validate="onIcon"
    />
    <UiSheet
      v-model:open="confirmOpen"
      :title="t('lists.doc.confirmRemove.title')"
      :description="t('lists.doc.confirmRemove.body')"
    >
      <template #footer>
        <div class="grid grid-cols-2 gap-2.5">
          <UButton
            variant="outline"
            color="neutral"
            class="h-12 justify-center font-semibold"
            :label="t('lists.doc.confirmRemove.keep')"
            @click="answerConfirm(false)"
          />
          <UButton
            color="error"
            class="h-12 justify-center font-bold"
            :label="t('lists.doc.confirmRemove.remove')"
            @click="answerConfirm(true)"
          />
        </div>
      </template>
    </UiSheet>
    <ListsClaimSheet
      v-if="changing"
      v-model:open="changeOpen"
      :via="via"
      :idea="changing.idea"
      :for-name="changing.forName"
    />
    <ListsJoinSheet
      v-if="joining"
      v-model:open="joinOpen"
      :via="via"
      :idea="joining.idea"
      :for-name="joining.forName"
    />
    <UiTextSheet
      v-if="linkAsk"
      v-model:open="linkOpen"
      :title="t('lists.doc.linkSheet.title')"
      :label="t('lists.doc.linkSheet.label')"
      :value="linkUrl"
      :maxlength="2000"
      placeholder="https://…"
      :validate-label="t('common.actions.validate')"
      :cancel-label="t('common.actions.cancel')"
      @validate="onLink"
    />
  </AdminScreen>
</template>
