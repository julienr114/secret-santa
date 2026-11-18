<script setup lang="ts">
import {
  useGameQuery,
  useResultsSeenMutation,
} from '~/composables/queries/usePersonal';

// The palmarès of « Devine qui » in images (README 22.17), for a
// participant, joueur or not. Watched to the end, it is « seen »: the
// answers page then corrects the guesses, and the home's card goes.
const route = useRoute();
const token = computed(() => String(route.params.token));
const query = useGameQuery(token);
const seen = useResultsSeenMutation(token);
const game = computed(() => query.data.value);
const results = computed(() => game.value?.results ?? null);
// No palmarès (nobody played, or not revealed): the answers page.
watch(
  () => game.value,
  (value) => {
    if (value && (!value.results || value.results.size === 'none')) {
      void navigateTo(`/p/${token.value}/devine`, { replace: true });
    }
  },
  { immediate: true },
);
const onSeen = () => {
  if (!results.value?.seen && !seen.isPending.value) seen.mutate(undefined);
};
</script>

<template>
  <ParticipantScreen
    :token="token"
    :back="`/p/${token}/devine`"
    :pending="query.isPending.value"
    :error="query.error.value"
  >
    <ParticipantStories
      v-if="game && results && results.size !== 'none'"
      :edition-label="game.editionLabel"
      :people="game.people"
      :players="results.players"
      :guesses="results.guesses"
      :awards="results.awards"
      :santa="results.santa"
      :unmasked="results.unmasked"
      :small="results.size === 'small'"
      :close-call="results.closeCall"
      :me="game.me"
      :first-name="game.firstName"
      :answers-path="`/p/${token}/devine`"
      @seen="onSeen"
    />
  </ParticipantScreen>
</template>
