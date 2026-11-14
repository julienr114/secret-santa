<script setup lang="ts">
import type { PersonFormValue } from '~/components/admin/PersonForm.vue';
import {
  useDashboardQuery,
  useDeletePersonMutation,
  usePeopleQuery,
  useUpdatePersonMutation,
} from '~/composables/queries/useGroup';

definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t } = useT();
const errorMessage = useErrorMessage();
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
    () =>
      `${person.value?.firstName ?? t('adminGroup.person.fallbackTitle')} — ${t('common.appName')}`,
  ),
});
const screen = computed(() => ({
  back: `/admin/${slug.value}/personnes`,
  crumbs: [
    { label: groupName.value, to: `/admin/${slug.value}` },
    {
      label: t('adminGroup.people.title'),
      to: `/admin/${slug.value}/personnes`,
    },
    { label: person.value?.firstName ?? '…' },
  ],
}));

const onSave = (value: PersonFormValue) =>
  update.mutate(
    { id: id.value, ...value },
    {
      onSuccess: () =>
        toast.add({
          title: t('adminGroup.person.saved'),
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
      <p v-if="!person" class="text-muted">
        {{ t('adminGroup.person.notFound') }}
      </p>
      <template v-else>
        <UiPageTitle>
          {{ person.firstName }}
        </UiPageTitle>
        <AdminPersonForm
          :key="person.id"
          :initial="person"
          autosave
          @submit="onSave"
        />

        <UiList :title="t('adminGroup.person.doesNotDraw')">
          <UiListItem
            :to="`/admin/${slug}/exclusions`"
            icon="i-lucide-ban"
            :title="
              exclusions.length
                ? exclusions.join(', ')
                : t('adminGroup.person.noExclusion')
            "
            :subtitle="t('adminGroup.person.manageExclusions')"
          />
        </UiList>

        <UiList
          :title="t('adminGroup.person.participation')"
          :footer="
            person.active ? t('adminGroup.person.deactivateHelp') : undefined
          "
        >
          <UiListItem
            :icon="person.active ? 'i-lucide-user-x' : 'i-lucide-user-check'"
            :title="
              person.active
                ? t('adminGroup.person.deactivate')
                : t('adminGroup.person.reactivate')
            "
            @click="toggleActive"
          />
          <UiListItem
            v-if="!confirmDelete"
            icon="i-lucide-trash-2"
            :title="t('adminGroup.person.deleteForever')"
            :subtitle="t('adminGroup.person.deleteHint')"
            tone="danger"
            @click="confirmDelete = true"
          />
          <li v-else class="flex flex-col gap-2 px-4 py-3">
            <p class="text-sm">
              {{
                t('adminGroup.person.deleteConfirm', { name: person.firstName })
              }}
            </p>
            <div class="flex gap-2">
              <UButton
                color="error"
                :loading="remove.isPending.value"
                :label="t('common.actions.delete')"
                @click="onDelete"
              />
              <UButton
                variant="ghost"
                color="neutral"
                :label="t('common.actions.cancel')"
                @click="confirmDelete = false"
              />
            </div>
          </li>
        </UiList>
      </template>
    </AdminQueryState>
  </AdminScreen>
</template>
