<script setup lang="ts">
import { partyEmoji } from '#shared/utils/categories';
import { usePastYearQuery } from '~/composables/queries/useParty';
import { categoryTint } from '~/utils/categories';

// A year over of an event (ticket 108, docs/spec/v3/fete.md, « Une année
// passée », V3FeteAnneePassee): the name of the year, the event, its day
// that year, without a countdown; its Secret Santa with whom I gave to,
// « Devine qui » when it was played; its lists. Read only: nothing to
// create, nothing to set, no « Quitter ». « Retour » leads to « Les
// événements passés », or to the event when I came from it
// (docs/spec/v3/navigation.md).
definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t } = useT();
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const year = computed(() => Number(route.params.annee));
const page = usePastYearQuery(slug, year);
const data = computed(() => page.data.value);
const { deedText, yearName, dayOf } = usePastText();
const title = computed(() =>
  data.value ? yearName(data.value.party.category, data.value.year) : '',
);
useHead({
  title: () =>
    `${title.value} — ${data.value?.party.name ?? ''} — ${t('common.appName')}`,
});
const back = computed(() =>
  route.query.depuis === 'evenement'
    ? `/e/${slug.value}`
    : '/evenements-passes',
);
const santaTitle = (label: string) =>
  (data.value?.secretSantas.length ?? 0) > 1
    ? label
    : t('party.secretSantaTitle', { count: 1 });
const words = useLineText();
const listText = (list: NonNullable<typeof data.value>['lists'][number]) => {
  if (list.held) return words.part(list.held);
  return list.offered > 0
    ? t('party.past.offered', { count: list.offered })
    : undefined;
};
const games = computed(
  () => data.value?.secretSantas.filter((santa) => santa.game) ?? [],
);
</script>

<template>
  <AdminScreen :back="back">
    <AdminQueryState
      :pending="page.isPending.value"
      :error="page.error.value"
      :skeleton="['head', 'sections']"
    >
      <template v-if="data">
        <div class="flex flex-col gap-2 px-1 pt-1">
          <span
            class="inline-flex h-6.5 items-center gap-1.5 self-start rounded-full pr-2.5 pl-2 text-[13px] font-bold"
            :class="categoryTint(data.party.category)"
            data-testid="past-year-name"
          >
            <UiEmoji
              v-if="partyEmoji(data.party)"
              :emoji="partyEmoji(data.party)!"
            />
            {{ title }}
          </span>
          <UiPageTitle>{{ data.party.name }}</UiPageTitle>
          <p v-if="data.date" class="text-[15px] font-bold text-toned">
            {{ dayOf(data.date, true) }}
          </p>
        </div>

        <UiList
          v-if="data.secretSantas.length > 0"
          :title="
            t('party.secretSantaTitle', { count: data.secretSantas.length })
          "
          data-testid="past-year-secret-santas"
        >
          <UiListItem
            v-for="santa in data.secretSantas"
            :key="santa.id"
            icon="i-lucide-mail"
            icon-tone="neutral"
            :title="santaTitle(santa.label)"
            :subtitle="
              santa.gaveTo
                ? deedText({ kind: 'gaveTo', names: [santa.gaveTo] })
                : undefined
            "
            :to="santa.to ?? undefined"
          />
          <UiListItem
            v-for="santa in games"
            :key="`${santa.id}-game`"
            icon="i-lucide-trophy"
            icon-tone="neutral"
            :title="t('party.past.game')"
            :subtitle="t('party.past.palmares')"
            :to="santa.game ?? undefined"
          />
        </UiList>

        <UiList
          v-if="data.lists.length > 0"
          :title="t('party.lists.title')"
          data-testid="past-year-lists"
        >
          <UiListItem
            v-for="list in data.lists"
            :key="list.id"
            :avatar="list.owner?.avatar"
            :icon="list.owner ? undefined : 'i-lucide-list-checks'"
            icon-tone="lilac"
            :title="words.part(list.title)"
            :subtitle="listText(list)"
            :to="list.to"
          />
        </UiList>
      </template>
    </AdminQueryState>
  </AdminScreen>
</template>
