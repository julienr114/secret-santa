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
// Its header (ticket 159): the date under the name, which takes two lines
// at most; on the right, the arrow, or for its organiser a wheel in a
// round (« Gérer l'événement »); the whole header opens the event.
// Under a Secret Santa I take part in and organise (ticket 156), « Tu
// l'organises », hung to its line (no rule, no icon, its text under the
// title), which opens the follow-up; never a red dot.
// At the bottom, what may be made in it (ticket 151): « Créer un Secret
// Santa », « Créer une liste de cadeaux ». Two months before an event
// that comes back (ticket 108, V3AccueilAnnee): « Préparer Noël 2027 »
// for its organiser, « Reprendre ma liste de l'an dernier » for whoever
// held one, instead of the list.
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
/**
 * What may be made in it (ticket 151, V3AccueilSansSecret): « Créer un
 * Secret Santa » for its organiser while it has none this year, « Créer
 * une liste de cadeaux » while I hold none; the Secret Santa first at
 * Christmas, the list first elsewhere.
 */
const creates = computed(() => {
  const santa = props.party.createSanta
    ? [
        {
          key: 'santa',
          to: `/admin/${props.party.slug}/editions/nouvelle`,
          label: t('party.secretSanta.organise'),
        },
      ]
    : [];
  const list =
    hasMine.value || props.party.resume
      ? []
      : [
          {
            key: 'list',
            to: `/listes/nouvelle?pour=${props.party.slug}`,
            label: t('party.lists.new'),
          },
        ];
  return props.party.category === 'christmas'
    ? [...santa, ...list]
    : [...list, ...santa];
});
</script>

<template>
  <section
    class="overflow-hidden rounded-[28px] bg-default shadow-[0_3px_0_var(--color-peach-200),0_0_0_1.5px_var(--color-peach-200)]"
    data-testid="home-party"
  >
    <NuxtLink
      :to="`/e/${party.slug}`"
      class="flex min-h-[66px] items-center gap-3 px-4 py-2.5 transition-colors active:bg-muted"
    >
      <UiEventTile :emoji="emoji" :category="party.category" :size="44" />
      <span class="flex min-w-0 grow flex-col gap-px">
        <h3 class="line-clamp-2 font-display text-lg leading-tight font-bold">
          {{ party.name }}
        </h3>
        <span
          v-if="party.date"
          class="text-[13px] font-semibold text-toned"
          data-testid="home-party-date"
          >{{ formatShortDay(party.date, locale) }}</span
        >
      </span>
      <span
        v-if="party.organises"
        role="img"
        :aria-label="t('home.manage')"
        class="flex size-[38px] shrink-0 items-center justify-center rounded-full bg-muted text-toned ring-1 ring-accented"
        data-testid="home-manage"
      >
        <UIcon name="i-lucide-settings" class="size-4.5" aria-hidden="true" />
      </span>
      <UIcon
        v-else
        name="i-lucide-chevron-right"
        class="size-4.5 shrink-0 text-dimmed"
      />
    </NuxtLink>
    <ul class="divide-y divide-default border-t border-default">
      <template v-for="santa in party.secretSantas" :key="santa.id">
        <UiListItem
          :class="santa.organiser ? 'border-b-0' : ''"
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
        <UiOrganiseRow
          v-if="santa.organiser"
          :line="santa.organiser.line"
          :to="santa.organiser.to"
          data-testid="home-organise"
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
        v-for="row in creates"
        :key="row.key"
        :to="row.to"
        :label="row.label"
        :data-testid="`home-create-${row.key}`"
      />
    </ul>
  </section>
</template>
