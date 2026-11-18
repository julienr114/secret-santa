<script setup lang="ts">
import { useRequestGroupMutation } from '~/composables/queries/useAuth';

// « Organiser un tirage »: asking for a group while the app is in beta, on
// a page of its own (README 23.3, Correction 18, maquette DemandeGroupe):
// the request on top, « Pourquoi une demande ? » under it, « Envoyer ma
// demande » fixed at the bottom; « Retour » gives it up.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const REQUEST_MAX = 500;
const { t } = useT();
useHead({
  title: () => `${t('auth.home.requestAction')} — ${t('common.appName')}`,
});
const screen = { back: '/' };
const errorMessage = useErrorMessage();
const toast = useToast();
const goBack = useGoBack();
const ask = useRequestGroupMutation();
const message = ref('');
const canSend = computed(() => message.value.trim().length > 0);
const failure = computed(() =>
  ask.isError.value ? errorMessage(ask.error.value) : null,
);
/**
 * Sends the request, then goes home with a toast.
 * @returns Nothing: the mutation reports by itself.
 */
const onSend = () =>
  canSend.value &&
  ask.mutate(message.value.trim(), {
    onSuccess: () => {
      toast.add({
        title: t('auth.home.requestSent'),
        color: 'success',
        icon: 'i-lucide-check',
      });
      goBack('/');
    },
  });
</script>

<template>
  <AdminScreen v-bind="screen">
    <div class="flex flex-col gap-1">
      <UiPageTitle>{{ t('auth.home.requestAction') }}</UiPageTitle>
      <p class="mt-1 text-[15px] leading-[1.45] text-toned">
        {{ t('auth.home.requestDescription') }}
      </p>
    </div>
    <UiTextField
      id="group-request"
      v-model="message"
      :label="t('auth.home.requestLabel')"
      :maxlength="REQUEST_MAX"
      :placeholder="t('auth.home.requestPlaceholder')"
      :hint="t('auth.home.requestReply')"
    />
    <UiNotice
      variant="warning"
      icon="i-lucide-info"
      :title="t('auth.home.requestWhyTitle')"
      data-testid="request-why"
    >
      {{ t('auth.home.requestWhy') }}
    </UiNotice>
    <p v-if="failure" class="text-sm font-medium text-error" role="alert">
      {{ failure }}
    </p>
    <UiStickyFooter>
      <UButton
        block
        size="xl"
        icon="i-lucide-send"
        class="h-13 justify-center text-[17px] font-bold"
        :disabled="!canSend"
        :loading="ask.isPending.value"
        :label="t('auth.home.requestSend')"
        data-testid="request-send"
        @click="onSend"
      />
    </UiStickyFooter>
  </AdminScreen>
</template>
