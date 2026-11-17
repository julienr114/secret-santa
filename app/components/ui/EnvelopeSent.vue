<script setup lang="ts">
// The envelope of a login link just sent: closed, with a green check.
// Drawn from the mockup ConnexionEnvoye (lot 18, README 22.16); the colours of the
// design system by their tokens, the others as drawn. Decorative: the
// words around it say the same.
const uid = useId();
</script>

<template>
  <svg
    viewBox="0 0 184 128"
    fill="none"
    class="h-auto shrink-0 w-[150px]"
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
    <path
      d="M20 1l1.4 4.6 4.6 1.4-4.6 1.4-1.4 4.6-1.4-4.6-4.6-1.4 4.6-1.4z"
      style="fill: var(--color-mustard-400)"
    />
    <path
      d="M118 3l0.9 3.1 3.1 0.9-3.1 0.9-0.9 3.1-0.9-3.1-3.1-0.9 3.1-0.9z"
      style="fill: var(--color-mustard-400)"
    />
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
    <circle cx="150" cy="28.500" r="20" fill="#3c1e0a" opacity="0.16" />
    <circle cx="150" cy="26" r="20" style="fill: var(--color-pine-600)" />
    <path
      d="M135 20a16 16 0 0 1 9-8"
      stroke="#ffffff"
      stroke-width="2"
      stroke-linecap="round"
      opacity="0.28"
    />
    <path
      d="m141 26 6 6 12-12"
      stroke="#ffffff"
      stroke-width="4"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>
