<script setup lang="ts">
import { z } from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';
import { homeOf, useLoginMutation } from '~/composables/queries/useSession';
import { errorMessage } from '~/utils/errors';

definePageMeta({ middleware: 'admin' });
useHead({ title: 'Connexion — Secret Santa' });

const modes = [
  { label: 'Gardien', value: 'guardian' },
  { label: 'Super-admin', value: 'super' },
];
const mode = ref<'guardian' | 'super'>('guardian');

const schema = z.object({
  slug: z.string().trim().toLowerCase(),
  password: z.string().min(1, 'Mot de passe requis'),
});
type Schema = z.output<typeof schema>;
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
  <main
    class="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 px-4 py-8"
  >
    <div class="text-center">
      <p class="text-4xl" aria-hidden="true">🎁</p>
      <h1 class="font-display text-3xl font-bold text-primary">Secret Santa</h1>
      <p class="mt-1 text-sm text-muted">Espace du gardien</p>
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
          label="Identifiant du groupe"
          hint="ex. famille-rabin"
          required
        >
          <UInput
            v-model="state.slug"
            autocomplete="username"
            autocapitalize="none"
            class="w-full"
          />
        </UFormField>
        <UFormField name="password" label="Mot de passe" required>
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
          label="Se connecter"
        />
      </UForm>
    </UCard>
  </main>
</template>
