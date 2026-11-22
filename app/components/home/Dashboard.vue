<script setup lang="ts">
import {
  comingBirthdays,
  daysUntilChristmas,
  homeSections,
} from '#shared/utils/homeParties';
import { nextOccurrence } from '#shared/utils/categories';
import { useHomePartiesQuery } from '~/composables/queries/useHome';
import { useElsewhereQuery } from '~/composables/queries/useLists';

// The home of a logged-in account (docs/spec/v3/accueil-et-creation.md,
// V3Accueil and V3AccueilVide): a section per season of Christmas, with
// its countdown to 25 December; « Bientôt », the birthdays of my people;
// « Plus tard », my other parties; then « Les événements passés » and « Ce
// que j'offre ailleurs ». A new account sees two cards instead. Which
// parties are still on the home after their date, and at which date, the
// server decides (ticket 108).
const { t } = useT();
// « Ce que j'offre ailleurs » (ticket 106), shown once I offer something
// on a public list of an event I am not in: « Le mariage de Karim et
// Sofia · 1 cadeau », or « 3 listes · 5 cadeaux » (docs/spec/v3/lignes.md).
const elsewhere = useElsewhereQuery();
const elsewhereLine = computed(() => {
  const lists = elsewhere.data.value?.lists ?? [];
  const gifts = t('lists.elsewhere.gifts', {
    count: lists.reduce((sum, list) => sum + list.gifts.length, 0),
  });
  if (lists.length === 0) return '';
  return lists.length === 1
    ? `${lists[0]?.title ?? ''} · ${gifts}`
    : `${t('lists.elsewhere.lists', { count: lists.length })} · ${gifts}`;
});
const home = useHomePartiesQuery();
useHead({ title: () => `${t('home.title')} — ${t('common.appName')}` });
const today = new Date().toLocaleDateString('sv-SE');
const data = computed(() => home.data.value);
const parties = computed(() => data.value?.parties ?? []);
// « Les événements passés » (lignes.md): the latest, and how many others.
const pastLine = computed(() => {
  const past = data.value?.past;
  if (!past) return '';
  return past.others === 0
    ? past.latest
    : t('home.pastMore', { name: past.latest, count: past.others });
});
const sections = computed(() => homeSections(parties.value));
const birthdays = computed(() =>
  comingBirthdays(data.value?.people ?? [], parties.value, today),
);
const empty = computed(
  () => parties.value.length === 0 && birthdays.value.length === 0,
);
const countdown = daysUntilChristmas(today);
/** The season the countdown is for. */
const christmasYear = Number(nextOccurrence('12-25', today).slice(0, 4));
const greeting = computed(() =>
  data.value?.firstName
    ? t('home.hello', { name: data.value.firstName })
    : t('home.helloNobody'),
);
</script>

<template>
  <AdminScreen>
    <AdminQueryState
      :pending="home.isPending.value"
      :error="home.error.value"
      :skeleton="['greeting', 'parties']"
      skeleton-gap="sm"
    >
      <div class="flex flex-col gap-0.5 px-1 pt-1">
        <UiPageTitle>{{ greeting }}</UiPageTitle>
        <p v-if="empty" class="text-[15px] text-toned">
          {{ t('home.start') }}
        </p>
      </div>

      <template v-if="empty">
        <UiCard
          v-for="card in ['secretSanta', 'list'] as const"
          :key="card"
          padding="none"
          class="flex flex-col gap-3 p-4.5"
          :data-testid="`home-empty-${card}`"
        >
          <div class="flex items-center gap-3">
            <span
              class="flex size-9 shrink-0 items-center justify-center rounded-2xl"
              :class="
                card === 'list'
                  ? 'bg-lilac-100 text-lilac-800'
                  : 'bg-muted text-toned'
              "
              aria-hidden="true"
            >
              <UIcon
                :name="
                  card === 'list' ? 'i-lucide-list-checks' : 'i-lucide-mail'
                "
                class="size-4.5"
              />
            </span>
            <h2 class="font-display text-[22px] leading-tight font-bold">
              {{ t(`home.empty.${card}.title`) }}
            </h2>
          </div>
          <p class="text-[15px] leading-[1.45] text-toned">
            {{ t(`home.empty.${card}.body`) }}
          </p>
          <UButton
            :to="`/e/nouvelle?pour=${card === 'list' ? 'liste' : 'secret-santa'}`"
            block
            :color="card === 'list' ? 'neutral' : 'primary'"
            :variant="card === 'list' ? 'outline' : 'solid'"
            class="justify-center"
            :class="card === 'list' ? 'min-h-11' : 'min-h-12'"
            :label="t(`home.empty.${card}.button`)"
          />
        </UiCard>
        <!-- Invited to a wedding without being in any event: what I offer
             there is found all the same (ticket 106). -->
        <UiList v-if="elsewhereLine" class="mt-2.5">
          <UiListItem
            to="/offert-ailleurs"
            icon="i-lucide-gift"
            icon-tone="neutral"
            :title="t('home.elsewhere')"
            :subtitle="elsewhereLine"
            data-testid="home-elsewhere"
          />
        </UiList>
      </template>

      <template v-else>
        <section
          v-for="season in sections.seasons"
          :key="season.year"
          class="flex flex-col gap-3.5"
          data-testid="home-season"
        >
          <div class="flex items-baseline justify-between gap-3 px-1 pt-1.5">
            <h2 class="font-display text-[26px] leading-tight font-bold">
              {{ t('home.christmas', { year: season.year }) }}
            </h2>
            <span
              v-if="season.year === christmasYear && countdown > 0"
              class="text-sm font-bold whitespace-nowrap text-primary"
              data-testid="home-countdown"
              >{{ t('party.inDays', { count: countdown }) }}</span
            >
          </div>
          <HomePartyCard
            v-for="party in season.parties"
            :key="party.slug"
            :party="party"
          />
        </section>

        <section
          v-if="birthdays.length > 0"
          class="flex flex-col gap-3.5"
          data-testid="home-soon"
        >
          <UiSectionTitle class="pt-2.5">{{ t('home.soon') }}</UiSectionTitle>
          <HomeBirthday
            v-for="birthday in birthdays"
            :key="birthday.memberId"
            :birthday="birthday"
          />
        </section>

        <section
          v-if="sections.later.length > 0"
          class="flex flex-col gap-3.5"
          data-testid="home-later"
        >
          <UiSectionTitle class="pt-2.5">{{ t('home.later') }}</UiSectionTitle>
          <HomePartyCard
            v-for="party in sections.later"
            :key="party.slug"
            :party="party"
          />
        </section>

        <UiList v-if="pastLine || elsewhereLine" class="mt-2.5">
          <UiListItem
            v-if="pastLine"
            to="/evenements-passes"
            icon="i-lucide-clock"
            icon-tone="neutral"
            :title="t('home.past')"
            :subtitle="pastLine"
            data-testid="home-past"
          />
          <UiListItem
            v-if="elsewhereLine"
            to="/offert-ailleurs"
            icon="i-lucide-gift"
            icon-tone="neutral"
            :title="t('home.elsewhere')"
            :subtitle="elsewhereLine"
            data-testid="home-elsewhere"
          />
        </UiList>
      </template>
    </AdminQueryState>
  </AdminScreen>
</template>
