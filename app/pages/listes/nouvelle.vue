<script setup lang="ts">
import { randomListIcon } from '#server/utils/lists';
import { useCreateListMutation } from '~/composables/queries/useLists';

// « Nouvelle liste » (README 22.19, maquette ListeNouvelle): no form, no
// « Créer » button. A draft is made at once, with an icon drawn at random,
// and its document opens, the cursor in its name. Left without a name and
// without anyone, the document deletes it.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t } = useT();
const errorMessage = useErrorMessage();
const create = useCreateListMutation();
const failure = ref<unknown>(null);
onMounted(() =>
  create.mutate(
    { icon: randomListIcon((n) => Math.floor(Math.random() * n)) },
    {
      onSuccess: ({ id }) =>
        navigateTo(`/listes/${id}?nouvelle=1`, { replace: true }),
      onError: (error) => {
        failure.value = error;
      },
    },
  ),
);
</script>

<template>
  <AdminScreen back="/listes">
    <p v-if="failure" class="text-sm font-medium text-error" role="alert">
      {{ errorMessage(failure) }}
    </p>
    <UiSkeleton
      v-else
      :parts="['title', 'card']"
      :label="t('common.loading')"
    />
  </AdminScreen>
</template>
