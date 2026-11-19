<script setup lang="ts">
// The tree and its parcels: a fir under its star, a sealed parcel and a
// small one. In place of the logo on the screens before logging in
// (README 23.5), where it carries the name of the application.
// Drawn from docs/refonte/sorbet/illus2.py, in the manner of the
// envelopes; the colours by their tokens. Decorative without a label.
defineProps<{
  /** Its name for screen readers, when it stands for the logo. */
  label?: string;
}>();
const uid = useId();
</script>

<template>
  <svg
    viewBox="0 0 184 128"
    fill="none"
    class="h-auto w-50 shrink-0"
    :role="label ? 'img' : undefined"
    :aria-label="label"
    :aria-hidden="label ? undefined : 'true'"
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
    <ellipse cx="92" cy="123" rx="82" ry="4" opacity="0.1" class="fill-shade" />
    <path
      d="M160 24l1.4 4.6 4.6 1.4-4.6 1.4-1.4 4.6-1.4-4.6-4.6-1.4 4.6-1.4z"
      class="fill-star"
    />
    <path
      d="M20 39.5l1.0 3.5 3.5 1.0-3.5 1.0-1.0 3.5-1.0-3.5-3.5-1.0 3.5-1.0z"
      class="fill-star"
    />
    <circle cx="146" cy="14" r="1.800" class="fill-primary" />
    <rect x="79" y="106" width="10" height="14" rx="2" class="fill-wood" />
    <polygon
      points="48,108 120,108 84,58"
      stroke-width="5"
      stroke-linejoin="round"
      class="fill-success stroke-success"
    />
    <polygon
      points="56,89 112,89 84,47"
      stroke-width="5"
      stroke-linejoin="round"
      class="fill-success-deep stroke-success-deep"
    />
    <polygon
      points="56,84 112,84 84,42"
      stroke-width="5"
      stroke-linejoin="round"
      class="fill-success stroke-success"
    />
    <polygon
      points="64,65 104,65 84,31"
      stroke-width="5"
      stroke-linejoin="round"
      class="fill-success-deep stroke-success-deep"
    />
    <polygon
      points="64,60 104,60 84,26"
      stroke-width="5"
      stroke-linejoin="round"
      class="fill-success stroke-success"
    />
    <path
      d="M72 46q5-10 11-16"
      stroke-width="2"
      stroke-linecap="round"
      opacity="0.28"
      class="stroke-white"
    />
    <path
      d="M60 97q24 10 48-3M67 73q17 8 34-3"
      stroke-width="1.500"
      stroke-linecap="round"
      stroke-dasharray="4 5"
      opacity="0.85"
      class="stroke-star-soft"
    />
    <circle cx="70" cy="101" r="4" class="fill-star" />
    <circle cx="68.8" cy="99.8" r="1.1" opacity="0.6" class="fill-white" />
    <circle cx="100" cy="99" r="3.4" class="fill-primary" />
    <circle cx="99.0" cy="98.0" r="1.0" opacity="0.6" class="fill-white" />
    <circle cx="94" cy="77" r="3.6" class="fill-star" />
    <circle cx="92.9" cy="75.9" r="1.0" opacity="0.6" class="fill-white" />
    <circle cx="76" cy="54" r="3" class="fill-primary" />
    <circle cx="75.1" cy="53.1" r="0.8" opacity="0.6" class="fill-white" />
    <path
      d="M84 8l2.1 6.9 6.9 2.1-6.9 2.1-2.1 6.9-2.1-6.9-6.9-2.1 6.9-2.1z"
      class="fill-star"
    />
    <rect
      x="122"
      y="78.5"
      width="44"
      height="42"
      rx="5"
      opacity="0.1"
      class="fill-shade"
    />
    <rect
      x="122"
      y="76"
      width="44"
      height="42"
      rx="5"
      :fill="`url(#${uid}-paper)`"
      stroke-width="2"
      class="stroke-envelope-line"
    />
    <path
      d="M125 83h38"
      stroke-width="3"
      stroke-linecap="round"
      opacity="0.7"
      class="stroke-white"
    />
    <path
      d="M144.0 77v40M123 95.32h42"
      stroke-width="2"
      stroke-linecap="round"
      class="stroke-primary"
    />
    <path
      d="M152.6 95.3L152.5 95.8L152.2 96.2L151.9 96.6L151.6 96.9L151.3 97.3L151.1 97.6L151.0 98.0L151.1 98.5L151.1 99.0L151.2 99.5L151.1 99.9L150.9 100.4L150.6 100.7L150.2 100.9L149.7 101.0L149.2 101.1L148.7 101.2L148.4 101.3L148.1 101.6L147.9 102.0L147.6 102.4L147.4 102.9L147.0 103.2L146.6 103.5L146.2 103.5L145.7 103.4L145.3 103.2L144.8 103.0L144.4 102.8L144.0 102.8L143.6 102.8L143.2 103.0L142.7 103.2L142.3 103.4L141.8 103.5L141.4 103.5L141.0 103.2L140.6 102.9L140.4 102.4L140.1 102.0L139.9 101.6L139.6 101.3L139.3 101.2L138.8 101.1L138.3 101.0L137.8 100.9L137.4 100.7L137.1 100.4L136.9 99.9L136.8 99.5L136.9 99.0L136.9 98.5L137.0 98.0L136.9 97.6L136.7 97.3L136.4 96.9L136.1 96.6L135.8 96.2L135.5 95.8L135.4 95.3L135.5 94.9L135.8 94.5L136.1 94.1L136.4 93.7L136.7 93.4L136.9 93.0L137.0 92.6L136.9 92.2L136.9 91.7L136.8 91.2L136.9 90.7L137.1 90.3L137.4 90.0L137.8 89.8L138.3 89.7L138.8 89.6L139.3 89.5L139.6 89.3L139.9 89.0L140.1 88.6L140.4 88.2L140.6 87.8L141.0 87.4L141.4 87.2L141.8 87.1L142.3 87.2L142.7 87.4L143.2 87.6L143.6 87.8L144.0 87.9L144.4 87.8L144.8 87.6L145.3 87.4L145.7 87.2L146.2 87.1L146.6 87.2L147.0 87.4L147.4 87.8L147.6 88.2L147.9 88.6L148.1 89.0L148.4 89.3L148.7 89.5L149.2 89.6L149.7 89.7L150.2 89.8L150.6 90.0L150.9 90.3L151.1 90.7L151.2 91.2L151.1 91.7L151.1 92.2L151.0 92.6L151.1 93.0L151.3 93.4L151.6 93.7L151.9 94.1L152.2 94.5L152.5 94.9z"
      opacity="0.16"
      transform="translate(0 2.500)"
      class="fill-shade"
    />
    <path
      d="M152.6 95.3L152.5 95.8L152.2 96.2L151.9 96.6L151.6 96.9L151.3 97.3L151.1 97.6L151.0 98.0L151.1 98.5L151.1 99.0L151.2 99.5L151.1 99.9L150.9 100.4L150.6 100.7L150.2 100.9L149.7 101.0L149.2 101.1L148.7 101.2L148.4 101.3L148.1 101.6L147.9 102.0L147.6 102.4L147.4 102.9L147.0 103.2L146.6 103.5L146.2 103.5L145.7 103.4L145.3 103.2L144.8 103.0L144.4 102.8L144.0 102.8L143.6 102.8L143.2 103.0L142.7 103.2L142.3 103.4L141.8 103.5L141.4 103.5L141.0 103.2L140.6 102.9L140.4 102.4L140.1 102.0L139.9 101.6L139.6 101.3L139.3 101.2L138.8 101.1L138.3 101.0L137.8 100.9L137.4 100.7L137.1 100.4L136.9 99.9L136.8 99.5L136.9 99.0L136.9 98.5L137.0 98.0L136.9 97.6L136.7 97.3L136.4 96.9L136.1 96.6L135.8 96.2L135.5 95.8L135.4 95.3L135.5 94.9L135.8 94.5L136.1 94.1L136.4 93.7L136.7 93.4L136.9 93.0L137.0 92.6L136.9 92.2L136.9 91.7L136.8 91.2L136.9 90.7L137.1 90.3L137.4 90.0L137.8 89.8L138.3 89.7L138.8 89.6L139.3 89.5L139.6 89.3L139.9 89.0L140.1 88.6L140.4 88.2L140.6 87.8L141.0 87.4L141.4 87.2L141.8 87.1L142.3 87.2L142.7 87.4L143.2 87.6L143.6 87.8L144.0 87.9L144.4 87.8L144.8 87.6L145.3 87.4L145.7 87.2L146.2 87.1L146.6 87.2L147.0 87.4L147.4 87.8L147.6 88.2L147.9 88.6L148.1 89.0L148.4 89.3L148.7 89.5L149.2 89.6L149.7 89.7L150.2 89.8L150.6 90.0L150.9 90.3L151.1 90.7L151.2 91.2L151.1 91.7L151.1 92.2L151.0 92.6L151.1 93.0L151.3 93.4L151.6 93.7L151.9 94.1L152.2 94.5L152.5 94.9z"
      class="fill-primary"
    />
    <circle
      cx="144.0"
      cy="95.32"
      r="5.6"
      stroke-width="1.200"
      class="fill-primary stroke-primary-deep"
    />
    <path
      d="M137.8 92.4a6.9 6.9 0 0 1 4.0-3.6"
      stroke-width="2"
      stroke-linecap="round"
      opacity="0.28"
      class="stroke-white"
    />
    <path
      d="M144.0 91.32l0.9 3.1 3.1 0.9-3.1 0.9-0.9 3.1-0.9-3.1-3.1-0.9 3.1-0.9z"
      class="fill-star-soft"
    />
    <rect
      x="18"
      y="94.5"
      width="32"
      height="26"
      rx="5"
      opacity="0.1"
      class="fill-shade"
    />
    <rect
      x="18"
      y="92"
      width="32"
      height="26"
      rx="5"
      :fill="`url(#${uid}-paper)`"
      stroke-width="2"
      class="stroke-envelope-line"
    />
    <path
      d="M21 99h26"
      stroke-width="3"
      stroke-linecap="round"
      opacity="0.7"
      class="stroke-white"
    />
    <path
      d="M34.0 93v24M19 103.96000000000001h30"
      stroke-width="2"
      stroke-linecap="round"
      class="stroke-success"
    />
    <circle cx="34.0" cy="103.96000000000001" r="4" class="fill-star" />
    <circle cx="32.8" cy="102.8" r="1.1" opacity="0.6" class="fill-white" />
    <path
      d="M132.0 76.0L150.0 58.0M137.5 70.5L143.4 71.4M137.5 70.5L136.6 64.6M142.9 65.1L148.8 65.9M142.9 65.1L142.1 59.2"
      stroke-width="2.2"
      stroke-linecap="round"
      class="stroke-success"
    />
    <circle cx="136" cy="70" r="3.4" class="fill-star" />
    <circle cx="135.0" cy="69.0" r="1.0" opacity="0.6" class="fill-white" />
  </svg>
</template>
