<script setup lang="ts">
import type { Avatar } from '#server/utils/avatars';
import { useResultsQuery } from '~/composables/queries/useEdition';

// Who gave to whom, once the edition is closed or its results revealed.
const props = defineProps<{
  slug: string;
  id: string;
  people: { id: string; firstName: string; avatar: Avatar }[];
  title?: string;
  footer?: string;
}>();
const { t } = useT();
const results = useResultsQuery(
  () => props.slug,
  () => props.id,
);
</script>

<template>
  <AdminQueryState
    :pending="results.isPending.value"
    :error="results.error.value"
    :rows="3"
  >
    <AdminDrawPairs
      past
      :pairs="results.data.value?.pairs ?? []"
      :people="people"
      :title="title ?? t('adminEdition.results.title')"
      :footer="footer ?? t('adminEdition.results.footer')"
    />
  </AdminQueryState>
</template>
