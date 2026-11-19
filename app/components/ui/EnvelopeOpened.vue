<script setup lang="ts">
// The envelope of a draw already discovered: open, the card with its
// star sticking out.
// Drawn from the mockup TirageRevoir (lot 18, README 22.16); the colours of the
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
    <ellipse cx="92" cy="123" rx="76" ry="4" opacity="0.1" class="fill-shade" />
    <path
      d="M20 24l1.4 4.6 4.6 1.4-4.6 1.4-1.4 4.6-1.4-4.6-4.6-1.4 4.6-1.4z"
      class="fill-star"
    />
    <path
      d="M166 11.5l1.0 3.5 3.5 1.0-3.5 1.0-1.0 3.5-1.0-3.5-3.5-1.0 3.5-1.0z"
      class="fill-star"
    />
    <circle cx="24" cy="12" r="1.800" class="fill-primary" />
    <rect
      x="6"
      y="46"
      width="172"
      height="76"
      rx="8"
      stroke-width="2"
      class="fill-envelope-fold stroke-envelope-line"
    />
    <path
      d="M148.0 54.0L168.0 30.0M152.7 48.4L159.6 48.8M152.7 48.4L151.0 41.6M157.3 42.8L164.3 43.2M157.3 42.8L155.7 36.0M162.0 37.3L168.9 37.6M162.0 37.3L160.3 30.4"
      stroke-width="2.2"
      stroke-linecap="round"
      class="stroke-success"
    />
    <path
      d="M148.0 54.0L174.0 44.0M155.9 51.0L161.8 54.7M155.9 51.0L157.8 44.2M163.8 47.9L169.7 51.7M163.8 47.9L165.7 41.2"
      stroke-width="2.2"
      stroke-linecap="round"
      class="stroke-success"
    />
    <circle cx="154" cy="45" r="3.6" class="fill-star" />
    <circle cx="152.9" cy="43.9" r="1.0" opacity="0.6" class="fill-white" />
    <rect
      x="38"
      y="6.500"
      width="108"
      height="84"
      rx="6"
      opacity="0.1"
      class="fill-shade"
    />
    <rect
      x="38"
      y="4"
      width="108"
      height="84"
      rx="6"
      stroke-width="2"
      style="fill: var(--ui-bg)"
      class="stroke-envelope-line"
    />
    <rect
      x="45"
      y="11"
      width="94"
      height="70"
      rx="3"
      stroke-width="1.200"
      stroke-dasharray="3 4"
      opacity="0.5"
      class="stroke-primary"
    />
    <path
      d="M92 16l2.3 7.7 7.7 2.3-7.7 2.3-2.3 7.7-2.3-7.7-7.7-2.3 7.7-2.3z"
      class="fill-primary"
    />
    <path
      d="M64 44h56M74 53h36"
      stroke-width="3"
      stroke-linecap="round"
      class="stroke-envelope-fold"
    />
    <path
      d="M6 52 92 104 178 52v62a8 8 0 0 1-8 8H14a8 8 0 0 1-8-8z"
      :fill="`url(#${uid}-paper)`"
      stroke-width="2"
      stroke-linejoin="round"
      class="stroke-envelope-line"
    />
    <path
      d="M16 66 92 112l76-46"
      stroke-width="1.500"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-dasharray="4 5"
      opacity="0.65"
      class="stroke-primary"
    />
  </svg>
</template>
