<script setup lang="ts">
import { BADGE_LABELS, STATUS_LABELS } from '~/utils/labels';

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
  wishes: 'primary',
  viewed: 'secondary',
};
const label = computed(
  () => STATUS_LABELS[props.code] ?? BADGE_LABELS[props.code] ?? props.code,
);
</script>

<template>
  <UBadge
    :color="COLORS[code] ?? 'neutral'"
    variant="subtle"
    size="sm"
    :label="label"
  />
</template>
