<script setup lang="ts">
import { randomListIcon } from '#server/utils/lists';
import { useCreateListMutation } from '~/composables/queries/useLists';

// « Nouvelle liste » (README 22.19, maquette V3ListeNouvelle): no form, no
// « Créer » button. A draft is made at once and its document opens. From
// an event (`?pour=`, ticket 106), it takes the event's name, date and
// icon; otherwise an icon drawn at random, the cursor in its name, and
// left without a name and without anyone, the document deletes it. With
// `?reprendre=` (ticket 108, « Reprendre ma liste de l'an dernier »), the
// draft takes the people and the ideas nobody gave of that list.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t } = useT();
const errorMessage = useErrorMessage();
const create = useCreateListMutation();
const failure = ref<unknown>(null);
const route = useRoute();
const party =
  typeof route.query.pour === 'string' ? route.query.pour : undefined;
const from =
  typeof route.query.reprendre === 'string' ? route.query.reprendre : undefined;
onMounted(() =>
  create.mutate(
    {
      icon: randomListIcon((n) => Math.floor(Math.random() * n)),
      party,
      from,
    },
    {
      onSuccess: ({ id }) =>
        navigateTo(party ? `/listes/${id}` : `/listes/${id}?nouvelle=1`, {
          replace: true,
        }),
      onError: (error) => {
        failure.value = error;
      },
    },
  ),
);
</script>

<template>
  <AdminScreen back="/">
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
