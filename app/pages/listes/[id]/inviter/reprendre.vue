<script setup lang="ts">
import {
  useListMembersQuery,
  useListQuery,
  useTakeToListMutation,
} from '~/composables/queries/useLists';

// « Reprendre ceux d'un autre événement », from « Inviter quelqu'un »
// (V3FeteMembresReprendre, ticket 117): those ticked in my other events
// become members of the list's event, by the list; then back.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const id = computed(() => String(route.params.id));
const back = computed(() => `/listes/${id.value}/inviter`);
const { t } = useT();
const toast = useMessages();
const errorMessage = useErrorMessage();
const goBack = useGoBack();
const list = useListQuery(id);
const members = useListMembersQuery(id);
const take = useTakeToListMutation(id);
useHead({
  title: () => `${t('party.take.title')} — ${t('common.appName')}`,
});
const context = computed(() =>
  list.data.value?.list.title
    ? [{ label: list.data.value.list.title, to: `/listes/${id.value}` }]
    : [],
);
/**
 * Adds those ticked, then goes back.
 * @param personIds - Those ticked.
 * @returns Nothing.
 */
const onTake = (personIds: string[]) =>
  take.mutate(personIds, {
    onSuccess: ({ count }) => {
      toast.done(t('party.take.done', { count }));
      goBack(back.value);
    },
    onError: (error) => toast.failed(errorMessage(error)),
  });
</script>

<template>
  <AdminScreen :back="back">
    <AdminQueryState
      :pending="list.isPending.value || members.isPending.value"
      :error="list.error.value ?? members.error.value"
      :skeleton="['title', 'chips', 'list']"
      :rows="4"
    >
      <TakeFromEvents
        :context="context"
        :party-id="members.data.value?.partyId ?? ''"
        :in-already="[]"
        :busy="take.isPending.value"
        @take="onTake"
      />
    </AdminQueryState>
  </AdminScreen>
</template>
