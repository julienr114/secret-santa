<script setup lang="ts">
// The frame of the screens one reaches before being in: an invitation
// link, a login link. A light top bar (the name of the app in the middle,
// the language on the right), then the content in one column.
const { t, setLocale } = useT();
useHead({ title: () => t('common.appName') });
</script>

<template>
  <div class="flex min-h-dvh flex-col pb-[env(safe-area-inset-bottom)]">
    <header
      class="grid h-14 shrink-0 grid-cols-[1fr_auto_1fr] items-center px-3 pt-[env(safe-area-inset-top)]"
    >
      <div />
      <p class="font-display text-lg font-bold text-primary">
        ✦ {{ t('common.appName') }}
      </p>
      <LanguageSwitch class="justify-self-end" @change="setLocale" />
    </header>
    <UContainer
      as="main"
      class="flex w-full max-w-md grow flex-col gap-5 pt-4 pb-6"
    >
      <slot />
    </UContainer>
  </div>
</template>
