<script setup lang="ts">
import { useEditionQuery } from '~/composables/queries/useGroup';
import { plural } from '~/utils/labels';

// Edition cockpit. Step 3 shows the participants; step 4 adds the actions
// (links, draw, cancel, close).
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const id = computed(() => String(route.params.id));
const edition = useEditionQuery(slug, id);
useHead({
  title: computed(
    () => `${edition.data.value?.edition.label ?? 'Édition'} — Secret Santa`,
  ),
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <AdminQueryState
      :pending="edition.isPending.value"
      :error="edition.error.value"
    >
      <template v-if="edition.data.value">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h1 class="font-display text-2xl font-bold">
            {{ edition.data.value.edition.label }}
          </h1>
          <AdminStatusBadge :code="edition.data.value.edition.status" />
        </div>
        <p class="text-sm text-muted">
          Budget : {{ edition.data.value.rules.budget || '—' }} · Date :
          {{ edition.data.value.rules.eventDate || '—' }}
        </p>
        <UCard>
          <template #header
            ><h2 class="font-semibold">
              {{
                plural(edition.data.value.participants.length, 'participant')
              }}
            </h2></template
          >
          <p
            v-if="edition.data.value.participants.length === 0"
            class="text-sm text-muted"
          >
            Personne pour l'instant.
          </p>
          <ul class="divide-y divide-default">
            <li
              v-for="p in edition.data.value.participants"
              :key="p.participationId"
              class="flex flex-wrap items-center justify-between gap-2 py-3"
            >
              <AdminPersonName
                :person="p"
                :people="edition.data.value.participants"
                class="font-medium"
              />
              <div class="flex flex-wrap gap-1">
                <AdminStatusBadge
                  v-for="badge in p.badges"
                  :key="badge"
                  :code="badge"
                />
                <span v-if="p.badges.length === 0" class="text-xs text-muted"
                  >en attente</span
                >
              </div>
            </li>
          </ul>
        </UCard>
        <UAlert
          color="neutral"
          variant="subtle"
          icon="i-lucide-info"
          description="Les actions de pilotage (envoi des liens, tirage, clôture) arrivent à l'étape 4."
        />
      </template>
    </AdminQueryState>
  </div>
</template>
