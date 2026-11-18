<script setup lang="ts">
// The bar at the bottom of the two homes (README 22.19): « Tirages » and
// « Listes », the one shown in colour. Its ground reaches the edge, its
// content stops above the home bar.
const { t } = useT();
const route = useRoute();
const tabs = computed(() => [
  { to: '/', icon: 'i-lucide-mail', label: t('lists.tabs.draws') },
  { to: '/listes', icon: 'i-lucide-list-checks', label: t('lists.tabs.lists') },
]);
const current = (to: string) =>
  to === '/' ? route.path === '/' : route.path.startsWith(to);
</script>

<template>
  <nav
    class="fixed inset-x-0 bottom-0 z-30 border-t border-default bg-default pb-[env(safe-area-inset-bottom)]"
    :aria-label="t('lists.tabs.label')"
    data-testid="tab-bar"
  >
    <ul class="mx-auto grid h-14 max-w-md grid-cols-2">
      <li v-for="tab in tabs" :key="tab.to">
        <NuxtLink
          :to="tab.to"
          class="flex h-full flex-col items-center justify-center gap-0.5 text-xs font-semibold"
          :class="current(tab.to) ? 'text-primary' : 'text-toned'"
          :aria-current="current(tab.to) ? 'page' : undefined"
        >
          <UIcon :name="tab.icon" class="size-5" />
          {{ tab.label }}
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>
