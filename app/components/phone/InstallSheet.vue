<script setup lang="ts">
import type { InstallWay } from '~/composables/usePhone';

// « Mets Under the Tree sur ton écran d'accueil » (ticket 124, Installer):
// on iPhone, the three gestures of Safari; on Android, the phone's own
// offer, by « Installer ». Never in the installed app.
const props = defineProps<{ way: Exclude<InstallWay, null> }>();
const open = defineModel<boolean>('open', { required: true });
const emit = defineEmits<{ install: [] }>();
const { t } = useT();
const steps = computed(() => [
  t('phone.install.step1'),
  t('phone.install.step2'),
  t('phone.install.step3'),
]);
</script>

<template>
  <UiSheet
    v-model:open="open"
    :title="t('phone.install.title')"
    :description="t('phone.install.why')"
  >
    <ol
      v-if="props.way === 'ios'"
      class="flex flex-col gap-3 text-[15px] leading-[1.45]"
      data-testid="install-steps"
    >
      <li v-for="(step, at) in steps" :key="at" class="flex items-start gap-3">
        <span
          class="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-tint font-bold text-primary-ink"
          aria-hidden="true"
          >{{ at + 1 }}</span
        >
        <span class="pt-0.5">{{ step }}</span>
      </li>
    </ol>
    <template #footer>
      <UButton
        v-if="props.way === 'android'"
        block
        size="xl"
        class="h-13 justify-center font-bold"
        icon="i-lucide-download"
        :label="t('phone.install.install')"
        data-testid="install-now"
        @click="emit('install')"
      />
      <UButton
        v-else
        block
        size="xl"
        class="h-13 justify-center font-bold"
        :label="t('phone.install.understood')"
        @click="open = false"
      />
      <UButton
        block
        variant="ghost"
        color="neutral"
        :label="t('phone.install.later')"
        @click="open = false"
      />
    </template>
  </UiSheet>
</template>
