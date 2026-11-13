<script setup lang="ts">
import { useLogoutMutation } from '~/composables/queries/useSession';

const { user } = useUserSession();
const route = useRoute();
const logout = useLogoutMutation();

const slug = computed(() =>
  typeof route.params.slug === 'string'
    ? route.params.slug
    : (user.value?.groupSlug ?? null),
);
const links = computed(() =>
  slug.value
    ? [
        {
          label: 'Tableau de bord',
          to: `/admin/${slug.value}`,
          icon: 'i-lucide-layout-dashboard',
          exact: true,
        },
        {
          label: 'Personnes',
          to: `/admin/${slug.value}/personnes`,
          icon: 'i-lucide-users',
        },
        {
          label: 'Réglages',
          to: `/admin/${slug.value}/reglages`,
          icon: 'i-lucide-settings-2',
        },
      ]
    : [],
);
const onLogout = () =>
  logout.mutate(undefined, { onSuccess: () => navigateTo('/admin') });
</script>

<template>
  <div class="min-h-dvh">
    <header
      class="sticky top-0 z-10 border-b border-default bg-default/90 backdrop-blur"
    >
      <div
        class="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-2"
      >
        <NuxtLink
          :to="
            user?.role === 'super_admin'
              ? '/admin/groupes'
              : `/admin/${slug ?? ''}`
          "
          class="font-display text-lg font-bold text-primary"
        >
          ✦ Secret Santa
        </NuxtLink>
        <div class="flex items-center gap-1">
          <UButton
            v-if="user?.role === 'super_admin' && slug"
            to="/admin/groupes"
            variant="ghost"
            color="neutral"
            size="sm"
            icon="i-lucide-arrow-left"
            label="Groupes"
          />
          <UButton
            variant="ghost"
            color="neutral"
            size="sm"
            icon="i-lucide-log-out"
            label="Déconnexion"
            :loading="logout.isPending.value"
            @click="onLogout"
          />
        </div>
      </div>
      <UNavigationMenu
        v-if="links.length"
        :items="links"
        class="mx-auto max-w-3xl px-2"
      />
    </header>
    <main class="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-5">
      <slot />
    </main>
  </div>
</template>
