<script setup lang="ts">
// The emails are suspended (ticket 129, EnvoiSuspendu), for the
// organiser who wants to send: it does not come from them, and the links
// can still be shared from the phone, one by one.
defineProps<{
  /** Where the links are shared one by one: the follow-up. */
  to: string;
}>();
const { t } = useT();
</script>

<template>
  <div class="flex flex-col gap-5" data-testid="emails-paused">
    <div
      role="status"
      class="flex items-start gap-3 rounded-[18px] bg-lilac-100 p-3.5 text-[15px] leading-[1.45] text-lilac-700 ring-1 ring-lilac-300"
    >
      <UIcon name="i-lucide-pause-circle" class="mt-px size-5 shrink-0" />
      <span
        ><strong>{{ t('adminEdition.screen.emails.paused') }}</strong>
        {{ t('adminEdition.screen.emails.pausedWhy') }}</span
      >
    </div>
    <p class="text-base leading-[1.5]">
      {{ t('adminEdition.screen.emails.pausedMeanwhile') }}
    </p>
    <UButton
      :to="to"
      block
      size="xl"
      icon="i-lucide-share"
      class="h-13 justify-center text-[17px] font-bold"
      :label="t('adminEdition.screen.emails.shareLinks')"
    />
  </div>
</template>
