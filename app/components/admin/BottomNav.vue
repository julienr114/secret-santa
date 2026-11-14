<script setup lang="ts">
import { useHomeQuery } from '~/composables/queries/useAuth';
import { HOME } from '~/composables/queries/useSession';

// The super-admin's bottom bar: home, accounts (with the number of
// requests awaiting an answer) and every group.
const { t } = useT();
const route = useRoute();
const home = useHomeQuery();
const pending = computed(() => home.data.value?.pendingRequests ?? 0);
const items = computed(() => [
  {
    to: HOME,
    icon: 'i-lucide-gift',
    label: t('auth.nav.home'),
    name: t('auth.home.title'),
    badge: 0,
  },
  {
    to: '/admin/comptes',
    icon: 'i-lucide-users',
    label: t('auth.nav.accounts'),
    name: t('auth.home.adminAccounts'),
    badge: pending.value,
  },
  {
    to: '/admin/groupes',
    icon: 'i-lucide-trees',
    label: t('auth.nav.groups'),
    name: t('auth.home.adminGroups'),
    badge: 0,
  },
]);
</script>

<template>
  <nav
    class="fixed inset-x-0 bottom-0 z-20 border-t border-default bg-page/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    :aria-label="t('auth.nav.label')"
    data-testid="admin-nav"
  >
    <UContainer class="flex max-w-md">
      <NuxtLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        :aria-label="item.name"
        :aria-current="route.path === item.to ? 'page' : undefined"
        class="flex h-14 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors"
        :class="route.path === item.to ? 'text-primary' : 'text-muted'"
      >
        <UChip :show="item.badge > 0" :text="item.badge" size="2xl">
          <UIcon :name="item.icon" class="size-6" />
        </UChip>
        <span>{{ item.label }}</span>
      </NuxtLink>
    </UContainer>
  </nav>
</template>
