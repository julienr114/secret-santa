<script setup lang="ts">
import { HOME } from '~/composables/queries/useSession';

// The one way in, for everyone: an email address, then a link in the
// mailbox. Someone already logged in goes straight home.
const { loggedIn } = useUserSession();
if (loggedIn.value) await navigateTo(HOME, { replace: true });
const { t } = useT();
useHead({
  title: computed(() => `${t('auth.confirm.title')} — ${t('common.appName')}`),
});
</script>

<template>
  <HomeLanding />
</template>
