<script setup lang="ts">
import type { EnvelopeState } from '#server/utils/personal';

// The envelope of a draw, by where it stands (`envelopeState`): waiting,
// sealed, opened or locked. Each is an illustration of its own, drawn
// from the mockups (lot 18, README 22.16).
defineProps<{ state: EnvelopeState }>();
</script>

<template>
  <UiEnvelopePending v-if="state === 'pending'" />
  <UiEnvelopeSealed v-else-if="state === 'sealed'" />
  <UiEnvelopeOpened v-else-if="state === 'opened'" />
  <UiEnvelopeLocked v-else />
</template>
