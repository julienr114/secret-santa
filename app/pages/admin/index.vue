<script setup>
import { homeOf, useLoginMutation } from '~/composables/queries/useSession.js';
import { errorMessage } from '~/utils/errors.js';

definePageMeta({ middleware: 'admin' });
useHead({ title: 'Connexion — Secret Santa' });

const mode = ref('guardian'); // guardian | super
const slug = ref('');
const password = ref('');
const login = useLoginMutation();

const submit = () =>
  login.mutate(
    {
      scope: mode.value === 'super' ? 'super' : slug.value.trim().toLowerCase(),
      password: password.value,
    },
    { onSuccess: ({ user }) => navigateTo(homeOf(user)) },
  );
</script>

<template>
  <main
    class="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 px-4 py-8"
  >
    <h1 class="text-center text-2xl font-bold">🎁 Secret Santa</h1>
    <form
      class="flex flex-col gap-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-neutral-200"
      @submit.prevent="submit"
    >
      <div
        class="grid grid-cols-2 gap-1 rounded-lg bg-neutral-100 p-1 text-sm font-medium"
      >
        <button
          type="button"
          class="min-h-10 rounded-md"
          :class="mode === 'guardian' ? 'bg-white shadow' : 'text-neutral-600'"
          @click="mode = 'guardian'"
        >
          Gardien
        </button>
        <button
          type="button"
          class="min-h-10 rounded-md"
          :class="mode === 'super' ? 'bg-white shadow' : 'text-neutral-600'"
          @click="mode = 'super'"
        >
          Super-admin
        </button>
      </div>
      <UiField
        v-if="mode === 'guardian'"
        id="slug"
        label="Identifiant du groupe"
        hint="Par exemple : famille-rabin"
      >
        <UiInput
          id="slug"
          v-model="slug"
          autocomplete="username"
          autocapitalize="none"
          required
        />
      </UiField>
      <UiField id="password" label="Mot de passe">
        <UiInput
          id="password"
          v-model="password"
          type="password"
          autocomplete="current-password"
          required
        />
      </UiField>
      <UiNotice v-if="login.isError.value">{{
        errorMessage(login.error.value)
      }}</UiNotice>
      <UiButton type="submit" :loading="login.isPending.value"
        >Se connecter</UiButton
      >
    </form>
  </main>
</template>
