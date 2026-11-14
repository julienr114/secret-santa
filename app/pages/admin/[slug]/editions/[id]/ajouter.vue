<script setup lang="ts">
import {
  useDashboardQuery,
  useEditionQuery,
  usePeopleQuery,
} from '~/composables/queries/useGroup';
import { useAddParticipantMutation } from '~/composables/queries/useEdition';

definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const id = computed(() => String(route.params.id));
const toast = useToast();
const { t } = useT();
const errorMessage = useErrorMessage();
const edition = useEditionQuery(slug, id);
const dashboard = useDashboardQuery(slug);
const people = usePeopleQuery(slug);
const add = useAddParticipantMutation(slug, id);

useHead({
  title: computed(
    () => `${t('adminEdition.addParticipants.title')} — ${t('common.appName')}`,
  ),
});
const screen = computed(() => ({
  back: `/admin/${slug.value}/editions/${id.value}`,
  crumbs: [
    {
      label: dashboard.data.value?.group.name ?? slug.value,
      to: `/admin/${slug.value}`,
    },
    {
      label:
        edition.data.value?.edition.label ??
        t('adminEdition.general.editionFallback'),
      to: `/admin/${slug.value}/editions/${id.value}`,
    },
    { label: t('adminEdition.addParticipants.crumb') },
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
// The sentence around the link to the people screen: the text before and
// after the `{people}` placeholder, left unfilled on purpose.
const everyoneIn = computed(() =>
  t('adminEdition.addParticipants.everyoneIn').split('{people}'),
);
const onAdd = (personId: string, firstName: string) =>
  add.mutate(personId, {
    onSuccess: () =>
      toast.add({
        title: t('adminEdition.addParticipants.added', { name: firstName }),
        color: 'success',
        icon: 'i-lucide-check',
      }),
    onError: (error) =>
      toast.add({ title: errorMessage(error), color: 'error' }),
  });
</script>

<template>
  <AdminScreen v-bind="screen">
    <UiPageTitle>
      {{ t('adminEdition.addParticipants.title') }}
    </UiPageTitle>
    <AdminQueryState
      :pending="people.isPending.value || edition.isPending.value"
      :error="people.error.value ?? edition.error.value"
    >
      <p v-if="candidates.length === 0" class="text-muted">
        {{ everyoneIn[0]
        }}<NuxtLink
          :to="`/admin/${slug}/personnes/nouvelle`"
          class="text-primary underline"
          >{{ t('adminEdition.addParticipants.peopleLink') }}</NuxtLink
        >{{ everyoneIn[1] }}
      </p>
      <UiList v-else :footer="t('adminEdition.addParticipants.footer')">
        <UiListItem
          v-for="person in candidates"
          :key="person.id"
          :avatar="person.avatar"
          :title="person.firstName"
          :subtitle="person.lastName ?? undefined"
          @click="onAdd(person.id, person.firstName)"
        >
          <template #trailing>
            <UIcon name="i-lucide-plus-circle" class="size-6 text-primary" />
          </template>
        </UiListItem>
      </UiList>
    </AdminQueryState>
  </AdminScreen>
</template>
