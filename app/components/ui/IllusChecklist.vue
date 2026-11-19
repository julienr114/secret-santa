<script setup lang="ts">
// The sheet to tick: a first line ticked, two to go; no list yet
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
    <ellipse cx="92" cy="123" rx="70" ry="4" opacity="0.1" class="fill-shade" />
    <path
      d="M24 16l1.4 4.6 4.6 1.4-4.6 1.4-1.4 4.6-1.4-4.6-4.6-1.4 4.6-1.4z"
      class="fill-star"
    />
    <path
      d="M160 9.5l1.0 3.5 3.5 1.0-3.5 1.0-1.0 3.5-1.0-3.5-3.5-1.0 3.5-1.0z"
      class="fill-star"
    />
    <circle cx="150" cy="30" r="1.800" class="fill-primary" />
    <rect
      x="44"
      y="10.500"
      width="96"
      height="108"
      rx="6"
      opacity="0.1"
      class="fill-shade"
    />
    <rect
      x="44"
      y="8"
      width="96"
      height="108"
      rx="6"
      stroke-width="2"
      class="fill-white stroke-envelope-line"
    />
    <rect
      x="51"
      y="15"
      width="82"
      height="94"
      rx="3"
      stroke-width="1.200"
      stroke-dasharray="3 4"
      opacity="0.5"
      class="stroke-primary"
    />
    <path
      d="M92 21l1.8 6.2 6.2 1.8-6.2 1.8-1.8 6.2-1.8-6.2-6.2-1.8 6.2-1.8z"
      class="fill-primary"
    />
    <rect
      x="58"
      y="44"
      width="13"
      height="13"
      rx="3.500"
      class="fill-success"
    />
    <path
      d="m61 50.5 3 3 5-5.500"
      stroke-width="2.200"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="stroke-white"
    />
    <path
      d="M80 50.5h36"
      stroke-width="3"
      stroke-linecap="round"
      class="stroke-envelope-fold"
    />
    <rect
      x="59"
      y="64"
      width="11"
      height="11"
      rx="3"
      stroke-width="2"
      class="fill-white stroke-envelope-line"
    />
    <path
      d="M80 69.5h44"
      stroke-width="3"
      stroke-linecap="round"
      class="stroke-envelope-fold"
    />
    <rect
      x="59"
      y="83"
      width="11"
      height="11"
      rx="3"
      stroke-width="2"
      class="fill-white stroke-envelope-line"
    />
    <path
      d="M80 88.5h28"
      stroke-width="3"
      stroke-linecap="round"
      class="stroke-envelope-fold"
    />
    <path
      d="M126.0 104.0L150.0 82.0M131.6 98.9L138.5 100.2M131.6 98.9L130.9 91.9M137.2 93.8L144.0 95.1M137.2 93.8L136.5 86.8M142.7 88.7L149.6 89.9M142.7 88.7L142.1 81.7"
      stroke-width="2.2"
      stroke-linecap="round"
      class="stroke-success"
    />
    <path
      d="M126.0 104.0L156.0 98.0M135.1 102.2L140.3 106.8M135.1 102.2L138.1 95.9M144.2 100.4L149.4 105.0M144.2 100.4L147.2 94.0"
      stroke-width="2.2"
      stroke-linecap="round"
      class="stroke-success"
    />
    <circle cx="134" cy="95" r="4" class="fill-star" />
    <circle cx="132.8" cy="93.8" r="1.1" opacity="0.6" class="fill-white" />
    <circle cx="141" cy="101" r="3.2" class="fill-star" />
    <circle cx="140.0" cy="100.0" r="0.9" opacity="0.6" class="fill-white" />
  </svg>
</template>
