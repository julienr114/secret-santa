<script setup lang="ts">
// The tree and a parcel still to come, in dashes: no draw yet
// (README 23.5).
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
      rx="80"
      ry="4"
      opacity="0.07"
      class="fill-shade"
    />
    <path
      d="M160 29l1.2 3.8 3.8 1.2-3.8 1.2-1.2 3.8-1.2-3.8-3.8-1.2 3.8-1.2z"
      class="fill-envelope-fold"
    />
    <path
      d="M22 42l0.9 3.1 3.1 0.9-3.1 0.9-0.9 3.1-0.9-3.1-3.1-0.9 3.1-0.9z"
      class="fill-envelope-fold"
    />
    <rect x="75" y="106" width="10" height="14" rx="2" class="fill-wood" />
    <polygon
      points="44,108 116,108 80,58"
      stroke-width="5"
      stroke-linejoin="round"
      class="fill-success stroke-success"
    />
    <polygon
      points="52,89 108,89 80,47"
      stroke-width="5"
      stroke-linejoin="round"
      class="fill-success-deep stroke-success-deep"
    />
    <polygon
      points="52,84 108,84 80,42"
      stroke-width="5"
      stroke-linejoin="round"
      class="fill-success stroke-success"
    />
    <polygon
      points="60,65 100,65 80,31"
      stroke-width="5"
      stroke-linejoin="round"
      class="fill-success-deep stroke-success-deep"
    />
    <polygon
      points="60,60 100,60 80,26"
      stroke-width="5"
      stroke-linejoin="round"
      class="fill-success stroke-success"
    />
    <path
      d="M68 46q5-10 11-16"
      stroke-width="2"
      stroke-linecap="round"
      opacity="0.28"
      class="stroke-white"
    />
    <path
      d="M56 97q24 10 48-3M63 73q17 8 34-3"
      stroke-width="1.500"
      stroke-linecap="round"
      stroke-dasharray="4 5"
      opacity="0.85"
      class="stroke-star-soft"
    />
    <path
      d="M80 8l2.1 6.9 6.9 2.1-6.9 2.1-2.1 6.9-2.1-6.9-6.9-2.1 6.9-2.1z"
      class="fill-star"
    />
    <rect
      x="124"
      y="78"
      width="42"
      height="40"
      rx="5"
      stroke-width="2"
      stroke-dasharray="7 6"
      class="fill-page stroke-envelope-line"
    />
    <path
      d="M145.0 80v36M126 96.4h38"
      stroke-width="2"
      stroke-linecap="round"
      stroke-dasharray="7 6"
      class="stroke-envelope-fold"
    />
  </svg>
</template>
