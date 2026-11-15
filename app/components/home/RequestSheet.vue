<script setup lang="ts">
import { useRequestGroupMutation } from '~/composables/queries/useAuth';

// "Organiser un tirage": asking for a group while the app is in beta. Why
// a request, then for whom, then "Envoyer ma demande".
const REQUEST_MAX = 500;
const open = defineModel<boolean>('open', { required: true });
const { t } = useT();
const errorMessage = useErrorMessage();
const toast = useToast();
const ask = useRequestGroupMutation();
const message = ref('');
const canSend = computed(() => message.value.trim().length > 0);
watch(open, (isOpen) => {
  if (!isOpen) return;
  message.value = '';
  ask.reset();
});
/**
 * Sends the request, then closes the sheet with a toast.
 * @returns Nothing: the mutation reports by itself.
 */
const onSend = () =>
  canSend.value &&
  ask.mutate(message.value.trim(), {
    onSuccess: () => {
      open.value = false;
      toast.add({
        title: t('auth.home.requestSent'),
        color: 'success',
        icon: 'i-lucide-check',
      });
    },
  });
</script>

<template>
  <UiSheet
    v-model:open="open"
    :title="t('auth.home.requestAction')"
    :description="t('auth.home.requestDescription')"
  >
    <form
      id="group-request-form"
      class="flex flex-col gap-4 py-2"
      novalidate
      data-testid="request-sheet"
      @submit.prevent="onSend"
    >
      <UiNotice
        variant="warning"
        icon="i-lucide-info"
        :title="t('auth.home.requestWhyTitle')"
      >
        {{ t('auth.home.requestWhy') }} {{ t('auth.home.requestReply') }}
      </UiNotice>
      <UFormField :label="t('auth.home.requestLabel')">
        <UTextarea
          v-model="message"
          :maxlength="REQUEST_MAX"
          :rows="4"
          autoresize
          :placeholder="t('auth.home.requestPlaceholder')"
          class="w-full"
        />
      </UFormField>
      <UAlert
        v-if="ask.isError.value"
        color="error"
        variant="subtle"
        :description="errorMessage(ask.error.value)"
      />
    </form>
    <template #footer>
      <UButton
        type="submit"
        form="group-request-form"
        block
        size="xl"
        icon="i-lucide-send"
        class="min-h-14 justify-center font-bold"
        :disabled="!canSend"
        :loading="ask.isPending.value"
        :label="t('auth.home.requestSend')"
      />
    </template>
  </UiSheet>
</template>
