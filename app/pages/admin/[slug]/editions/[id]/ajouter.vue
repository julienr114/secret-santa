<script setup lang="ts">
import {
  useDashboardQuery,
  useEditionQuery,
  usePeopleQuery,
} from '~/composables/queries/useGroup';
import { useAddParticipantMutation } from '~/composables/queries/useEdition';
import { errorMessage } from '~/utils/errors';

definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const id = computed(() => String(route.params.id));
const toast = useToast();
const edition = useEditionQuery(slug, id);
const dashboard = useDashboardQuery(slug);
const people = usePeopleQuery(slug);
const add = useAddParticipantMutation(slug, id);

useHead({ title: 'Ajouter des participants — Secret Santa' });
const screen = computed(() => ({
  back: `/admin/${slug.value}/editions/${id.value}`,
  crumbs: [
    {
      label: dashboard.data.value?.group.name ?? slug.value,
      to: `/admin/${slug.value}`,
    },
    {
      label: edition.data.value?.edition.label ?? 'Édition',
      to: `/admin/${slug.value}/editions/${id.value}`,
    },
    { label: 'Ajouter' },
  ],
}));

const inEdition = computed(
  () => new Set(edition.data.value?.participants.map((p) => p.id) ?? []),
);
const candidates = computed(() =>
  (people.data.value?.persons ?? []).filter(
    (p) => p.active && !inEdition.value.has(p.id),
  ),
);
const onAdd = (personId: string, firstName: string) =>
  add.mutate(personId, {
    onSuccess: () =>
      toast.add({
        title: `${firstName} participe`,
        color: 'success',
        icon: 'i-lucide-check',
      }),
    onError: (error) =>
      toast.add({ title: errorMessage(error), color: 'error' }),
  });
</script>

<template>
  <AdminScreen v-bind="screen">
    <h1 class="font-display text-3xl font-bold">Ajouter des participants</h1>
    <AdminQueryState
      :pending="people.isPending.value || edition.isPending.value"
      :error="people.error.value ?? edition.error.value"
    >
      <p v-if="candidates.length === 0" class="text-muted">
        Tout le monde participe déjà. Pour quelqu'un de nouveau, crée-le d'abord
        dans
        <NuxtLink
          :to="`/admin/${slug}/personnes/nouvelle`"
          class="text-primary underline"
          >Personnes</NuxtLink
        >.
      </p>
      <MobileList
        v-else
        footer="Les personnes désactivées n'apparaissent pas ici."
      >
        <MobileListItem
          v-for="person in candidates"
          :key="person.id"
          :title="person.firstName"
          :subtitle="person.lastName ?? undefined"
          @click="onAdd(person.id, person.firstName)"
        >
          <template #trailing>
            <UIcon name="i-lucide-plus-circle" class="size-6 text-primary" />
          </template>
        </MobileListItem>
      </MobileList>
    </AdminQueryState>
  </AdminScreen>
</template>
