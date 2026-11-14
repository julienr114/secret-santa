<script setup lang="ts">
import { LOGIN } from '~/composables/queries/useSession';

const { t } = useT();
const errorMessage = useErrorMessage();

// Loading and error states shared by every admin screen. The skeleton
// mimics a screen: a title, then a full-width list.
const props = withDefaults(
  defineProps<{ pending: boolean; error: unknown; rows?: number }>(),
  { rows: 4 },
);

// A session revoked elsewhere (other device, account disabled) is only
// known when the server refuses: forget it here and go back to the login.
const { clear } = useUserSession();
watch(
  () => (props.error as { statusCode?: number } | null)?.statusCode,
  async (status) => {
    if (status !== 401 || import.meta.server) return;
    await clear();
    await navigateTo(LOGIN);
  },
  { immediate: true },
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
    :aria-label="t('common.loading')"
  >
    <USkeleton class="h-9 w-2/3 rounded-md bg-skeleton" />
    <div class="flex flex-col gap-1.5">
      <USkeleton class="mx-1 h-3 w-24 rounded bg-skeleton" />
      <ul
        class="-mx-4 divide-y divide-default border-y border-default bg-default sm:mx-0 sm:overflow-hidden sm:rounded-lg sm:border"
      >
        <li
          v-for="i in rows"
          :key="i"
          class="flex min-h-14 items-center gap-3 px-4 py-2.5"
        >
          <USkeleton class="size-9 shrink-0 rounded-full bg-skeleton-soft" />
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
  </div>
  <slot v-else />
</template>
