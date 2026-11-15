<script setup lang="ts">
import type { HomeAction } from '#server/utils/home';

// "À faire maintenant": the one card on top of the home, chosen by
// `pickHomeAction` (README 22.10). An optional card can be put off.
const props = defineProps<{
  action: HomeAction;
  /** The account has several groups: the card names its own. */
  named: boolean;
}>();
const emit = defineEmits<{ later: [key: string] }>();
const { t } = useT();
const eyebrow = computed(() =>
  props.named && props.action.groupName
    ? t('auth.home.nowIn', { group: props.action.groupName })
    : t('auth.home.now'),
);
const words = computed(() => {
  const { kind, count } = props.action;
  return {
    title: t(`auth.home.action.${kind}.title`, { count }),
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
    </template>
  </UiActionCard>
</template>
