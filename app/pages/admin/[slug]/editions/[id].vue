<script setup lang="ts">
import {
  useDashboardQuery,
  useEditionQuery,
} from '~/composables/queries/useGroup';
import { plural } from '~/utils/labels';

// Edition cockpit. Step 3 shows the participants; step 4 adds the actions
// (links, draw, cancel, close).
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const id = computed(() => String(route.params.id));
const edition = useEditionQuery(slug, id);
const dashboard = useDashboardQuery(slug);
const label = computed(() => edition.data.value?.edition.label ?? 'Édition');
useHead({ title: computed(() => `${label.value} — Secret Santa`) });
const screen = computed(() => ({
  back: `/admin/${slug.value}`,
  crumbs: [
    {
      label: dashboard.data.value?.group.name ?? slug.value,
      to: `/admin/${slug.value}`,
    },
    { label: label.value },
  ],
}));
const subtitle = computed(() => {
  const rules = edition.data.value?.rules;
  return [
    rules?.budget && `Budget ${rules.budget}`,
    rules?.eventDate && `le ${rules.eventDate}`,
  ]
    .filter(Boolean)
    .join(' · ');
});
</script>

<template>
  <AdminScreen v-bind="screen">
    <AdminQueryState
      :pending="edition.isPending.value"
      :error="edition.error.value"
    >
      <template v-if="edition.data.value">
        <div class="flex flex-col gap-1">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <h1 class="font-display text-3xl font-bold">{{ label }}</h1>
            <AdminStatusBadge :code="edition.data.value.edition.status" />
          </div>
          <p v-if="subtitle" class="text-muted">{{ subtitle }}</p>
        </div>
        <p
          v-if="edition.data.value.participants.length === 0"
          class="text-muted"
        >
          Personne pour l'instant.
        </p>
        <MobileList
          v-else
          :title="plural(edition.data.value.participants.length, 'participant')"
        >
          <MobileListItem
            v-for="p in edition.data.value.participants"
            :key="p.participationId"
            :title="p.firstName"
            :subtitle="p.badges.length === 0 ? 'en attente' : undefined"
          >
            <template #trailing>
              <div class="flex flex-wrap justify-end gap-1">
                <AdminStatusBadge
                  v-for="badge in p.badges"
                  :key="badge"
                  :code="badge"
                />
              </div>
            </template>
          </MobileListItem>
        </MobileList>
        <UAlert
          color="neutral"
          variant="subtle"
          icon="i-lucide-info"
          description="Les actions de pilotage (envoi des liens, tirage, clôture) arrivent à l'étape 4."
        />
      </template>
    </AdminQueryState>
  </AdminScreen>
</template>
