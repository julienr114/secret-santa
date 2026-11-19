<script setup lang="ts">
// The envelope of a draw to discover: peach paper, the flap closed
// with a coral seal and its star, a sprig of fir and two baubles.
// Drawn from the mockup TirageDecouvrir (lot 18, README 22.16); the colours of the
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
      d="M20 1l1.4 4.6 4.6 1.4-4.6 1.4-1.4 4.6-1.4-4.6-4.6-1.4 4.6-1.4z"
      class="fill-star"
    />
    <path
      d="M164 1.5l1.0 3.5 3.5 1.0-3.5 1.0-1.0 3.5-1.0-3.5-3.5-1.0 3.5-1.0z"
      class="fill-star"
    />
    <circle cx="150" cy="8" r="1.800" class="fill-primary" />
    <rect
      x="6"
      y="14"
      width="172"
      height="106"
      rx="8"
      :fill="`url(#${uid}-paper)`"
      stroke-width="2"
      class="stroke-envelope-line"
    />
    <path
      d="M8 117 70 66q22 17 44 0l62 51z"
      opacity="0.35"
      class="fill-envelope-fold"
    />
    <path
      d="M7 116 70 66M177 116 114 66"
      stroke-width="2"
      stroke-linecap="round"
      class="stroke-envelope-line"
    />
    <path
      d="M8 21 84 77a13 13 0 0 0 16 0l76-56"
      opacity="0.08"
      class="fill-shade"
    />
    <path
      d="M8 18 84 74a13 13 0 0 0 16 0l76-56"
      :fill="`url(#${uid}-flap)`"
      stroke-width="2"
      stroke-linejoin="round"
      class="stroke-envelope-line"
    />
    <path
      d="M24 23 86 68.500a10 10 0 0 0 12 0L160 23"
      stroke-width="1.500"
      stroke-linecap="round"
      stroke-dasharray="4 5"
      opacity="0.65"
      class="stroke-primary"
    />
    <path
      d="M104.0 68.0L134.0 47.0M111.0 63.1L117.6 65.3M111.0 63.1L111.2 56.1M118.0 58.2L124.6 60.4M118.0 58.2L118.2 51.2M124.9 53.3L131.6 55.5M124.9 53.3L125.2 46.4"
      stroke-width="2.2"
      stroke-linecap="round"
      class="stroke-success"
    />
    <path
      d="M104.0 68.0L141.0 65.0M112.6 67.3L117.2 72.5M112.6 67.3L116.3 61.4M121.2 66.6L125.8 71.8M121.2 66.6L124.9 60.7M129.8 65.9L134.5 71.1M129.8 65.9L133.5 60.0"
      stroke-width="2.2"
      stroke-linecap="round"
      class="stroke-success"
    />
    <path
      d="M115.5 78.0L115.3 79.2L114.6 80.4L113.7 81.4L112.8 82.4L112.0 83.3L111.5 84.3L111.3 85.4L111.4 86.6L111.6 88.0L111.7 89.4L111.6 90.7L111.0 91.8L110.1 92.7L108.9 93.2L107.6 93.6L106.2 93.8L105.0 94.1L104.0 94.6L103.3 95.3L102.6 96.4L102.0 97.6L101.3 98.8L100.4 99.8L99.3 100.4L98.0 100.5L96.7 100.3L95.4 99.7L94.2 99.1L93.1 98.6L92.0 98.5L90.9 98.6L89.8 99.1L88.6 99.7L87.3 100.3L86.0 100.5L84.7 100.4L83.6 99.8L82.7 98.8L82.0 97.6L81.4 96.4L80.7 95.3L80.0 94.6L79.0 94.1L77.8 93.8L76.4 93.6L75.1 93.2L73.9 92.7L73.0 91.8L72.4 90.7L72.3 89.4L72.4 88.0L72.6 86.6L72.7 85.4L72.5 84.3L72.0 83.3L71.2 82.4L70.3 81.4L69.4 80.4L68.7 79.2L68.5 78.0L68.7 76.8L69.4 75.6L70.3 74.6L71.2 73.6L72.0 72.7L72.5 71.7L72.7 70.6L72.6 69.4L72.4 68.0L72.3 66.6L72.4 65.3L73.0 64.2L73.9 63.3L75.1 62.8L76.4 62.4L77.8 62.2L79.0 61.9L80.0 61.4L80.7 60.7L81.4 59.6L82.0 58.4L82.7 57.2L83.6 56.2L84.7 55.6L86.0 55.5L87.3 55.7L88.6 56.3L89.8 56.9L90.9 57.4L92.0 57.5L93.1 57.4L94.2 56.9L95.4 56.3L96.7 55.7L98.0 55.5L99.3 55.6L100.4 56.2L101.3 57.2L102.0 58.4L102.6 59.6L103.3 60.7L104.0 61.4L105.0 61.9L106.2 62.2L107.6 62.4L108.9 62.8L110.1 63.3L111.0 64.2L111.6 65.3L111.7 66.6L111.6 68.0L111.4 69.4L111.3 70.6L111.5 71.7L112.0 72.7L112.8 73.6L113.7 74.6L114.6 75.6L115.3 76.8z"
      opacity="0.16"
      transform="translate(0 2.500)"
      class="fill-shade"
    />
    <path
      d="M115.5 78.0L115.3 79.2L114.6 80.4L113.7 81.4L112.8 82.4L112.0 83.3L111.5 84.3L111.3 85.4L111.4 86.6L111.6 88.0L111.7 89.4L111.6 90.7L111.0 91.8L110.1 92.7L108.9 93.2L107.6 93.6L106.2 93.8L105.0 94.1L104.0 94.6L103.3 95.3L102.6 96.4L102.0 97.6L101.3 98.8L100.4 99.8L99.3 100.4L98.0 100.5L96.7 100.3L95.4 99.7L94.2 99.1L93.1 98.6L92.0 98.5L90.9 98.6L89.8 99.1L88.6 99.7L87.3 100.3L86.0 100.5L84.7 100.4L83.6 99.8L82.7 98.8L82.0 97.6L81.4 96.4L80.7 95.3L80.0 94.6L79.0 94.1L77.8 93.8L76.4 93.6L75.1 93.2L73.9 92.7L73.0 91.8L72.4 90.7L72.3 89.4L72.4 88.0L72.6 86.6L72.7 85.4L72.5 84.3L72.0 83.3L71.2 82.4L70.3 81.4L69.4 80.4L68.7 79.2L68.5 78.0L68.7 76.8L69.4 75.6L70.3 74.6L71.2 73.6L72.0 72.7L72.5 71.7L72.7 70.6L72.6 69.4L72.4 68.0L72.3 66.6L72.4 65.3L73.0 64.2L73.9 63.3L75.1 62.8L76.4 62.4L77.8 62.2L79.0 61.9L80.0 61.4L80.7 60.7L81.4 59.6L82.0 58.4L82.7 57.2L83.6 56.2L84.7 55.6L86.0 55.5L87.3 55.7L88.6 56.3L89.8 56.9L90.9 57.4L92.0 57.5L93.1 57.4L94.2 56.9L95.4 56.3L96.7 55.7L98.0 55.5L99.3 55.6L100.4 56.2L101.3 57.2L102.0 58.4L102.6 59.6L103.3 60.7L104.0 61.4L105.0 61.9L106.2 62.2L107.6 62.4L108.9 62.8L110.1 63.3L111.0 64.2L111.6 65.3L111.7 66.6L111.6 68.0L111.4 69.4L111.3 70.6L111.5 71.7L112.0 72.7L112.8 73.6L113.7 74.6L114.6 75.6L115.3 76.8z"
      class="fill-primary"
    />
    <circle
      cx="92"
      cy="78"
      r="15.4"
      stroke-width="1.200"
      class="fill-primary stroke-primary-deep"
    />
    <path
      d="M75.1 70.1a18.9 18.9 0 0 1 11.0-9.9"
      stroke-width="2"
      stroke-linecap="round"
      opacity="0.28"
      class="stroke-white"
    />
    <path
      d="M92 67.0l2.5 8.5 8.5 2.5-8.5 2.5-2.5 8.5-2.5-8.5-8.5-2.5 8.5-2.5z"
      class="fill-star-soft"
    />
    <circle cx="110" cy="58" r="4.2" class="fill-star" />
    <circle cx="108.7" cy="56.7" r="1.2" opacity="0.6" class="fill-white" />
    <circle cx="117.5" cy="63.5" r="3.4" class="fill-star" />
    <circle cx="116.5" cy="62.5" r="1.0" opacity="0.6" class="fill-white" />
  </svg>
</template>
