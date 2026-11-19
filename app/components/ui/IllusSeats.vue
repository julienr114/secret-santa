<script setup lang="ts">
// The seats to fill: one to add, two in dashes; an edition without
// participants yet (README 23.5).
// Drawn from docs/refonte/sorbet/illus2.py, in the manner of the
// envelopes; the colours by their tokens. Decorative: the words around
// it say the same.
</script>

<template>
  <svg
    viewBox="0 0 184 128"
    fill="none"
    class="h-auto w-46 shrink-0"
    aria-hidden="true"
    focusable="false"
  >
    <ellipse
      cx="92"
      cy="123"
      rx="78"
      ry="4"
      opacity="0.08"
      class="fill-shade"
    />
    <path
      d="M24 19l1.2 3.8 3.8 1.2-3.8 1.2-1.2 3.8-1.2-3.8-3.8-1.2 3.8-1.2z"
      class="fill-envelope-fold"
    />
    <path
      d="M160 16l1.4 4.6 4.6 1.4-4.6 1.4-1.4 4.6-1.4-4.6-4.6-1.4 4.6-1.4z"
      class="fill-star"
    />
    <circle cx="146" cy="38" r="1.800" class="fill-primary" />
    <circle
      cx="40"
      cy="80"
      r="22"
      stroke-width="2"
      stroke-dasharray="7 6"
      class="fill-page stroke-envelope-line"
    />
    <circle cx="40" cy="75.2" r="6.6" class="fill-envelope-fold" />
    <path d="M27.9 93.6a12.1 11.0 0 0 1 24.2 0z" class="fill-envelope-fold" />
    <circle
      cx="144"
      cy="80"
      r="22"
      stroke-width="2"
      stroke-dasharray="7 6"
      class="fill-page stroke-envelope-line"
    />
    <circle cx="144" cy="75.2" r="6.6" class="fill-envelope-fold" />
    <path d="M131.9 93.6a12.1 11.0 0 0 1 24.2 0z" class="fill-envelope-fold" />
    <circle cx="92" cy="68.500" r="30" opacity="0.1" class="fill-shade" />
    <circle
      cx="92"
      cy="66"
      r="30"
      stroke-width="2"
      class="fill-white stroke-envelope-line"
    />
    <circle
      cx="92"
      cy="66"
      r="23"
      stroke-width="1.200"
      stroke-dasharray="3 4"
      opacity="0.5"
      class="stroke-primary"
    />
    <path
      d="M92 54v24M80 66h24"
      stroke-width="4.500"
      stroke-linecap="round"
      class="stroke-primary"
    />
    <path
      d="M112.0 98.0L134.0 112.0M118.7 102.2L119.1 108.2M118.7 102.2L124.3 100.1M125.3 106.5L125.8 112.5M125.3 106.5L130.9 104.4"
      stroke-width="2.2"
      stroke-linecap="round"
      class="stroke-success"
    />
    <circle cx="116" cy="104" r="3.4" class="fill-star" />
    <circle cx="115.0" cy="103.0" r="1.0" opacity="0.6" class="fill-white" />
  </svg>
</template>
