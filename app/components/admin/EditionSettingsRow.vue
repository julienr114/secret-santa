<script setup lang="ts">
import { useEditionQuery } from '~/composables/queries/useGroup';

// « Réglages de l'édition », the same row at every step of an edition
// (README 22.16): what is set (« Budget 30 € · petit mot »), or what the
// page holds, and the page itself on a tap.
const props = defineProps<{ slug: string; editionId: string }>();
const { t } = useT();
const edition = useEditionQuery(
  () => props.slug,
  () => props.editionId,
);
const line = computed(() => {
  const rules = edition.data.value?.rules;
  return (
    [
      rules?.budget &&
        t('adminEdition.settings.budgetIs', { budget: rules.budget }),
      rules?.guardianMessage && t('adminEdition.settings.word'),
      edition.data.value?.guess.mode !== 'none' &&
        edition.data.value?.guess &&
        t('adminEdition.settings.gameShort'),
    ]
      .filter(Boolean)
      .join(' · ') || t('adminEdition.settings.what')
  );
});
</script>

<template>
  <UiListItem
    :to="`/admin/${slug}/editions/${editionId}/reglages`"
    icon="i-lucide-sliders-horizontal"
    icon-tone="neutral"
    :title="t('adminEdition.settings.title')"
    :subtitle="line"
    data-testid="settings-row"
  />
</template>
