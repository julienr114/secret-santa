<script setup lang="ts">
import { useDashboardQuery } from '~/composables/queries/useGroup';
import { STATUS_LABELS, plural } from '~/utils/labels';

// Group home: what the guardian can do, as a list of actions.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const { user } = useUserSession();
const isSuper = computed(() => user.value?.role === 'super_admin');
const dashboard = useDashboardQuery(slug);
const name = computed(() => dashboard.data.value?.group.name ?? slug.value);

useHead({ title: computed(() => `${name.value} — Secret Santa`) });
const screen = computed(() => ({
  back: isSuper.value ? '/admin/groupes' : null,
  crumbs: [
    ...(isSuper.value ? [{ label: 'Groupes', to: '/admin/groupes' }] : []),
    { label: name.value },
  ],
}));

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
  `${STATUS_LABELS[status] ?? status} · ${plural(count ?? 0, 'participant')}`;
</script>

<template>
  <AdminScreen v-bind="screen">
    <AdminQueryState
      :pending="dashboard.isPending.value"
      :error="dashboard.error.value"
    >
      <h1 class="font-display text-3xl font-bold">{{ name }}</h1>

      <MobileList title="Édition">
        <MobileListItem
          v-if="current"
          :to="`/admin/${slug}/editions/${current.id}`"
          emoji="🎁"
          :title="current.label"
          :subtitle="editionSubtitle(current.status, current.participantCount)"
        />
        <MobileListItem
          v-else
          :to="`/admin/${slug}/editions/nouvelle`"
          icon="i-lucide-plus"
          title="Nouvelle édition"
          subtitle="Reprend les participants de l'an dernier"
        />
      </MobileList>

      <MobileList title="Groupe">
        <MobileListItem
          :to="`/admin/${slug}/personnes`"
          icon="i-lucide-users"
          title="Personnes et couples"
        />
        <MobileListItem
          :to="`/admin/${slug}/exclusions`"
          icon="i-lucide-ban"
          title="Exclusions"
          subtitle="Paires qui ne se tirent jamais"
        />
        <MobileListItem
          :to="`/admin/${slug}/reglages`"
          icon="i-lucide-settings-2"
          title="Règles du tirage"
        />
        <MobileListItem
          v-if="isSuper"
          :to="`/admin/${slug}/gardien`"
          icon="i-lucide-key-round"
          title="Mot de passe du gardien"
          :subtitle="
            dashboard.data.value?.group.hasGuardianPassword
              ? 'Configuré'
              : 'À définir'
          "
        />
      </MobileList>

      <MobileList v-if="past.length" title="Éditions passées">
        <MobileListItem
          v-for="edition in past"
          :key="edition.id"
          :to="`/admin/${slug}/editions/${edition.id}`"
          :title="edition.label"
          :subtitle="editionSubtitle(edition.status, edition.participantCount)"
        />
      </MobileList>
    </AdminQueryState>
  </AdminScreen>
</template>
