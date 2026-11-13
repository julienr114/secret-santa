<script setup lang="ts">
import type { Avatar } from '#server/utils/avatars';
import { useResultsQuery } from '~/composables/queries/useEdition';

// Results of a closed edition, shown in the archives.
const props = defineProps<{
  slug: string;
  id: string;
  people: { id: string; firstName: string; avatar: Avatar }[];
  title?: string;
}>();
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
      :title="title ?? 'Le tirage'"
      footer="L'édition est clôturée : ses résultats ne sont plus secrets."
    />
  </AdminQueryState>
</template>
