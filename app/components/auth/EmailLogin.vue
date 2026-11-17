<script setup lang="ts">
import { z } from 'zod';
import { useRequestLinkMutation } from '~/composables/queries/useAuth';
import type { SignupPrefill } from '~/composables/useSignupPrefill';

// Login without a password: an address, then a link in the mailbox. The
// screen says the same thing whether the address has an account or not.
// Two ways in, the same magic link: log in with an address, or create an
// account with a first name and an address. `next`: the page to come back
// to once logged in (an invitation, a personal page). Once the link is
// sent: where it went, what to do if nothing comes, and another address.
const props = withDefaults(
  defineProps<{
    next?: string | null;
    mode?: 'login' | 'signup';
    /** What the page already knows, to fill the form. */
    initial?: SignupPrefill | null;
    /** A word above the form, gone once the link is sent. */
    intro?: string;
    /** Both ways in, side by side; without, an address is enough. */
    tabs?: boolean;
  }>(),
  { next: null, mode: 'login', initial: null, intro: undefined, tabs: true },
);
const emit = defineEmits<{ sent: [sent: boolean] }>();
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
watch(sent, (value) => emit('sent', value));
/** « Lien envoyé à … », cut around the address set in bold. */
const sentTo = computed(() => {
  const [before = '', after = ''] = t('auth.login.sentTo', {
    email: '\u0000',
  }).split('\u0000');
  return { before, after };
});
/** The words of the button, which say when it works. */
const submitLabel = computed(() => {
  if (request.isPending.value) return t('auth.login.sending');
  if (mode.value === 'signup') return t('auth.login.signupSubmit');
  return props.tabs ? t('auth.login.submit') : t('auth.login.submitMine');
});
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
  <div
    v-if="sent"
    class="flex flex-col items-center gap-3.5 text-center"
    role="status"
    data-testid="login-sent"
  >
    <svg
      class="h-[104px] w-[150px]"
      viewBox="0 0 184 128"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="6"
        y="14"
        width="172"
        height="108"
        rx="8"
        class="fill-envelope stroke-envelope-fold"
        stroke-width="2"
      />
      <path
        d="M7 118 70 66M177 118 114 66"
        class="stroke-envelope-fold"
        stroke-width="2"
        stroke-linecap="round"
      />
      <path
        d="M8 18 84 74a13 13 0 0 0 16 0l76-56"
        class="fill-skeleton-soft stroke-envelope-fold"
        stroke-width="2"
        stroke-linejoin="round"
      />
      <circle cx="150" cy="26" r="20" class="fill-success" />
      <path
        d="m141 26 6 6 12-12"
        stroke="white"
        stroke-width="4"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
    <div class="flex flex-col gap-1.5">
      <h2 class="font-display text-[22px] leading-[1.2] font-semibold">
        {{ t('auth.login.sentTitle') }}
      </h2>
      <p class="text-[15px] leading-[1.45] text-toned">
        {{ sentTo.before
        }}<strong class="text-highlighted">{{
          request.variables.value?.email
        }}</strong
        >{{ sentTo.after }}
      </p>
    </div>
    <ul
      class="flex self-stretch flex-col border-t border-divider text-left text-sm leading-[1.45] text-toned"
    >
      <li class="flex items-start gap-2.5 py-3">
        <UIcon name="i-lucide-mail" class="mt-px size-[18px] shrink-0" />
        {{ t('auth.login.spamHint') }}
      </li>
      <li class="flex items-start gap-2.5 border-t border-divider py-3">
        <UIcon name="i-lucide-smartphone" class="mt-px size-[18px] shrink-0" />
        {{ t('auth.login.sameDevice') }}
      </li>
    </ul>
    <UButton
      v-if="devLink"
      :to="devLink"
      external
      block
      variant="soft"
      :label="t('auth.login.devLink')"
    />
    <UButton
      block
      variant="outline"
      color="neutral"
      class="h-[46px] justify-center text-[15px] font-bold"
      :label="t('auth.login.again')"
      @click="onAgain"
    />
  </div>
  <form
    v-else
    class="flex flex-col gap-3.5"
    novalidate
    @submit.prevent="onSubmit"
  >
    <p v-if="intro" class="text-[15px] leading-[1.45]">{{ intro }}</p>
    <div
      v-if="tabs"
      class="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1"
      role="tablist"
    >
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
      :required="tabs"
      :ui="{
        label: 'text-[15px] font-semibold',
        help: 'text-[13px] text-toned',
      }"
    >
      <UInput
        v-model="email"
        type="email"
        inputmode="email"
        autocomplete="email"
        autocapitalize="none"
        :placeholder="t('auth.login.emailPlaceholder')"
        size="xl"
        class="w-full"
        :ui="{ base: 'h-12' }"
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
      size="xl"
      class="h-12 justify-center font-bold"
      :icon="mode === 'signup' ? 'i-lucide-user-plus' : 'i-lucide-mail'"
      :disabled="!valid || request.isPending.value"
      :loading="request.isPending.value"
      :label="submitLabel"
    />
  </form>
</template>
