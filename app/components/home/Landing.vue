<script setup lang="ts">
// What someone who is not logged in sees, on the home page and on
// /login: the name of the app and the one way in, for everyone.
const { t, setLocale } = useT();
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
        <p class="text-5xl" aria-hidden="true">🎁</p>
        <h1 class="font-display text-4xl font-bold text-primary">
          {{ t('common.appName') }}
        </h1>
        <p class="text-muted">{{ t('auth.landing.tagline') }}</p>
      </div>
      <UiCard padding="lg">
        <AuthEmailLogin />
      </UiCard>
      <p class="text-center text-sm text-muted">
        {{ t('auth.landing.personalLink') }}
      </p>
    </UContainer>
  </div>
</template>
