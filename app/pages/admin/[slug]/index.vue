<script setup lang="ts">
import { useDashboardQuery } from '~/composables/queries/useGroup';
import {
  useDeleteGroupMutation,
  useUpdateGroupMutation,
} from '~/composables/queries/useGroups';

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
  back: isSuper.value ? '/admin/groupes' : null,
  crumbs: [
    ...(isSuper.value
      ? [{ label: t('adminGroup.groups.title'), to: '/admin/groupes' }]
      : []),
    { label: name.value },
  ],
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
// Bulk sending by email: the super-admin's switch, never the guardian's.
const toast = useToast();
const updateGroup = useUpdateGroupMutation();
const emailSending = computed(
  () => dashboard.data.value?.group.emailSending ?? false,
);
const onToggleEmail = (value: boolean) => {
  const id = dashboard.data.value?.group.id;
  if (!id) return;
  updateGroup.mutate(
    { id, emailSending: value },
    {
      onError: (error) =>
        toast.add({ title: errorMessage(error), color: 'error' }),
    },
  );
};
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
        navigateTo('/admin/groupes', { replace: true });
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
      <h1 class="font-display text-3xl font-bold">{{ name }}</h1>

      <MobileList :title="t('adminGroup.dashboard.editionSection')">
        <MobileListItem
          v-if="current"
          :to="`/admin/${slug}/editions/${current.id}`"
          emoji="🎁"
          :title="current.label"
          :subtitle="editionSubtitle(current.status, current.participantCount)"
        />
        <MobileListItem
          v-else
          :to="`/admin/${slug}/editions/nouvelle`"
          icon="i-lucide-plus"
          :title="t('adminGroup.dashboard.newEdition')"
          :subtitle="t('adminGroup.dashboard.newEditionHint')"
        />
      </MobileList>

      <MobileList :title="t('adminGroup.dashboard.groupSection')">
        <MobileListItem
          :to="`/admin/${slug}/personnes`"
          icon="i-lucide-users"
          :title="t('adminGroup.people.title')"
        />
        <MobileListItem
          :to="`/admin/${slug}/exclusions`"
          icon="i-lucide-ban"
          :title="t('adminGroup.exclusions.title')"
          :subtitle="t('adminGroup.exclusions.summary')"
        />
        <MobileListItem
          :to="`/admin/${slug}/reglages`"
          icon="i-lucide-settings-2"
          :title="t('adminGroup.rules.title')"
        />
        <MobileListItem
          :to="`/admin/${slug}/journal`"
          icon="i-lucide-scroll-text"
          :title="t('participant.home.journal.title')"
          :subtitle="t('participant.home.journal.subtitle')"
        />
        <MobileListItem
          v-if="isSuper"
          :to="`/admin/${slug}/gardien`"
          icon="i-lucide-key-round"
          :title="t('adminGroup.guardian.title')"
          :subtitle="
            dashboard.data.value?.group.hasGuardianPassword
              ? t('adminGroup.dashboard.guardianPasswordSet')
              : t('adminGroup.dashboard.guardianPasswordMissing')
          "
        />
      </MobileList>

      <MobileList
        v-if="isSuper"
        :title="t('adminGroup.dashboard.superSection')"
        :footer="t('adminGroup.dashboard.emailSendingHelp')"
      >
        <MobileListItem
          icon="i-lucide-mail"
          :title="t('adminGroup.dashboard.emailSending')"
          :subtitle="
            emailSending
              ? t('adminGroup.dashboard.emailSendingOn')
              : t('adminGroup.dashboard.emailSendingOff')
          "
        >
          <template #trailing>
            <USwitch
              :model-value="emailSending"
              :loading="updateGroup.isPending.value"
              :aria-label="t('adminGroup.dashboard.emailSending')"
              @update:model-value="onToggleEmail"
            />
          </template>
        </MobileListItem>
        <MobileListItem
          icon="i-lucide-trash-2"
          tone="danger"
          :title="t('adminGroup.dashboard.deleteGroup')"
          :subtitle="t('adminGroup.dashboard.deleteGroupHint')"
          @click="openDelete"
        />
      </MobileList>

      <MobileList
        v-if="past.length"
        :title="t('adminGroup.dashboard.pastEditions')"
      >
        <MobileListItem
          v-for="edition in past"
          :key="edition.id"
          :to="`/admin/${slug}/editions/${edition.id}`"
          :title="edition.label"
          :subtitle="editionSubtitle(edition.status, edition.participantCount)"
        />
      </MobileList>
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
