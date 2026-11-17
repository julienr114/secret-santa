<script setup lang="ts">
// The podium of the « Devine qui » results (lot 19): not shown yet.
// Drawn from the mockup DevineTiragePalmares (lot 18, README 22.16); the colours of the
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
        <stop stop-color="#efe3cd" />
        <stop offset="1" stop-color="#e2d2b4" />
      </linearGradient>
      <linearGradient
        :id="`${uid}-flap`"
        x1="0"
        y1="18"
        x2="0"
        y2="78"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="#f8f1e3" />
        <stop offset="1" stop-color="#efe4cf" />
      </linearGradient>
    </defs>
    <ellipse cx="92" cy="123" rx="80" ry="4" fill="#3c1e0a" opacity="0.1" />
    <rect
      x="22"
      y="76"
      width="46"
      height="46"
      rx="4"
      :fill="`url(#${uid}-flap)`"
      stroke="#cdb48a"
      stroke-width="2"
    />
    <path
      d="M25 83h40"
      stroke-width="3"
      stroke-linecap="round"
      opacity="0.7"
      style="stroke: var(--ui-bg)"
    />
    <rect
      x="116"
      y="88"
      width="46"
      height="34"
      rx="4"
      :fill="`url(#${uid}-flap)`"
      stroke="#cdb48a"
      stroke-width="2"
    />
    <path
      d="M119 95h40"
      stroke-width="3"
      stroke-linecap="round"
      opacity="0.7"
      style="stroke: var(--ui-bg)"
    />
    <rect
      x="68"
      y="54"
      width="48"
      height="68"
      rx="4"
      :fill="`url(#${uid}-paper)`"
      stroke="#cdb48a"
      stroke-width="2"
    />
    <path
      d="M71 61h42"
      stroke-width="3"
      stroke-linecap="round"
      opacity="0.7"
      style="stroke: var(--ui-bg)"
    />
    <path
      d="M88.500 84l5-4v20M88 100h11"
      stroke-width="3.500"
      stroke-linecap="round"
      stroke-linejoin="round"
      style="stroke: var(--color-brick-500)"
    />
    <path
      d="M40 97a5 5 0 1 1 9 3l-9 9.500h10.500"
      stroke-width="3"
      stroke-linecap="round"
      stroke-linejoin="round"
      style="stroke: var(--color-mustard-700)"
    />
    <path
      d="M134.500 100h9l-5 5.500a4.300 4.300 0 1 1-4.500 5.500"
      stroke-width="3"
      stroke-linecap="round"
      stroke-linejoin="round"
      style="stroke: var(--color-pine-600)"
    />
    <path
      d="M80.0 40.0L62.0 24.0M75.8 36.3L76.3 30.3M75.8 36.3L69.9 37.5M71.6 32.6L72.1 26.6M71.6 32.6L65.7 33.8M67.4 28.8L67.9 22.9M67.4 28.8L61.6 30.0"
      stroke-width="2.2"
      stroke-linecap="round"
      style="stroke: var(--color-pine-600)"
    />
    <path
      d="M104.0 40.0L122.0 24.0M108.2 36.3L114.1 37.5M108.2 36.3L107.7 30.3M112.4 32.6L118.3 33.8M112.4 32.6L111.9 26.6M116.6 28.8L122.4 30.0M116.6 28.8L116.1 22.9"
      stroke-width="2.2"
      stroke-linecap="round"
      style="stroke: var(--color-pine-600)"
    />
    <path
      d="M111.3 28.0L111.1 29.0L110.5 29.9L109.8 30.8L109.0 31.6L108.3 32.4L107.9 33.2L107.8 34.1L107.9 35.1L108.0 36.2L108.1 37.3L108.0 38.4L107.6 39.3L106.8 40.0L105.8 40.5L104.7 40.7L103.6 40.9L102.6 41.1L101.8 41.5L101.2 42.2L100.7 43.0L100.2 44.0L99.6 45.0L98.8 45.8L98.0 46.3L96.9 46.4L95.9 46.2L94.8 45.8L93.8 45.3L92.9 44.9L92.0 44.7L91.1 44.9L90.2 45.3L89.2 45.8L88.1 46.2L87.1 46.4L86.0 46.3L85.2 45.8L84.4 45.0L83.8 44.0L83.3 43.0L82.8 42.2L82.2 41.5L81.4 41.1L80.4 40.9L79.3 40.7L78.2 40.5L77.2 40.0L76.4 39.3L76.0 38.4L75.9 37.3L76.0 36.2L76.1 35.1L76.2 34.1L76.1 33.2L75.7 32.4L75.0 31.6L74.2 30.8L73.5 29.9L72.9 29.0L72.7 28.0L72.9 27.0L73.5 26.1L74.2 25.2L75.0 24.4L75.7 23.6L76.1 22.8L76.2 21.9L76.1 20.9L76.0 19.8L75.9 18.7L76.0 17.6L76.4 16.7L77.2 16.0L78.2 15.5L79.3 15.3L80.4 15.1L81.4 14.9L82.2 14.5L82.8 13.8L83.3 13.0L83.8 12.0L84.4 11.0L85.2 10.2L86.0 9.7L87.1 9.6L88.1 9.8L89.2 10.2L90.2 10.7L91.1 11.1L92.0 11.3L92.9 11.1L93.8 10.7L94.8 10.2L95.9 9.8L96.9 9.6L98.0 9.7L98.8 10.2L99.6 11.0L100.2 12.0L100.7 13.0L101.2 13.8L101.8 14.5L102.6 14.9L103.6 15.1L104.7 15.3L105.8 15.5L106.8 16.0L107.6 16.7L108.0 17.6L108.1 18.7L108.0 19.8L107.9 20.9L107.8 21.9L107.9 22.8L108.3 23.6L109.0 24.4L109.8 25.2L110.5 26.1L111.1 27.0z"
      fill="#3c1e0a"
      opacity="0.16"
      transform="translate(0 2.500)"
    />
    <path
      d="M111.3 28.0L111.1 29.0L110.5 29.9L109.8 30.8L109.0 31.6L108.3 32.4L107.9 33.2L107.8 34.1L107.9 35.1L108.0 36.2L108.1 37.3L108.0 38.4L107.6 39.3L106.8 40.0L105.8 40.5L104.7 40.7L103.6 40.9L102.6 41.1L101.8 41.5L101.2 42.2L100.7 43.0L100.2 44.0L99.6 45.0L98.8 45.8L98.0 46.3L96.9 46.4L95.9 46.2L94.8 45.8L93.8 45.3L92.9 44.9L92.0 44.7L91.1 44.9L90.2 45.3L89.2 45.8L88.1 46.2L87.1 46.4L86.0 46.3L85.2 45.8L84.4 45.0L83.8 44.0L83.3 43.0L82.8 42.2L82.2 41.5L81.4 41.1L80.4 40.9L79.3 40.7L78.2 40.5L77.2 40.0L76.4 39.3L76.0 38.4L75.9 37.3L76.0 36.2L76.1 35.1L76.2 34.1L76.1 33.2L75.7 32.4L75.0 31.6L74.2 30.8L73.5 29.9L72.9 29.0L72.7 28.0L72.9 27.0L73.5 26.1L74.2 25.2L75.0 24.4L75.7 23.6L76.1 22.8L76.2 21.9L76.1 20.9L76.0 19.8L75.9 18.7L76.0 17.6L76.4 16.7L77.2 16.0L78.2 15.5L79.3 15.3L80.4 15.1L81.4 14.9L82.2 14.5L82.8 13.8L83.3 13.0L83.8 12.0L84.4 11.0L85.2 10.2L86.0 9.7L87.1 9.6L88.1 9.8L89.2 10.2L90.2 10.7L91.1 11.1L92.0 11.3L92.9 11.1L93.8 10.7L94.8 10.2L95.9 9.8L96.9 9.6L98.0 9.7L98.8 10.2L99.6 11.0L100.2 12.0L100.7 13.0L101.2 13.8L101.8 14.5L102.6 14.9L103.6 15.1L104.7 15.3L105.8 15.5L106.8 16.0L107.6 16.7L108.0 17.6L108.1 18.7L108.0 19.8L107.9 20.9L107.8 21.9L107.9 22.8L108.3 23.6L109.0 24.4L109.8 25.2L110.5 26.1L111.1 27.0z"
      style="fill: var(--color-brick-500)"
    />
    <circle
      cx="92"
      cy="28"
      r="12.6"
      stroke-width="1.200"
      style="fill: var(--color-brick-600); stroke: var(--color-brick-700)"
    />
    <path
      d="M78.1 21.5a15.5 15.5 0 0 1 9.0-8.1"
      stroke="#ffffff"
      stroke-width="2"
      stroke-linecap="round"
      opacity="0.28"
    />
    <path
      d="M92 19.0l2.1 6.9 6.9 2.1-6.9 2.1-2.1 6.9-2.1-6.9-6.9-2.1 6.9-2.1z"
      style="fill: var(--color-mustard-100)"
    />
    <path
      d="M45 52l1.8 6.2 6.2 1.8-6.2 1.8-1.8 6.2-1.8-6.2-6.2-1.8 6.2-1.8z"
      style="fill: var(--color-mustard-400)"
    />
    <path
      d="M139 67.5l1.5 5.0 5.0 1.5-5.0 1.5-1.5 5.0-1.5-5.0-5.0-1.5 5.0-1.5z"
      style="fill: var(--color-pine-600)"
    />
    <circle cx="54" cy="16" r="3" style="fill: var(--color-pine-600)" />
    <circle cx="132" cy="12" r="3" style="fill: var(--color-mustard-400)" />
    <circle cx="154" cy="42" r="2.500" style="fill: var(--color-brick-500)" />
    <circle cx="28" cy="42" r="2.500" style="fill: var(--color-brick-500)" />
    <path
      d="M20 22l4 3M162 24l-4 3M150 60l3-4"
      stroke-width="2.500"
      stroke-linecap="round"
      style="stroke: var(--color-mustard-400)"
    />
  </svg>
</template>
