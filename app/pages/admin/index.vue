<script setup lang="ts">
import { z } from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';
import { homeOf, useLoginMutation } from '~/composables/queries/useSession';

definePageMeta({ middleware: 'admin' });
const { t } = useT();
const errorMessage = useErrorMessage();
useHead({
  title: computed(
    () => `${t('adminGroup.login.title')} — ${t('common.appName')}`,
  ),
});

const modes = computed(() => [
  { label: t('adminGroup.login.guardian'), value: 'guardian' },
  { label: t('adminGroup.login.superAdmin'), value: 'super' },
]);
const mode = ref<'guardian' | 'super'>('guardian');

const schema = computed(() =>
  z.object({
    slug: z.string().trim().toLowerCase(),
    password: z.string().min(1, t('adminGroup.login.passwordRequired')),
  }),
);
type Schema = z.output<typeof schema.value>;
const state = reactive<Schema>({ slug: '', password: '' });
const login = useLoginMutation();

const onSubmit = (event: FormSubmitEvent<Schema>) =>
  login.mutate(
    {
      scope: mode.value === 'super' ? 'super' : event.data.slug,
      password: event.data.password,
    },
    { onSuccess: ({ user }) => navigateTo(homeOf(user)) },
  );
</script>

<template>
  <UContainer
    as="main"
    class="flex min-h-dvh max-w-sm flex-col justify-center gap-6 py-8 py-8"
  >
    <div class="text-center">
      <p class="text-4xl" aria-hidden="true">🎁</p>
      <h1 class="font-display text-3xl font-bold text-primary">
        {{ t('common.appName') }}
      </h1>
      <p class="mt-1 text-sm text-muted">
        {{ t('adminGroup.login.subtitle') }}
      </p>
    </div>
    <UCard>
      <UForm
        :schema="schema"
        :state="state"
        class="flex flex-col gap-4"
        @submit="onSubmit"
      >
        <UTabs v-model="mode" :items="modes" :content="false" size="sm" />
        <UFormField
          v-if="mode === 'guardian'"
          name="slug"
          :label="t('adminGroup.login.slugLabel')"
          :hint="t('adminGroup.login.slugHint')"
          required
        >
          <UInput
            v-model="state.slug"
            autocomplete="username"
            autocapitalize="none"
            class="w-full"
          />
        </UFormField>
        <UFormField
          name="password"
          :label="t('adminGroup.login.passwordLabel')"
          required
        >
          <UInput
            v-model="state.password"
            type="password"
            autocomplete="current-password"
            class="w-full"
          />
        </UFormField>
        <UAlert
          v-if="login.isError.value"
          color="error"
          variant="subtle"
          :description="errorMessage(login.error.value)"
        />
        <UButton
          type="submit"
          block
          :loading="login.isPending.value"
          :label="t('adminGroup.login.submit')"
        />
      </UForm>
    </UCard>
  </UContainer>
</template>
