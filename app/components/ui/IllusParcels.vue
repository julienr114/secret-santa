<script setup lang="ts">
// Three parcels and a tick: the group is joined (README 23.5).
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
    <ellipse cx="92" cy="123" rx="80" ry="4" opacity="0.1" class="fill-shade" />
    <path
      d="M22 34l1.4 4.6 4.6 1.4-4.6 1.4-1.4 4.6-1.4-4.6-4.6-1.4 4.6-1.4z"
      class="fill-star"
    />
    <path
      d="M164 29.5l1.0 3.5 3.5 1.0-3.5 1.0-1.0 3.5-1.0-3.5-3.5-1.0 3.5-1.0z"
      class="fill-star"
    />
    <circle cx="40" cy="22" r="1.800" class="fill-primary" />
    <path
      d="M84.0 70.0L66.0 46.0M79.8 64.4L81.8 57.7M79.8 64.4L72.8 64.4M75.6 58.8L77.6 52.1M75.6 58.8L68.6 58.8M71.4 53.3L73.4 46.5M71.4 53.3L64.4 53.3"
      stroke-width="2.2"
      stroke-linecap="round"
      class="stroke-success"
    />
    <path
      d="M84.0 70.0L98.0 44.0M88.2 62.1L95.2 61.1M88.2 62.1L85.3 55.8M92.5 54.2L99.4 53.2M92.5 54.2L89.5 47.9"
      stroke-width="2.2"
      stroke-linecap="round"
      class="stroke-success"
    />
    <circle cx="78" cy="58" r="3.8" class="fill-star" />
    <circle cx="76.9" cy="56.9" r="1.1" opacity="0.6" class="fill-white" />
    <rect
      x="66"
      y="72.5"
      width="52"
      height="48"
      rx="5"
      opacity="0.1"
      class="fill-shade"
    />
    <rect
      x="66"
      y="70"
      width="52"
      height="48"
      rx="5"
      :fill="`url(#${uid}-paper)`"
      stroke-width="2"
      class="stroke-envelope-line"
    />
    <path
      d="M69 77h46"
      stroke-width="3"
      stroke-linecap="round"
      opacity="0.7"
      class="stroke-white"
    />
    <path
      d="M92.0 71v46M67 92.08h50"
      stroke-width="2"
      stroke-linecap="round"
      class="stroke-primary"
    />
    <path
      d="M100.6 92.1L100.5 92.5L100.2 92.9L99.9 93.3L99.6 93.7L99.3 94.0L99.1 94.4L99.0 94.8L99.1 95.2L99.1 95.7L99.2 96.2L99.1 96.7L98.9 97.1L98.6 97.4L98.2 97.6L97.7 97.7L97.2 97.8L96.7 97.9L96.4 98.1L96.1 98.4L95.9 98.8L95.6 99.2L95.4 99.6L95.0 100.0L94.6 100.2L94.2 100.3L93.7 100.2L93.3 100.0L92.8 99.8L92.4 99.6L92.0 99.5L91.6 99.6L91.2 99.8L90.7 100.0L90.3 100.2L89.8 100.3L89.4 100.2L89.0 100.0L88.6 99.6L88.4 99.2L88.1 98.8L87.9 98.4L87.6 98.1L87.3 97.9L86.8 97.8L86.3 97.7L85.8 97.6L85.4 97.4L85.1 97.1L84.9 96.7L84.8 96.2L84.9 95.7L84.9 95.2L85.0 94.8L84.9 94.4L84.7 94.0L84.4 93.7L84.1 93.3L83.8 92.9L83.5 92.5L83.4 92.1L83.5 91.6L83.8 91.2L84.1 90.8L84.4 90.5L84.7 90.1L84.9 89.8L85.0 89.4L84.9 88.9L84.9 88.4L84.8 87.9L84.9 87.5L85.1 87.0L85.4 86.7L85.8 86.5L86.3 86.4L86.8 86.3L87.3 86.2L87.6 86.1L87.9 85.8L88.1 85.4L88.4 85.0L88.6 84.5L89.0 84.2L89.4 83.9L89.8 83.9L90.3 84.0L90.7 84.2L91.2 84.4L91.6 84.6L92.0 84.6L92.4 84.6L92.8 84.4L93.3 84.2L93.7 84.0L94.2 83.9L94.6 83.9L95.0 84.2L95.4 84.5L95.6 85.0L95.9 85.4L96.1 85.8L96.4 86.1L96.7 86.2L97.2 86.3L97.7 86.4L98.2 86.5L98.6 86.7L98.9 87.0L99.1 87.5L99.2 87.9L99.1 88.4L99.1 88.9L99.0 89.4L99.1 89.8L99.3 90.1L99.6 90.5L99.9 90.8L100.2 91.2L100.5 91.6z"
      opacity="0.16"
      transform="translate(0 2.500)"
      class="fill-shade"
    />
    <path
      d="M100.6 92.1L100.5 92.5L100.2 92.9L99.9 93.3L99.6 93.7L99.3 94.0L99.1 94.4L99.0 94.8L99.1 95.2L99.1 95.7L99.2 96.2L99.1 96.7L98.9 97.1L98.6 97.4L98.2 97.6L97.7 97.7L97.2 97.8L96.7 97.9L96.4 98.1L96.1 98.4L95.9 98.8L95.6 99.2L95.4 99.6L95.0 100.0L94.6 100.2L94.2 100.3L93.7 100.2L93.3 100.0L92.8 99.8L92.4 99.6L92.0 99.5L91.6 99.6L91.2 99.8L90.7 100.0L90.3 100.2L89.8 100.3L89.4 100.2L89.0 100.0L88.6 99.6L88.4 99.2L88.1 98.8L87.9 98.4L87.6 98.1L87.3 97.9L86.8 97.8L86.3 97.7L85.8 97.6L85.4 97.4L85.1 97.1L84.9 96.7L84.8 96.2L84.9 95.7L84.9 95.2L85.0 94.8L84.9 94.4L84.7 94.0L84.4 93.7L84.1 93.3L83.8 92.9L83.5 92.5L83.4 92.1L83.5 91.6L83.8 91.2L84.1 90.8L84.4 90.5L84.7 90.1L84.9 89.8L85.0 89.4L84.9 88.9L84.9 88.4L84.8 87.9L84.9 87.5L85.1 87.0L85.4 86.7L85.8 86.5L86.3 86.4L86.8 86.3L87.3 86.2L87.6 86.1L87.9 85.8L88.1 85.4L88.4 85.0L88.6 84.5L89.0 84.2L89.4 83.9L89.8 83.9L90.3 84.0L90.7 84.2L91.2 84.4L91.6 84.6L92.0 84.6L92.4 84.6L92.8 84.4L93.3 84.2L93.7 84.0L94.2 83.9L94.6 83.9L95.0 84.2L95.4 84.5L95.6 85.0L95.9 85.4L96.1 85.8L96.4 86.1L96.7 86.2L97.2 86.3L97.7 86.4L98.2 86.5L98.6 86.7L98.9 87.0L99.1 87.5L99.2 87.9L99.1 88.4L99.1 88.9L99.0 89.4L99.1 89.8L99.3 90.1L99.6 90.5L99.9 90.8L100.2 91.2L100.5 91.6z"
      class="fill-primary"
    />
    <circle
      cx="92.0"
      cy="92.08"
      r="5.6"
      stroke-width="1.200"
      class="fill-primary stroke-primary-deep"
    />
    <path
      d="M85.8 89.2a6.9 6.9 0 0 1 4.0-3.6"
      stroke-width="2"
      stroke-linecap="round"
      opacity="0.28"
      class="stroke-white"
    />
    <path
      d="M92.0 88.08l0.9 3.1 3.1 0.9-3.1 0.9-0.9 3.1-0.9-3.1-3.1-0.9 3.1-0.9z"
      class="fill-star-soft"
    />
    <rect
      x="30"
      y="90.5"
      width="34"
      height="30"
      rx="5"
      opacity="0.1"
      class="fill-shade"
    />
    <rect
      x="30"
      y="88"
      width="34"
      height="30"
      rx="5"
      :fill="`url(#${uid}-paper)`"
      stroke-width="2"
      class="stroke-envelope-line"
    />
    <path
      d="M33 95h28"
      stroke-width="3"
      stroke-linecap="round"
      opacity="0.7"
      class="stroke-white"
    />
    <path
      d="M47.0 89v28M31 101.8h32"
      stroke-width="2"
      stroke-linecap="round"
      class="stroke-success"
    />
    <circle cx="47.0" cy="101.8" r="4" class="fill-star" />
    <circle cx="45.8" cy="100.6" r="1.1" opacity="0.6" class="fill-white" />
    <rect
      x="124"
      y="94.5"
      width="32"
      height="26"
      rx="5"
      opacity="0.1"
      class="fill-shade"
    />
    <rect
      x="124"
      y="92"
      width="32"
      height="26"
      rx="5"
      :fill="`url(#${uid}-paper)`"
      stroke-width="2"
      class="stroke-envelope-line"
    />
    <path
      d="M127 99h26"
      stroke-width="3"
      stroke-linecap="round"
      opacity="0.7"
      class="stroke-white"
    />
    <path
      d="M140.0 93v24M125 103.96000000000001h30"
      stroke-width="2"
      stroke-linecap="round"
      class="stroke-primary"
    />
    <circle cx="140.0" cy="103.96000000000001" r="4" class="fill-star" />
    <circle cx="138.8" cy="102.8" r="1.1" opacity="0.6" class="fill-white" />
    <circle cx="126" cy="62.5" r="17" opacity="0.16" class="fill-shade" />
    <circle cx="126" cy="60" r="17" class="fill-success" />
    <path
      d="M113.2 54.9a13.6 13.6 0 0 1 7.7-6.8"
      stroke-width="2"
      stroke-linecap="round"
      opacity="0.28"
      class="stroke-white"
    />
    <path
      d="m118.3 60 5.1 5.1 10.2-10.2"
      stroke-width="3.4"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="stroke-white"
    />
  </svg>
</template>
