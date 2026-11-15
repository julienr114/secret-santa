<script setup lang="ts">
import { z } from 'zod';
import { useRequestLinkMutation } from '~/composables/queries/useAuth';
import type { SignupPrefill } from '~/composables/useSignupPrefill';

// Login without a password: an address, then a link in the mailbox. The
// screen says the same thing whether the address has an account or not.
// Two ways in, the same magic link: log in with an address, or create an
// account with a first name and an address. `next`: the page to come back
// to once logged in (an invitation, a personal page).
const props = withDefaults(
  defineProps<{
    next?: string | null;
    mode?: 'login' | 'signup';
    /** What the page already knows, to fill the form. */
    initial?: SignupPrefill | null;
  }>(),
  { next: null, mode: 'login', initial: null },
);
const mode = ref(props.mode);
const modes = computed(() => [
  { value: 'login' as const, label: t('auth.login.tabLogin') },
  { value: 'signup' as const, label: t('auth.login.tabSignup') },
]);
const firstName = ref(props.initial?.firstName ?? '');
const { t } = useT();
const errorMessage = useErrorMessage();
const request = useRequestLinkMutation();

const email = ref(props.initial?.email ?? '');
const valid = computed(
  () =>
    z.email().safeParse(email.value.trim()).success &&
    (mode.value === 'login' ||
      z.string().trim().min(1).safeParse(firstName.value).success),
);
const sent = computed(() => request.isSuccess.value);
const devLink = computed(() => request.data.value?.devLink);
const onSubmit = () => {
  if (valid.value) {
    request.mutate({
      email: email.value.trim(),
      next: props.next,
      ...(mode.value === 'signup' ? { firstName: firstName.value.trim() } : {}),
    });
  }
};
const onAgain = () => {
  request.reset();
  email.value = '';
};
</script>

<template>
  <div v-if="sent" class="flex flex-col gap-3 text-center" role="status">
    <UIcon
      name="i-lucide-mail-check"
      class="size-10 self-center text-primary"
      aria-hidden="true"
    />
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
    <div class="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1" role="tablist">
      <button
        v-for="item in modes"
        :key="item.value"
        type="button"
        role="tab"
        :aria-selected="mode === item.value"
        class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
        :class="
          mode === item.value
            ? 'bg-default text-default shadow-sm'
            : 'text-muted'
        "
        @click="mode = item.value"
      >
        {{ item.label }}
      </button>
    </div>
    <UFormField
      v-if="mode === 'signup'"
      :label="t('adminGroup.personForm.firstNameLabel')"
      required
    >
      <UInput v-model="firstName" autocomplete="given-name" class="w-full" />
    </UFormField>
    <UFormField
      :label="t('auth.login.emailLabel')"
      :help="t('auth.login.emailHelp')"
      required
    >
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
      :icon="mode === 'signup' ? 'i-lucide-user-plus' : 'i-lucide-mail'"
      :disabled="!valid"
      :loading="request.isPending.value"
      :label="
        mode === 'signup'
          ? t('auth.login.signupSubmit')
          : t('auth.login.submit')
      "
    />
  </form>
</template>
