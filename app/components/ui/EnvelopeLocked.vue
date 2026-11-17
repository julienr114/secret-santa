<script setup lang="ts">
// The envelope of a link that no longer works: closed with a padlock.
// Drawn from the mockup TirageLienInvalide (lot 18, README 22.16); the colours of the
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
    <ellipse cx="92" cy="123" rx="76" ry="4" fill="#3c1e0a" opacity="0.1" />
    <rect
      x="6"
      y="14"
      width="172"
      height="106"
      rx="8"
      :fill="`url(#${uid}-paper)`"
      stroke="#cdb48a"
      stroke-width="2"
    />
    <path d="M8 117 70 66q22 17 44 0l62 51z" fill="#d9c7a6" opacity="0.35" />
    <path
      d="M7 116 70 66M177 116 114 66"
      stroke="#cdb48a"
      stroke-width="2"
      stroke-linecap="round"
    />
    <path
      d="M8 21 84 77a13 13 0 0 0 16 0l76-56"
      fill="#3c1e0a"
      opacity="0.08"
    />
    <path
      d="M8 18 84 74a13 13 0 0 0 16 0l76-56"
      :fill="`url(#${uid}-flap)`"
      stroke="#cdb48a"
      stroke-width="2"
      stroke-linejoin="round"
    />
    <path
      d="M24 23 86 68.500a10 10 0 0 0 12 0L160 23"
      stroke-width="1.500"
      stroke-linecap="round"
      stroke-dasharray="4 5"
      opacity="0.65"
      style="stroke: var(--color-brick-500)"
    />
    <circle cx="92" cy="80.500" r="24" fill="#3c1e0a" opacity="0.12" />
    <circle
      cx="92"
      cy="78"
      r="24"
      stroke="#cdb48a"
      stroke-width="2"
      style="fill: var(--ui-bg)"
    />
    <path
      d="M85.500 76v-5a6.500 6.500 0 0 1 13 0v5"
      stroke-width="3"
      stroke-linecap="round"
      style="stroke: var(--ui-text-toned)"
    />
    <rect
      x="81"
      y="75"
      width="22"
      height="16.500"
      rx="3.500"
      style="fill: var(--ui-text-toned)"
    />
    <circle cx="92" cy="81.500" r="2.200" style="fill: var(--ui-bg)" />
    <path
      d="M92 82.500v4"
      stroke-width="1.800"
      stroke-linecap="round"
      style="stroke: var(--ui-bg)"
    />
  </svg>
</template>
