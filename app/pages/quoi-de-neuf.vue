<script setup lang="ts">
// « Quoi de neuf », the tab of the bar at the bottom: empty until the
// news of the app are designed (ticket 120, decided by Julien on 20
// November 2026).
definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t } = useT();
useHead({
  title: () => `${t('common.tabs.news')} — ${t('common.appName')}`,
});
</script>

<template>
  <AdminScreen>
    <UiPageTitle>{{ t('common.tabs.news') }}</UiPageTitle>
  </AdminScreen>
</template>
