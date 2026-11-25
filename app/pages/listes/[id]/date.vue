<script setup lang="ts">
import {
  useListQuery,
  useUpdateListMutation,
} from '~/composables/queries/useLists';

// The date of a list (ticket 160), on a page of its own: one field, the
// date in full under it; « Pas de date » takes it away. Back to the list.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const id = computed(() => String(route.params.id));
const { t } = useT();
const toast = useMessages();
const errorMessage = useErrorMessage();
const goBack = useGoBack();
const back = computed(() => `/listes/${id.value}`);
const query = useListQuery(id);
const update = useUpdateListMutation(id);
const list = computed(() => query.data.value?.list);
useHead({
  title: () => `${t('lists.doc.date')} — ${list.value?.title ?? ''}`,
});
/**
 * Saves the date, or takes it away, then goes back.
 * @param eventDate - The day chosen (ISO), or null.
 */
const onValidate = (eventDate: string | null) =>
  update.mutate(
    { eventDate },
    {
      onSuccess: () => goBack(back.value),
      onError: (error) => toast.failed(errorMessage(error)),
    },
  );
</script>

<template>
  <AdminDatePage
    :parts="list ? [{ label: list.title, to: back }] : []"
    :back="back"
    :title="t('lists.doc.date')"
    :value="list?.eventDate"
    :ready="Boolean(list)"
    :clear-label="t('lists.doc.noDate')"
    :busy="update.isPending.value"
    testid="list-date"
    @validate="onValidate"
  />
</template>
