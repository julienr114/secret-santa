<script setup lang="ts">
import { APP_GROUPS_COMFORT } from '#server/utils/quota';

// How full the app is, against the groups the free plans carry: a bar,
// green, then lilac past four fifths, coral beyond, and a line under it.
const props = defineProps<{
  /** The groups the bar shows. */
  groups: number;
  /** The line under the bar; by default, how many are covered. */
  caption?: string;
}>();
const { t } = useT();
const ratio = computed(() => Math.min(props.groups / APP_GROUPS_COMFORT, 1));
const tone = computed(() => {
  if (props.groups > APP_GROUPS_COMFORT) return 'bg-error';
  return ratio.value >= 0.8 ? 'bg-warning' : 'bg-success';
});
</script>

<template>
  <div class="flex flex-col gap-1.5" data-testid="app-load">
    <div
      role="progressbar"
      :aria-valuenow="groups"
      aria-valuemin="0"
      :aria-valuemax="APP_GROUPS_COMFORT"
      :aria-label="t('auth.admin.capacity')"
      class="h-2 overflow-hidden rounded-full bg-track"
    >
      <div
        class="h-full rounded-full"
        :class="tone"
        :style="{ width: `${Math.max(ratio * 100, 2)}%` }"
      />
    </div>
    <p class="text-[13px] leading-[1.4] text-toned">
      {{
        caption ??
        t('auth.admin.loadOk', { count: groups, max: APP_GROUPS_COMFORT })
      }}
    </p>
  </div>
</template>
