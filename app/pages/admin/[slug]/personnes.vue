<script setup>
import {
  useCreateCoupleMutation,
  useCreateExclusionMutation,
  useCreatePersonMutation,
  useDeleteExclusionMutation,
  useDeletePersonMutation,
  useEndCoupleMutation,
  usePeopleQuery,
  useUpdatePersonMutation,
} from '../../../composables/queries/useGroup.js';
import { errorMessage } from '../../../utils/errors.js';

definePageMeta({ middleware: 'admin', layout: 'admin' });
useHead({ title: 'Personnes — Secret Santa' });
const route = useRoute();
const slug = computed(() => route.params.slug);

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
const nameOf = (id) => {
  const person = persons.value.find((p) => p.id === id);
  if (!person) return '?';
  const homonyms = persons.value.filter(
    (p) => p.id !== id && p.firstName === person.firstName,
  );
  return homonyms.length && person.lastName
    ? `${person.firstName} ${person.lastName}`
    : person.firstName;
};
const coupleOf = (id) =>
  couples.value.find((c) => c.personAId === id || c.personBId === id);

// New person
const personForm = reactive({ firstName: '', lastName: '', phone: '' });
const submitPerson = () =>
  createPerson.mutate(
    {
      firstName: personForm.firstName,
      lastName: personForm.lastName || null,
      phone: personForm.phone || null,
    },
    {
      onSuccess: () =>
        Object.assign(personForm, { firstName: '', lastName: '', phone: '' }),
    },
  );

// Edit person (one at a time)
const editing = ref(null);
const editForm = reactive({ firstName: '', lastName: '', phone: '' });
const startEdit = (person) => {
  editing.value = person.id;
  Object.assign(editForm, {
    firstName: person.firstName,
    lastName: person.lastName ?? '',
    phone: person.phone ?? '',
  });
};
const submitEdit = () =>
  updatePerson.mutate(
    {
      id: editing.value,
      firstName: editForm.firstName,
      lastName: editForm.lastName || null,
      phone: editForm.phone || null,
    },
    { onSuccess: () => (editing.value = null) },
  );
const toggleActive = (person) =>
  updatePerson.mutate({ id: person.id, active: !person.active });
const confirmDelete = ref(null);
const removePerson = (id) =>
  deletePerson.mutate(id, { onSettled: () => (confirmDelete.value = null) });

// Couples and exclusions
const coupleForm = reactive({ personAId: '', personBId: '' });
const submitCouple = () =>
  createCouple.mutate(
    { ...coupleForm },
    {
      onSuccess: () =>
        Object.assign(coupleForm, { personAId: '', personBId: '' }),
    },
  );
const exclusionForm = reactive({
  giverId: '',
  receiverId: '',
  reciprocal: true,
});
const submitExclusion = () =>
  createExclusion.mutate(
    { ...exclusionForm },
    {
      onSuccess: () =>
        Object.assign(exclusionForm, { giverId: '', receiverId: '' }),
    },
  );

const selectClass =
  'min-h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 text-base outline-none focus:border-red-700 focus:ring-2 focus:ring-red-200';
</script>

<template>
  <div class="flex flex-col gap-4">
    <h1 class="text-xl font-bold">Personnes</h1>
    <UiNotice v-if="people.isError.value">{{
      errorMessage(people.error.value)
    }}</UiNotice>
    <p v-else-if="people.isPending.value" class="text-sm text-neutral-500">
      Chargement…
    </p>
    <template v-else>
      <UiCard>
        <template #title>Ajouter une personne</template>
        <form class="flex flex-col gap-3" @submit.prevent="submitPerson">
          <div class="grid gap-3 sm:grid-cols-2">
            <UiField id="fn" label="Prénom"
              ><UiInput
                id="fn"
                v-model="personForm.firstName"
                required
                autocomplete="off"
            /></UiField>
            <UiField
              id="ln"
              label="Nom (facultatif)"
              hint="Utile seulement pour départager deux prénoms identiques"
              ><UiInput
                id="ln"
                v-model="personForm.lastName"
                autocomplete="off"
            /></UiField>
          </div>
          <UiField
            id="ph"
            label="Numéro WhatsApp (facultatif)"
            hint="Format international, ex. +33 6 12 34 56 78"
          >
            <UiInput
              id="ph"
              v-model="personForm.phone"
              type="tel"
              inputmode="tel"
              autocomplete="off"
              placeholder="+33 6 12 34 56 78"
            />
          </UiField>
          <UiNotice v-if="createPerson.isError.value">{{
            errorMessage(createPerson.error.value)
          }}</UiNotice>
          <UiButton type="submit" :loading="createPerson.isPending.value"
            >Ajouter</UiButton
          >
        </form>
      </UiCard>

      <UiCard>
        <template #title
          >{{ persons.length }} personne{{
            persons.length > 1 ? 's' : ''
          }}</template
        >
        <p v-if="persons.length === 0" class="text-sm text-neutral-500">
          Commence par ajouter les membres de la famille.
        </p>
        <ul class="divide-y divide-neutral-100">
          <li v-for="person in persons" :key="person.id" class="py-3">
            <form
              v-if="editing === person.id"
              class="flex flex-col gap-2"
              @submit.prevent="submitEdit"
            >
              <div class="grid gap-2 sm:grid-cols-3">
                <UiInput
                  v-model="editForm.firstName"
                  required
                  aria-label="Prénom"
                />
                <UiInput
                  v-model="editForm.lastName"
                  aria-label="Nom"
                  placeholder="Nom"
                />
                <UiInput
                  v-model="editForm.phone"
                  type="tel"
                  aria-label="Numéro WhatsApp"
                  placeholder="+33…"
                />
              </div>
              <UiNotice v-if="updatePerson.isError.value">{{
                errorMessage(updatePerson.error.value)
              }}</UiNotice>
              <div class="flex gap-2">
                <UiButton type="submit" :loading="updatePerson.isPending.value"
                  >Enregistrer</UiButton
                >
                <UiButton variant="ghost" @click="editing = null"
                  >Annuler</UiButton
                >
              </div>
            </form>
            <div
              v-else
              class="flex flex-wrap items-center justify-between gap-2"
              :class="{ 'opacity-50': !person.active }"
            >
              <div>
                <p class="font-medium">
                  <AdminPersonName :person="person" :people="persons" />
                  <span
                    v-if="!person.active"
                    class="ml-1 text-xs text-neutral-500"
                    >(désactivé·e)</span
                  >
                </p>
                <p class="text-xs text-neutral-500">
                  {{ person.phone ?? 'pas de numéro WhatsApp' }}
                  <template v-if="coupleOf(person.id)">
                    · en couple avec
                    {{
                      nameOf(
                        coupleOf(person.id).personAId === person.id
                          ? coupleOf(person.id).personBId
                          : coupleOf(person.id).personAId,
                      )
                    }}</template
                  >
                  <template v-if="person.hasPin"> · code choisi</template>
                </p>
              </div>
              <div class="flex flex-wrap gap-1">
                <UiButton variant="ghost" @click="startEdit(person)"
                  >Modifier</UiButton
                >
                <UiButton variant="ghost" @click="toggleActive(person)">{{
                  person.active ? 'Désactiver' : 'Réactiver'
                }}</UiButton>
                <UiButton
                  v-if="confirmDelete !== person.id"
                  variant="ghost"
                  @click="confirmDelete = person.id"
                  >Supprimer</UiButton
                >
                <UiButton
                  v-else
                  variant="danger"
                  :loading="deletePerson.isPending.value"
                  @click="removePerson(person.id)"
                  >Confirmer la suppression</UiButton
                >
              </div>
            </div>
            <UiNotice
              v-if="
                deletePerson.isError.value &&
                deletePerson.variables.value === person.id
              "
              class="mt-2"
            >
              {{ errorMessage(deletePerson.error.value) }}
            </UiNotice>
          </li>
        </ul>
      </UiCard>

      <UiCard>
        <template #title>Couples</template>
        <ul v-if="couples.length" class="mb-3 divide-y divide-neutral-100">
          <li
            v-for="couple in couples"
            :key="couple.id"
            class="flex items-center justify-between py-2"
          >
            <span
              >{{ nameOf(couple.personAId) }} +
              {{ nameOf(couple.personBId) }}</span
            >
            <UiButton
              variant="ghost"
              :loading="endCouple.isPending.value"
              @click="endCouple.mutate(couple.id)"
              >Séparer</UiButton
            >
          </li>
        </ul>
        <form
          class="flex flex-col gap-2 sm:flex-row sm:items-end"
          @submit.prevent="submitCouple"
        >
          <UiField id="ca" label="Personne" class="grow">
            <select
              id="ca"
              v-model="coupleForm.personAId"
              :class="selectClass"
              required
            >
              <option value="" disabled>Choisir…</option>
              <option
                v-for="p in activePersons"
                :key="p.id"
                :value="p.id"
                :disabled="Boolean(coupleOf(p.id))"
              >
                {{ nameOf(p.id) }}
              </option>
            </select>
          </UiField>
          <UiField id="cb" label="En couple avec" class="grow">
            <select
              id="cb"
              v-model="coupleForm.personBId"
              :class="selectClass"
              required
            >
              <option value="" disabled>Choisir…</option>
              <option
                v-for="p in activePersons"
                :key="p.id"
                :value="p.id"
                :disabled="
                  Boolean(coupleOf(p.id)) || p.id === coupleForm.personAId
                "
              >
                {{ nameOf(p.id) }}
              </option>
            </select>
          </UiField>
          <UiButton
            type="submit"
            variant="secondary"
            :loading="createCouple.isPending.value"
            >Enregistrer</UiButton
          >
        </form>
        <UiNotice v-if="createCouple.isError.value" class="mt-2">{{
          errorMessage(createCouple.error.value)
        }}</UiNotice>
      </UiCard>

      <UiCard>
        <template #title>Exclusions manuelles</template>
        <p class="mb-2 text-sm text-neutral-600">
          Des paires qui ne doivent jamais se tirer, en plus des couples.
        </p>
        <ul v-if="exclusions.length" class="mb-3 divide-y divide-neutral-100">
          <li
            v-for="ex in exclusions"
            :key="ex.id"
            class="flex items-center justify-between py-2"
          >
            <span
              >{{ nameOf(ex.giverId) }} {{ ex.reciprocal ? '↔' : '→' }}
              {{ nameOf(ex.receiverId) }}</span
            >
            <UiButton
              variant="ghost"
              :loading="deleteExclusion.isPending.value"
              @click="deleteExclusion.mutate(ex.id)"
              >Retirer</UiButton
            >
          </li>
        </ul>
        <form class="flex flex-col gap-2" @submit.prevent="submitExclusion">
          <div class="grid gap-2 sm:grid-cols-2">
            <UiField id="eg" label="Donneur">
              <select
                id="eg"
                v-model="exclusionForm.giverId"
                :class="selectClass"
                required
              >
                <option value="" disabled>Choisir…</option>
                <option v-for="p in activePersons" :key="p.id" :value="p.id">
                  {{ nameOf(p.id) }}
                </option>
              </select>
            </UiField>
            <UiField id="er" label="Ne tire jamais">
              <select
                id="er"
                v-model="exclusionForm.receiverId"
                :class="selectClass"
                required
              >
                <option value="" disabled>Choisir…</option>
                <option
                  v-for="p in activePersons"
                  :key="p.id"
                  :value="p.id"
                  :disabled="p.id === exclusionForm.giverId"
                >
                  {{ nameOf(p.id) }}
                </option>
              </select>
            </UiField>
          </div>
          <label class="flex min-h-11 items-center gap-2 text-sm"
            ><input
              v-model="exclusionForm.reciprocal"
              type="checkbox"
              class="size-5"
            />
            Dans les deux sens</label
          >
          <UiNotice v-if="createExclusion.isError.value">{{
            errorMessage(createExclusion.error.value)
          }}</UiNotice>
          <UiButton
            type="submit"
            variant="secondary"
            :loading="createExclusion.isPending.value"
            >Ajouter l'exclusion</UiButton
          >
        </form>
      </UiCard>
    </template>
  </div>
</template>
