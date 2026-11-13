<script setup lang="ts">
// Frame of the admin area: each page is an AdminScreen (top bar + content);
// inside a group, a bottom navigation within thumb reach.
const route = useRoute();
const slug = computed(() =>
  typeof route.params.slug === 'string' ? route.params.slug : null,
);

type NavItem = {
  label: string;
  icon: string;
  to: string;
  match: (path: string) => boolean;
};
const nav = computed<NavItem[]>(() => {
  if (!slug.value) return [];
  const base = `/admin/${slug.value}`;
  return [
    {
      label: 'Accueil',
      icon: 'i-lucide-gift',
      to: base,
      match: (p) =>
        p === base ||
        p.startsWith(`${base}/editions`) ||
        p === `${base}/gardien`,
    },
    {
      label: 'Personnes',
      icon: 'i-lucide-users',
      to: `${base}/personnes`,
      match: (p) =>
        p.startsWith(`${base}/personnes`) || p.startsWith(`${base}/exclusions`),
    },
    {
      label: 'Règles',
      icon: 'i-lucide-settings-2',
      to: `${base}/reglages`,
      match: (p) => p.startsWith(`${base}/reglages`),
    },
  ];
});
</script>

<template>
  <div
    class="min-h-dvh"
    :class="
      nav.length ? 'pb-[calc(4.5rem+env(safe-area-inset-bottom))]' : 'pb-8'
    "
  >
    <slot />
    <nav
      v-if="nav.length"
      aria-label="Navigation du groupe"
      class="fixed inset-x-0 bottom-0 z-20 border-t border-default bg-default/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <UContainer class="flex max-w-3xl">
        <NuxtLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors"
          :class="item.match(route.path) ? 'text-primary' : 'text-muted'"
          :aria-current="item.match(route.path) ? 'page' : undefined"
        >
          <UIcon :name="item.icon" class="size-6" />
          {{ item.label }}
        </NuxtLink>
      </UContainer>
    </nav>
  </div>
</template>
