<script setup lang="ts">
import {
  useJournalQuery,
  useJournalSeenMutation,
} from '~/composables/queries/usePersonal';

// The group's journal, as every participant can read it (README section 9).
// Opening it clears the alerts counted on the draw page.
const route = useRoute();
const token = computed(() => String(route.params.token));
const journal = useJournalQuery(token);
const seen = useJournalSeenMutation(token);
/** Opened from the home on an alert: its explanation shows at once. */
const explainId = computed(() =>
  typeof route.query.alerte === 'string' ? route.query.alerte : null,
);
onMounted(() => seen.mutate(undefined));
const { t } = useT();
</script>

<template>
  <ParticipantScreen
    :token="token"
    :back="`/p/${token}`"
    :pending="journal.isPending.value"
    :error="journal.error.value"
    :skeleton="['title', 'journal']"
  >
    <UiPageTitle>
      {{ t('participant.journal.title') }}
    </UiPageTitle>
    <JournalView
      v-if="journal.data.value"
      :entries="journal.data.value.entries"
      :editions="journal.data.value.editions"
      :current-edition-id="journal.data.value.currentEditionId"
      :people="journal.data.value.people"
      :me="journal.data.value.me"
      :explain-id="explainId"
      :palmares-of="
        (editionId) =>
          editionId === journal.data.value?.currentEditionId
            ? `/p/${token}/devine/palmares`
            : null
      "
    />
  </ParticipantScreen>
</template>
