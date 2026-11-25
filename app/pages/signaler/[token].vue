<script setup lang="ts">
import { api } from '~/composables/queries/useApi';

// « Signaler cet envoi » (ticket 130), opened by the link at the foot of
// an email an organiser sent, without a session: the button reports it,
// opening the page does not.
const route = useRoute();
const token = computed(() => String(route.params.token));
const { t } = useT();
const toast = useMessages();
const errorMessage = useErrorMessage();
useHead({
  title: () => `${t('auth.report.pageTitle')} — ${t('common.appName')}`,
});
const sent = ref(false);
const busy = ref(false);
/** Reports the email. */
const send = async () => {
  busy.value = true;
  try {
    await api(`/api/report-send/${token.value}`, { method: 'POST' });
    sent.value = true;
  } catch (error) {
    toast.failed(errorMessage(error));
  } finally {
    busy.value = false;
  }
};
</script>

<template>
  <AuthScreen>
    <div v-if="sent" class="flex flex-col gap-4" data-testid="report-done">
      <UiPageTitle>{{ t('auth.report.doneTitle') }}</UiPageTitle>
      <p class="text-base leading-[1.5]">{{ t('auth.report.done') }}</p>
    </div>
    <div v-else class="flex flex-col gap-5">
      <UiPageTitle>{{ t('auth.report.title') }}</UiPageTitle>
      <p class="text-base leading-[1.5]">{{ t('auth.report.body') }}</p>
      <UButton
        size="xl"
        block
        class="h-13 justify-center text-[17px] font-bold"
        :loading="busy"
        :label="t('auth.report.send')"
        data-testid="report-send"
        @click="send"
      />
    </div>
  </AuthScreen>
</template>
