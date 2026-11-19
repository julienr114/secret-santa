<script setup lang="ts">
// The label of a present, with its string and three lines: the gift
// hints still to fill (README 23.5).
// Drawn from docs/refonte/sorbet/illus2.py, in the manner of the
// envelopes; the colours by their tokens. Decorative: the words around
// it say the same.
const uid = useId();
</script>

<template>
  <svg
    viewBox="0 0 184 128"
    fill="none"
    class="h-auto w-46 shrink-0"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <linearGradient
        :id="`${uid}-paper`"
        x1="0"
        y1="14"
        x2="0"
        y2="120"
        gradientUnits="userSpaceOnUse"
      >
        <stop style="stop-color: var(--color-envelope)" />
        <stop offset="1" style="stop-color: var(--color-envelope-fold)" />
      </linearGradient>
    </defs>
    <ellipse cx="92" cy="123" rx="70" ry="4" opacity="0.1" class="fill-shade" />
    <path
      d="M160 12l1.4 4.6 4.6 1.4-4.6 1.4-1.4 4.6-1.4-4.6-4.6-1.4 4.6-1.4z"
      class="fill-star"
    />
    <path
      d="M26 91.5l1.0 3.5 3.5 1.0-3.5 1.0-1.0 3.5-1.0-3.5-3.5-1.0 3.5-1.0z"
      class="fill-star"
    />
    <circle cx="150" cy="104" r="1.800" class="fill-primary" />
    <path
      d="M128.0 34.0L152.0 14.0M133.6 29.3L140.4 31.0M133.6 29.3L133.2 22.4M139.2 24.7L146.0 26.3M139.2 24.7L138.8 17.7M144.7 20.0L151.6 21.7M144.7 20.0L144.4 13.1"
      stroke-width="2.2"
      stroke-linecap="round"
      class="stroke-success"
    />
    <path
      d="M128.0 34.0L158.0 30.0M137.1 32.8L142.0 37.8M137.1 32.8L140.5 26.7M146.2 31.6L151.1 36.6M146.2 31.6L149.6 25.5"
      stroke-width="2.2"
      stroke-linecap="round"
      class="stroke-success"
    />
    <circle cx="136" cy="26" r="3.8" class="fill-star" />
    <circle cx="134.9" cy="24.9" r="1.1" opacity="0.6" class="fill-white" />
    <g transform="rotate(-7 92 66)">
      <rect
        x="42"
        y="30.500"
        width="110"
        height="76"
        rx="9"
        opacity="0.1"
        class="fill-shade"
      />
      <rect
        x="42"
        y="28"
        width="110"
        height="76"
        rx="9"
        :fill="`url(#${uid}-paper)`"
        stroke-width="2"
        class="stroke-envelope-line"
      />
      <rect
        x="49"
        y="35"
        width="96"
        height="62"
        rx="5"
        stroke-width="1.200"
        stroke-dasharray="3 4"
        opacity="0.5"
        class="stroke-primary"
      />
      <path
        d="M60 66C44 58 34 46 22 30"
        stroke-width="2"
        stroke-linecap="round"
        class="stroke-primary"
      />
      <circle
        cx="60"
        cy="66"
        r="6"
        stroke-width="2"
        class="fill-page stroke-envelope-line"
      />
      <path
        d="M82 43.5l1.3 4.2 4.2 1.3-4.2 1.3-1.3 4.2-1.3-4.2-4.2-1.3 4.2-1.3z"
        class="fill-primary"
      />
      <path
        d="M94 49h40"
        stroke-width="3"
        stroke-linecap="round"
        class="stroke-envelope-fold"
      />
      <path
        d="M82 60.5l1.3 4.2 4.2 1.3-4.2 1.3-1.3 4.2-1.3-4.2-4.2-1.3 4.2-1.3z"
        class="fill-success"
      />
      <path
        d="M94 66h46"
        stroke-width="3"
        stroke-linecap="round"
        class="stroke-envelope-fold"
      />
      <path
        d="M82 77.5l1.3 4.2 4.2 1.3-4.2 1.3-1.3 4.2-1.3-4.2-4.2-1.3 4.2-1.3z"
        class="fill-star"
      />
      <path
        d="M94 83h30"
        stroke-width="3"
        stroke-linecap="round"
        class="stroke-envelope-fold"
      />
    </g>
  </svg>
</template>
