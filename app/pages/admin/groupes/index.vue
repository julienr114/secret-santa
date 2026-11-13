<script setup lang="ts">
import { useGroupsQuery } from '~/composables/queries/useGroups';

definePageMeta({ middleware: 'admin', layout: 'admin' });
useHead({ title: 'Groupes — Secret Santa' });
const screen = computed(() => ({ back: null, crumbs: [{ label: 'Groupes' }] }));

const groups = useGroupsQuery();
</script>

<template>
  <AdminScreen v-bind="screen">
    <div class="flex items-center justify-between gap-3">
      <h1 class="font-display text-3xl font-bold">Groupes</h1>
      <UButton
        to="/admin/groupes/nouveau"
        icon="i-lucide-plus"
        label="Nouveau"
      />
    </div>

    <AdminQueryState
      :pending="groups.isPending.value"
      :error="groups.error.value"
    >
      <p v-if="groups.data.value?.groups.length === 0" class="text-muted">
        Aucun groupe pour l'instant. Crée la première famille avec « Nouveau ».
      </p>
      <MobileList v-else>
        <MobileListItem
          v-for="group in groups.data.value?.groups ?? []"
          :key="group.id"
          :to="`/admin/${group.slug}`"
          emoji="🎄"
          :title="group.name"
          :subtitle="
            group.hasGuardianPassword
              ? 'Gardien configuré'
              : 'Gardien à configurer'
          "
        />
      </MobileList>
    </AdminQueryState>
  </AdminScreen>
</template>
