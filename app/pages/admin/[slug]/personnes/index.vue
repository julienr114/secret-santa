<script setup lang="ts">
import {
  useDashboardQuery,
  usePeopleQuery,
} from '~/composables/queries/useGroup';
import { plural } from '~/utils/labels';

definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const dashboard = useDashboardQuery(slug);
const people = usePeopleQuery(slug);
const name = computed(() => dashboard.data.value?.group.name ?? slug.value);
useHead({ title: 'Personnes — Secret Santa' });
const screen = computed(() => ({
  back: `/admin/${slug.value}`,
  crumbs: [
    { label: name.value, to: `/admin/${slug.value}` },
    { label: 'Personnes' },
  ],
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
const subtitle = (active: boolean) => (active ? undefined : 'désactivé·e');
const sorted = computed(() =>
  persons.value.toSorted((a, b) => Number(b.active) - Number(a.active)),
);
</script>

<template>
  <AdminScreen v-bind="screen">
    <div class="flex items-center justify-between gap-3">
      <h1 class="font-display text-3xl font-bold">Personnes</h1>
      <UButton
        :to="`/admin/${slug}/personnes/nouvelle`"
        icon="i-lucide-plus"
        label="Ajouter"
      />
    </div>
    <AdminQueryState
      :pending="people.isPending.value"
      :error="people.error.value"
    >
      <p v-if="persons.length === 0" class="text-muted">
        Commence par ajouter les membres du groupe.
      </p>
      <MobileList
        v-else
        footer="Touche une personne pour la modifier ou la désactiver."
      >
        <MobileListItem
          v-for="person in sorted"
          :key="person.id"
          :avatar="person.avatar"
          :to="`/admin/${slug}/personnes/${person.id}`"
          :title="label(person.id)"
          :subtitle="subtitle(person.active)"
          :class="{ 'opacity-60': !person.active }"
        >
        </MobileListItem>
      </MobileList>
      <MobileList>
        <MobileListItem
          :to="`/admin/${slug}/exclusions`"
          icon="i-lucide-ban"
          title="Exclusions"
          subtitle="Paires qui ne se tirent jamais"
        >
          <template #trailing>
            <UBadge
              :label="String(exclusionCount)"
              :color="exclusionCount > 0 ? 'primary' : 'neutral'"
              variant="subtle"
              class="shrink-0 rounded-full tabular-nums"
              :aria-label="plural(exclusionCount, 'exclusion')"
            />
          </template>
        </MobileListItem>
      </MobileList>
    </AdminQueryState>
  </AdminScreen>
</template>
