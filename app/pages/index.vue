<script setup lang="ts">
// The home page, the same address for everyone: the login when nobody is
// logged in, the account's draws and groups otherwise.
const { loggedIn } = useUserSession();
</script>

<template>
  <div
    v-if="loggedIn"
    class="min-h-dvh pb-[calc(2rem+env(safe-area-inset-bottom))]"
  >
    <HomeDashboard />
  </div>
  <HomeLanding v-else />
</template>
