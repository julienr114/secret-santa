<script setup lang="ts">
import { hasMessage } from '#shared/i18n';

const props = defineProps<{ code: string }>();

const COLORS: Record<
  string,
  'neutral' | 'warning' | 'success' | 'info' | 'secondary' | 'error' | 'primary'
> = {
  draft: 'neutral',
  invitations: 'warning',
  drawn: 'success',
  closed: 'neutral',
  sent: 'info',
  hints: 'primary',
  viewed: 'secondary',
};
const { tk } = useT();
const label = computed(() => {
  const key = ['common.status', 'common.badge']
    .map((prefix) => `${prefix}.${props.code}`)
    .find(hasMessage);
  return key ? tk(key) : props.code;
});
</script>

<template>
  <UBadge
    :color="COLORS[code] ?? 'neutral'"
    variant="subtle"
    size="sm"
    :label="label"
  />
</template>
