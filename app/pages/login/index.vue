<script setup lang="ts">
import { safeNext } from '#server/utils/invite';
import { HOME } from '~/composables/queries/useSession';

// The one way in, for everyone: an email address, then a link in the
// mailbox; `?mode=signup` opens on the creation of an account. `?next=`
// brings back to an invitation or a personal page once
// logged in. Someone already logged in goes straight there.
const route = useRoute();
const next = computed(() => safeNext(route.query.next));
const mode = computed(() =>
  route.query.mode === 'signup' ? ('signup' as const) : ('login' as const),
);
const prefill = useSignupPrefill();
const { loggedIn } = useUserSession();
if (loggedIn.value) await navigateTo(next.value ?? HOME, { replace: true });
const { t } = useT();
useHead({
  title: computed(() => `${t('auth.confirm.title')} — ${t('common.appName')}`),
});
</script>

<template>
  <HomeLanding :next="next" :mode="mode" :initial="prefill" />
</template>
