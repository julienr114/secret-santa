<script setup lang="ts">
import type { PersonFormValue } from '~/components/admin/PersonForm.vue';
import {
  useCreatePersonMutation,
  useDashboardQuery,
} from '~/composables/queries/useGroup';
import { errorMessage } from '~/utils/errors';

definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const dashboard = useDashboardQuery(slug);
const create = useCreatePersonMutation(slug);
const toast = useToast();
const name = computed(() => dashboard.data.value?.group.name ?? slug.value);
useHead({ title: 'Nouvelle personne — Secret Santa' });
const screen = computed(() => ({
  back: `/admin/${slug.value}/personnes`,
  crumbs: [
    { label: name.value, to: `/admin/${slug.value}` },
    { label: 'Personnes', to: `/admin/${slug.value}/personnes` },
    { label: 'Nouvelle' },
  ],
}));

const onSubmit = (value: PersonFormValue) =>
  create.mutate(value, {
    onSuccess: ({ person }) => {
      toast.add({
        title: `${person.firstName} ajouté·e`,
        color: 'success',
        icon: 'i-lucide-check',
      });
      navigateTo(`/admin/${slug.value}/personnes`, { replace: true });
    },
  });
</script>

<template>
  <AdminScreen v-bind="screen">
    <h1 class="font-display text-3xl font-bold">Nouvelle personne</h1>
    <AdminPersonForm
      submit-label="Ajouter"
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
