<script setup lang="ts">
import { formatEventDate } from '#server/utils/rules';
import {
  useEditionQuery,
  useUpdateEditionMutation,
} from '~/composables/queries/useGroup';

// « Date de la fête », changed from the follow-up of a Secret Santa or
// from its settings (`?depuis=reglages`), on a page of its own (ticket
// 160): the date in one field, what the change does, « Valider ». The
// server writes it in the journal of the event.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const id = computed(() => String(route.params.id));
const { t, locale } = useT();
const toast = useMessages();
const errorMessage = useErrorMessage();
const goBack = useGoBack();
// Not in the past (Julien, 25 November 2026).
const today = new Date().toLocaleDateString('sv-SE');
const context = useScreenContext(slug, id);
const title = computed(() => t('adminEdition.screen.dateSheet.title'));
useHead({ title: () => context.titleOf(title.value) });
const editionPath = computed(() => `/admin/${slug.value}/editions/${id.value}`);
const back = computed(() =>
  route.query.depuis === 'reglages'
    ? `${editionPath.value}/reglages`
    : editionPath.value,
);
const edition = useEditionQuery(slug, id);
const update = useUpdateEditionMutation(slug);
/**
 * Saves the day, then goes back with a toast.
 * @param eventDate - The day chosen (ISO).
 */
const onValidate = (eventDate: string | null) => {
  if (!eventDate) return;
  update.mutate(
    { id: id.value, eventDate },
    {
      onSuccess: () => {
        toast.done(
          t('adminEdition.screen.dateSheet.saved'),
          formatEventDate(eventDate, locale.value),
        );
        goBack(back.value);
      },
    },
  );
};
</script>

<template>
  <AdminDatePage
    :parts="context.parts.value"
    :back="back"
    :since="today"
    :title="title"
    :value="edition.data.value?.rules.eventDate"
    :ready="Boolean(edition.data.value)"
    :busy="update.isPending.value"
    :error="update.isError.value ? errorMessage(update.error.value) : null"
    testid="edition-date"
    @validate="onValidate"
  >
    <ul
      class="flex list-disc flex-col gap-1 pl-5 text-sm text-muted"
      data-testid="date-note"
    >
      <li>{{ t('adminEdition.screen.dateSheet.seen') }}</li>
      <li>{{ t('adminEdition.screen.dateSheet.journal') }}</li>
    </ul>
  </AdminDatePage>
</template>
