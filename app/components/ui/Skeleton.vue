<script setup lang="ts">
/** A piece of a loading screen, drawn at the place and size of what it stands for. */
export type SkeletonPart =
  | 'title'
  | 'header'
  | 'stepper'
  | 'steps'
  | 'card'
  | 'envelope'
  | 'groups'
  | 'list';

// A screen on its way, composed by the screen from pieces: a title, a
// header with the person's icon, the edition's stepper or the draw's
// steps, an action card, the envelope of a draw, group cards, a list.
// The busy state and its words go on the whole, for screen readers. It
// keeps its room but shows only after 200 ms, so a quick load does not
// flicker.
withDefaults(
  defineProps<{
    parts: SkeletonPart[];
    /** Rows of the list piece. */
    rows?: number;
    /** "Chargement", read by screen readers. */
    label: string;
  }>(),
  { rows: 4 },
);
/** Hidden for the first 200 ms, so a quick load does not flicker. */
const shown = useBusy(() => true);
</script>

<template>
  <div
    class="flex flex-col gap-6"
    :class="{ invisible: !shown }"
    aria-busy="true"
    :aria-label="label"
  >
    <template v-for="part in parts" :key="part">
      <div v-if="part === 'title'" class="flex flex-col gap-2">
        <USkeleton class="h-8.5 w-3/5 rounded-md bg-skeleton" />
        <USkeleton class="h-4 w-2/5 rounded bg-skeleton" />
      </div>
      <div v-else-if="part === 'header'" class="flex items-center gap-3">
        <USkeleton class="size-14 shrink-0 rounded-full bg-skeleton" />
        <div class="flex grow flex-col gap-2">
          <USkeleton class="h-7 w-3/4 rounded-md bg-skeleton" />
          <USkeleton class="h-3 w-1/2 rounded bg-skeleton-soft" />
        </div>
      </div>
      <div
        v-else-if="part === 'stepper'"
        class="grid grid-cols-3 justify-items-center px-6"
      >
        <USkeleton
          v-for="i in 3"
          :key="i"
          class="h-6 w-[88px] rounded-full bg-skeleton"
        />
      </div>
      <div
        v-else-if="part === 'steps'"
        class="grid grid-cols-3 justify-items-center"
      >
        <div v-for="i in 3" :key="i" class="flex flex-col items-center gap-2">
          <USkeleton class="size-6 rounded-full bg-skeleton" />
          <USkeleton class="h-2.5 w-[68px] rounded bg-skeleton" />
        </div>
      </div>
      <div
        v-else-if="part === 'card'"
        class="flex flex-col gap-3.5 rounded-2xl bg-default p-5 ring-1 ring-default"
      >
        <USkeleton class="h-3 w-1/3 rounded bg-skeleton-soft" />
        <USkeleton class="h-6 w-4/5 rounded bg-skeleton-soft" />
        <USkeleton class="h-12 rounded-md bg-skeleton-soft" />
      </div>
      <div
        v-else-if="part === 'envelope'"
        class="flex flex-col items-center gap-4 rounded-2xl bg-default px-6 py-7 ring-1 ring-default"
      >
        <USkeleton class="h-26 w-[150px] rounded-2xl bg-skeleton-soft" />
        <USkeleton class="h-5.5 w-3/5 rounded-lg bg-skeleton-soft" />
        <USkeleton class="h-3 w-4/5 rounded bg-skeleton-soft" />
        <USkeleton class="h-3 w-1/2 rounded bg-skeleton-soft" />
        <USkeleton class="h-12 w-full rounded-md bg-skeleton-soft" />
      </div>
      <div v-else-if="part === 'groups'" class="flex flex-col gap-3">
        <USkeleton class="mx-1 h-3 w-24 rounded bg-skeleton" />
        <div
          v-for="i in 2"
          :key="i"
          class="flex flex-col gap-3 rounded-2xl bg-default p-4 ring-1 ring-default"
        >
          <USkeleton class="h-5 w-1/2 rounded-md bg-skeleton-soft" />
          <USkeleton class="h-3 w-3/4 rounded bg-skeleton-soft" />
          <div class="grid grid-cols-2 gap-2">
            <USkeleton class="h-11 rounded-md bg-skeleton-soft" />
            <USkeleton class="h-11 rounded-md bg-skeleton-soft" />
          </div>
        </div>
      </div>
      <div v-else class="flex flex-col gap-1.5">
        <USkeleton class="mx-1 h-3 w-24 rounded bg-skeleton" />
        <ul
          class="-mx-4 divide-y divide-default border-y border-default bg-default sm:mx-0 sm:overflow-hidden sm:rounded-lg sm:border"
        >
          <li
            v-for="i in rows"
            :key="i"
            class="flex min-h-15 items-center gap-3 px-4 py-2"
          >
            <USkeleton class="size-10 shrink-0 rounded-full bg-skeleton-soft" />
            <div class="flex grow flex-col gap-1.5">
              <USkeleton
                class="h-4 rounded bg-skeleton-soft"
                :style="{ width: `${70 - i * 9}%` }"
              />
              <USkeleton class="h-3 w-2/5 rounded bg-skeleton-soft" />
            </div>
          </li>
        </ul>
      </div>
    </template>
  </div>
</template>
