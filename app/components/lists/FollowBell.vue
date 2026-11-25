<script setup lang="ts">
// The bell of a person of a list I do not hold (ticket 122, ListeSuivre):
// empty, I do not follow them; full and red, I do. 44 px to touch, said
// as « Suivre Léo » or « Ne plus suivre Léo » with its state.
defineProps<{
  /** Whether I follow them. */
  on: boolean;
  /** « Suivre Léo », or « Ne plus suivre Léo ». */
  label: string;
}>();
defineEmits<{ toggle: [] }>();
</script>

<template>
  <button
    type="button"
    class="-mr-2.5 flex size-11 shrink-0 items-center justify-center"
    :class="on ? 'text-primary' : 'text-muted'"
    :aria-pressed="on"
    :aria-label="label"
    data-testid="follow-bell"
    @click="$emit('toggle')"
  >
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      :fill="on ? 'currentColor' : 'none'"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10 20a2 2 0 0 0 4 0" />
    </svg>
  </button>
</template>
