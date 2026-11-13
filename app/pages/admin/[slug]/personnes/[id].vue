<script setup lang="ts">
import type { PersonFormValue } from '~/components/admin/PersonForm.vue';
import {
  useCreateCoupleMutation,
  useDashboardQuery,
  useDeletePersonMutation,
  useEndCoupleMutation,
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
const createCouple = useCreateCoupleMutation(slug);
const endCouple = useEndCoupleMutation(slug);

const persons = computed(() => people.data.value?.persons ?? []);
const person = computed(
  () => persons.value.find((p) => p.id === id.value) ?? null,
);
const couples = computed(() =>
  (people.data.value?.couples ?? []).filter((c) => c.active),
);
const couple = computed(
  () =>
    couples.value.find(
      (c) => c.personAId === id.value || c.personBId === id.value,
    ) ?? null,
);
const nameOf = (pid: string) =>
  persons.value.find((p) => p.id === pid)?.firstName ?? '?';
const partnerName = computed(() =>
  couple.value
    ? nameOf(
        couple.value.personAId === id.value
          ? couple.value.personBId
          : couple.value.personAId,
      )
    : null,
);
const partnerOptions = computed(() =>
  persons.value
    .filter((p) => p.active && p.id !== id.value)
    .filter(
      (p) =>
        !couples.value.some(
          (c) => c.personAId === p.id || c.personBId === p.id,
        ),
    )
    .map((p) => ({
      label: p.firstName + (p.lastName ? ` ${p.lastName}` : ''),
      value: p.id,
    })),
);
const partner = ref<string | undefined>();

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
const addCouple = () =>
  partner.value &&
  createCouple.mutate(
    { personAId: id.value, personBId: partner.value },
    {
      onSuccess: () => {
        partner.value = undefined;
      },
      onError,
    },
  );
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
        <h1 class="font-display text-3xl font-bold">{{ person.firstName }}</h1>
        <AdminPersonForm
          :key="person.id"
          :initial="person"
          submit-label="Enregistrer"
          :loading="update.isPending.value"
          @submit="onSave"
        />

        <MobileList title="Couple">
          <MobileListItem
            v-if="couple"
            icon="i-lucide-heart"
            :title="`En couple avec ${partnerName}`"
          >
            <template #trailing>
              <UButton
                variant="ghost"
                color="neutral"
                size="sm"
                label="Séparer"
                :loading="endCouple.isPending.value"
                @click.stop="endCouple.mutate(couple.id, { onError })"
              />
            </template>
          </MobileListItem>
          <li v-else class="flex items-center gap-2 px-4 py-3">
            <USelect
              v-model="partner"
              :items="partnerOptions"
              placeholder="En couple avec…"
              class="grow"
            />
            <UButton
              variant="soft"
              :disabled="!partner"
              :loading="createCouple.isPending.value"
              label="Lier"
              @click="addCouple"
            />
          </li>
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
