<script setup>
import {
  useCreateGroupMutation,
  useGroupsQuery,
  useUpdateGroupMutation,
} from '~/composables/queries/useGroups.js';
import { errorMessage } from '~/utils/errors.js';

definePageMeta({ middleware: 'admin', layout: 'admin' });
useHead({ title: 'Groupes — Secret Santa' });

const groups = useGroupsQuery();
const create = useCreateGroupMutation();
const update = useUpdateGroupMutation();

const form = reactive({ name: '', slug: '', guardianPassword: '' });
const slugify = (text) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
watch(
  () => form.name,
  (name) => {
    form.slug = slugify(name);
  },
);

const submit = () =>
  create.mutate(
    {
      name: form.name,
      slug: form.slug,
      ...(form.guardianPassword
        ? { guardianPassword: form.guardianPassword }
        : {}),
    },
    {
      onSuccess: () => {
        form.name = '';
        form.slug = '';
        form.guardianPassword = '';
      },
    },
  );

const passwordDrafts = reactive({});
const setPassword = (id) =>
  update.mutate(
    { id, guardianPassword: passwordDrafts[id] },
    {
      onSuccess: () => {
        passwordDrafts[id] = '';
      },
    },
  );
</script>

<template>
  <div class="flex flex-col gap-4">
    <h1 class="text-xl font-bold">Groupes</h1>

    <UiCard>
      <template #title>Nouveau groupe</template>
      <form class="flex flex-col gap-3" @submit.prevent="submit">
        <UiField id="name" label="Nom de la famille">
          <UiInput
            id="name"
            v-model="form.name"
            required
            placeholder="Famille Rabin"
          />
        </UiField>
        <UiField
          id="slug"
          label="Identifiant (dans l'adresse et pour la connexion)"
        >
          <UiInput
            id="slug"
            v-model="form.slug"
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            autocapitalize="none"
          />
        </UiField>
        <UiField
          id="gp"
          label="Mot de passe du gardien"
          hint="10 caractères minimum. Tu peux le définir plus tard."
        >
          <UiInput
            id="gp"
            v-model="form.guardianPassword"
            type="password"
            autocomplete="new-password"
            minlength="10"
          />
        </UiField>
        <UiNotice v-if="create.isError.value">{{
          errorMessage(create.error.value)
        }}</UiNotice>
        <UiButton type="submit" :loading="create.isPending.value"
          >Créer le groupe</UiButton
        >
      </form>
    </UiCard>

    <UiNotice v-if="groups.isError.value">{{
      errorMessage(groups.error.value)
    }}</UiNotice>
    <p v-else-if="groups.isPending.value" class="text-sm text-neutral-500">
      Chargement…
    </p>
    <p
      v-else-if="groups.data.value.groups.length === 0"
      class="text-sm text-neutral-500"
    >
      Aucun groupe pour l'instant.
    </p>

    <UiCard v-for="group in groups.data.value?.groups ?? []" :key="group.id">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 class="font-semibold">{{ group.name }}</h2>
          <p class="text-sm text-neutral-500">
            <code>{{ group.slug }}</code> ·
            {{
              group.hasGuardianPassword
                ? 'mot de passe gardien défini'
                : 'pas encore de mot de passe gardien'
            }}
          </p>
        </div>
        <NuxtLink
          :to="`/admin/${group.slug}`"
          class="text-sm font-semibold text-red-700 underline"
          >Ouvrir</NuxtLink
        >
      </div>
      <form
        class="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end"
        @submit.prevent="setPassword(group.id)"
      >
        <UiField
          :id="`pw-${group.id}`"
          :label="
            group.hasGuardianPassword
              ? 'Nouveau mot de passe gardien'
              : 'Mot de passe gardien'
          "
          class="grow"
        >
          <UiInput
            :id="`pw-${group.id}`"
            v-model="passwordDrafts[group.id]"
            type="password"
            autocomplete="new-password"
            minlength="10"
            required
          />
        </UiField>
        <UiButton
          type="submit"
          variant="secondary"
          :loading="update.isPending.value"
          >Enregistrer</UiButton
        >
      </form>
      <UiNotice
        v-if="update.isError.value && update.variables.value?.id === group.id"
        class="mt-2"
      >
        {{ errorMessage(update.error.value) }}
      </UiNotice>
    </UiCard>
  </div>
</template>
