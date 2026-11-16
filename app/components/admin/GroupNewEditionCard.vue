<script setup lang="ts">
// No edition going on: « Prépare le tirage de cette année », who the new
// edition will start with, and that nobody draws the same person again
// when the group says so, then « Créer l'édition ».
const props = defineProps<{
  slug: string;
  /** Years in which nobody draws the same person again (group rule). */
  excludePreviousYears: number;
}>();
const { t } = useT();
const { previous, members, pending } = useTakenOver(() => props.slug);
const body = computed(() =>
  [
    previous.value
      ? t('adminGroup.dashboard.takenFrom', {
          count: members.value.length,
          label: previous.value.label,
        })
      : t('adminGroup.dashboard.takenAll', { count: members.value.length }),
    previous.value && props.excludePreviousYears > 0
      ? t('adminGroup.dashboard.noRepeat', {
          count: props.excludePreviousYears,
        })
      : '',
  ]
    .filter(Boolean)
    .join(' '),
);
</script>

<template>
  <UiActionCard
    :eyebrow="t('adminEdition.screen.now')"
    :title="t('adminGroup.dashboard.prepareTitle')"
    data-testid="new-edition-card"
  >
    <USkeleton v-if="pending" class="h-10 rounded bg-skeleton-soft" />
    <p v-else class="text-sm leading-[1.45] text-toned">{{ body }}</p>
    <template #action>
      <UButton
        :to="`/admin/${slug}/editions/nouvelle`"
        block
        size="xl"
        icon="i-lucide-plus"
        class="h-12 justify-center font-bold"
        :ui="{ leadingIcon: 'size-5' }"
        :label="t('adminEdition.newEdition.submit')"
      />
    </template>
  </UiActionCard>
</template>
