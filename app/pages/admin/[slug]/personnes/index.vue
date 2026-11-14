<script setup lang="ts">
import { formatEventDate } from '#server/utils/rules';
import {
  useDashboardQuery,
  usePeopleQuery,
} from '~/composables/queries/useGroup';

definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t } = useT();
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const people = usePeopleQuery(slug);
// The invitation link belongs to the group: its state on the row.
const dashboard = useDashboardQuery(slug);
const { locale } = useT();
const inviteSummary = computed(() => {
  const g = dashboard.data.value?.group;
  if (!g?.inviteCode) return t('adminEdition.invite.off');
  return [
    t('adminEdition.invite.placesLeft', { count: g.invitePlaces ?? 0 }),
    ...(g.inviteUntil
      ? [
          t('adminEdition.invite.untilShort', {
            date: formatEventDate(g.inviteUntil, locale.value),
          }),
        ]
      : []),
  ].join(' · ');
});
useHead({
  title: computed(
    () => `${t('adminGroup.people.title')} — ${t('common.appName')}`,
  ),
});
const screen = computed(() => ({
  back: `/admin/${slug.value}`,
}));

const persons = computed(() => people.data.value?.persons ?? []);
const label = (id: string) => {
  const p = persons.value.find((x) => x.id === id);
  if (!p) return '?';
  const twins = persons.value.filter(
    (x) => x.id !== id && x.firstName === p.firstName,
  );
  return twins.length && p.lastName
    ? `${p.firstName} ${p.lastName}`
    : p.firstName;
};
const exclusionCount = computed(
  () => people.data.value?.exclusions.length ?? 0,
);
const subtitle = (active: boolean) =>
  active ? undefined : t('adminGroup.people.inactive');
const sorted = computed(() =>
  persons.value.toSorted((a, b) => Number(b.active) - Number(a.active)),
);
</script>

<template>
  <AdminScreen v-bind="screen">
    <div class="flex items-center justify-between gap-3">
      <UiPageTitle>
        {{ t('adminGroup.people.title') }}
      </UiPageTitle>
      <UButton
        :to="`/admin/${slug}/personnes/nouvelle`"
        icon="i-lucide-plus"
        :label="t('common.actions.add')"
      />
    </div>
    <AdminQueryState
      :pending="people.isPending.value"
      :error="people.error.value"
    >
      <p v-if="persons.length === 0" class="text-muted">
        {{ t('adminGroup.people.empty') }}
      </p>
      <UiList v-else :footer="t('adminGroup.people.hint')">
        <UiListItem
          v-for="person in sorted"
          :key="person.id"
          :avatar="person.avatar"
          :to="`/admin/${slug}/personnes/${person.id}`"
          :title="label(person.id)"
          :subtitle="subtitle(person.active)"
          :class="{ 'opacity-60': !person.active }"
        >
        </UiListItem>
      </UiList>
      <UiList>
        <UiListItem
          :to="`/admin/${slug}/invitation`"
          icon="i-lucide-link"
          :title="t('adminEdition.invite.title')"
          :subtitle="inviteSummary"
          data-testid="invite-row"
        />
      </UiList>
      <UiList>
        <UiListItem
          :to="`/admin/${slug}/exclusions`"
          icon="i-lucide-ban"
          :title="t('adminGroup.exclusions.title')"
          :subtitle="t('adminGroup.exclusions.summary')"
        >
          <template #trailing>
            <UBadge
              :label="String(exclusionCount)"
              :color="exclusionCount > 0 ? 'primary' : 'neutral'"
              variant="subtle"
              class="shrink-0 rounded-full tabular-nums"
              :aria-label="
                t('common.count.exclusions', { count: exclusionCount })
              "
            />
          </template>
        </UiListItem>
      </UiList>
    </AdminQueryState>
  </AdminScreen>
</template>
