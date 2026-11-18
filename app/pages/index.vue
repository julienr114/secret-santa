<script setup lang="ts">
// The home page, the same address for everyone: the login when nobody is
// logged in, the account's draws and groups otherwise, with the bar of
// the two homes (« Tirages », « Listes », README 22.19).
const { loggedIn } = useUserSession();
</script>

<template>
  <div
    v-if="loggedIn"
    class="min-h-dvh pb-[calc(5.5rem+env(safe-area-inset-bottom))]"
  >
    <HomeDashboard />
    <UiTabBar />
  </div>
  <HomeLanding v-else />
</template>
