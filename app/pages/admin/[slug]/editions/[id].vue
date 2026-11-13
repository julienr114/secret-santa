<script setup>
import { useEditionQuery } from '../../../../composables/queries/useGroup.js';
import { errorMessage } from '../../../../utils/errors.js';

// Edition cockpit. Step 3 shows the participants; step 4 adds the actions
// (links, draw, cancel, close).
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const slug = computed(() => route.params.slug);
const id = computed(() => route.params.id);
const edition = useEditionQuery(slug, id);
useHead({
  title: computed(
    () => `${edition.data.value?.edition.label ?? 'Édition'} — Secret Santa`,
  ),
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <UiNotice v-if="edition.isError.value">{{
      errorMessage(edition.error.value)
    }}</UiNotice>
    <p v-else-if="edition.isPending.value" class="text-sm text-neutral-500">
      Chargement…
    </p>
    <template v-else>
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h1 class="text-xl font-bold">
          {{ edition.data.value.edition.label }}
        </h1>
        <AdminStatusBadge :code="edition.data.value.edition.status" />
      </div>
      <p class="text-sm text-neutral-600">
        Budget : {{ edition.data.value.rules.budget || '—' }} · Date :
        {{ edition.data.value.rules.eventDate || '—' }}
      </p>
      <UiCard>
        <template #title
          >{{ edition.data.value.participants.length }} participant{{
            edition.data.value.participants.length > 1 ? 's' : ''
          }}</template
        >
        <p
          v-if="edition.data.value.participants.length === 0"
          class="text-sm text-neutral-500"
        >
          Personne pour l'instant.
        </p>
        <ul class="divide-y divide-neutral-100">
          <li
            v-for="p in edition.data.value.participants"
            :key="p.participationId"
            class="flex flex-wrap items-center justify-between gap-2 py-2"
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
              <span
                v-if="p.badges.length === 0"
                class="text-xs text-neutral-400"
                >en attente</span
              >
            </div>
          </li>
        </ul>
      </UiCard>
      <UiNotice tone="info"
        >Les actions de pilotage (envoi des liens, tirage, clôture) arrivent à
        l'étape 4.</UiNotice
      >
    </template>
  </div>
</template>
