<script setup lang="ts">
import { z } from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';
import {
  useCreateGroupMutation,
  useGroupsQuery,
  useUpdateGroupMutation,
} from '~/composables/queries/useGroups';
import { errorMessage } from '~/utils/errors';

definePageMeta({ middleware: 'admin', layout: 'admin' });
useHead({ title: 'Groupes — Secret Santa' });

const groups = useGroupsQuery();
const create = useCreateGroupMutation();
const update = useUpdateGroupMutation();
const toast = useToast();

const slugify = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const schema = z.object({
  name: z.string().trim().min(1, 'Nom requis').max(100),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Minuscules, chiffres et tirets')
    .min(2)
    .max(40),
  guardianPassword: z
    .string()
    .min(10, '10 caractères minimum')
    .or(z.literal('')),
});
type Schema = z.output<typeof schema>;
const state = reactive<Schema>({ name: '', slug: '', guardianPassword: '' });
watch(
  () => state.name,
  (name) => {
    state.slug = slugify(name);
  },
);

const onCreate = (event: FormSubmitEvent<Schema>) =>
  create.mutate(
    {
      name: event.data.name,
      slug: event.data.slug,
      ...(event.data.guardianPassword
        ? { guardianPassword: event.data.guardianPassword }
        : {}),
    },
    {
      onSuccess: () => {
        Object.assign(state, { name: '', slug: '', guardianPassword: '' });
        toast.add({ title: 'Groupe créé', color: 'success' });
      },
    },
  );

const drafts = reactive<Record<string, string>>({});
const setPassword = (id: string) =>
  update.mutate(
    { id, guardianPassword: drafts[id] },
    {
      onSuccess: () => {
        drafts[id] = '';
        toast.add({
          title: 'Mot de passe du gardien enregistré',
          color: 'success',
        });
      },
      onError: (error) =>
        toast.add({ title: errorMessage(error), color: 'error' }),
    },
  );
</script>

<template>
  <div class="flex flex-col gap-4">
    <h1 class="font-display text-2xl font-bold">Groupes</h1>

    <UCard>
      <template #header><h2 class="font-semibold">Nouveau groupe</h2></template>
      <UForm
        :schema="schema"
        :state="state"
        class="flex flex-col gap-4"
        @submit="onCreate"
      >
        <UFormField name="name" label="Nom de la famille" required>
          <UInput
            v-model="state.name"
            placeholder="Famille Rabin"
            class="w-full"
          />
        </UFormField>
        <UFormField
          name="slug"
          label="Identifiant"
          hint="dans l'adresse et pour la connexion"
          required
        >
          <UInput v-model="state.slug" autocapitalize="none" class="w-full" />
        </UFormField>
        <UFormField
          name="guardianPassword"
          label="Mot de passe du gardien"
          hint="facultatif, 10 caractères min."
        >
          <UInput
            v-model="state.guardianPassword"
            type="password"
            autocomplete="new-password"
            class="w-full"
          />
        </UFormField>
        <UAlert
          v-if="create.isError.value"
          color="error"
          variant="subtle"
          :description="errorMessage(create.error.value)"
        />
        <UButton
          type="submit"
          :loading="create.isPending.value"
          label="Créer le groupe"
        />
      </UForm>
    </UCard>

    <AdminQueryState
      :pending="groups.isPending.value"
      :error="groups.error.value"
    >
      <p
        v-if="groups.data.value?.groups.length === 0"
        class="text-sm text-muted"
      >
        Aucun groupe pour l'instant.
      </p>
      <UCard v-for="group in groups.data.value?.groups ?? []" :key="group.id">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 class="font-semibold">{{ group.name }}</h2>
            <p class="text-sm text-muted">
              <code>{{ group.slug }}</code> ·
              {{
                group.hasGuardianPassword
                  ? 'mot de passe gardien défini'
                  : 'pas encore de mot de passe gardien'
              }}
            </p>
          </div>
          <UButton
            :to="`/admin/${group.slug}`"
            variant="soft"
            icon="i-lucide-arrow-right"
            label="Ouvrir"
          />
        </div>
        <form
          class="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end"
          @submit.prevent="setPassword(group.id)"
        >
          <UFormField
            :label="
              group.hasGuardianPassword
                ? 'Nouveau mot de passe gardien'
                : 'Mot de passe gardien'
            "
            class="grow"
          >
            <UInput
              v-model="drafts[group.id]"
              type="password"
              autocomplete="new-password"
              minlength="10"
              required
              class="w-full"
            />
          </UFormField>
          <UButton
            type="submit"
            variant="outline"
            color="neutral"
            :loading="
              update.isPending.value && update.variables.value?.id === group.id
            "
            label="Enregistrer"
          />
        </form>
      </UCard>
    </AdminQueryState>
  </div>
</template>
