<script setup lang="ts">
import type { HomeRequest } from '~/composables/queries/useAuth';
import { formatDay } from '~/utils/labels';

// Where the account's request for a group stands, on a home without a
// draw: sent and waiting for an answer, with what it wrote, or refused
// with the administrator's word and the way to ask again.
const props = defineProps<{ request: HomeRequest }>();
const emit = defineEmits<{ again: [] }>();
const { t, locale } = useT();
const date = computed(() => formatDay(props.request.createdAt, locale.value));
</script>

<template>
  <UiCard
    padding="lg"
    class="flex flex-col gap-3"
    role="status"
    data-testid="home-request"
  >
    <template v-if="request.status === 'pending'">
      <div class="flex items-center gap-2.5">
        <span
          class="flex size-9 shrink-0 items-center justify-center rounded-full bg-warning-soft text-warning-ink"
          aria-hidden="true"
        >
          <UIcon name="i-lucide-clock" class="size-[18px]" />
        </span>
        <h2 class="font-display text-[22px] leading-[1.2] font-semibold">
          {{ t('auth.home.requestSentTitle') }}
        </h2>
      </div>
      <p class="text-sm leading-[1.45] text-toned">
        {{ t('auth.home.requestSentOn', { date }) }}
      </p>
      <p
        class="rounded-md bg-muted px-3 py-2.5 text-[15px] leading-[1.45] break-words whitespace-pre-line"
        data-testid="home-request-message"
      >
        {{ request.message }}
      </p>
    </template>
    <template v-else>
      <h2 class="font-display text-[22px] leading-[1.2] font-semibold">
        {{ t('auth.home.requestRefusedTitle', { date }) }}
      </h2>
      <div v-if="request.note" class="flex flex-col gap-1">
        <p class="text-xs font-bold tracking-[0.04em] text-toned uppercase">
          {{ t('auth.home.requestNote') }}
        </p>
        <p
          class="rounded-md bg-muted px-3 py-2.5 text-[15px] leading-[1.45] break-words whitespace-pre-line"
          data-testid="home-request-note"
        >
          {{ request.note }}
        </p>
      </div>
      <UButton
        block
        variant="outline"
        class="h-12 justify-center font-bold"
        :label="t('auth.home.requestAgain')"
        @click="emit('again')"
      />
    </template>
  </UiCard>
</template>
