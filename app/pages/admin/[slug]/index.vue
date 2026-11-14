<script setup lang="ts">
import { useDashboardQuery } from '~/composables/queries/useGroup';
import { useDeleteGroupMutation } from '~/composables/queries/useGroups';

// Group home: what the guardian can do, as a list of actions.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t, tk } = useT();
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
    >
      <UiPageTitle>{{ name }}</UiPageTitle>

      <UiList :title="t('adminGroup.dashboard.editionSection')">
        <UiListItem
          v-if="current"
          :to="`/admin/${slug}/editions/${current.id}`"
          emoji="🎁"
          :title="current.label"
          :subtitle="editionSubtitle(current.status, current.participantCount)"
        />
        <UiListItem
          v-else
          :to="`/admin/${slug}/editions/nouvelle`"
          icon="i-lucide-plus"
          :title="t('adminGroup.dashboard.newEdition')"
          :subtitle="t('adminGroup.dashboard.newEditionHint')"
        />
      </UiList>

      <UiList :title="t('adminGroup.dashboard.groupSection')">
        <UiListItem
          :to="`/admin/${slug}/personnes`"
          icon="i-lucide-users"
          :title="t('adminGroup.people.title')"
        />
        <UiListItem
          :to="`/admin/${slug}/exclusions`"
          icon="i-lucide-ban"
          :title="t('adminGroup.exclusions.title')"
          :subtitle="t('adminGroup.exclusions.summary')"
        />
        <UiListItem
          :to="`/admin/${slug}/reglages`"
          icon="i-lucide-settings-2"
          :title="t('adminGroup.rules.title')"
        />
        <UiListItem
          :to="`/admin/${slug}/journal`"
          icon="i-lucide-scroll-text"
          :title="t('participant.home.journal.title')"
          :subtitle="t('participant.home.journal.subtitle')"
        />
        <UiListItem
          :to="`/admin/${slug}/organisateurs`"
          icon="i-lucide-user-cog"
          :title="t('adminGroup.organizers.title')"
          :subtitle="t('adminGroup.organizers.summary')"
        />
      </UiList>

      <UiList v-if="isSuper" :title="t('adminGroup.dashboard.superSection')">
        <UiListItem
          icon="i-lucide-trash-2"
          tone="danger"
          :title="t('adminGroup.dashboard.deleteGroup')"
          :subtitle="t('adminGroup.dashboard.deleteGroupHint')"
          @click="openDelete"
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
          :title="edition.label"
          :subtitle="editionSubtitle(edition.status, edition.participantCount)"
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
