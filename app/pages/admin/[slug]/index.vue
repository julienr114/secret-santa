<script setup lang="ts">
import {
  useDashboardQuery,
  useGroupJournalQuery,
  useOrganizersQuery,
  usePeopleQuery,
} from '~/composables/queries/useGroup';
import { useDeleteGroupMutation } from '~/composables/queries/useGroups';

// Group home: the edition going on (or the card to prepare the next one),
// the group in four rows (members, exclusions, journal, settings), then
// the past editions.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t, tk, locale } = useT();
const errorMessage = useErrorMessage();
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const { user } = useUserSession();
const isSuper = computed(() => user.value?.role === 'super_admin');
const dashboard = useDashboardQuery(slug);
const name = computed(() => dashboard.data.value?.group.name ?? slug.value);

useHead({ title: computed(() => `${name.value} — ${t('common.appName')}`) });
const screen = computed(() => ({
  back: '/',
}));

const people = usePeopleQuery(slug);
const organizers = useOrganizersQuery(slug);
const journal = useGroupJournalQuery(slug, locale);
const persons = computed(() => people.data.value?.persons ?? []);
const activeCount = computed(
  () => persons.value.filter((p) => p.active).length,
);
const subtitle = computed(() =>
  [
    t('adminGroup.dashboard.members', { count: activeCount.value }),
    organizers.data.value?.organizers.some((o) => o.me)
      ? t('adminGroup.dashboard.youOrganize')
      : '',
  ]
    .filter(Boolean)
    .join(' · '),
);
const exclusionCount = computed(
  () => people.data.value?.exclusions.length ?? 0,
);
/** The last thing the journal says. */
const lastEvent = computed(
  () =>
    (journal.data.value?.entries ?? []).toSorted((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    )[0]?.text,
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
const toast = useToast();
// Deleting the group and everything in it: super-admin only, and only
// after typing the group's identifier.
const deleteGroup = useDeleteGroupMutation();
const deleteOpen = ref(false);
const deleteConfirm = ref('');
const openDelete = () => {
  deleteConfirm.value = '';
  deleteGroup.reset();
  deleteOpen.value = true;
};
const canDelete = computed(() => deleteConfirm.value.trim() === slug.value);
const onDelete = () => {
  const id = dashboard.data.value?.group.id;
  if (!id || !canDelete.value) return;
  deleteGroup.mutate(
    { id, confirm: deleteConfirm.value },
    {
      onSuccess: () => {
        toast.add({
          title: t('adminGroup.dashboard.deleteDone'),
          color: 'success',
          icon: 'i-lucide-check',
        });
        navigateTo('/', { replace: true });
      },
    },
  );
};
const editionSubtitle = (status: string, count?: number) =>
  `${tk(`common.status.${status}`)} · ${t('common.count.participants', { count: count ?? 0 })}`;
</script>

<template>
  <AdminScreen v-bind="screen">
    <AdminQueryState
      :pending="dashboard.isPending.value"
      :error="dashboard.error.value"
      :skeleton="['title', 'card', 'list']"
    >
      <div class="flex flex-col gap-1">
        <UiPageTitle>{{ name }}</UiPageTitle>
        <p class="text-[15px] text-toned">{{ subtitle }}</p>
      </div>

      <AdminGroupEditionCard
        v-if="current"
        :slug="slug"
        :edition="current"
        :group-date="dashboard.data.value?.rules.eventDate ?? ''"
      />
      <AdminGroupNewEditionCard
        v-else
        :slug="slug"
        :exclude-previous-years="
          dashboard.data.value?.rules.excludePreviousYears ?? 0
        "
      />

      <UiList :title="t('adminGroup.dashboard.groupSection')">
        <UiListItem
          :to="`/admin/${slug}/personnes`"
          icon="i-lucide-users"
          :title="t('adminGroup.dashboard.membersRow')"
          :subtitle="
            t('adminGroup.dashboard.persons', { count: persons.length })
          "
        />
        <UiListItem
          :to="`/admin/${slug}/exclusions`"
          icon="i-lucide-ban"
          :title="t('adminGroup.exclusions.title')"
          :subtitle="
            exclusionCount > 0
              ? t('adminGroup.dashboard.pairs', { count: exclusionCount })
              : t('adminEdition.screen.prepare.exclusionsNone')
          "
        />
        <UiListItem
          :to="`/admin/${slug}/journal`"
          icon="i-lucide-file-text"
          :title="t('adminGroup.dashboard.journal')"
          :subtitle="lastEvent ?? t('adminGroup.dashboard.journalEmpty')"
        />
        <UiListItem
          :to="`/admin/${slug}/reglages`"
          icon="i-lucide-sliders-horizontal"
          :title="t('adminGroup.dashboard.settings')"
          :subtitle="t('adminGroup.dashboard.settingsHint')"
        />
      </UiList>

      <UiList
        v-if="past.length"
        :title="t('adminGroup.dashboard.pastEditions')"
      >
        <UiListItem
          v-for="edition in past"
          :key="edition.id"
          :to="`/admin/${slug}/editions/${edition.id}`"
          icon="i-lucide-archive"
          icon-tone="neutral"
          :title="edition.label"
          :subtitle="editionSubtitle(edition.status, edition.participantCount)"
        />
      </UiList>

      <UiList v-if="isSuper" :title="t('adminGroup.dashboard.superSection')">
        <UiListItem
          icon="i-lucide-trash-2"
          tone="danger"
          :title="t('adminGroup.dashboard.deleteGroup')"
          :subtitle="t('adminGroup.dashboard.deleteGroupHint')"
          :on-click="openDelete"
        />
      </UiList>
      <UDrawer
        v-model:open="deleteOpen"
        :title="t('adminGroup.dashboard.deleteTitle', { name })"
        :description="t('adminGroup.dashboard.deleteDescription')"
      >
        <template #body>
          <form
            id="delete-group-form"
            class="flex flex-col gap-4 py-2"
            novalidate
            @submit.prevent="onDelete"
          >
            <UFormField
              :label="t('adminGroup.dashboard.deleteConfirmLabel', { slug })"
            >
              <UInput
                v-model="deleteConfirm"
                autocomplete="off"
                autocapitalize="off"
                class="w-full"
              />
            </UFormField>
            <UAlert
              v-if="deleteGroup.isError.value"
              color="error"
              variant="subtle"
              :description="errorMessage(deleteGroup.error.value)"
            />
          </form>
        </template>
        <template #footer>
          <UButton
            type="submit"
            form="delete-group-form"
            block
            color="error"
            icon="i-lucide-trash-2"
            :disabled="!canDelete"
            :loading="deleteGroup.isPending.value"
            :label="t('adminGroup.dashboard.deleteAction')"
          />
        </template>
      </UDrawer>
    </AdminQueryState>
  </AdminScreen>
</template>
