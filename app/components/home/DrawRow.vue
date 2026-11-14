<script setup lang="ts">
import type { HomeDraw } from '~/composables/queries/useAuth';
import { daysUntil, formatEventDate } from '#server/utils/rules';

// A draw in progress on the home page, on one row: the group, where the
// draw stands and the party date. The row opens the draw; a small button
// beside it, only when something is expected, goes straight to it.
const props = defineProps<{ draw: HomeDraw }>();
const emit = defineEmits<{ open: [] }>();
const { t, locale } = useT();

const STEPS = {
  discover: { emoji: '🎁', suffix: '', action: true },
  addWishes: { emoji: '📝', suffix: '/souhaits', action: true },
  seeAgain: { emoji: '🤫', suffix: '', action: false },
  wait: { emoji: '⏳', suffix: '', action: false },
  closed: { emoji: '🎉', suffix: '', action: false },
} as const;
const step = computed(() => STEPS[props.draw.step]);
const actionTo = computed(() => `${props.draw.path}${step.value.suffix}`);

const today = new Date().toISOString().slice(0, 10);
const party = computed(() => {
  if (!props.draw.eventDate) return null;
  const days = daysUntil(props.draw.eventDate, today);
  if (days === 0) return t('auth.home.partyToday');
  return days === null
    ? formatEventDate(props.draw.eventDate, locale.value)
    : t('auth.home.partyIn', { count: days });
});
</script>

<template>
  <li data-testid="draw-row" class="flex items-center">
    <NuxtLink
      :to="draw.path"
      class="flex min-h-16 min-w-0 grow items-center gap-3 py-3 pl-4 transition-colors active:bg-muted"
      :class="step.action ? 'pr-2' : 'pr-4'"
      @click="emit('open')"
    >
      <span
        class="flex size-10 shrink-0 items-center justify-center rounded-full text-xl"
        :class="step.action ? 'bg-primary/10' : 'bg-muted'"
        aria-hidden="true"
        >{{ step.emoji }}</span
      >
      <span class="min-w-0 grow">
        <span class="block truncate font-medium">{{ draw.groupName }}</span>
        <span class="block truncate text-sm text-muted">
          {{ t(`auth.home.step.${draw.step}.state`)
          }}<template v-if="party"> · {{ party }}</template>
        </span>
      </span>
      <UIcon
        v-if="!step.action"
        name="i-lucide-chevron-right"
        class="size-5 shrink-0 text-dimmed"
      />
    </NuxtLink>
    <UButton
      v-if="step.action"
      :to="actionTo"
      size="sm"
      class="mr-4 shrink-0 rounded-full"
      :label="t(`auth.home.step.${draw.step}.action`)"
      @click="emit('open')"
    />
  </li>
</template>
