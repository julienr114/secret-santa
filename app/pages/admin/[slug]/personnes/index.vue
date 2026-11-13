<script setup lang="ts">
import {
  useDashboardQuery,
  usePeopleQuery,
} from '~/composables/queries/useGroup';

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
const couples = computed(() =>
  (people.data.value?.couples ?? []).filter((c) => c.active),
);
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
const partnerOf = (id: string) => {
  const c = couples.value.find((x) => x.personAId === id || x.personBId === id);
  return c ? label(c.personAId === id ? c.personBId : c.personAId) : null;
};
const subtitle = (id: string, phone: string | null, active: boolean) =>
  [
    !active && 'désactivé·e',
    partnerOf(id) && `en couple avec ${partnerOf(id)}`,
    phone ?? 'pas de WhatsApp',
  ]
    .filter(Boolean)
    .join(' · ');
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
        Commence par ajouter les membres de la famille.
      </p>
      <MobileList
        v-else
        footer="Touche une personne pour la modifier, gérer son couple ou la désactiver."
      >
        <MobileListItem
          v-for="person in sorted"
          :key="person.id"
          :to="`/admin/${slug}/personnes/${person.id}`"
          :title="label(person.id)"
          :subtitle="subtitle(person.id, person.phone, person.active)"
          :class="{ 'opacity-60': !person.active }"
        >
          <template #trailing>
            <UIcon
              v-if="person.hasPin"
              name="i-lucide-lock-keyhole"
              class="size-4 text-muted"
              aria-label="code choisi"
            />
          </template>
        </MobileListItem>
      </MobileList>
      <MobileList>
        <MobileListItem
          :to="`/admin/${slug}/exclusions`"
          icon="i-lucide-ban"
          title="Exclusions"
          subtitle="Paires qui ne se tirent jamais"
        />
      </MobileList>
    </AdminQueryState>
  </AdminScreen>
</template>
