<script setup lang="ts">
import type { PersonFormValue } from '~/components/admin/PersonForm.vue';
import {
  useDashboardQuery,
  useDeletePersonMutation,
  usePeopleQuery,
  useUpdatePersonMutation,
} from '~/composables/queries/useGroup';
import { errorMessage } from '~/utils/errors';

definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const id = computed(() => String(route.params.id));
const toast = useToast();
const onError = (error: unknown) =>
  toast.add({ title: errorMessage(error), color: 'error' });

const dashboard = useDashboardQuery(slug);
const people = usePeopleQuery(slug);
const update = useUpdatePersonMutation(slug);
const remove = useDeletePersonMutation(slug);

const persons = computed(() => people.data.value?.persons ?? []);
const person = computed(
  () => persons.value.find((p) => p.id === id.value) ?? null,
);
const nameOf = (pid: string) =>
  persons.value.find((p) => p.id === pid)?.firstName ?? '?';
const exclusions = computed(() =>
  (people.data.value?.exclusions ?? [])
    .filter((e) => e.giverId === id.value || e.receiverId === id.value)
    .map((e) =>
      e.giverId === id.value ? nameOf(e.receiverId) : nameOf(e.giverId),
    ),
);

const groupName = computed(
  () => dashboard.data.value?.group.name ?? slug.value,
);
useHead({
  title: computed(
    () => `${person.value?.firstName ?? 'Personne'} — Secret Santa`,
  ),
});
const screen = computed(() => ({
  back: `/admin/${slug.value}/personnes`,
  crumbs: [
    { label: groupName.value, to: `/admin/${slug.value}` },
    { label: 'Personnes', to: `/admin/${slug.value}/personnes` },
    { label: person.value?.firstName ?? '…' },
  ],
}));

const onSave = (value: PersonFormValue) =>
  update.mutate(
    { id: id.value, ...value },
    {
      onSuccess: () =>
        toast.add({
          title: 'Enregistré',
          color: 'success',
          icon: 'i-lucide-check',
        }),
      onError,
    },
  );
const toggleActive = () =>
  person.value &&
  update.mutate({ id: id.value, active: !person.value.active }, { onError });
const confirmDelete = ref(false);
const onDelete = () =>
  remove.mutate(id.value, {
    onSuccess: () =>
      navigateTo(`/admin/${slug.value}/personnes`, { replace: true }),
    onError: (error) => {
      confirmDelete.value = false;
      onError(error);
    },
  });
</script>

<template>
  <AdminScreen v-bind="screen">
    <AdminQueryState
      :pending="people.isPending.value"
      :error="people.error.value"
    >
      <p v-if="!person" class="text-muted">Personne introuvable.</p>
      <template v-else>
        <h1 class="font-display text-3xl font-bold">
          {{ person.firstName }}
        </h1>
        <AdminPersonForm
          :key="person.id"
          :initial="person"
          submit-label="Enregistrer"
          :loading="update.isPending.value"
          @submit="onSave"
        />

        <MobileList title="Ne tire pas">
          <MobileListItem
            :to="`/admin/${slug}/exclusions`"
            icon="i-lucide-ban"
            :title="
              exclusions.length ? exclusions.join(', ') : 'Aucune exclusion'
            "
            subtitle="Gérer les exclusions"
          />
        </MobileList>

        <MobileList
          title="Participation"
          :footer="
            person.active
              ? 'Une personne désactivée n\'est pas reprise dans les prochaines éditions. Son historique est conservé.'
              : undefined
          "
        >
          <MobileListItem
            :icon="person.active ? 'i-lucide-user-x' : 'i-lucide-user-check'"
            :title="person.active ? 'Désactiver' : 'Réactiver'"
            @click="toggleActive"
          />
          <MobileListItem
            v-if="!confirmDelete"
            icon="i-lucide-trash-2"
            title="Supprimer définitivement"
            subtitle="Seulement si elle n'a jamais participé"
            tone="danger"
            @click="confirmDelete = true"
          />
          <li v-else class="flex flex-col gap-2 px-4 py-3">
            <p class="text-sm">
              Supprimer {{ person.firstName }} pour de bon ?
            </p>
            <div class="flex gap-2">
              <UButton
                color="error"
                :loading="remove.isPending.value"
                label="Supprimer"
                @click="onDelete"
              />
              <UButton
                variant="ghost"
                color="neutral"
                label="Annuler"
                @click="confirmDelete = false"
              />
            </div>
          </li>
        </MobileList>
      </template>
    </AdminQueryState>
  </AdminScreen>
</template>
