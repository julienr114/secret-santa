<script setup lang="ts">
import {
  useConfirmLinkMutation,
  useLinkEmailQuery,
} from '~/composables/queries/useAuth';
import { safeNext } from '#server/utils/invite';
import { HOME, LOGIN } from '~/composables/queries/useSession';

// Where a login link lands. Opening the page does nothing but read the
// address it logs in with: the link is only consumed by the button, so
// that a mail scanner or a link preview cannot use it up. It leads home,
// or back to the page the login was asked from (`?next=`). A link too old
// or already used says so at once, with the way to a new one.
const route = useRoute();
const token = computed(() => String(route.params.token));
const { t } = useT();
const errorMessage = useErrorMessage();
const confirm = useConfirmLinkMutation();
const linkEmail = useLinkEmailQuery(token);
const email = computed(() => linkEmail.data.value?.email ?? null);
/** The sentence around the address, cut where the address goes in bold. */
const withEmail = computed(() => {
  const [before = '', after = ''] = t('auth.confirm.bodyWith', {
    email: '\u0000',
  }).split('\u0000');
  return { before, after };
});
useHead({ title: () => `${t('auth.confirm.title')} — ${t('common.appName')}` });

/** The error that ends the page: reading the link, or using it. */
const failure = computed(() => confirm.error.value ?? linkEmail.error.value);
/** The link is too old or was used: not a passing problem. */
const used = computed(() => {
  const error = failure.value as {
    statusMessage?: string;
    data?: { statusMessage?: string };
  } | null;
  return (
    (error?.data?.statusMessage ?? error?.statusMessage) ===
    'login_link_invalid'
  );
});
/** The login page, coming back to the same place afterwards. */
const again = computed(() => {
  const next = safeNext(route.query.next);
  return next ? `${LOGIN}?next=${encodeURIComponent(next)}` : LOGIN;
});
const onConfirm = () =>
  confirm.mutate(token.value, {
    onSuccess: () =>
      navigateTo(safeNext(route.query.next) ?? HOME, { replace: true }),
  });
</script>

<template>
  <AuthScreen>
    <div class="flex flex-col items-center gap-2.5 pt-2 text-center">
      <img src="/favicon.svg" alt="" class="size-16" />
      <p
        class="font-display text-[26px] leading-[1.05] font-bold text-primary-ink"
      >
        {{ t('common.appName') }}
      </p>
    </div>
    <UiCard
      padding="none"
      class="flex flex-col gap-3.5 px-5 pt-6 pb-5 text-center"
    >
      <USkeleton
        v-if="linkEmail.isPending.value"
        class="mx-auto h-24 w-full bg-skeleton-soft"
      />
      <template v-else-if="failure">
        <div class="flex flex-col gap-1.5">
          <h1 class="font-display text-[22px] leading-[1.2] font-semibold">
            {{ t('auth.confirm.invalidTitle') }}
          </h1>
          <p class="text-[15px] leading-[1.45] text-toned" role="alert">
            {{ used ? t('auth.confirm.invalidBody') : errorMessage(failure) }}
          </p>
        </div>
        <UButton
          :to="again"
          block
          size="xl"
          icon="i-lucide-mail"
          class="h-12 justify-center font-bold"
          :label="t('auth.confirm.newLink')"
        />
      </template>
      <template v-else>
        <div class="flex flex-col gap-1.5">
          <h1 class="font-display text-[22px] leading-[1.2] font-semibold">
            {{ t('auth.confirm.question') }}
          </h1>
          <p
            v-if="email"
            class="text-[15px] leading-[1.45] break-words text-toned"
            data-testid="login-email"
          >
            {{ withEmail.before
            }}<strong class="font-bold text-highlighted">{{ email }}</strong
            >{{ withEmail.after }}
          </p>
        </div>
        <UButton
          block
          size="xl"
          icon="i-lucide-log-in"
          class="h-13 justify-center text-[17px] font-bold"
          :disabled="confirm.isPending.value"
          :loading="confirm.isPending.value"
          :label="
            confirm.isPending.value
              ? t('auth.confirm.connecting')
              : t('auth.confirm.action')
          "
          @click="onConfirm"
        />
        <p class="text-[13px] leading-[1.4] text-toned">
          {{ t('auth.confirm.notYours') }}
        </p>
      </template>
    </UiCard>
  </AuthScreen>
</template>
