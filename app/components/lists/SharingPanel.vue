<script setup lang="ts">
import type { SharingOption } from '#server/database/listSharing';
import {
  sharingImpact,
  useListSharingQuery,
  useSaveSharingMutation,
  useShareListMutation,
} from '~/composables/queries/useLists';
import { categoryTint } from '~/utils/categories';

// « Qui verra ta liste ? », inside the bar of a list once unrolled
// (docs/spec/v3/listes.md, V3ListeQui, V3ListeQuiModifier,
// V3ListeQuiSecret, V3ListeQuiLien): my events to tick, « Tous les
// membres » or « Celui qui m'a tiré » under one where I take part in a
// Secret Santa, « Une autre occasion », « Inviter quelqu'un » (once the
// list is shared with all the members of its own event), « Tout le monde,
// avec le lien ». Public, « Le message qui accompagne le lien »; « Changer
// de lien » for any list. Unticking an event the list is shared in, or
// « Tout le monde » once someone ticked a gift, asks first, with how many
// will lose the list (V3ListeQuiRetirer); so does « Changer de lien »
// (V3ListeLienChanger). The question takes the place of what follows it,
// the button included. « Partager » from a draft, « Enregistrer » after:
// it saves, then the bar folds (`done`).
const props = defineProps<{
  listId: string;
  /** The list is a draft: the button says « Partager ». */
  draft: boolean;
}>();
const emit = defineEmits<{ done: [] }>();
const { t, tk } = useT();
const toast = useMessages();
const errorMessage = useErrorMessage();
const query = useListSharingQuery(
  () => props.listId,
  () => true,
);
const save = useSaveSharingMutation(() => props.listId);
const renew = useShareListMutation(() => props.listId);

const options = computed(() => query.data.value?.options ?? []);
const saved = computed(
  () => new Set(options.value.filter((o) => o.checked).map((o) => o.id)),
);
const ticked = ref<Set<string>>(new Set());
/** The events ticked for « Celui qui m'a tiré » only. */
const givers = ref<Set<string>>(new Set());
const isPublic = ref(false);
// What the list holds, once, when the panel opens: a later refetch does
// not undo what was just changed.
const ready = ref(false);
watch(
  () => query.data.value,
  (data) => {
    if (!data || ready.value) return;
    ticked.value = new Set(saved.value);
    givers.value = new Set(
      data.options.filter((o) => o.giver).map((o) => o.id),
    );
    isPublic.value = data.isPublic;
    ready.value = true;
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

/**
 * A question before a step: narrowing the sharing, or a new link. It
 * shows under the events (`events`) or under « Tout le monde »
 * (`everyone`), in the place of what follows.
 */
const confirm = ref<{
  at: 'events' | 'everyone';
  title: string;
  lines: string[];
  submit: string;
  /** Takes the step, and closes the question once taken. */
  apply: () => void;
} | null>(null);
const checking = ref(false);
const confirmBox = useTemplateRef<HTMLElement>('confirmBox');
// The question takes the focus: what was touched is gone below it.
watch(confirmBox, (box) => box?.querySelector<HTMLElement>('button')?.focus());

/**
 * Asks before giving the list to fewer people, when someone loses it.
 * @param option - The event narrowed.
 * @param next - The sharing asked.
 * @param apply - Takes it.
 * @returns Once taken or asked.
 */
const narrow = async (
  option: SharingOption,
  next: ReturnType<typeof ask>,
  apply: () => void,
) => {
  checking.value = true;
  try {
    const { members, claimers } = await sharingImpact(props.listId, {
      ...next,
      from: ask().parties,
    });
    if (members === 0 && claimers === 0) {
      apply();
      return;
    }
    confirm.value = {
      at: 'events',
      title: t('lists.sharing.narrow.title', { name: option.name }),
      lines: [
        t('lists.sharing.narrow.members', { count: members }),
        claimers > 0 &&
          t('lists.sharing.narrow.claimersOf', { count: claimers }),
      ].filter((line): line is string => Boolean(line)),
      submit: t('lists.sharing.narrow.submit'),
      apply: () => {
        apply();
        confirm.value = null;
      },
    };
  } catch (error) {
    toast.failed(errorMessage(error));
  } finally {
    checking.value = false;
  }
};

/**
 * Ticks or unticks an event; unticking one the list is shared in asks
 * first, with its members and those of them who ticked a gift.
 * @param option - The event.
 * @returns Once done or asked.
 */
const onToggle = async (option: SharingOption) => {
  const next = new Set(ticked.value);
  const apply = () => {
    ticked.value = next;
  };
  if (!next.has(option.id)) {
    next.add(option.id);
    apply();
    return;
  }
  next.delete(option.id);
  // Not saved yet, or kept for the one who drew me: nobody loses it.
  if (!saved.value.has(option.id) || givers.value.has(option.id)) {
    apply();
    return;
  }
  await narrow(option, ask({ parties: next }), apply);
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
  const apply = () => {
    givers.value = next;
  };
  if (!giverOnly) {
    next.delete(option.id);
    apply();
    return;
  }
  next.add(option.id);
  if (!saved.value.has(option.id) || option.giver) {
    apply();
    return;
  }
  await narrow(option, ask({ givers: next }), apply);
};

/**
 * « Tout le monde, avec le lien »: on at once; off asks first when
 * someone who ticked a gift would lose the list.
 * @param on - The switch.
 * @returns Once done or asked.
 */
const onEveryone = async (on: boolean) => {
  const apply = () => {
    isPublic.value = on;
  };
  if (on || !query.data.value?.isPublic) {
    apply();
    return;
  }
  checking.value = true;
  try {
    const { claimers } = await sharingImpact(
      props.listId,
      ask({ isPublic: false }),
    );
    if (claimers === 0) {
      apply();
      return;
    }
    confirm.value = {
      at: 'everyone',
      title: t('lists.sharing.narrow.everyoneTitle'),
      lines: [t('lists.sharing.narrow.claimers', { count: claimers })],
      submit: t('lists.sharing.narrow.submit'),
      apply: () => {
        apply();
        confirm.value = null;
      },
    };
  } catch (error) {
    toast.failed(errorMessage(error));
  } finally {
    checking.value = false;
  }
};

const onRenew = () => {
  confirm.value = {
    at: 'everyone',
    title: t('lists.sharing.renew.title'),
    lines: [t('lists.sharing.renew.body')],
    submit: t('lists.sharing.renew.submit'),
    apply: () =>
      renew.mutate(
        { ask: 'renew' },
        {
          onSuccess: () => {
            confirm.value = null;
            toast.done(t('lists.share.changed'));
          },
          onError: (error) => toast.failed(errorMessage(error)),
        },
      ),
  };
};

const onSave = () =>
  save.mutate(ask(), {
    onSuccess: () => emit('done'),
    onError: (error) => toast.failed(errorMessage(error)),
  });

/** The two choices under an event where I take part in a Secret Santa. */
const audiences = computed(() => [
  { value: 'all' as const, label: t('lists.sharing.allMembers') },
  { value: 'giver' as const, label: t('lists.sharing.giverOnly') },
]);
/** A row that leads elsewhere, from the bar. */
const LINK_ROW =
  'flex min-h-14 items-center gap-3 border-t border-default px-3.5 py-1.5 font-semibold';
</script>

<template>
  <div class="flex flex-col gap-2.5" data-testid="sharing-panel">
    <h2 class="px-3.5 pt-1 text-lg font-bold">
      {{ t('lists.sharing.title') }}
    </h2>
    <UiSkeleton
      v-if="!ready"
      :parts="['icons']"
      :rows="3"
      :label="t('common.loading')"
    />
    <template v-else>
      <ul class="border-y border-default">
        <template v-for="(option, index) in options" :key="option.id">
          <li>
            <button
              type="button"
              role="checkbox"
              :aria-checked="ticked.has(option.id)"
              :disabled="checking || confirm !== null"
              class="flex min-h-14 w-full items-center gap-3 px-3.5 py-1.5 text-left"
              :class="{ 'border-t border-default': index > 0 }"
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
          </li>
          <li
            v-if="option.drawn && ticked.has(option.id)"
            class="mr-3.5 mb-3 ml-14.5"
            :data-testid="`sharing-audience-${option.slug}`"
          >
            <!-- Remade when a question closes: the radio the browser
                 ticked goes back to what is kept. -->
            <UiSegmented
              :key="String(confirm === null)"
              :model-value="givers.has(option.id) ? 'giver' : 'all'"
              :items="audiences"
              :label="t('lists.sharing.audienceLabel', { name: option.name })"
              @update:model-value="
                (choice) => onAudience(option, choice === 'giver')
              "
            />
          </li>
        </template>
        <li>
          <NuxtLink
            :to="`/e/nouvelle?pour=liste&liste=${listId}`"
            :class="[LINK_ROW, { 'border-t-0': options.length === 0 }]"
            data-testid="sharing-other"
          >
            <span
              aria-hidden="true"
              class="flex size-8 shrink-0 items-center justify-center rounded-[9px] border-[1.5px] border-dashed border-peach-300 text-primary"
            >
              <UIcon name="i-lucide-plus" class="size-4" />
            </span>
            <span class="grow">{{ t('lists.sharing.otherOccasion') }}</span>
            <UIcon
              name="i-lucide-chevron-right"
              class="size-4.5 shrink-0 text-dimmed"
            />
          </NuxtLink>
        </li>
        <li v-if="query.data.value?.invite">
          <NuxtLink
            :to="`/listes/${listId}/inviter`"
            :class="LINK_ROW"
            data-testid="sharing-invite"
          >
            <span
              aria-hidden="true"
              class="flex size-8 shrink-0 items-center justify-center rounded-[9px] border-[1.5px] border-peach-300 text-primary"
            >
              <UIcon name="i-lucide-user-plus" class="size-4" />
            </span>
            <span class="grow">{{ t('lists.sharing.invite') }}</span>
            <UIcon
              name="i-lucide-chevron-right"
              class="size-4.5 shrink-0 text-dimmed"
            />
          </NuxtLink>
        </li>
      </ul>
      <template v-if="confirm?.at !== 'events'">
        <div
          class="flex min-h-13 items-center gap-3 px-3.5"
          data-testid="sharing-everyone"
        >
          <UIcon
            name="i-lucide-globe"
            class="size-5 shrink-0"
            :class="isPublic ? 'text-success' : 'text-toned'"
          />
          <span class="grow font-semibold">{{
            t('lists.sharing.everyone')
          }}</span>
          <USwitch
            :model-value="isPublic"
            :disabled="checking || confirm !== null"
            size="lg"
            color="success"
            :aria-label="t('lists.sharing.everyone')"
            class="flex min-h-11 shrink-0 items-center"
            @update:model-value="(on) => onEveryone(Boolean(on))"
          />
        </div>
        <template v-if="!confirm">
          <ul class="border-y border-default">
            <li v-if="isPublic">
              <NuxtLink
                :to="`/listes/${listId}/message`"
                :class="[LINK_ROW, 'min-h-13 border-t-0']"
              >
                <span class="grow">{{ t('lists.sharing.message') }}</span>
                <UIcon
                  name="i-lucide-chevron-right"
                  class="size-4.5 shrink-0 text-dimmed"
                />
              </NuxtLink>
            </li>
            <li>
              <button
                type="button"
                :class="[
                  LINK_ROW,
                  'min-h-13 w-full text-left',
                  { 'border-t-0': !isPublic },
                ]"
                data-testid="sharing-renew"
                @click="onRenew"
              >
                <span class="grow">{{ t('lists.sharing.changeLink') }}</span>
                <UIcon
                  name="i-lucide-chevron-right"
                  class="size-4.5 shrink-0 text-dimmed"
                />
              </button>
            </li>
          </ul>
          <div class="px-2">
            <UButton
              block
              size="xl"
              class="h-12 justify-center rounded-md text-base font-bold"
              :loading="save.isPending.value"
              :disabled="checking"
              :label="
                draft ? t('lists.sharing.share') : t('lists.sharing.save')
              "
              data-testid="sharing-save"
              @click="onSave"
            />
          </div>
        </template>
      </template>
      <div
        v-if="confirm"
        ref="confirmBox"
        role="alertdialog"
        :aria-label="confirm.title"
        class="mx-2 flex flex-col gap-2.5 rounded-xl p-3.5 ring-1 ring-default"
        data-testid="sharing-confirm"
      >
        <h3 class="font-display text-lg font-bold">{{ confirm.title }}</h3>
        <p class="text-sm leading-[1.45]">{{ confirm.lines.join(' ') }}</p>
        <div class="flex gap-2">
          <UButton
            color="neutral"
            variant="outline"
            class="h-11 flex-1 rounded-md justify-center text-[15px] font-bold"
            :label="t('common.actions.cancel')"
            @click="confirm = null"
          />
          <UButton
            variant="outline"
            class="h-11 flex-1 rounded-md justify-center text-[15px] font-bold"
            :loading="renew.isPending.value"
            :label="confirm.submit"
            @click="confirm.apply()"
          />
        </div>
      </div>
    </template>
  </div>
</template>
