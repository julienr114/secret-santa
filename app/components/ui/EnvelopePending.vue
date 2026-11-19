<script setup lang="ts">
// The envelope of a draw not made yet: a dashed outline, and a clock.
// Drawn from the mockup TirageAttente (lot 18, README 22.16); the colours of the
// design system by their tokens, the others as drawn. Decorative: the
// words around it say the same.
const uid = useId();
</script>

<template>
  <svg
    viewBox="0 0 184 128"
    fill="none"
    class="h-auto shrink-0 w-46"
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
      <linearGradient
        :id="`${uid}-flap`"
        x1="0"
        y1="18"
        x2="0"
        y2="78"
        gradientUnits="userSpaceOnUse"
      >
        <stop style="stop-color: var(--color-envelope)" />
        <stop offset="1" style="stop-color: var(--color-envelope)" />
      </linearGradient>
    </defs>
    <ellipse
      cx="92"
      cy="123"
      rx="76"
      ry="4"
      opacity="0.06"
      class="fill-shade"
    />
    <rect
      x="6"
      y="14"
      width="172"
      height="106"
      rx="8"
      stroke-width="2"
      stroke-dasharray="7 6"
      class="stroke-envelope-line fill-page"
    />
    <path
      d="M7 116 70 66M177 116 114 66"
      stroke-width="2"
      stroke-linecap="round"
      stroke-dasharray="7 6"
      class="stroke-envelope-fold"
    />
    <path
      d="M8 18 84 74a13 13 0 0 0 16 0l76-56"
      stroke-width="2"
      stroke-linejoin="round"
      stroke-dasharray="7 6"
      class="stroke-envelope-line"
    />
    <circle cx="92" cy="80.500" r="23" opacity="0.1" class="fill-shade" />
    <circle
      cx="92"
      cy="78"
      r="23"
      stroke-width="2"
      style="fill: var(--ui-bg)"
      class="stroke-envelope-line"
    />
    <g stroke-width="2" stroke-linecap="round" class="stroke-envelope-line">
      <path d="M107.5 78.0L110.0 78.0" />
      <path d="M92.0 93.5L92.0 96.0" />
      <path d="M76.5 78.0L74.0 78.0" />
      <path d="M92.0 62.5L92.0 60.0" />
    </g>
    <path
      d="M92 67v11l7.500 4.500"
      stroke-width="3"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="stroke-warning-ink"
    />
    <circle cx="92" cy="78" r="2" class="fill-warning-ink" />
    <path
      d="M22 2l1.2 3.8 3.8 1.2-3.8 1.2-1.2 3.8-1.2-3.8-3.8-1.2 3.8-1.2z"
      class="fill-envelope-fold"
    />
    <path
      d="M162 3l0.9 3.1 3.1 0.9-3.1 0.9-0.9 3.1-0.9-3.1-3.1-0.9 3.1-0.9z"
      class="fill-envelope-fold"
    />
  </svg>
</template>
