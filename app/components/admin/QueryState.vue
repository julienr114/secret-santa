<script setup lang="ts">
import { useQueryClient } from '@tanstack/vue-query';
import { HOME, LOGIN } from '~/composables/queries/useSession';
import type { SkeletonPart } from '~/components/ui/Skeleton.vue';

const { t } = useT();
const errorMessage = useErrorMessage();

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
    class="flex flex-col gap-3.5 rounded-2xl bg-default px-5 py-6 shadow-card"
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
  <UiSkeleton
    v-else-if="pending"
    :parts="skeleton"
    :rows="rows"
    :label="t('common.loading')"
  />
  <slot v-else />
</template>
