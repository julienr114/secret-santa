<script setup lang="ts">
import { useConfirmLinkMutation } from '~/composables/queries/useAuth';
import { safeNext } from '#server/utils/invite';
import { HOME, LOGIN } from '~/composables/queries/useSession';

// Where a login link lands. Opening the page does nothing: the link is
// only consumed by the button, so that a mail scanner or a link preview
// cannot use it up. It leads home, or back to the page the login was
// asked from (`?next=`).
const route = useRoute();
const token = computed(() => String(route.params.token));
const { t } = useT();
const errorMessage = useErrorMessage();
const confirm = useConfirmLinkMutation();
useHead({ title: () => `${t('auth.confirm.title')} — ${t('common.appName')}` });

const onConfirm = () =>
  confirm.mutate(token.value, {
    onSuccess: () =>
      navigateTo(safeNext(route.query.next) ?? HOME, { replace: true }),
  });
</script>

<template>
  <UContainer
    as="main"
    class="flex min-h-dvh max-w-sm flex-col justify-center gap-6 py-8"
  >
    <div class="text-center">
      <p class="text-4xl" aria-hidden="true">🔑</p>
      <UiPageTitle class="text-primary">
        {{ t('auth.confirm.title') }}
      </UiPageTitle>
    </div>
    <UiCard padding="lg" class="flex flex-col gap-4 text-center">
      <template v-if="confirm.isError.value">
        <p role="alert">{{ errorMessage(confirm.error.value) }}</p>
        <UButton
          :to="LOGIN"
          block
          variant="soft"
          :label="t('auth.confirm.newLink')"
        />
      </template>
      <template v-else>
        <p class="text-sm text-muted">{{ t('auth.confirm.body') }}</p>
        <UButton
          block
          icon="i-lucide-log-in"
          :loading="confirm.isPending.value"
          :label="t('auth.confirm.action')"
          @click="onConfirm"
        />
      </template>
    </UiCard>
  </UContainer>
</template>
