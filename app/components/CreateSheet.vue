<script setup lang="ts">
import { partyEmoji } from '#shared/utils/categories';
import { categoryTint } from '~/utils/categories';
import {
  useHomePartiesQuery,
  useNewSecretSantaQuery,
} from '~/composables/queries/useHome';

// « Créer », the sheet of the tab (docs/spec/v3/accueil-et-creation.md):
// two lines without a subtitle. « Une liste de cadeaux » turns the sheet
// into its « Pour quelle occasion ? » (V3ListeOccasion, ticket 106): one of my
// events, whose name, date and icon the new list takes, or « Une autre
// occasion », which creates one first; with no event of mine, that
// straight away.
// « Un Secret Santa » turns the sheet into its own « Pour quelle
// occasion ? » (V3TirageQuelleFete): one of the parties I organise, or
// « Une autre occasion », which creates a party. At my limit, the screen
// of the limit instead (V3TirageLimite), and while the super-admin pauses
// new Secret Santa, the screen of the pause (V3TiragePause); organising
// none yet, the creation of a party straight away.
const open = defineModel<boolean>('open', { required: true });
const { t, tk, locale } = useT();
const NEW_PARTY = '/e/nouvelle?pour=secret-santa';
const OTHER = '';

const step = ref<'what' | 'occasion' | 'list'>('what');
const choice = ref(OTHER);
const query = useNewSecretSantaQuery(() => step.value === 'occasion');
const parties = computed(() => query.data.value?.parties ?? []);
const NEW_LIST_PARTY = '/e/nouvelle?pour=liste';
const home = useHomePartiesQuery(() => step.value === 'list');
const events = computed(() => home.data.value?.parties ?? []);
const listChoice = ref(OTHER);
const { createFor, creating } = useListOccasion();
/**
 * The line under an event, for a list: its category and its day.
 * @param event - The event.
 * @returns « Noël · 25 décembre ».
 */
const dayLineOf = (event: (typeof events.value)[number]) => {
  const day = event.date;
  return [
    tk(`party.category.${event.category}`),
    day &&
      new Intl.DateTimeFormat(locale.value, {
        day: 'numeric',
        month: 'long',
        timeZone: 'UTC',
      }).format(new Date(`${day}T00:00:00Z`)),
  ]
    .filter(Boolean)
    .join(' · ');
};
// No event of mine: « Une autre occasion » straight away.
watch(
  () => (step.value === 'list' ? home.data.value : undefined),
  async (data) => {
    if (!data) return;
    if (data.parties.length === 0) await go(NEW_LIST_PARTY);
    else listChoice.value = data.parties[0]?.slug ?? OTHER;
  },
  { immediate: true },
);
/** « Continuer »: the list, made for the event; or a new event first. */
const onListContinue = async () => {
  if (listChoice.value === OTHER) return go(NEW_LIST_PARTY);
  open.value = false;
  await createFor(listChoice.value);
};
const title = computed(() =>
  step.value === 'what' ? t('common.create.title') : t('party.create.title'),
);
// Back to the first step each time the sheet opens.
watch(open, (isOpen) => {
  if (isOpen) {
    step.value = 'what';
    choice.value = OTHER;
    listChoice.value = OTHER;
  }
});

/**
 * Leaves the sheet for a page.
 * @param to - The page.
 * @returns Once there.
 */
const go = async (to: string) => {
  open.value = false;
  await navigateTo(to);
};
// Nothing to choose: paused, at the limit, or without a party of mine.
watch(
  () => (step.value === 'occasion' ? query.data.value : undefined),
  async (data) => {
    if (!data) return;
    if (data.paused) await go('/secret-santa/pause');
    else if (data.limitReached) await go('/secret-santa/limite');
    else if (data.parties.length === 0) await go(NEW_PARTY);
    else choice.value = data.parties[0]?.slug ?? OTHER;
  },
  { immediate: true },
);

/**
 * The line under a party: its category, its members, and whether its
 * year already has a Secret Santa.
 * @param party - The party.
 * @returns « Noël · 8 membres · déjà un Secret Santa cette année ».
 */
const lineOf = (party: (typeof parties.value)[number]) =>
  [
    tk(`party.category.${party.category}`),
    t('party.members', { count: party.members }),
    party.hasSecretSanta && t('party.secretSanta.already'),
  ]
    .filter(Boolean)
    .join(' · ');

/** « Continuer »: the form of the Secret Santa, or a new party first. */
const onContinue = () =>
  go(
    choice.value === OTHER
      ? NEW_PARTY
      : `/admin/${choice.value}/editions/nouvelle`,
  );
</script>

<template>
  <UiSheet v-model:open="open" :title="title">
    <UiList v-if="step === 'what'">
      <UiListItem
        :title="t('common.create.secretSanta')"
        icon="i-lucide-mail"
        icon-tone="neutral"
        :on-click="() => (step = 'occasion')"
        data-testid="create-secret-santa"
      />
      <UiListItem
        :title="t('common.create.list')"
        icon="i-lucide-list-checks"
        icon-tone="lilac"
        :on-click="() => (step = 'list')"
        data-testid="create-list"
      />
    </UiList>
    <div
      v-else-if="step === 'list'"
      class="flex flex-col gap-3"
      data-testid="list-occasion"
    >
      <UiSkeleton
        v-if="events.length === 0"
        :parts="['list']"
        :rows="2"
        :label="t('common.loading')"
      />
      <div
        v-else
        role="radiogroup"
        :aria-label="t('party.create.title')"
        class="-mx-4 divide-y divide-divider border-y border-divider"
      >
        <label
          v-for="event in events"
          :key="event.slug"
          class="flex min-h-15 cursor-pointer items-center gap-3 px-4 py-2"
        >
          <span
            class="flex size-8 shrink-0 items-center justify-center rounded-[9px] text-base"
            :class="categoryTint(event.category)"
            aria-hidden="true"
          >
            <UiEmoji :emoji="partyEmoji(event)" />
          </span>
          <span class="flex min-w-0 grow flex-col gap-px">
            <span class="font-semibold">{{ event.name }}</span>
            <span class="text-[13px] leading-[1.35] text-toned">{{
              dayLineOf(event)
            }}</span>
          </span>
          <input
            v-model="listChoice"
            type="radio"
            name="list-party"
            :value="event.slug"
            class="size-6 shrink-0 accent-(--ui-primary)"
          />
        </label>
        <label
          class="flex min-h-15 cursor-pointer items-center gap-3 px-4 py-2"
        >
          <span
            class="flex size-9 shrink-0 items-center justify-center rounded-[10px] border-[1.5px] border-dashed border-peach-300 text-primary-ink"
            aria-hidden="true"
          >
            <UIcon name="i-lucide-plus" class="size-4" />
          </span>
          <span class="grow font-semibold">{{
            t('party.secretSanta.otherOccasion')
          }}</span>
          <input
            v-model="listChoice"
            type="radio"
            name="list-party"
            :value="OTHER"
            class="size-6 shrink-0 accent-(--ui-primary)"
          />
        </label>
      </div>
      <UButton
        block
        size="xl"
        class="h-12 justify-center font-bold"
        :disabled="events.length === 0"
        :loading="creating"
        :label="t('party.create.continue')"
        @click="onListContinue"
      />
    </div>
    <div v-else class="flex flex-col gap-3" data-testid="secret-santa-occasion">
      <UiSkeleton
        v-if="parties.length === 0"
        :parts="['list']"
        :rows="2"
        :label="t('common.loading')"
      />
      <div
        v-else
        role="radiogroup"
        :aria-label="t('party.secretSanta.whichParty')"
        class="-mx-4 divide-y divide-divider border-y border-divider"
      >
        <label
          v-for="party in parties"
          :key="party.slug"
          class="flex min-h-15 cursor-pointer items-center gap-3 px-4 py-2"
        >
          <span
            class="flex size-8 shrink-0 items-center justify-center rounded-[9px] text-base"
            :class="categoryTint(party.category)"
            aria-hidden="true"
          >
            <UiEmoji :emoji="partyEmoji(party)" />
          </span>
          <span class="flex min-w-0 grow flex-col gap-px">
            <span class="font-semibold">{{ party.name }}</span>
            <span class="text-[13px] leading-[1.35] text-toned">{{
              lineOf(party)
            }}</span>
          </span>
          <input
            v-model="choice"
            type="radio"
            name="secret-santa-party"
            :value="party.slug"
            class="size-6 shrink-0 accent-(--ui-primary)"
          />
        </label>
        <label
          class="flex min-h-15 cursor-pointer items-center gap-3 px-4 py-2"
        >
          <span
            class="flex size-9 shrink-0 items-center justify-center rounded-[10px] border-[1.5px] border-dashed border-peach-300 text-primary-ink"
            aria-hidden="true"
          >
            <UIcon name="i-lucide-plus" class="size-4" />
          </span>
          <span class="grow font-semibold">{{
            t('party.secretSanta.otherOccasion')
          }}</span>
          <input
            v-model="choice"
            type="radio"
            name="secret-santa-party"
            :value="OTHER"
            class="size-6 shrink-0 accent-(--ui-primary)"
          />
        </label>
      </div>
      <UButton
        block
        size="xl"
        class="h-12 justify-center font-bold"
        :disabled="parties.length === 0"
        :label="t('party.create.continue')"
        @click="onContinue"
      />
    </div>
  </UiSheet>
</template>
