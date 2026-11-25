<script setup lang="ts">
import { tabOf, type Tab } from '#shared/utils/navigation';
import { staleNotifications } from '#shared/utils/notifications';
import { useNewsCountQuery } from '~/composables/queries/useNews';

// The bar at the bottom of every screen of someone logged in
// (docs/spec/v3/accueil-et-creation.md): « Accueil », « Créer », « Quoi de
// neuf », and « Admin » for the super-admin, the current one in colour.
// « Créer » is drawn like the others and opens its sheet. Its ground
// reaches the edge, its content stops above the home bar. A bottom sheet
// covers it, and so do the images of the palmarès. « Quoi de neuf »
// carries the count of the news not seen (ticket 120), read again on each
// page and on coming back to the app.
const { t } = useT();
const route = useRoute();
const { user, loggedIn } = useUserSession();
const newsCount = useNewsCountQuery(loggedIn);
const unseen = computed(() => newsCount.data.value?.count ?? 0);
// The same count on the icon of the installed app (ticket 124), where
// the phone shows it, from the opening of the app on (ticket 175).
watch(
  () => newsCount.data.value?.count,
  (count) => {
    if (import.meta.server || count === undefined) return;
    if (!('setAppBadge' in navigator)) return;
    void (
      count > 0 ? navigator.setAppBadge(count) : navigator.clearAppBadge()
    ).catch(() => undefined);
  },
  { immediate: true },
);
// A notification whose news is now seen leaves the phone (ticket 175).
const pushed = computed(() => newsCount.data.value?.pushed.join(' ') ?? null);
watch(
  pushed,
  async (waiting) => {
    if (import.meta.server || waiting === null) return;
    if (!('serviceWorker' in navigator)) return;
    const registration = await navigator.serviceWorker.getRegistration();
    const shown =
      (await registration?.getNotifications().catch(() => [])) ?? [];
    const stale = new Set(
      staleNotifications(
        shown.map((one) => one.tag),
        waiting ? waiting.split(' ') : [],
      ),
    );
    shown.filter((one) => stale.has(one.tag)).forEach((one) => one.close());
  },
  { immediate: true },
);
watch(
  () => route.path,
  () => {
    if (loggedIn.value) void newsCount.refetch();
  },
);
const creating = ref(false);
const current = computed(() => tabOf(route.path));
const links = computed(() => ({
  home: { to: '/', icon: 'i-lucide-house', label: t('common.tabs.home') },
  news: {
    to: '/quoi-de-neuf',
    icon: 'i-lucide-bell',
    label: t('common.tabs.news'),
  },
  admin: {
    to: '/admin',
    icon: 'i-lucide-shield',
    label: t('common.tabs.admin'),
  },
}));
const isSuper = computed(() => user.value?.role === 'super_admin');
/** The tabs after « Créer ». */
const after = computed<Tab[]>(() =>
  isSuper.value ? ['news', 'admin'] : ['news'],
);
const TAB =
  'flex h-full w-full flex-col items-center justify-center gap-0.5 text-xs';
</script>

<template>
  <nav
    class="fixed inset-x-0 bottom-0 z-30 border-t border-default bg-default pb-[env(safe-area-inset-bottom)]"
    :aria-label="t('common.tabs.label')"
    data-testid="tab-bar"
  >
    <ul
      class="mx-auto grid h-14 max-w-md"
      :class="isSuper ? 'grid-cols-4' : 'grid-cols-3'"
    >
      <li>
        <NuxtLink
          :to="links.home.to"
          :class="[
            TAB,
            current === 'home'
              ? 'font-bold text-primary'
              : 'font-semibold text-toned',
          ]"
          :aria-current="current === 'home' ? 'page' : undefined"
        >
          <UIcon :name="links.home.icon" class="size-5" />
          {{ links.home.label }}
        </NuxtLink>
      </li>
      <li>
        <button
          type="button"
          :class="[TAB, 'font-semibold text-toned']"
          aria-haspopup="dialog"
          @click="creating = true"
        >
          <UIcon name="i-lucide-circle-plus" class="size-5" />
          {{ t('common.tabs.create') }}
        </button>
      </li>
      <li v-for="tab in after" :key="tab">
        <NuxtLink
          :to="links[tab].to"
          :class="[
            TAB,
            current === tab
              ? 'font-bold text-primary'
              : 'font-semibold text-toned',
          ]"
          :aria-current="current === tab ? 'page' : undefined"
        >
          <span class="relative flex">
            <UIcon :name="links[tab].icon" class="size-5" />
            <span
              v-if="tab === 'news' && unseen > 0"
              class="absolute -top-1.25 left-3.25 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-coral-500 px-1.25 text-[11px] font-bold text-white tabular-nums ring-2 ring-default"
              aria-hidden="true"
              data-testid="news-count"
              >{{ unseen }}</span
            >
          </span>
          {{ links[tab].label
          }}<span v-if="tab === 'news' && unseen > 0" class="sr-only"
            >, {{ t('news.count', { count: unseen }) }}</span
          >
        </NuxtLink>
      </li>
    </ul>
    <CreateSheet v-model:open="creating" />
  </nav>
</template>
