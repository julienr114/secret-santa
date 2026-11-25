<script setup lang="ts">
// « Des notifications sur ce téléphone ? » (ticket 124, NotifAutoriser),
// before the phone's own question, always after a gesture: what they
// say, and that the phone will ask to confirm.
const open = defineModel<boolean>('open', { required: true });
defineProps<{ busy?: boolean }>();
const emit = defineEmits<{ enable: [] }>();
const { t } = useT();
</script>

<template>
  <UiSheet
    v-model:open="open"
    :title="t('phone.notify.title')"
    :description="t('phone.notify.what')"
  >
    <p class="text-[15px] leading-[1.45] text-toned">
      {{ t('phone.notify.confirm') }}
    </p>
    <template #footer>
      <UButton
        block
        size="xl"
        class="h-13 justify-center font-bold"
        icon="i-lucide-bell"
        :loading="busy"
        :label="t('phone.notify.enable')"
        data-testid="notify-enable"
        @click="emit('enable')"
      />
      <UButton
        block
        variant="ghost"
        color="neutral"
        :label="t('phone.notify.notNow')"
        @click="open = false"
      />
    </template>
  </UiSheet>
</template>
