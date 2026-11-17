<script setup lang="ts">
import type { HomeAction } from '#server/utils/home';
import type { HomeDraw } from '~/composables/queries/useAuth';
import { formatDay } from '~/utils/labels';

// "À faire maintenant": the one card on top of the home, chosen by
// `pickHomeAction` (README 22.10). An optional card can be put off.
const props = defineProps<{
  action: HomeAction;
  /** The account has several groups: the card names its own. */
  named: boolean;
  /** For requests: who has been waiting the longest, and since when. */
  oldestRequest?: { name: string; since: string } | null;
  /** The draw the card is about, when its journal has news. */
  signalDraw?: HomeDraw | null;
}>();
const emit = defineEmits<{ later: [key: string] }>();
const { t, locale } = useT();
const eyebrow = computed(() => {
  if (props.action.kind === 'requests') {
    return t('auth.home.nowIn', { group: t('auth.admin.title') });
  }
  return props.named && props.action.groupName
    ? t('auth.home.nowIn', { group: props.action.groupName })
    : t('auth.home.now');
});
/**
 * The requests card, naming who has been waiting the longest.
 * @param count - How many requests wait.
 * @param oldest - The oldest one's account and day.
 * @returns Its line and its button.
 */
const requestWords = (
  count: number,
  oldest: { name: string; since: string },
) => {
  const at = { name: oldest.name, date: formatDay(oldest.since, locale.value) };
  return {
    body:
      count > 1
        ? t('auth.home.action.requests.whoOthers', { ...at, count: count - 1 })
        : t('auth.home.action.requests.who', at),
    button:
      count > 1
        ? t('auth.home.action.requests.button')
        : t('auth.home.action.requests.buttonOne'),
  };
};
const words = computed(() => {
  const { kind, count } = props.action;
  const title = t(`auth.home.action.${kind}.title`, { count });
  if (kind === 'requests' && props.oldestRequest) {
    return { title, ...requestWords(count, props.oldestRequest) };
  }
  return {
    title,
    body: t(`auth.home.action.${kind}.body`, { count }),
    button: t(`auth.home.action.${kind}.button`),
  };
});
</script>

<template>
  <UiActionCard :eyebrow="eyebrow" :title="words.title" data-testid="top-card">
    <UiEnvelope
      v-if="action.kind === 'discover'"
      state="sealed"
      class="self-center"
    />
    <p class="text-sm text-muted">{{ words.body }}</p>
    <template #action>
      <UButton
        :to="action.to"
        block
        size="xl"
        class="min-h-14 justify-center font-bold"
        :label="words.button"
      />
      <UButton
        v-if="action.dismissKey"
        variant="ghost"
        color="neutral"
        class="min-h-11 justify-center"
        :label="t('auth.home.later')"
        @click="emit('later', action.dismissKey)"
      />
      <HomeJournalSignal
        v-if="signalDraw?.journal"
        :signal="signalDraw.journal"
        :path="signalDraw.path"
        class="mt-2"
      />
    </template>
  </UiActionCard>
</template>
