<script setup lang="ts">
import { z } from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';
import {
  useCreateEditionMutation,
  useDashboardQuery,
} from '~/composables/queries/useGroup';
import { errorMessage } from '~/utils/errors';
import { formatDate, plural } from '~/utils/labels';

definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const dashboard = useDashboardQuery(slug);
const create = useCreateEditionMutation(slug);
useHead({
  title: computed(
    () => `${dashboard.data.value?.group.name ?? 'Groupe'} — Secret Santa`,
  ),
});

const schema = z.object({
  label: z.string().trim().min(1, 'Nom requis').max(60),
  year: z.coerce.number().int().min(2000).max(2100),
});
type Schema = z.output<typeof schema>;
const state = reactive({ label: '', year: new Date().getFullYear() });
watch(
  () => dashboard.data.value?.nextEdition,
  (next) => next && Object.assign(state, next),
  { immediate: true },
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
const onCreate = (event: FormSubmitEvent<Schema>) =>
  create.mutate(event.data, {
    onSuccess: ({ edition }) =>
      navigateTo(`/admin/${slug.value}/editions/${edition.id}`),
  });
</script>

<template>
  <div class="flex flex-col gap-4">
    <AdminQueryState
      :pending="dashboard.isPending.value"
      :error="dashboard.error.value"
    >
      <h1 class="font-display text-2xl font-bold">
        {{ dashboard.data.value?.group.name }}
      </h1>

      <UCard v-if="current">
        <template #header
          ><h2 class="font-semibold">Édition en cours</h2></template
        >
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="font-display text-xl font-semibold">
              {{ current.label }}
            </p>
            <p class="mt-1 flex items-center gap-2 text-sm text-muted">
              <AdminStatusBadge :code="current.status" />
              {{ plural(current.participantCount ?? 0, 'participant') }}
            </p>
          </div>
          <UButton
            :to="`/admin/${slug}/editions/${current.id}`"
            icon="i-lucide-sparkles"
            label="Piloter"
          />
        </div>
      </UCard>

      <UCard v-else>
        <template #header
          ><h2 class="font-semibold">Nouvelle édition</h2></template
        >
        <p class="mb-4 text-sm text-muted">
          Les participants de l'édition précédente encore actifs sont repris
          automatiquement ; tu pourras ajuster la liste ensuite.
        </p>
        <UForm
          :schema="schema"
          :state="state"
          class="flex flex-col gap-4"
          @submit="onCreate"
        >
          <UFormField name="label" label="Nom de l'édition" required>
            <UInput v-model="state.label" class="w-full" />
          </UFormField>
          <UFormField name="year" label="Année" required>
            <UInput
              v-model="state.year"
              type="number"
              inputmode="numeric"
              class="w-full"
            />
          </UFormField>
          <UAlert
            v-if="create.isError.value"
            color="error"
            variant="subtle"
            :description="errorMessage(create.error.value)"
          />
          <UButton
            type="submit"
            :loading="create.isPending.value"
            label="Créer l'édition"
          />
        </UForm>
      </UCard>

      <UCard v-if="past.length">
        <template #header
          ><h2 class="font-semibold">Éditions passées</h2></template
        >
        <ul class="divide-y divide-default">
          <li
            v-for="edition in past"
            :key="edition.id"
            class="flex items-center justify-between gap-2 py-3"
          >
            <div>
              <p class="font-medium">{{ edition.label }}</p>
              <p class="text-xs text-muted">
                {{ plural(edition.participantCount ?? 0, 'participant') }} ·
                {{ formatDate(edition.closedAt ?? edition.createdAt) }}
              </p>
            </div>
            <div class="flex items-center gap-2">
              <AdminStatusBadge :code="edition.status" />
              <UButton
                :to="`/admin/${slug}/editions/${edition.id}`"
                variant="ghost"
                color="neutral"
                size="sm"
                label="Voir"
              />
            </div>
          </li>
        </ul>
      </UCard>
    </AdminQueryState>
  </div>
</template>
