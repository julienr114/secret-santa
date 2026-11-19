<script setup lang="ts">
import type { SignupPrefill } from '~/composables/useSignupPrefill';
// What someone who is not logged in sees, on the home page and on
// /login: the logo, the name of the app and what it does, a word for
// those who came with a personal link, then the one way in. Once the link
// is sent, only the logo and the name stay above it.
defineProps<{
  next?: string | null;
  mode?: 'login' | 'signup';
  initial?: SignupPrefill | null;
}>();
const { t, setLocale } = useT();
const sent = ref(false);
</script>

<template>
  <div class="flex min-h-dvh flex-col">
    <header class="flex justify-end px-4 pt-[env(safe-area-inset-top)]">
      <LanguageSwitch class="mt-2" @change="setLocale" />
    </header>
    <UContainer
      as="main"
      class="flex max-w-sm grow flex-col justify-center gap-6 py-8"
    >
      <div class="flex flex-col items-center gap-2 text-center">
        <UiIllusTree :label="t('common.appName')" />
        <h1 class="font-display text-4xl font-bold text-primary">
          {{ t('common.appName') }}
        </h1>
        <p v-if="!sent" class="text-muted">{{ t('auth.landing.tagline') }}</p>
      </div>
      <UiNotice v-if="!sent" variant="positive" icon="i-lucide-link">
        {{ t('auth.landing.personalLink') }}
      </UiNotice>
      <UiCard padding="lg">
        <AuthEmailLogin
          :next="next"
          :mode="mode"
          :initial="initial"
          @sent="(value) => (sent = value)"
        />
      </UiCard>
    </UContainer>
  </div>
</template>
