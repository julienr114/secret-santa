<script setup lang="ts">
import { partyEmoji } from '#shared/utils/categories';
import { usePastEventsQuery } from '~/composables/queries/useParty';

// « Les événements passés » (ticket 108, docs/spec/v3/accueil-et-creation.md,
// V3FetesPassees): by year, the latest first, a line per event and year
// over, with its day and what I did there. Each opens that year. It
// replaces « Tirages passés », whose address leads here.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t } = useT();
useHead({ title: () => `${t('home.past')} — ${t('common.appName')}` });
const past = usePastEventsQuery();
const years = computed(() => past.data.value?.years ?? []);
const { lineText } = usePastText();
</script>

<template>
  <AdminScreen back="/">
    <AdminQueryState
      :pending="past.isPending.value"
      :error="past.error.value"
      :skeleton="['title', 'sections']"
    >
      <div class="px-1 pt-1">
        <UiPageTitle>{{ t('home.past') }}</UiPageTitle>
      </div>
      <p v-if="years.length === 0" class="px-1 text-[15px] text-toned">
        {{ t('party.past.empty') }}
      </p>
      <UiList
        v-for="entry in years"
        :key="entry.year"
        :title="String(entry.year)"
        data-testid="past-year"
      >
        <UiListItem
          v-for="line in entry.lines"
          :key="`${line.slug}-${line.year}`"
          :to="`/e/${line.slug}/annees/${line.year}`"
          :title="line.name"
          :subtitle="lineText(line.date, line.deed, line.forWhom) || undefined"
        >
          <template #leading>
            <UiEventTile
              :emoji="partyEmoji(line)"
              :category="line.category"
              :size="36"
            />
          </template>
        </UiListItem>
      </UiList>
    </AdminQueryState>
  </AdminScreen>
</template>
