<script setup lang="ts">
import type { SharingOption } from '#server/database/listSharing';
import {
  linkLetsIn,
  listStage,
  sharingAsk,
  sharingView,
  type SharingAsk,
} from '#server/utils/listSharing';
import type { ShareQuestion } from '~/components/lists/ShareConfirm.vue';
import {
  sharingImpact,
  useListSharingQuery,
  useSaveSharingMutation,
  useUnlinkDrawMutation,
} from '~/composables/queries/useLists';

// « Qui voit ta liste ? », the first level of the bar of a list once
// unrolled (docs/spec/v3/listes.md, tickets 139 and 141; V3ListeQui,
// V3ListeQuiModifier, V3ListeQuiAjouter, V3ListeQuiSecret,
// V3ListeQuiLien): « Qui je veux » or « Tout le monde ». Under « Qui je
// veux », only those who see the list, each with a cross; « Ajouter »
// unrolls the rest in pills, « Quelqu'un d'autre » among them, which
// takes the bar one level further (`someone-else`). Each gesture is saved
// at once. Removing members who lose the list, opening it to everyone,
// coming back from everyone when someone ticked, and « Changer de lien »
// ask first, one level further too (`ask`). Smaller than the rest of the
// app, what is touched keeping 44 px (« Tout y est un peu plus petit »).
const props = defineProps<{ listId: string }>();
const emit = defineEmits<{
  'someone-else': [];
  /** A question before a step, and what was touched to ask it. */
  ask: [question: ShareQuestion, from: string];
}>();
/** « Ajouter » unrolled; null until touched: open while nobody sees it. */
const adding = defineModel<boolean | null>('adding', { required: true });
const { t } = useT();
const toast = useMessages();
const errorMessage = useErrorMessage();
const query = useListSharingQuery(
  () => props.listId,
  () => true,
);
const save = useSaveSharingMutation(() => props.listId);
const unlink = useUnlinkDrawMutation(() => props.listId);

// The gesture being saved shows at once.
const pending = ref<SharingAsk | null>(null);
const options = computed<SharingOption[]>(() => {
  const all = query.data.value?.options ?? [];
  const ask = pending.value;
  return ask
    ? all.map((option) => ({
        ...option,
        shared: ask.parties.includes(option.id),
        giver: ask.givers.includes(option.id),
      }))
    : all;
});
const isPublic = computed(
  () => pending.value?.isPublic ?? query.data.value?.isPublic ?? false,
);
const view = computed(() =>
  sharingView(options.value, {
    onList: query.data.value?.onList ?? false,
    invite: query.data.value?.invite ?? false,
  }),
);
const unrolled = computed(() => adding.value ?? view.value.nobody);
/** « Changer de lien » once the link lets someone in (ticket 157). */
const canRenew = computed(() =>
  linkLetsIn(
    listStage({
      isPublic: isPublic.value,
      parties: view.value.events.length,
      givers: view.value.givers.length,
    }),
  ),
);
const checking = ref(false);
const busy = computed(
  () => save.isPending.value || unlink.isPending.value || checking.value,
);
/** The sharing as it stands, with one change. */
const changed = (change: Partial<SharingAsk>): SharingAsk => ({
  ...sharingAsk(options.value, isPublic.value),
  ...change,
});

/**
 * Saves the sharing with one change.
 * @param change - What changes.
 * @returns Nothing.
 */
const apply = (change: Partial<SharingAsk>) => {
  const ask = changed(change);
  pending.value = ask;
  save.mutate(ask, {
    onError: (error) => toast.failed(errorMessage(error)),
    onSettled: () => {
      pending.value = null;
    },
  });
};

/**
 * The cross of an event: when its members lose the list, a question
 * first, with those of them who ticked a gift.
 * @param option - The event.
 * @returns Once removed or asked.
 */
const onRemoveEvent = async (option: SharingOption) => {
  const ask = changed({
    parties: sharingAsk(options.value, isPublic.value).parties.filter(
      (id) => id !== option.id,
    ),
  });
  checking.value = true;
  try {
    const { members, claimers } = await sharingImpact(props.listId, {
      ...ask,
      from: sharingAsk(options.value, isPublic.value).parties,
    });
    if (members === 0 && claimers === 0) {
      apply(ask);
      return;
    }
    emit(
      'ask',
      {
        title: t('lists.sharing.narrow.title', { name: option.name }),
        text: [
          t('lists.sharing.narrow.members', { count: members }),
          claimers > 0 &&
            t('lists.sharing.narrow.claimersOf', { count: claimers }),
        ]
          .filter(Boolean)
          .join(' '),
        submit: t('lists.sharing.narrow.submit'),
        step: { kind: 'save', ask },
      },
      `remove-${option.id}`,
    );
  } catch (error) {
    toast.failed(errorMessage(error));
  } finally {
    checking.value = false;
  }
};

/**
 * The cross of a Secret Santa: it goes at once, as « Délier »
 * under my name (ticket 148, one way in the code).
 * @param option - The event of the Secret Santa.
 * @returns Nothing.
 */
const onRemoveGiver = (option: SharingOption) => {
  pending.value = changed({
    givers: sharingAsk(options.value, isPublic.value).givers.filter(
      (id) => id !== option.id,
    ),
  });
  unlink.mutate(option.id, {
    onError: (error) => toast.failed(errorMessage(error)),
    onSettled: () => {
      pending.value = null;
    },
  });
};

/**
 * A pill of « Ajouter »: an event, with all its members. « Ajouter »
 * stays unrolled, the draft it was open for gone.
 * @param option - The event.
 * @returns Nothing.
 */
const onAddEvent = (option: SharingOption) => {
  adding.value = true;
  apply({
    parties: [...sharingAsk(options.value, isPublic.value).parties, option.id],
  });
};

/**
 * A pill « Secret Santa · Famille Camille » (ticket 157): that one only.
 * @param id - Its event.
 */
const onAddGiver = (id: string) => {
  adding.value = true;
  apply({
    givers: [...sharingAsk(options.value, isPublic.value).givers, id],
  });
};
/** The pills of the Secret Santa not linked yet, by name. */
const giverPills = computed(() =>
  view.value.addGiver.flatMap((id) => {
    const option = options.value.find((one) => one.id === id);
    return option ? [option] : [];
  }),
);

/**
 * « Qui je veux » or « Tout le monde »: opening it to everyone asks
 * first; coming back asks when someone who ticked would lose it.
 * @param choice - The choice touched.
 * @returns Once done or asked.
 */
const onChoice = async (choice: 'chosen' | 'everyone') => {
  if (choice === 'everyone') {
    emit(
      'ask',
      {
        title: t('lists.sharing.open.title'),
        text: t('lists.sharing.open.body'),
        submit: t('lists.sharing.open.submit'),
        step: { kind: 'save', ask: changed({ isPublic: true }) },
      },
      'choice',
    );
    return;
  }
  const ask = changed({ isPublic: false });
  checking.value = true;
  try {
    const { claimers } = await sharingImpact(props.listId, ask);
    if (claimers === 0) {
      apply(ask);
      return;
    }
    emit(
      'ask',
      {
        title: t('lists.sharing.narrow.everyoneTitle'),
        text: t('lists.sharing.narrow.claimers', { count: claimers }),
        submit: t('lists.sharing.narrow.submit'),
        step: { kind: 'save', ask },
      },
      'choice',
    );
  } catch (error) {
    toast.failed(errorMessage(error));
  } finally {
    checking.value = false;
  }
};

const onRenew = () =>
  emit(
    'ask',
    {
      title: t('lists.sharing.renew.title'),
      text: t('lists.sharing.renew.body'),
      submit: t('lists.sharing.renew.submit'),
      step: { kind: 'renew' },
    },
    'renew',
  );

const choices = computed(() => [
  { value: 'chosen' as const, label: t('lists.sharing.chosen') },
  { value: 'everyone' as const, label: t('lists.sharing.everyone') },
]);
/** A line of « Qui je veux »: 48 px, its text in 15 px. */
const ROW = 'flex min-h-12 items-center gap-3 py-1 pl-3.5 text-[15px]';
/** Its square icon, 28 px. */
const SQUARE =
  'flex size-7 shrink-0 items-center justify-center rounded-[8px] text-sm';
/** A cross, 44 px to touch. */
const CROSS =
  'flex size-11 shrink-0 items-center justify-center text-toned disabled:opacity-50';
/** A pill of « Ajouter », 36 px to see and 44 px to touch (inside its
 * border, if it has one, one pixel more). */
const PILL =
  'relative flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-bold after:absolute after:inset-x-0 after:-inset-y-1';
</script>

<template>
  <div class="flex flex-col gap-2" data-testid="sharing-panel">
    <h2 class="px-3.5 pt-0.5 text-base font-bold">
      {{ t('lists.sharing.title') }}
    </h2>
    <UiSkeleton
      v-if="!query.data.value"
      :parts="['icons']"
      :rows="3"
      :label="t('common.loading')"
    />
    <template v-else>
      <div class="px-2" data-share-focus="choice" tabindex="-1">
        <UiSegmented
          :model-value="isPublic ? 'everyone' : 'chosen'"
          :items="choices"
          :label="t('lists.sharing.title')"
          size="sm"
          data-testid="sharing-choice"
          @update:model-value="onChoice"
        />
      </div>
      <ul class="border-t border-default" data-testid="sharing-lines">
        <template v-if="!isPublic">
          <li
            v-for="option in view.events"
            :key="`event-${option.id}`"
            :class="ROW"
            class="border-b border-default"
            :data-testid="`sharing-event-${option.slug}`"
          >
            <UiEventTile
              :emoji="option.emoji ?? '🎁'"
              :category="option.category"
              :size="28"
            />
            <span class="flex min-w-0 grow flex-col">
              <span class="truncate font-semibold">{{ option.name }}</span>
              <span class="truncate text-[13px] text-toned">{{
                t('lists.sharing.membersOf', { count: option.members })
              }}</span>
            </span>
            <button
              type="button"
              :class="CROSS"
              :disabled="busy"
              :aria-label="t('lists.sharing.remove', { name: option.name })"
              :data-share-focus="`remove-${option.id}`"
              data-testid="sharing-remove"
              @click="onRemoveEvent(option)"
            >
              <UIcon name="i-lucide-x" class="size-4" />
            </button>
          </li>
          <li
            v-for="option in view.givers"
            :key="`giver-${option.id}`"
            :class="ROW"
            class="border-b border-default"
            :data-testid="`sharing-giver-${option.slug}`"
          >
            <span aria-hidden="true" :class="[SQUARE, 'bg-muted text-toned']">
              <UIcon name="i-lucide-mail" class="size-3.5" />
            </span>
            <span class="flex min-w-0 grow flex-col">
              <span class="truncate font-semibold">{{
                t('lists.doc.santa', { name: option.santaName })
              }}</span>
              <span class="truncate text-[13px] text-toned">{{
                t('lists.sharing.giverSees')
              }}</span>
            </span>
            <button
              type="button"
              :class="CROSS"
              :disabled="busy"
              :aria-label="
                t('lists.sharing.remove', {
                  name: t('lists.doc.santa', { name: option.santaName }),
                })
              "
              data-testid="sharing-remove-giver"
              @click="onRemoveGiver(option)"
            >
              <UIcon name="i-lucide-x" class="size-4" />
            </button>
          </li>
          <li class="border-b border-default">
            <button
              type="button"
              :class="ROW"
              class="w-full pr-3.5 text-left"
              :aria-expanded="unrolled"
              data-testid="sharing-add"
              @click="adding = !unrolled"
            >
              <span
                aria-hidden="true"
                :class="SQUARE"
                class="border-[1.5px] border-dashed border-accented text-primary"
              >
                <UIcon name="i-lucide-plus" class="size-3.5" />
              </span>
              <span class="grow font-semibold">{{
                t('lists.sharing.add')
              }}</span>
              <UIcon
                :name="
                  unrolled ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'
                "
                class="size-4 shrink-0 text-dimmed"
              />
            </button>
            <div
              v-if="unrolled"
              class="flex flex-wrap gap-2 px-3 pt-0.5 pb-3"
              data-testid="sharing-pills"
            >
              <button
                v-for="option in giverPills"
                :key="`giver-${option.id}`"
                type="button"
                :class="PILL"
                class="bg-default ring-1 ring-default"
                :disabled="busy"
                data-testid="sharing-add-giver"
                @click="onAddGiver(option.id)"
              >
                <UIcon name="i-lucide-mail" class="size-3.5" />
                {{ t('lists.doc.santa', { name: option.santaName }) }}
              </button>
              <button
                v-for="option in view.addEvents"
                :key="option.id"
                type="button"
                :class="PILL"
                class="bg-default ring-1 ring-default"
                :disabled="busy"
                :data-testid="`sharing-add-${option.slug}`"
                @click="onAddEvent(option)"
              >
                <UiEmoji :emoji="option.emoji ?? '🎁'" />
                {{ option.name }}
              </button>
              <button
                v-if="view.someoneElse"
                type="button"
                :class="PILL"
                class="border border-dashed border-accented text-primary-ink after:-inset-y-[5px]"
                data-share-focus="someone-else"
                data-testid="sharing-someone-else"
                @click="emit('someone-else')"
              >
                <UIcon name="i-lucide-plus" class="size-3.5" />
                {{ t('lists.sharing.someoneElse') }}
              </button>
            </div>
          </li>
        </template>
        <li v-if="canRenew" class="border-b border-default">
          <button
            type="button"
            :class="ROW"
            class="w-full pr-3.5 text-left font-semibold"
            data-share-focus="renew"
            data-testid="sharing-renew"
            @click="onRenew"
          >
            <span class="grow">{{ t('lists.sharing.changeLink') }}</span>
            <UIcon
              name="i-lucide-chevron-right"
              class="size-4 shrink-0 text-dimmed"
            />
          </button>
        </li>
      </ul>
    </template>
  </div>
</template>
