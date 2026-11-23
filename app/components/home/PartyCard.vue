<script setup lang="ts">
import type { HomeParty } from '#server/database/homeParties';
import { partyEmoji } from '#shared/utils/categories';
import { formatShortDay } from '~/utils/labels';
import { usePrepareYearMutation } from '~/composables/queries/useParty';

// A party on the home (docs/spec/v3/accueil-et-creation.md, V3Accueil):
// its header opens it; below, its Secret Santas (and their « Devine
// qui ») and the lists of its members, at the same level, each with its
// title, its text and maybe a red dot (lignes.md, tickets 112 and 120).
// The event in its tile in colour, the lines under it with their icon
// alone (ticket 143).
// « Nouvelle liste » while I have none in it. Two months before an event
// that comes back (ticket 108, V3AccueilAnnee): « Préparer Noël 2027 » for
// its organiser, « Reprendre ma liste de l'an dernier » for whoever held
// one, instead of « Nouvelle liste ».
const props = defineProps<{ party: HomeParty }>();
const { t, tk, locale } = useT();
const words = useLineText();
const toast = useMessages();
const errorMessage = useErrorMessage();
const prepare = usePrepareYearMutation(() => props.party.slug);
const prepareLabel = computed(() =>
  props.party.prepare === null
    ? ''
    : t('home.prepareYear', {
        name: `${tk(`party.category.${props.party.category}`)} ${props.party.prepare}`,
      }),
);
/** Prepares the Secret Santa of the year to come, a failure told in a toast. */
const onPrepare = () =>
  prepare.mutate(undefined, {
    onError: (error) => toast.failed(errorMessage(error)),
  });
const emoji = computed(() => partyEmoji(props.party));
const hasMine = computed(() => props.party.lists.some((list) => list.mine));
</script>

<template>
  <section
    class="overflow-hidden rounded-[28px] bg-default shadow-[0_3px_0_var(--color-peach-200),0_0_0_1.5px_var(--color-peach-200)]"
    data-testid="home-party"
  >
    <NuxtLink
      :to="`/e/${party.slug}`"
      class="flex min-h-14 items-center gap-2.5 px-4 py-2.5 transition-colors active:bg-muted"
    >
      <UiEventTile :emoji="emoji" :category="party.category" :size="44" />
      <h3 class="min-w-0 grow font-display text-lg leading-tight font-bold">
        {{ party.name }}
      </h3>
      <span
        v-if="party.date"
        class="shrink-0 text-[13px] font-bold whitespace-nowrap text-toned"
        >{{ formatShortDay(party.date, locale) }}</span
      >
      <UIcon
        name="i-lucide-chevron-right"
        class="size-4.5 shrink-0 text-dimmed"
      />
    </NuxtLink>
    <ul class="divide-y divide-default border-t border-default">
      <template v-for="santa in party.secretSantas" :key="santa.id">
        <UiListItem
          icon="i-lucide-mail"
          icon-tone="neutral"
          bare-icon
          :title="
            party.secretSantas.length > 1
              ? santa.label
              : t('party.secretSantaTitle', { count: 1 })
          "
          :subtitle="words.line(santa.line)"
          :dot="santa.line?.dot ? t('lines.dot') : undefined"
          :to="santa.to ?? undefined"
          data-testid="home-santa"
        />
        <UiListItem
          v-if="santa.game"
          icon="i-lucide-search"
          icon-tone="neutral"
          bare-icon
          :title="t('lines.game.title')"
          :subtitle="words.line(santa.game.line)"
          :dot="santa.game.line.dot ? t('lines.dot') : undefined"
          :to="santa.game.to"
          data-testid="home-game"
        />
      </template>
      <UiListItem
        v-for="list in party.lists"
        :key="list.id"
        icon="i-lucide-list-checks"
        icon-tone="lilac"
        bare-icon
        :title="words.part(list.title)"
        :subtitle="words.line(list.line)"
        :dot="list.line?.dot ? t('lines.dot') : undefined"
        :to="list.to ?? undefined"
        data-testid="home-list"
      />
      <UiAddRow
        v-if="party.prepare !== null"
        :label="prepareLabel"
        :busy="prepare.isPending.value"
        :on-click="onPrepare"
        data-testid="home-prepare"
      />
      <UiAddRow
        v-if="party.resume"
        :to="`/listes/nouvelle?pour=${party.slug}&reprendre=${party.resume}`"
        :label="t('party.lists.resume')"
        data-testid="home-resume"
      />
      <UiAddRow
        v-else-if="!hasMine"
        :to="`/listes/nouvelle?pour=${party.slug}`"
        :label="t('party.lists.new')"
      />
    </ul>
  </section>
</template>
