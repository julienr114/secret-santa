<script setup lang="ts">
// The envelope of a draw, drawn in SVG: waiting (dashed outline and a
// clock), sealed (kraft, a brick seal with a star), opened (flap up, a
// card with a star sticking out) or locked (a padlock instead of the
// seal). Decorative: the words around it say the same.

/** Where the envelope stands. */
export type EnvelopeState = 'pending' | 'sealed' | 'opened' | 'locked';
defineProps<{ state: EnvelopeState }>();
/** A five-pointed star of radius 7 around the origin. */
const STAR =
  '0,-7 1.76,-2.43 6.66,-2.16 2.85,0.93 4.11,5.66 0,3 -4.11,5.66 -2.85,0.93 -6.66,-2.16 -1.76,-2.43';
</script>

<template>
  <svg
    viewBox="0 0 160 124"
    class="h-auto w-40"
    aria-hidden="true"
    focusable="false"
  >
    <template v-if="state === 'pending'">
      <rect
        x="16"
        y="40"
        width="128"
        height="80"
        rx="6"
        class="fill-(--ui-bg) stroke-(--ui-border)"
        stroke-width="2"
        stroke-dasharray="6 5"
      />
      <path
        d="M17 42 L80 86 L143 42"
        class="fill-none stroke-(--ui-border)"
        stroke-width="2"
        stroke-dasharray="6 5"
      />
      <g transform="translate(80 86)">
        <circle
          r="14"
          class="fill-page stroke-(--ui-text-muted)"
          stroke-width="2"
        />
        <path
          d="M0 -7 V0 L5 3"
          class="fill-none stroke-(--ui-text-muted)"
          stroke-width="2"
          stroke-linecap="round"
        />
      </g>
    </template>

    <template v-else-if="state === 'opened'">
      <path d="M16 46 L80 6 L144 46 Z" class="fill-envelope-fold" />
      <rect
        x="16"
        y="40"
        width="128"
        height="80"
        rx="6"
        class="fill-envelope-fold"
      />
      <rect
        x="32"
        y="16"
        width="96"
        height="72"
        rx="4"
        class="fill-(--ui-bg) stroke-(--ui-border)"
        stroke-width="1.5"
      />
      <polygon
        :points="STAR"
        transform="translate(80 42) scale(1.6)"
        class="fill-star"
      />
      <path
        d="M16 46 L80 86 L144 46 V114 A6 6 0 0 1 138 120 H22 A6 6 0 0 1 16 114 Z"
        class="fill-envelope"
      />
    </template>

    <template v-else>
      <rect
        x="16"
        y="40"
        width="128"
        height="80"
        rx="6"
        class="fill-envelope"
      />
      <path
        d="M16 120 L66 80 M144 120 L94 80"
        class="fill-none stroke-envelope-fold"
        stroke-width="2"
      />
      <path
        d="M16 46 A6 6 0 0 1 22 40 H138 A6 6 0 0 1 144 46 L80 90 Z"
        class="fill-envelope-fold"
      />
      <g v-if="state === 'sealed'" transform="translate(80 88)">
        <circle r="14" class="fill-(--ui-primary)" />
        <polygon :points="STAR" class="fill-(--ui-bg)" />
      </g>
      <g v-else transform="translate(80 88)">
        <circle r="14" class="fill-(--ui-text-muted)" />
        <path
          d="M-3.5 -1 V-4.5 A3.5 3.5 0 0 1 3.5 -4.5 V-1"
          class="fill-none stroke-(--ui-bg)"
          stroke-width="2"
        />
        <rect
          x="-6"
          y="-1"
          width="12"
          height="9"
          rx="2"
          class="fill-(--ui-bg)"
        />
      </g>
    </template>
  </svg>
</template>
