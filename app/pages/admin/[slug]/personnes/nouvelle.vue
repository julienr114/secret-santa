<script setup lang="ts">
import type { PersonFormValue } from '~/components/admin/PersonForm.vue';
import {
  useCreatePersonMutation,
  useDashboardQuery,
} from '~/composables/queries/useGroup';

definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t } = useT();
const errorMessage = useErrorMessage();
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const dashboard = useDashboardQuery(slug);
const create = useCreatePersonMutation(slug);
const toast = useToast();
const name = computed(() => dashboard.data.value?.group.name ?? slug.value);
useHead({
  title: computed(
    () => `${t('adminGroup.newPerson.title')} — ${t('common.appName')}`,
  ),
});
const screen = computed(() => ({
  back: `/admin/${slug.value}/personnes`,
  crumbs: [
    { label: name.value, to: `/admin/${slug.value}` },
    {
      label: t('adminGroup.people.title'),
      to: `/admin/${slug.value}/personnes`,
    },
    { label: t('adminGroup.newPerson.crumb') },
  ],
}));

const onSubmit = (value: PersonFormValue) =>
  create.mutate(value, {
    onSuccess: ({ person }) => {
      toast.add({
        title: t('adminGroup.newPerson.added', { name: person.firstName }),
        color: 'success',
        icon: 'i-lucide-check',
      });
      navigateTo(`/admin/${slug.value}/personnes`, { replace: true });
    },
  });
</script>

<template>
  <AdminScreen v-bind="screen">
    <h1 class="font-display text-3xl font-bold">
      {{ t('adminGroup.newPerson.title') }}
    </h1>
    <AdminPersonForm
      :submit-label="t('common.actions.add')"
      :with-email="dashboard.data.value?.group.emailSending"
      :loading="create.isPending.value"
      @submit="onSubmit"
    >
      <UAlert
        v-if="create.isError.value"
        color="error"
        variant="subtle"
        :description="errorMessage(create.error.value)"
      />
    </AdminPersonForm>
  </AdminScreen>
</template>
