<script setup lang="ts">
import { errorMessage } from '~/utils/errors';

// Loading and error states shared by every admin screen. The skeleton
// mimics a screen: a title, then a full-width list.
withDefaults(
  defineProps<{ pending: boolean; error: unknown; rows?: number }>(),
  { rows: 4 },
);
</script>

<template>
  <UAlert
    v-if="error"
    color="error"
    variant="subtle"
    icon="i-lucide-triangle-alert"
    :description="errorMessage(error)"
  />
  <div
    v-else-if="pending"
    class="flex flex-col gap-6"
    aria-busy="true"
    aria-label="Chargement"
  >
    <USkeleton class="h-9 w-2/3 rounded-md bg-[var(--color-kraft-300)]" />
    <div class="flex flex-col gap-1.5">
      <USkeleton class="mx-1 h-3 w-24 rounded bg-[var(--color-kraft-300)]" />
      <ul
        class="-mx-4 divide-y divide-default border-y border-default bg-default sm:mx-0 sm:overflow-hidden sm:rounded-lg sm:border"
      >
        <li
          v-for="i in rows"
          :key="i"
          class="flex min-h-14 items-center gap-3 px-4 py-2.5"
        >
          <USkeleton
            class="size-9 shrink-0 rounded-full bg-[var(--color-kraft-100)]"
          />
          <div class="flex grow flex-col gap-1.5">
            <USkeleton
              class="h-4 rounded bg-[var(--color-kraft-100)]"
              :style="{ width: `${70 - i * 9}%` }"
            />
            <USkeleton class="h-3 w-2/5 rounded bg-[var(--color-kraft-100)]" />
          </div>
        </li>
      </ul>
    </div>
  </div>
  <slot v-else />
</template>
