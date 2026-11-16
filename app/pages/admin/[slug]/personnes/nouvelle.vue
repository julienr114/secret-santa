<script setup lang="ts">
import { fullName } from '#server/utils/people';
import type { PersonFormValue } from '~/components/admin/PersonForm.vue';
import { useCreatePersonMutation } from '~/composables/queries/useGroup';
import { useAddParticipantMutation } from '~/composables/queries/useEdition';

definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t } = useT();
// Back to the list the form was opened from, not to a second copy of it.
const goBack = useGoBack();
const errorMessage = useErrorMessage();
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const create = useCreatePersonMutation(slug);
// Opened from « Choisir les participants »: the person joins that edition
// too, and comes back ticked.
const editionId = computed(() => String(route.query.edition ?? ''));
const join = useAddParticipantMutation(slug, editionId);
const ticked = useChosenParticipants(editionId);
const busy = computed(() => create.isPending.value || join.isPending.value);
const toast = useToast();
useHead({
  title: computed(
    () => `${t('adminGroup.newPerson.title')} — ${t('common.appName')}`,
  ),
});
const screen = computed(() => ({
  back: `/admin/${slug.value}/personnes`,
}));

/**
 * Adds the new person to the edition the screen was opened from.
 * @param personId - The new person.
 * @returns Once added, and ticked on the screen that comes back.
 */
const joinEdition = async (personId: string) => {
  await join.mutateAsync(personId);
  ticked.value = ticked.value ? [...ticked.value, personId] : null;
};
const onSubmit = (value: PersonFormValue) =>
  create.mutate(value, {
    onSuccess: async ({ person }) => {
      if (editionId.value) await joinEdition(person.id);
      toast.add({
        title: t('adminGroup.newPerson.added', { name: fullName(person) }),
        color: 'success',
        icon: 'i-lucide-check',
      });
      goBack(
        editionId.value
          ? `/admin/${slug.value}/editions/${editionId.value}/ajouter`
          : `/admin/${slug.value}/personnes`,
      );
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
      :loading="busy"
      @submit="onSubmit"
    >
      <UAlert
        v-if="create.isError.value || join.isError.value"
        color="error"
        variant="subtle"
        :description="errorMessage(create.error.value ?? join.error.value)"
      />
    </AdminPersonForm>
  </AdminScreen>
</template>
