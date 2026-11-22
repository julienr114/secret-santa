<script setup lang="ts">
import { skeletonLines } from '#shared/utils/skeleton';

/** A piece of a loading screen, drawn at the place and size of what it stands for. */
export type SkeletonPart =
  | 'title'
  | 'header'
  | 'greeting'
  | 'head'
  | 'doc'
  | 'bar'
  | 'members'
  | 'parties'
  | 'sections'
  | 'icons'
  | 'settings'
  | 'chips'
  | 'stepper'
  | 'steps'
  | 'card'
  | 'envelope'
  | 'groups'
  | 'journal'
  | 'list';

// A screen on its way, composed by the screen from pieces: a title, a
// header with the person's icon, the edition's stepper or the draw's
// steps, an action card, the envelope of a draw, group cards, the
// journal (its two views, its filter, a vertical timeline), a list.
// The V3 adds the home's greeting and its event cards, the head of an
// event or of a list (a pill or a tile, the name, the date), the share
// bar of a list, the line of an event's members, sections of lines with
// an icon, settings, and chips to choose from.
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
    /** Room between the pieces: as the screen it stands for. */
    gap?: 'sm' | 'md' | 'lg';
  }>(),
  { rows: 4, gap: 'lg' },
);
/** Tailwind class of each room between the pieces. */
const GAPS = { sm: 'gap-3.5', md: 'gap-4.5', lg: 'gap-6' };
/** The event cards of the home, by their number of lines. */
const PARTIES = [1, 2, 3].map((count) => skeletonLines(count));
/** The sections of an event: the width of their title, their lines. */
const SECTIONS = [
  { title: '34%', lines: skeletonLines(1) },
  { title: '26%', lines: skeletonLines(2, 1) },
];
/** Chips to choose from, by width. */
const CHIPS = ['28%', '36%', '24%'];
/** The edge and band of a white surface on the home and an event. */
const EDGE =
  'shadow-[0_3px_0_var(--color-peach-200),0_0_0_1.5px_var(--color-peach-200)]';
/** The lines of the journal's two days, by width. */
const JOURNAL_DAYS = [
  ['70%', '55%', '62%'],
  ['48%', '66%'],
];
/** Hidden for the first 200 ms, so a quick load does not flicker. */
const shown = useBusy(() => true);
</script>

<template>
  <div
    class="flex flex-col"
    :class="[GAPS[gap], { invisible: !shown }]"
    aria-busy="true"
    :aria-label="label"
  >
    <template v-for="(part, index) in parts" :key="index">
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
      <div v-else-if="part === 'greeting'" class="contents">
        <div class="px-1 pt-1">
          <USkeleton class="h-[30px] w-[52%] rounded-full bg-skeleton" />
        </div>
        <div class="px-1">
          <USkeleton class="h-[13px] w-[44%] rounded-full bg-skeleton" />
        </div>
      </div>
      <div v-else-if="part === 'head'" class="flex flex-col gap-2.5 px-1 pt-1">
        <USkeleton class="h-6.5 w-[130px] rounded-full bg-skeleton" />
        <USkeleton class="h-[30px] w-[64%] rounded-full bg-skeleton" />
        <USkeleton class="h-3.5 w-[52%] rounded-full bg-skeleton" />
      </div>
      <div v-else-if="part === 'doc'" class="flex flex-col gap-2">
        <USkeleton class="size-18 rounded-3xl bg-skeleton" />
        <USkeleton class="h-9 w-3/4 rounded-full bg-skeleton" />
        <USkeleton class="h-3.5 w-2/5 rounded-full bg-skeleton" />
      </div>
      <div
        v-else-if="part === 'bar'"
        class="flex min-h-15 items-center gap-2.5 rounded-[24px] bg-default py-2 pr-2 pl-3.5 shadow-card ring-1 ring-default"
      >
        <USkeleton class="size-5 shrink-0 rounded-full bg-skeleton-soft" />
        <span class="flex grow flex-col gap-1.5">
          <USkeleton class="h-3.5 w-1/2 rounded-full bg-skeleton-soft" />
          <USkeleton class="h-3 w-3/4 rounded-full bg-skeleton-soft" />
        </span>
        <USkeleton class="h-9 w-20 shrink-0 rounded-full bg-skeleton-soft" />
      </div>
      <div
        v-else-if="part === 'members'"
        class="flex min-h-14 items-center gap-3 rounded-[28px] bg-default px-3.5"
        :class="EDGE"
      >
        <span class="flex shrink-0">
          <USkeleton
            v-for="i in 3"
            :key="i"
            class="size-6.5 rounded-full bg-skeleton-soft not-first:-ml-[7px] not-first:ring-2 not-first:ring-(--ui-bg)"
          />
        </span>
        <USkeleton class="h-4 w-[36%] rounded-full bg-skeleton-soft" />
      </div>
      <div v-else-if="part === 'parties'" class="contents">
        <section
          v-for="(lines, card) in PARTIES"
          :key="card"
          class="overflow-hidden rounded-[28px] bg-default"
          :class="EDGE"
        >
          <div class="flex min-h-14 items-center gap-2.5 px-4 py-2.5">
            <USkeleton class="size-8 shrink-0 rounded-[9px] bg-skeleton-soft" />
            <USkeleton class="h-4.5 w-[48%] rounded-full bg-skeleton-soft" />
            <span class="grow" />
            <USkeleton class="h-3 w-12 rounded-full bg-skeleton-soft" />
          </div>
          <ul class="divide-y divide-default border-t border-default">
            <UiSkeletonLines :lines="lines" />
          </ul>
        </section>
      </div>
      <div v-else-if="part === 'sections'" class="contents">
        <section
          v-for="section in SECTIONS"
          :key="section.title"
          class="flex flex-col gap-1.5"
        >
          <div class="px-1">
            <USkeleton
              class="h-3 rounded-full bg-skeleton"
              :style="{ width: section.title }"
            />
          </div>
          <ul
            class="-mx-4 divide-y divide-default border-y border-default bg-default sm:mx-0 sm:overflow-hidden sm:rounded-lg sm:border"
          >
            <UiSkeletonLines :lines="section.lines" />
          </ul>
        </section>
      </div>
      <ul
        v-else-if="part === 'icons'"
        class="-mx-4 divide-y divide-default border-y border-default bg-default sm:mx-0 sm:overflow-hidden sm:rounded-lg sm:border"
      >
        <UiSkeletonLines :lines="skeletonLines(rows)" />
      </ul>
      <div v-else-if="part === 'settings'" class="flex flex-col gap-1.5">
        <USkeleton class="mx-1 h-3 w-24 rounded bg-skeleton" />
        <ul
          class="-mx-4 divide-y divide-default border-y border-default bg-default sm:mx-0 sm:overflow-hidden sm:rounded-lg sm:border"
        >
          <li
            v-for="([title], row) in skeletonLines(rows, index)"
            :key="row"
            class="flex min-h-15 items-center gap-3 px-4 py-2"
          >
            <USkeleton
              class="h-4 rounded-full bg-skeleton-soft"
              :style="{ width: title }"
            />
            <USkeleton
              class="ml-auto h-3 w-16 shrink-0 rounded-full bg-skeleton-soft"
            />
          </li>
        </ul>
      </div>
      <div v-else-if="part === 'chips'" class="flex flex-col gap-2">
        <USkeleton class="mx-1 h-3 w-24 rounded bg-skeleton" />
        <div class="flex gap-2">
          <USkeleton
            v-for="width in CHIPS"
            :key="width"
            class="h-10 rounded-full bg-skeleton-soft"
            :style="{ width }"
          />
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
      <div v-else-if="part === 'journal'" class="flex flex-col gap-5">
        <USkeleton class="h-12 rounded-md bg-skeleton-soft" />
        <div class="flex gap-2">
          <USkeleton class="h-10 w-[110px] rounded-full bg-skeleton-soft" />
          <USkeleton class="h-10 w-[130px] rounded-full bg-skeleton-soft" />
        </div>
        <div
          v-for="(widths, day) in JOURNAL_DAYS"
          :key="day"
          class="flex flex-col gap-3.5"
        >
          <USkeleton class="h-3 w-2/5 rounded bg-skeleton" />
          <ul class="relative flex flex-col gap-4.5">
            <span
              class="absolute top-2 bottom-2 left-[19px] w-0.5 bg-skeleton"
              aria-hidden="true"
            />
            <li
              v-for="width in widths"
              :key="width"
              class="flex items-start gap-3"
            >
              <span class="flex w-10 shrink-0 justify-center">
                <span class="relative size-8 rounded-full bg-default" />
              </span>
              <span class="flex grow items-center gap-3 pt-[9px]">
                <USkeleton
                  class="h-3.5 rounded bg-skeleton"
                  :style="{ width }"
                />
                <USkeleton class="ml-auto h-2.5 w-9 rounded bg-skeleton" />
              </span>
            </li>
          </ul>
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
