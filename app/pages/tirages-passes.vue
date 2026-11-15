<script setup lang="ts">
import { pastDrawsByYear } from '#server/utils/home';
import { useHomeQuery } from '~/composables/queries/useAuth';

// "Tirages passés": the closed draws of the account, by year, the latest
// first. Each row opens the page of that draw, which still shows its
// result.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t } = useT();
useHead({
  title: () => `${t('auth.home.past.title')} — ${t('common.appName')}`,
});
const screen = { back: '/' };
const home = useHomeQuery();
const years = computed(() => pastDrawsByYear(home.data.value?.draws ?? []));
const fromHome = useDrawFromHome();
</script>

<template>
  <AdminScreen v-bind="screen">
    <AdminQueryState :pending="home.isPending.value" :error="home.error.value">
      <UiPageTitle>{{ t('auth.home.past.title') }}</UiPageTitle>
      <p v-if="years.length === 0" class="text-muted">
        {{ t('auth.home.past.empty') }}
      </p>
      <UiList
        v-for="entry in years"
        :key="entry.year"
        :title="String(entry.year)"
        data-testid="past-year"
      >
        <UiListItem
          v-for="draw in entry.draws"
          :key="draw.id"
          :to="draw.path"
          icon="i-lucide-archive"
          :title="draw.groupName"
          :subtitle="draw.editionLabel"
          @click="fromHome = { path: draw.path }"
        />
      </UiList>
    </AdminQueryState>
  </AdminScreen>
</template>
