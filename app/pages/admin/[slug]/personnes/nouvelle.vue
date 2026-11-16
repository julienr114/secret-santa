<script setup lang="ts">
import { fullName } from '#server/utils/people';
import type { PersonFormValue } from '~/components/admin/PersonForm.vue';
import { useCreatePersonMutation } from '~/composables/queries/useGroup';

definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t } = useT();
// Back to the list the form was opened from, not to a second copy of it.
const goBack = useGoBack();
const errorMessage = useErrorMessage();
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const create = useCreatePersonMutation(slug);
const toast = useToast();
useHead({
  title: computed(
    () => `${t('adminGroup.newPerson.title')} — ${t('common.appName')}`,
  ),
});
const screen = computed(() => ({
  back: `/admin/${slug.value}/personnes`,
}));

const onSubmit = (value: PersonFormValue) =>
  create.mutate(value, {
    onSuccess: ({ person }) => {
      toast.add({
        title: t('adminGroup.newPerson.added', { name: fullName(person) }),
        color: 'success',
        icon: 'i-lucide-check',
      });
      goBack(`/admin/${slug.value}/personnes`);
    },
  });
</script>

<template>
  <AdminScreen v-bind="screen">
    <UiPageTitle>
      {{ t('adminGroup.newPerson.title') }}
    </UiPageTitle>
    <AdminPersonForm
      :submit-label="t('common.actions.add')"
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
