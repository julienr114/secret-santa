<script setup lang="ts">
import type { SharingOption } from '#server/database/listSharing';
import {
  sharingImpact,
  useListSharingQuery,
  useSaveSharingMutation,
  useShareListMutation,
} from '~/composables/queries/useLists';
import { categoryTint } from '~/utils/categories';

// « Qui verra ta liste ? » (docs/spec/v3/listes.md, V3ListeQui,
// V3ListeQuiModifier, V3ListeQuiLien): my events to tick, « Une autre
// occasion », « Tout le monde, avec le lien ». Public, the link with
// « Copier », « Le message qui accompagne le lien » and « Changer de
// lien » (V3ListeLienChanger). Unticking an event the list is shared in,
// or « Tout le monde » once someone ticked a gift, asks first, with how
// many will lose the list (V3ListeQuiRetirer). « Partager » from a draft,
// « Enregistrer » after. « Celui qui m'a tiré » comes with ticket 107.
const props = defineProps<{
  listId: string;
  /** The list is a draft: the button says « Partager ». */
  draft: boolean;
  /** Its address, for « Copier ». */
  url: string;
}>();
const open = defineModel<boolean>('open', { required: true });
const { t, tk } = useT();
const toast = useMessages();
const errorMessage = useErrorMessage();
const query = useListSharingQuery(
  () => props.listId,
  () => open.value,
);
const save = useSaveSharingMutation(() => props.listId);
const renew = useShareListMutation(() => props.listId);

const options = computed(() => query.data.value?.options ?? []);
const saved = computed(
  () => new Set(options.value.filter((o) => o.checked).map((o) => o.id)),
);
const ticked = ref<Set<string>>(new Set());
/** The events ticked for « Celui qui m'a tiré » only (ticket 107). */
const givers = ref<Set<string>>(new Set());
const isPublic = ref(false);
// What the list holds, each time the sheet opens.
watch(
  () => (open.value ? query.data.value : undefined),
  (data) => {
    if (!data) return;
    ticked.value = new Set(saved.value);
    givers.value = new Set(
      data.options.filter((o) => o.giver).map((o) => o.id),
    );
    isPublic.value = data.isPublic;
  },
  { immediate: true },
);
const ask = (
  over: {
    parties?: Set<string>;
    givers?: Set<string>;
    isPublic?: boolean;
  } = {},
) => {
  const all = over.parties ?? ticked.value;
  const only = over.givers ?? givers.value;
  return {
    parties: [...all].filter((id) => !only.has(id)),
    givers: [...all].filter((id) => only.has(id)),
    isPublic: over.isPublic ?? isPublic.value,
  };
};

/** A narrower sharing waiting for its confirmation. */
const narrowing = ref<{
  title: string;
  lines: string[];
  apply: () => void;
} | null>(null);
const narrowOpen = computed({
  get: () => narrowing.value !== null,
  set: (value) => {
    if (!value) narrowing.value = null;
  },
});
const checking = ref(false);

/**
 * Ticks or unticks an event; unticking one the list is shared in asks
 * first, with its members and those of them who ticked a gift.
 * @param option - The event.
 * @returns Once done or asked.
 */
const onToggle = async (option: SharingOption) => {
  const next = new Set(ticked.value);
  if (!next.has(option.id)) {
    next.add(option.id);
    ticked.value = next;
    return;
  }
  next.delete(option.id);
  if (!saved.value.has(option.id)) {
    ticked.value = next;
    return;
  }
  // Already kept for the one who drew me: nobody else loses it.
  if (givers.value.has(option.id)) {
    ticked.value = next;
    return;
  }
  checking.value = true;
  try {
    const { members, claimers } = await sharingImpact(props.listId, {
      ...ask({ parties: next }),
      from: ask().parties,
    });
    if (members === 0 && claimers === 0) {
      ticked.value = next;
      return;
    }
    narrowing.value = {
      title: t('lists.sharing.narrow.title', { name: option.name }),
      lines: [
        t('lists.sharing.narrow.members', { count: members }),
        claimers > 0 &&
          t('lists.sharing.narrow.claimersOf', { count: claimers }),
      ].filter((line): line is string => Boolean(line)),
      apply: () => {
        ticked.value = next;
      },
    };
  } catch (error) {
    toast.failed(errorMessage(error));
  } finally {
    checking.value = false;
  }
};

/**
 * « Tous les membres » or « Celui qui m'a tiré » in an event where I take
 * part in a Secret Santa; keeping it for the one who drew me asks first,
 * like unticking, when its members saw it.
 * @param option - The event.
 * @param giverOnly - True for « Celui qui m'a tiré ».
 * @returns Once done or asked.
 */
const onAudience = async (option: SharingOption, giverOnly: boolean) => {
  const next = new Set(givers.value);
  if (!giverOnly) {
    next.delete(option.id);
    givers.value = next;
    return;
  }
  next.add(option.id);
  if (!saved.value.has(option.id) || option.giver) {
    givers.value = next;
    return;
  }
  checking.value = true;
  try {
    const { members, claimers } = await sharingImpact(props.listId, {
      ...ask({ givers: next }),
      from: ask().parties,
    });
    if (members === 0 && claimers === 0) {
      givers.value = next;
      return;
    }
    narrowing.value = {
      title: t('lists.sharing.narrow.title', { name: option.name }),
      lines: [
        t('lists.sharing.narrow.members', { count: members }),
        claimers > 0 &&
          t('lists.sharing.narrow.claimersOf', { count: claimers }),
      ].filter((line): line is string => Boolean(line)),
      apply: () => {
        givers.value = next;
      },
    };
  } catch (error) {
    toast.failed(errorMessage(error));
  } finally {
    checking.value = false;
  }
};

/**
 * « Tout le monde, avec le lien »: on at once; off asks first when
 * someone who ticked a gift would lose the list.
 * @param on - The switch.
 * @returns Once done or asked.
 */
const onEveryone = async (on: boolean) => {
  if (on || !query.data.value?.isPublic) {
    isPublic.value = on;
    return;
  }
  checking.value = true;
  try {
    const { claimers } = await sharingImpact(
      props.listId,
      ask({ isPublic: false }),
    );
    if (claimers === 0) {
      isPublic.value = false;
      return;
    }
    narrowing.value = {
      title: t('lists.sharing.narrow.everyoneTitle'),
      lines: [t('lists.sharing.narrow.claimers', { count: claimers })],
      apply: () => {
        isPublic.value = false;
      },
    };
  } catch (error) {
    toast.failed(errorMessage(error));
  } finally {
    checking.value = false;
  }
};

const onNarrow = () => {
  narrowing.value?.apply();
  narrowing.value = null;
};

const onSave = () =>
  save.mutate(ask(), {
    onSuccess: () => {
      open.value = false;
    },
    onError: (error) => toast.failed(errorMessage(error)),
  });

// « Copier » answers where it was touched, for a moment.
const copied = ref(false);
const onCopy = async () => {
  if (!(await copyText(props.url))) {
    toast.failed(t('lists.share.copyFailed'));
    return;
  }
  copied.value = true;
  window.setTimeout(() => {
    copied.value = false;
  }, 2000);
};
const renewing = ref(false);
const onRenew = () =>
  renew.mutate(
    { ask: 'renew' },
    {
      onSuccess: () => {
        renewing.value = false;
        toast.done(t('lists.share.changed'));
      },
      onError: (error) => toast.failed(errorMessage(error)),
    },
  );
</script>

<template>
  <UiSheet
    v-model:open="open"
    :title="t('lists.sharing.title')"
    :busy="save.isPending.value"
  >
    <UiSkeleton
      v-if="query.isPending.value"
      :parts="['icons']"
      :rows="3"
      :label="t('common.loading')"
    />
    <div v-else class="-mx-4 flex flex-col gap-3" data-testid="sharing-sheet">
      <ul class="border-y border-default">
        <li
          v-for="(option, index) in options"
          :key="option.id"
          :class="{ 'border-t border-default': index > 0 }"
        >
          <button
            type="button"
            role="checkbox"
            :aria-checked="ticked.has(option.id)"
            :disabled="checking"
            class="flex min-h-15 w-full items-center gap-3 px-4 py-2 text-left"
            :data-testid="`sharing-event-${option.slug}`"
            @click="onToggle(option)"
          >
            <span
              aria-hidden="true"
              class="flex size-8 shrink-0 items-center justify-center rounded-[9px] text-base"
              :class="categoryTint(option.category)"
              >{{ option.emoji ?? '🎁' }}</span
            >
            <span class="flex min-w-0 grow flex-col gap-px">
              <span class="truncate font-semibold">{{ option.name }}</span>
              <span class="truncate text-[13px] text-toned">{{
                t('lists.sharing.eventLine', {
                  category: tk(`party.category.${option.category}`),
                  count: option.members,
                })
              }}</span>
            </span>
            <span
              aria-hidden="true"
              class="flex size-6 shrink-0 items-center justify-center rounded-full"
              :class="
                ticked.has(option.id)
                  ? 'bg-primary text-inverted'
                  : 'border-2 border-peach-300'
              "
            >
              <UIcon
                v-if="ticked.has(option.id)"
                name="i-lucide-check"
                class="size-4"
              />
            </span>
          </button>
          <div
            v-if="option.drawn && ticked.has(option.id)"
            role="radiogroup"
            :aria-label="
              t('lists.sharing.audienceLabel', { name: option.name })
            "
            class="flex flex-wrap gap-2 pr-4 pb-3.5 pl-16"
          >
            <button
              v-for="choice in [false, true]"
              :key="String(choice)"
              type="button"
              role="radio"
              :aria-checked="givers.has(option.id) === choice"
              :disabled="checking"
              class="h-10 rounded-full px-3.5 text-sm font-bold"
              :class="
                givers.has(option.id) === choice
                  ? 'bg-lilac-100 ring-2 ring-primary'
                  : 'bg-default ring-1 ring-default'
              "
              :data-testid="`sharing-audience-${option.slug}-${choice ? 'giver' : 'all'}`"
              @click="onAudience(option, choice)"
            >
              {{
                choice
                  ? t('lists.sharing.giverOnly')
                  : t('lists.sharing.allMembers')
              }}
            </button>
          </div>
        </li>
        <li :class="{ 'border-t border-default': options.length > 0 }">
          <NuxtLink
            :to="`/e/nouvelle?pour=liste&liste=${listId}`"
            class="flex min-h-15 items-center gap-3 px-4 py-2 font-semibold"
            data-testid="sharing-other"
          >
            <span
              aria-hidden="true"
              class="flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-muted"
            >
              <UIcon name="i-lucide-plus" class="size-5" />
            </span>
            {{ t('lists.sharing.otherOccasion') }}
          </NuxtLink>
        </li>
      </ul>
      <ul class="border-y border-default">
        <UiListItem
          :checked="isPublic"
          :title="t('lists.sharing.everyone')"
          data-testid="sharing-everyone"
          @update:checked="(on) => onEveryone(Boolean(on))"
        />
        <template v-if="isPublic">
          <li class="px-4 pb-3">
            <div
              class="flex items-center gap-2.5 rounded-[18px] bg-muted py-1.5 pr-1.5 pl-3"
            >
              <span
                class="min-w-0 grow truncate text-sm font-semibold"
                data-testid="sharing-link"
                >{{ url.replace(/^https?:\/\//, '') }}</span
              >
              <button
                type="button"
                class="flex h-9 shrink-0 items-center rounded-full bg-default px-3 text-sm font-bold ring-1 ring-default"
                @click="onCopy"
              >
                <span aria-live="polite">{{
                  copied ? t('lists.share.copied') : t('lists.sharing.copy')
                }}</span>
              </button>
            </div>
          </li>
          <UiListItem
            :to="`/listes/${listId}/message`"
            :title="t('lists.sharing.message')"
          />
          <UiListItem
            :title="t('lists.sharing.changeLink')"
            :on-click="() => (renewing = true)"
            data-testid="sharing-renew"
          />
        </template>
      </ul>
    </div>
    <UiSheet
      v-model:open="narrowOpen"
      nested
      :title="narrowing?.title ?? ''"
      :description="narrowing?.lines.join(' ')"
    >
      <template #footer>
        <div class="flex flex-col gap-2" data-testid="sharing-narrow">
          <UButton
            block
            size="xl"
            color="error"
            class="h-13 justify-center text-[17px] font-bold"
            :label="t('lists.sharing.narrow.submit')"
            @click="onNarrow"
          />
          <UButton
            block
            size="xl"
            variant="ghost"
            color="neutral"
            class="h-13 justify-center text-[17px] font-bold"
            :label="t('common.actions.cancel')"
            @click="narrowing = null"
          />
        </div>
      </template>
    </UiSheet>

    <UiSheet
      v-model:open="renewing"
      nested
      :title="t('lists.sharing.renew.title')"
      :description="t('lists.sharing.renew.body')"
      :busy="renew.isPending.value"
    >
      <template #footer>
        <div class="flex flex-col gap-2" data-testid="sharing-renew-confirm">
          <UButton
            block
            size="xl"
            class="h-13 justify-center text-[17px] font-bold"
            :loading="renew.isPending.value"
            :label="t('lists.sharing.renew.submit')"
            @click="onRenew"
          />
          <UButton
            block
            size="xl"
            variant="ghost"
            color="neutral"
            class="h-13 justify-center text-[17px] font-bold"
            :label="t('common.actions.cancel')"
            @click="renewing = false"
          />
        </div>
      </template>
    </UiSheet>
    <template #footer>
      <UButton
        block
        size="xl"
        class="h-13 justify-center text-[17px] font-bold"
        :loading="save.isPending.value"
        :disabled="query.isPending.value || checking"
        :label="draft ? t('lists.sharing.share') : t('lists.sharing.save')"
        data-testid="sharing-save"
        @click="onSave"
      />
    </template>
  </UiSheet>
</template>
