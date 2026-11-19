<script setup lang="ts">
import {
  BRANCHED_FLAKE_PATH,
  FLAKE_PATH,
  STAR_PATH,
  festiveRain,
  type RainPiece,
} from '~/utils/festiveRain';

// The festive rain behind the last image of the palmarès (README 22.17,
// 23.5, maquette DevineStory7): snowflakes, stars that twinkle, a few
// confetti, falling in a loop behind the words. Drawn at random in the
// browser, never on the server. CSS only, on `transform` and `opacity`.
// Decorative: hidden from screen readers, nothing to press. With « less
// motion », nothing moves: the drawings stay where they rest.
const pieces = ref<RainPiece[]>([]);
onMounted(() => {
  pieces.value = festiveRain(Math.random);
});
/**
 * Where a piece falls and at what pace, as the variables its class reads.
 * @param piece - The piece.
 * @returns Its inline style.
 */
const fall = (piece: RainPiece) => ({
  left: `${piece.left}%`,
  opacity: piece.opacity,
  '--d': `${piece.duration}s`,
  '--t': `${piece.delay}s`,
  '--dx': `${piece.drift}px`,
  '--r': `${piece.turn}deg`,
  '--y': `${piece.rest}%`,
});
</script>

<template>
  <div
    class="pointer-events-none absolute inset-0 overflow-hidden"
    aria-hidden="true"
    data-testid="festive-rain"
  >
    <span
      v-for="(piece, index) in pieces"
      :key="index"
      class="piece"
      :style="fall(piece)"
    >
      <span
        v-if="piece.kind === 'confetti'"
        class="block"
        :style="{
          width: `${piece.width}px`,
          height: `${piece.height}px`,
          borderRadius: piece.round ? '50%' : '2px',
          backgroundColor: piece.color,
        }"
      />
      <svg
        v-else-if="piece.kind === 'star'"
        class="twinkle"
        :style="{
          '--tw': `${piece.twinkle?.period}s`,
          '--td': `${piece.twinkle?.delay}s`,
        }"
        :width="piece.width"
        :height="piece.height"
        viewBox="0 0 24 24"
        :fill="piece.color"
      >
        <path :d="STAR_PATH" />
      </svg>
      <svg
        v-else
        :width="piece.width"
        :height="piece.height"
        viewBox="0 0 24 24"
        fill="none"
        :stroke="piece.color"
        :stroke-width="piece.stroke"
        stroke-linecap="round"
      >
        <path
          :d="piece.kind === 'branched' ? BRANCHED_FLAKE_PATH : FLAKE_PATH"
        />
      </svg>
    </span>
  </div>
</template>

<style scoped>
@keyframes fall {
  from {
    transform: translate3d(0, -60px, 0) rotate(0deg);
  }
  to {
    transform: translate3d(var(--dx), calc(100dvh + 80px), 0) rotate(var(--r));
  }
}
@keyframes twinkle {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.35;
    transform: scale(0.72);
  }
}
.piece {
  position: absolute;
  top: -40px;
  animation: fall var(--d) linear var(--t) infinite;
  will-change: transform;
}
.twinkle {
  display: block;
  animation: twinkle var(--tw) ease-in-out var(--td) infinite;
}
@media (prefers-reduced-motion: reduce) {
  .piece {
    top: var(--y);
    animation: none;
  }
  .twinkle {
    animation: none;
  }
}
</style>
