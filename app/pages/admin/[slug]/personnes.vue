<script setup lang="ts">
import { z } from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';
import type { PublicPerson } from '#server/utils/people';
import {
  useCreateCoupleMutation,
  useCreateExclusionMutation,
  useCreatePersonMutation,
  useDeleteExclusionMutation,
  useDeletePersonMutation,
  useEndCoupleMutation,
  usePeopleQuery,
  useUpdatePersonMutation,
} from '~/composables/queries/useGroup';
import { errorMessage } from '~/utils/errors';
import { plural } from '~/utils/labels';

definePageMeta({ middleware: 'admin', layout: 'admin' });
useHead({ title: 'Personnes — Secret Santa' });
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const toast = useToast();
const onError = (error: unknown) =>
  toast.add({ title: errorMessage(error), color: 'error' });

const people = usePeopleQuery(slug);
const createPerson = useCreatePersonMutation(slug);
const updatePerson = useUpdatePersonMutation(slug);
const deletePerson = useDeletePersonMutation(slug);
const createCouple = useCreateCoupleMutation(slug);
const endCouple = useEndCoupleMutation(slug);
const createExclusion = useCreateExclusionMutation(slug);
const deleteExclusion = useDeleteExclusionMutation(slug);

const persons = computed(() => people.data.value?.persons ?? []);
const activePersons = computed(() => persons.value.filter((p) => p.active));
const couples = computed(() =>
  (people.data.value?.couples ?? []).filter((c) => c.active),
);
const exclusions = computed(() => people.data.value?.exclusions ?? []);

const nameOf = (id: string) => {
  const person = persons.value.find((p) => p.id === id);
  if (!person) return '?';
  const homonyms = persons.value.filter(
    (p) => p.id !== id && p.firstName === person.firstName,
  );
  return homonyms.length && person.lastName
    ? `${person.firstName} ${person.lastName}`
    : person.firstName;
};
const coupleOf = (id: string) =>
  couples.value.find((c) => c.personAId === id || c.personBId === id);
const partnerOf = (id: string) => {
  const couple = coupleOf(id);
  return couple
    ? nameOf(couple.personAId === id ? couple.personBId : couple.personAId)
    : null;
};
const options = (exclude?: string) =>
  activePersons.value.map((p) => ({
    label: nameOf(p.id),
    value: p.id,
    disabled: p.id === exclude,
  }));

// New person
const personSchema = z.object({
  firstName: z.string().trim().min(1, 'Prénom requis').max(60),
  lastName: z.string().trim().max(60),
  phone: z.string().trim().max(30),
});
type PersonSchema = z.output<typeof personSchema>;
const personState = reactive<PersonSchema>({
  firstName: '',
  lastName: '',
  phone: '',
});
const onCreatePerson = (event: FormSubmitEvent<PersonSchema>) =>
  createPerson.mutate(
    {
      firstName: event.data.firstName,
      lastName: event.data.lastName || null,
      phone: event.data.phone || null,
    },
    {
      onSuccess: () =>
        Object.assign(personState, { firstName: '', lastName: '', phone: '' }),
    },
  );

// Edit person (one at a time)
const editing = ref<string | null>(null);
const editState = reactive<PersonSchema>({
  firstName: '',
  lastName: '',
  phone: '',
});
const startEdit = (person: PublicPerson) => {
  editing.value = person.id;
  Object.assign(editState, {
    firstName: person.firstName,
    lastName: person.lastName ?? '',
    phone: person.phone ?? '',
  });
};
const onEdit = (event: FormSubmitEvent<PersonSchema>) =>
  editing.value &&
  updatePerson.mutate(
    {
      id: editing.value,
      firstName: event.data.firstName,
      lastName: event.data.lastName || null,
      phone: event.data.phone || null,
    },
    {
      onSuccess: () => {
        editing.value = null;
      },
      onError,
    },
  );
const toggleActive = (person: PublicPerson) =>
  updatePerson.mutate({ id: person.id, active: !person.active }, { onError });
const confirmDelete = ref<string | null>(null);
const removePerson = (id: string) =>
  deletePerson.mutate(id, {
    onSettled: () => {
      confirmDelete.value = null;
    },
    onError,
  });

// Couples and exclusions
const coupleState = reactive({ personAId: '', personBId: '' });
const onCouple = () =>
  createCouple.mutate(
    { ...coupleState },
    {
      onSuccess: () =>
        Object.assign(coupleState, { personAId: '', personBId: '' }),
      onError,
    },
  );
const exclusionState = reactive({
  giverId: '',
  receiverId: '',
  reciprocal: true,
});
const onExclusion = () =>
  createExclusion.mutate(
    { ...exclusionState },
    {
      onSuccess: () =>
        Object.assign(exclusionState, { giverId: '', receiverId: '' }),
      onError,
    },
  );
</script>

<template>
  <div class="flex flex-col gap-4">
    <h1 class="font-display text-2xl font-bold">Personnes</h1>
    <AdminQueryState
      :pending="people.isPending.value"
      :error="people.error.value"
    >
      <UCard>
        <template #header
          ><h2 class="font-semibold">Ajouter une personne</h2></template
        >
        <UForm
          :schema="personSchema"
          :state="personState"
          class="flex flex-col gap-4"
          @submit="onCreatePerson"
        >
          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField name="firstName" label="Prénom" required>
              <UInput
                v-model="personState.firstName"
                autocomplete="off"
                class="w-full"
              />
            </UFormField>
            <UFormField
              name="lastName"
              label="Nom"
              hint="facultatif, pour départager deux prénoms identiques"
            >
              <UInput
                v-model="personState.lastName"
                autocomplete="off"
                class="w-full"
              />
            </UFormField>
          </div>
          <UFormField
            name="phone"
            label="Numéro WhatsApp"
            hint="facultatif, format international"
          >
            <UInput
              v-model="personState.phone"
              type="tel"
              inputmode="tel"
              placeholder="+33 6 12 34 56 78"
              autocomplete="off"
              class="w-full"
            />
          </UFormField>
          <UAlert
            v-if="createPerson.isError.value"
            color="error"
            variant="subtle"
            :description="errorMessage(createPerson.error.value)"
          />
          <UButton
            type="submit"
            :loading="createPerson.isPending.value"
            icon="i-lucide-user-plus"
            label="Ajouter"
          />
        </UForm>
      </UCard>

      <UCard>
        <template #header
          ><h2 class="font-semibold">
            {{ plural(persons.length, 'personne') }}
          </h2></template
        >
        <p v-if="persons.length === 0" class="text-sm text-muted">
          Commence par ajouter les membres de la famille.
        </p>
        <ul class="divide-y divide-default">
          <li v-for="person in persons" :key="person.id" class="py-3">
            <UForm
              v-if="editing === person.id"
              :schema="personSchema"
              :state="editState"
              class="flex flex-col gap-3"
              @submit="onEdit"
            >
              <div class="grid gap-2 sm:grid-cols-3">
                <UFormField name="firstName"
                  ><UInput
                    v-model="editState.firstName"
                    placeholder="Prénom"
                    class="w-full"
                /></UFormField>
                <UFormField name="lastName"
                  ><UInput
                    v-model="editState.lastName"
                    placeholder="Nom"
                    class="w-full"
                /></UFormField>
                <UFormField name="phone"
                  ><UInput
                    v-model="editState.phone"
                    type="tel"
                    placeholder="+33…"
                    class="w-full"
                /></UFormField>
              </div>
              <div class="flex gap-2">
                <UButton
                  type="submit"
                  :loading="updatePerson.isPending.value"
                  label="Enregistrer"
                />
                <UButton
                  variant="ghost"
                  color="neutral"
                  label="Annuler"
                  @click="editing = null"
                />
              </div>
            </UForm>
            <div
              v-else
              class="flex flex-wrap items-center justify-between gap-2"
              :class="{ 'opacity-50': !person.active }"
            >
              <div>
                <p class="font-medium">
                  <AdminPersonName :person="person" :people="persons" />
                  <span v-if="!person.active" class="ml-1 text-xs text-muted"
                    >(désactivé·e)</span
                  >
                </p>
                <p class="text-xs text-muted">
                  {{ person.phone ?? 'pas de numéro WhatsApp' }}
                  <template v-if="partnerOf(person.id)">
                    · en couple avec {{ partnerOf(person.id) }}</template
                  >
                  <template v-if="person.hasPin"> · code choisi</template>
                </p>
              </div>
              <div class="flex flex-wrap gap-1">
                <UButton
                  variant="ghost"
                  color="neutral"
                  size="sm"
                  icon="i-lucide-pencil"
                  label="Modifier"
                  @click="startEdit(person)"
                />
                <UButton
                  variant="ghost"
                  color="neutral"
                  size="sm"
                  :icon="
                    person.active ? 'i-lucide-user-x' : 'i-lucide-user-check'
                  "
                  :label="person.active ? 'Désactiver' : 'Réactiver'"
                  @click="toggleActive(person)"
                />
                <UButton
                  v-if="confirmDelete !== person.id"
                  variant="ghost"
                  color="neutral"
                  size="sm"
                  icon="i-lucide-trash-2"
                  label="Supprimer"
                  @click="confirmDelete = person.id"
                />
                <UButton
                  v-else
                  color="error"
                  variant="soft"
                  size="sm"
                  :loading="deletePerson.isPending.value"
                  label="Confirmer la suppression"
                  @click="removePerson(person.id)"
                />
              </div>
            </div>
          </li>
        </ul>
      </UCard>

      <UCard>
        <template #header><h2 class="font-semibold">Couples</h2></template>
        <ul v-if="couples.length" class="mb-4 divide-y divide-default">
          <li
            v-for="couple in couples"
            :key="couple.id"
            class="flex items-center justify-between py-2"
          >
            <span
              >{{ nameOf(couple.personAId) }} +
              {{ nameOf(couple.personBId) }}</span
            >
            <UButton
              variant="ghost"
              color="neutral"
              size="sm"
              label="Séparer"
              :loading="endCouple.isPending.value"
              @click="endCouple.mutate(couple.id, { onError })"
            />
          </li>
        </ul>
        <form
          class="flex flex-col gap-3 sm:flex-row sm:items-end"
          @submit.prevent="onCouple"
        >
          <UFormField label="Personne" class="grow">
            <USelect
              v-model="coupleState.personAId"
              :items="options(coupleState.personBId)"
              placeholder="Choisir…"
              class="w-full"
            />
          </UFormField>
          <UFormField label="En couple avec" class="grow">
            <USelect
              v-model="coupleState.personBId"
              :items="options(coupleState.personAId)"
              placeholder="Choisir…"
              class="w-full"
            />
          </UFormField>
          <UButton
            type="submit"
            variant="outline"
            color="neutral"
            :disabled="!coupleState.personAId || !coupleState.personBId"
            :loading="createCouple.isPending.value"
            label="Enregistrer"
          />
        </form>
      </UCard>

      <UCard>
        <template #header
          ><h2 class="font-semibold">Exclusions manuelles</h2></template
        >
        <p class="mb-3 text-sm text-muted">
          Des paires qui ne doivent jamais se tirer, en plus des couples.
        </p>
        <ul v-if="exclusions.length" class="mb-4 divide-y divide-default">
          <li
            v-for="ex in exclusions"
            :key="ex.id"
            class="flex items-center justify-between py-2"
          >
            <span
              >{{ nameOf(ex.giverId) }} {{ ex.reciprocal ? '↔' : '→' }}
              {{ nameOf(ex.receiverId) }}</span
            >
            <UButton
              variant="ghost"
              color="neutral"
              size="sm"
              label="Retirer"
              :loading="deleteExclusion.isPending.value"
              @click="deleteExclusion.mutate(ex.id, { onError })"
            />
          </li>
        </ul>
        <form class="flex flex-col gap-3" @submit.prevent="onExclusion">
          <div class="grid gap-3 sm:grid-cols-2">
            <UFormField label="Donneur">
              <USelect
                v-model="exclusionState.giverId"
                :items="options(exclusionState.receiverId)"
                placeholder="Choisir…"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Ne tire jamais">
              <USelect
                v-model="exclusionState.receiverId"
                :items="options(exclusionState.giverId)"
                placeholder="Choisir…"
                class="w-full"
              />
            </UFormField>
          </div>
          <UCheckbox
            v-model="exclusionState.reciprocal"
            label="Dans les deux sens"
          />
          <UButton
            type="submit"
            variant="outline"
            color="neutral"
            :disabled="!exclusionState.giverId || !exclusionState.receiverId"
            :loading="createExclusion.isPending.value"
            label="Ajouter l'exclusion"
          />
        </form>
      </UCard>
    </AdminQueryState>
  </div>
</template>
