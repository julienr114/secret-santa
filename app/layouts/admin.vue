<script setup>
import { useLogoutMutation } from '~/composables/queries/useSession.js';

const { user } = useUserSession();
const route = useRoute();
const logout = useLogoutMutation();

const slug = computed(() => route.params.slug ?? user.value?.groupSlug ?? null);
const links = computed(() =>
  slug.value
    ? [
        { to: `/admin/${slug.value}`, label: 'Tableau de bord' },
        { to: `/admin/${slug.value}/personnes`, label: 'Personnes' },
        { to: `/admin/${slug.value}/reglages`, label: 'Réglages' },
      ]
    : [],
);

const onLogout = () =>
  logout.mutate(undefined, { onSuccess: () => navigateTo('/admin') });
</script>

<template>
  <div class="min-h-dvh bg-neutral-50 text-neutral-900">
    <header
      class="sticky top-0 z-10 border-b border-neutral-200 bg-white/95 backdrop-blur"
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
          class="font-bold"
        >
          🎁 Secret Santa
        </NuxtLink>
        <div class="flex items-center gap-2 text-sm">
          <NuxtLink
            v-if="user?.role === 'super_admin' && slug"
            to="/admin/groupes"
            class="text-neutral-600 underline"
          >
            Groupes
          </NuxtLink>
          <UiButton
            variant="ghost"
            :loading="logout.isPending.value"
            @click="onLogout"
            >Déconnexion</UiButton
          >
        </div>
      </div>
      <nav
        v-if="links.length"
        class="mx-auto flex max-w-3xl gap-1 overflow-x-auto px-2 pb-1"
      >
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="min-h-11 shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
          exact-active-class="bg-red-50 text-red-800"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>
    </header>
    <main class="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-4">
      <slot />
    </main>
  </div>
</template>
