<script setup lang="ts">
import { useTakeParticipantsMutation } from '~/composables/queries/useEdition';
import {
  useDashboardQuery,
  useEditionQuery,
} from '~/composables/queries/useGroup';

// « Reprendre ceux d'un autre événement », from « Choisir les
// participants » (V3FeteMembresReprendre, ticket 117): those ticked in my
// other events become participants of this Secret Santa, and so members
// of its event; then back to « Choisir les participants ». « Inviter par
// lien » is under the people, as on the screen before.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t } = useT();
const route = useRoute();
const toast = useMessages();
const errorMessage = useErrorMessage();
const goBack = useGoBack();
const slug = computed(() => String(route.params.slug));
const id = computed(() => String(route.params.id));
const choosing = computed(
  () => `/admin/${slug.value}/editions/${id.value}/ajouter`,
);
const dashboard = useDashboardQuery(slug);
const edition = useEditionQuery(slug, id);
const context = useScreenContext(slug);
useHead({ title: () => context.titleOf(t('party.take.title')) });
const take = useTakeParticipantsMutation(slug, id);
const ticked = useChosenParticipants(id);
const taking = computed(() =>
  (edition.data.value?.participants ?? []).flatMap((p) =>
    p.email ? [p.email] : [],
  ),
);
/**
 * Adds those ticked, then goes back to « Choisir les participants ».
 * @param personIds - Those ticked.
 * @returns Nothing.
 */
const onTake = (personIds: string[]) =>
  take.mutate(personIds, {
    onSuccess: ({ count }) => {
      ticked.value = null;
      toast.done(t('party.take.done', { count }));
      goBack(choosing.value);
    },
    onError: (error) => toast.failed(errorMessage(error)),
  });
</script>

<template>
  <AdminScreen :back="choosing">
    <AdminQueryState
      :pending="dashboard.isPending.value || edition.isPending.value"
      :error="dashboard.error.value ?? edition.error.value"
      :skeleton="['title', 'chips', 'list']"
      :rows="4"
    >
      <TakeFromEvents
        :context="context.parts.value"
        :party-id="dashboard.data.value?.group.id ?? ''"
        :in-already="taking"
        :busy="take.isPending.value"
        @take="onTake"
      >
        <UiList>
          <UiListItem
            :to="`/admin/${slug}/editions/${id}/invitation`"
            icon="i-lucide-link"
            :title="t('adminEdition.screen.empty.invite')"
            :subtitle="t('adminEdition.addParticipants.inviteHint')"
          />
        </UiList>
      </TakeFromEvents>
    </AdminQueryState>
  </AdminScreen>
</template>
