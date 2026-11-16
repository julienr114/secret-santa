<script setup lang="ts">
import { useQueryClient } from '@tanstack/vue-query';
import { HOME, LOGIN } from '~/composables/queries/useSession';

const { t } = useT();
const errorMessage = useErrorMessage();

/** A piece of the loading skeleton, drawn like the screen it stands for. */
export type SkeletonPart = 'title' | 'stepper' | 'card' | 'list';

// Loading and error states shared by every admin screen. While loading,
// a skeleton shaped like the screen (its parts are chosen by the screen).
// On failure, a card says what happened: a refused or missing page leads
// home; any other failure offers to try again, and a way back.
const props = withDefaults(
  defineProps<{
    pending: boolean;
    error: unknown;
    rows?: number;
    skeleton?: SkeletonPart[];
    /** "On n'arrive pas à charger l'édition". */
    errorTitle?: string;
    /** Where "back" leads after a failure; home by default. */
    backTo?: string;
    backLabel?: string;
  }>(),
  {
    rows: 4,
    skeleton: () => ['title', 'list'],
    errorTitle: undefined,
    backTo: undefined,
    backLabel: undefined,
  },
);

const status = computed(
  () => (props.error as { statusCode?: number } | null)?.statusCode,
);
// A session revoked elsewhere (other device, account disabled) is only
// known when the server refuses: forget it here and go back to the login.
const { clear } = useUserSession();
watch(
  status,
  async (code) => {
    if (code !== 401 || import.meta.server) return;
    await clear();
    await navigateTo(LOGIN);
  },
  { immediate: true },
);
/** Refused or missing: trying again would not help. */
const refused = computed(() => status.value === 403 || status.value === 404);
const failure = computed(() =>
  refused.value
    ? {
        title: errorMessage(props.error),
        body: null,
        to: HOME,
        back: t('common.loadError.home'),
      }
    : {
        title: props.errorTitle ?? t('common.loadError.title'),
        body: t('common.loadError.body'),
        to: props.backTo ?? HOME,
        back: props.backLabel ?? t('common.loadError.home'),
      },
);
const queryClient = useQueryClient();
const retrying = ref(false);
/**
 * Asks again for every query of the screen.
 * @returns Once they answered.
 */
const onRetry = async () => {
  retrying.value = true;
  await queryClient.refetchQueries({ type: 'active' });
  retrying.value = false;
};
</script>

<template>
  <section
    v-if="error"
    role="alert"
    class="flex flex-col gap-3.5 rounded-2xl bg-default px-5 py-6 shadow-sm ring-1 ring-default"
    data-testid="query-error"
  >
    <div class="flex items-start gap-3">
      <span
        class="flex size-10 shrink-0 items-center justify-center rounded-full bg-error-soft text-error-ink"
        aria-hidden="true"
      >
        <UIcon
          :name="refused ? 'i-lucide-lock' : 'i-lucide-wifi-off'"
          class="size-5"
        />
      </span>
      <div class="flex flex-col gap-1">
        <h2 class="font-display text-[22px] leading-tight font-semibold">
          {{ failure.title }}
        </h2>
        <p v-if="failure.body" class="text-[15px] text-muted">
          {{ failure.body }}
        </p>
      </div>
    </div>
    <UButton
      v-if="!refused"
      block
      size="xl"
      class="min-h-12 justify-center font-bold"
      :loading="retrying"
      :label="t('common.loadError.retry')"
      @click="onRetry"
    />
    <UButton
      :to="failure.to"
      block
      variant="ghost"
      class="min-h-11 justify-center font-semibold"
      :label="failure.back"
    />
  </section>
  <div
    v-else-if="pending"
    class="flex flex-col gap-6"
    aria-busy="true"
    :aria-label="t('common.loading')"
  >
    <template v-for="part in skeleton" :key="part">
      <div v-if="part === 'title'" class="flex flex-col gap-2">
        <USkeleton class="h-8.5 w-3/5 rounded-md bg-skeleton" />
        <USkeleton class="h-4 w-2/5 rounded bg-skeleton" />
      </div>
      <div v-else-if="part === 'stepper'" class="grid grid-cols-3 gap-6 px-6">
        <USkeleton v-for="i in 3" :key="i" class="h-6 rounded bg-skeleton" />
      </div>
      <div
        v-else-if="part === 'card'"
        class="flex flex-col gap-3.5 rounded-2xl bg-default p-5 ring-1 ring-default"
      >
        <USkeleton class="h-3 w-1/3 rounded bg-skeleton-soft" />
        <USkeleton class="h-6 w-4/5 rounded bg-skeleton-soft" />
        <USkeleton class="h-12 rounded-md bg-skeleton-soft" />
      </div>
      <div v-else class="flex flex-col gap-1.5">
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
    </template>
  </div>
  <slot v-else />
</template>
