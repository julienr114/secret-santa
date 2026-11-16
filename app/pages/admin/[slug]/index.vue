<script setup lang="ts">
import {
  useDashboardQuery,
  useGroupJournalQuery,
  useOrganizersQuery,
  usePeopleQuery,
} from '~/composables/queries/useGroup';

// Group home: the edition going on (or the card to prepare the next one),
// the group in four rows (members, exclusions, journal, settings), then
// the past editions.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t, tk, locale } = useT();
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const dashboard = useDashboardQuery(slug);
const name = computed(() => dashboard.data.value?.group.name ?? slug.value);

useHead({ title: computed(() => `${name.value} — ${t('common.appName')}`) });
const screen = computed(() => ({
  back: '/',
}));

const people = usePeopleQuery(slug);
const organizers = useOrganizersQuery(slug);
const journal = useGroupJournalQuery(slug, locale);
const persons = computed(() => people.data.value?.persons ?? []);
const { membersLine } = useMembersLine();
const activeCount = computed(
  () => persons.value.filter((p) => p.active).length,
);
const subtitle = computed(() =>
  [
    t('adminGroup.dashboard.members', { count: activeCount.value }),
    organizers.data.value?.organizers.some((o) => o.me)
      ? t('adminGroup.dashboard.youOrganize')
      : '',
  ]
    .filter(Boolean)
    .join(' · '),
);
const exclusionCount = computed(
  () => people.data.value?.exclusions.length ?? 0,
);
/** The last thing the journal says. */
const lastEvent = computed(
  () =>
    (journal.data.value?.entries ?? []).toSorted((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    )[0]?.text,
);
const current = computed(() =>
  dashboard.data.value?.editions.find(
    (e) => e.id === dashboard.data.value?.currentEditionId,
  ),
);
const past = computed(() =>
  (dashboard.data.value?.editions ?? [])
    .filter((e) => e.id !== dashboard.data.value?.currentEditionId)
    .toReversed(),
);
const editionSubtitle = (status: string, count?: number) =>
  `${tk(`common.status.${status}`)} · ${t('common.count.participants', { count: count ?? 0 })}`;
</script>

<template>
  <AdminScreen v-bind="screen">
    <AdminQueryState
      :pending="dashboard.isPending.value"
      :error="dashboard.error.value"
      :skeleton="['title', 'card', 'list']"
    >
      <div class="flex flex-col gap-1">
        <UiPageTitle>{{ name }}</UiPageTitle>
        <p class="text-[15px] text-toned">{{ subtitle }}</p>
      </div>

      <AdminGroupEditionCard
        v-if="current"
        :slug="slug"
        :edition="current"
        :group-date="dashboard.data.value?.rules.eventDate ?? ''"
      />
      <AdminGroupNewEditionCard
        v-else
        :slug="slug"
        :exclude-previous-years="
          dashboard.data.value?.rules.excludePreviousYears ?? 0
        "
      />

      <UiList :title="t('adminGroup.dashboard.groupSection')">
        <UiListItem
          :to="`/admin/${slug}/personnes`"
          icon="i-lucide-users"
          :title="t('adminGroup.dashboard.membersRow')"
          :subtitle="membersLine(persons)"
        />
        <UiListItem
          :to="`/admin/${slug}/exclusions`"
          icon="i-lucide-ban"
          :title="t('adminGroup.exclusions.title')"
          :subtitle="
            exclusionCount > 0
              ? t('adminGroup.dashboard.pairs', { count: exclusionCount })
              : t('adminEdition.screen.prepare.exclusionsNone')
          "
        />
        <UiListItem
          :to="`/admin/${slug}/journal`"
          icon="i-lucide-file-text"
          :title="t('adminGroup.dashboard.journal')"
          :subtitle="lastEvent ?? t('adminGroup.dashboard.journalEmpty')"
        />
        <UiListItem
          :to="`/admin/${slug}/reglages`"
          icon="i-lucide-sliders-horizontal"
          :title="t('adminGroup.dashboard.settings')"
          :subtitle="t('adminGroup.dashboard.settingsHint')"
        />
      </UiList>

      <UiList
        v-if="past.length"
        :title="t('adminGroup.dashboard.pastEditions')"
      >
        <UiListItem
          v-for="edition in past"
          :key="edition.id"
          :to="`/admin/${slug}/editions/${edition.id}`"
          icon="i-lucide-archive"
          icon-tone="neutral"
          :title="edition.label"
          :subtitle="editionSubtitle(edition.status, edition.participantCount)"
        />
      </UiList>
    </AdminQueryState>
  </AdminScreen>
</template>
