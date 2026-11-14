<script setup lang="ts">
import { z } from 'zod';
import { useRequestLinkMutation } from '~/composables/queries/useAuth';

// Login without a password: an address, then a link in the mailbox. The
// screen says the same thing whether the address has an account or not.
const { t } = useT();
const errorMessage = useErrorMessage();
const request = useRequestLinkMutation();

const email = ref('');
const valid = computed(() => z.email().safeParse(email.value.trim()).success);
const sent = computed(() => request.isSuccess.value);
const devLink = computed(() => request.data.value?.devLink);
const onSubmit = () => {
  if (valid.value) request.mutate(email.value.trim());
};
const onAgain = () => {
  request.reset();
  email.value = '';
};
</script>

<template>
  <div v-if="sent" class="flex flex-col gap-3 text-center" role="status">
    <p class="text-4xl" aria-hidden="true">📬</p>
    <p class="font-display text-xl font-semibold">
      {{ t('auth.login.sentTitle') }}
    </p>
    <p class="text-sm text-muted">{{ t('auth.login.sent') }}</p>
    <p class="text-sm text-muted">{{ t('auth.login.spamHint') }}</p>
    <UButton
      v-if="devLink"
      :to="devLink"
      external
      block
      variant="soft"
      :label="t('auth.login.devLink')"
    />
    <UButton
      variant="link"
      color="neutral"
      class="justify-center"
      :label="t('auth.login.again')"
      @click="onAgain"
    />
  </div>
  <form
    v-else
    class="flex flex-col gap-4"
    novalidate
    @submit.prevent="onSubmit"
  >
    <UFormField :label="t('auth.login.emailLabel')" required>
      <UInput
        v-model="email"
        type="email"
        inputmode="email"
        autocomplete="email"
        autocapitalize="none"
        class="w-full"
      />
    </UFormField>
    <UAlert
      v-if="request.isError.value"
      color="error"
      variant="subtle"
      :description="errorMessage(request.error.value)"
    />
    <UButton
      type="submit"
      block
      icon="i-lucide-mail"
      :disabled="!valid"
      :loading="request.isPending.value"
      :label="t('auth.login.submit')"
    />
  </form>
</template>
