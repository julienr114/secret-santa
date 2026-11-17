<script setup lang="ts">
import { useApiQuery } from '~/composables/queries/useApi';
import type { Avatar } from '#server/utils/avatars';
import type { Palmares } from '#server/utils/guesses';

// The palmarès of « Devine qui » in images for the organiser (README
// 22.17), even one who does not take part: the same images, without
// « mon Père Noël ».
definePageMeta({ middleware: 'admin', layout: false });
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const id = computed(() => String(route.params.id));
const editionPath = computed(() => `/admin/${slug.value}/editions/${id.value}`);
type Results = Palmares & {
  editionLabel: string;
  people: { id: string; name: string; avatar: Avatar }[];
  unmasked: number;
};
const query = useApiQuery<Results>(
  () => ['group', slug.value, 'edition', id.value, 'palmares'],
  () => `/api/admin/${slug.value}/editions/${id.value}/guess/results`,
);
const results = computed(() => query.data.value);
const { t } = useT();
</script>

<template>
  <ParticipantStories
    v-if="results?.enough"
    :edition-label="results.editionLabel"
    :people="results.people"
    :players="results.players"
    :guesses="results.guesses"
    :awards="results.awards"
    :santa="null"
    :unmasked="results.unmasked"
    :first-name="null"
    :answers-path="editionPath"
  />
  <AdminScreen v-else :back="editionPath">
    <AdminQueryState
      :pending="query.isPending.value"
      :error="query.error.value"
    >
      <p class="text-toned">{{ t('participant.game.organizerFew') }}</p>
    </AdminQueryState>
  </AdminScreen>
</template>
