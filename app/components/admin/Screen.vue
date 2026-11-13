<script setup lang="ts">
import { useLogoutMutation } from '~/composables/queries/useSession';

// One admin screen: its own top bar (back button, breadcrumb, log out)
// and its content. Pages use it as their root, like screens pushed on a
// mobile navigation stack.
export type Crumb = { label: string; to?: string };
defineProps<{ back?: string | null; crumbs: Crumb[] }>();

const logout = useLogoutMutation();
const onLogout = () =>
  logout.mutate(undefined, { onSuccess: () => navigateTo('/admin') });
</script>

<template>
  <div>
    <header
      class="sticky top-0 z-20 border-b border-default bg-[var(--color-kraft-50)]/90 pt-[env(safe-area-inset-top)] backdrop-blur"
    >
      <UContainer class="flex h-14 max-w-3xl items-center gap-1">
        <UButton
          v-if="back"
          :to="back"
          variant="ghost"
          color="neutral"
          icon="i-lucide-chevron-left"
          aria-label="Retour"
          class="-ml-2"
        />
        <!-- Top-level screens show the app name instead of a breadcrumb. -->
        <span
          v-if="!back"
          class="grow font-display text-lg font-bold text-primary"
          >✦ Secret Santa</span
        >
        <UBreadcrumb
          v-else
          :items="crumbs"
          separator-icon="i-lucide-chevron-right"
          class="min-w-0 grow"
          :ui="{
            list: 'flex-nowrap',
            item: 'min-w-0',
            link: 'truncate text-sm',
          }"
        />
        <UButton
          variant="ghost"
          color="neutral"
          icon="i-lucide-log-out"
          aria-label="Se déconnecter"
          :loading="logout.isPending.value"
          @click="onLogout"
        />
      </UContainer>
    </header>
    <UContainer as="main" class="flex max-w-3xl flex-col gap-6 py-5">
      <slot />
    </UContainer>
  </div>
</template>
