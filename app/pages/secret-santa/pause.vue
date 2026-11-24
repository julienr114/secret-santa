<script setup lang="ts">
// New Secret Santa paused (docs/spec/v3/administration.md, V3TiragePause):
// « Créer › Un Secret Santa » leads here while the super-admin has turned
// « Suspendre les nouveaux Secret Santa » on. Those that exist carry on;
// lists may still be created.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t } = useT();
useHead({
  title: () =>
    `${t('party.secretSanta.paused.title')} — ${t('common.appName')}`,
});
</script>

<template>
  <AdminScreen :back="'/'">
    <div class="flex flex-col gap-4" data-testid="secret-santa-paused">
      <UiPageTitle>{{ t('party.secretSanta.paused.title') }}</UiPageTitle>
      <p class="text-[15px] leading-[1.45] text-toned">
        {{ t('party.secretSanta.paused.text') }}
      </p>
    </div>
  </AdminScreen>
</template>
