<script setup>
import {
  useCreateEditionMutation,
  useDashboardQuery,
} from '~/composables/queries/useGroup.js';
import { errorMessage } from '~/utils/errors.js';
import { formatDate } from '~/utils/labels.js';

definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const slug = computed(() => route.params.slug);
const dashboard = useDashboardQuery(slug);
const create = useCreateEditionMutation(slug);
useHead({
  title: computed(
    () => `${dashboard.data.value?.group.name ?? 'Groupe'} — Secret Santa`,
  ),
});

const form = reactive({ label: '', year: new Date().getFullYear() });
watch(
  () => dashboard.data.value?.nextEdition,
  (next) => {
    if (next) {
      form.label = next.label;
      form.year = next.year;
    }
  },
  { immediate: true },
);
const current = computed(() =>
  dashboard.data.value?.editions.find(
    (e) => e.id === dashboard.data.value.currentEditionId,
  ),
);
const past = computed(() =>
  (dashboard.data.value?.editions ?? [])
    .filter((e) => e.id !== dashboard.data.value?.currentEditionId)
    .toReversed(),
);
const submit = () =>
  create.mutate(
    { label: form.label, year: Number(form.year) },
    {
      onSuccess: ({ edition }) =>
        navigateTo(`/admin/${slug.value}/editions/${edition.id}`),
    },
  );
</script>

<template>
  <div class="flex flex-col gap-4">
    <UiNotice v-if="dashboard.isError.value">{{
      errorMessage(dashboard.error.value)
    }}</UiNotice>
    <p v-else-if="dashboard.isPending.value" class="text-sm text-neutral-500">
      Chargement…
    </p>
    <template v-else>
      <h1 class="text-xl font-bold">{{ dashboard.data.value.group.name }}</h1>

      <UiCard v-if="current">
        <template #title>Édition en cours</template>
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p class="font-semibold">{{ current.label }}</p>
            <p class="text-sm text-neutral-500">
              <AdminStatusBadge :code="current.status" /> ·
              {{ current.participantCount }} participant{{
                current.participantCount > 1 ? 's' : ''
              }}
            </p>
          </div>
          <NuxtLink
            :to="`/admin/${slug}/editions/${current.id}`"
            class="font-semibold text-red-700 underline"
            >Piloter</NuxtLink
          >
        </div>
      </UiCard>

      <UiCard v-else>
        <template #title>Nouvelle édition</template>
        <p class="mb-3 text-sm text-neutral-600">
          Les participants de l'édition précédente encore actifs sont repris
          automatiquement ; tu pourras ajuster la liste ensuite.
        </p>
        <form class="flex flex-col gap-3" @submit.prevent="submit">
          <UiField id="label" label="Nom de l'édition">
            <UiInput id="label" v-model="form.label" required />
          </UiField>
          <UiField id="year" label="Année">
            <UiInput
              id="year"
              v-model="form.year"
              type="number"
              min="2000"
              max="2100"
              required
              inputmode="numeric"
            />
          </UiField>
          <UiNotice v-if="create.isError.value">{{
            errorMessage(create.error.value)
          }}</UiNotice>
          <UiButton type="submit" :loading="create.isPending.value"
            >Créer l'édition</UiButton
          >
        </form>
      </UiCard>

      <UiCard v-if="past.length">
        <template #title>Éditions passées</template>
        <ul class="divide-y divide-neutral-100">
          <li
            v-for="edition in past"
            :key="edition.id"
            class="flex items-center justify-between gap-2 py-2"
          >
            <div>
              <p class="font-medium">{{ edition.label }}</p>
              <p class="text-xs text-neutral-500">
                {{ edition.participantCount }} participants ·
                {{ formatDate(edition.closedAt ?? edition.createdAt) }}
              </p>
            </div>
            <div class="flex items-center gap-2">
              <AdminStatusBadge :code="edition.status" />
              <NuxtLink
                :to="`/admin/${slug}/editions/${edition.id}`"
                class="text-sm text-red-700 underline"
                >Voir</NuxtLink
              >
            </div>
          </li>
        </ul>
      </UiCard>
    </template>
  </div>
</template>
