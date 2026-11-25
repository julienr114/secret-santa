<script setup lang="ts">
import {
  CATEGORY_DEFAULTS,
  PARTY_CATEGORIES,
  newPartyDefaults,
  type PartyCategory,
} from '#shared/utils/categories';
import {
  birthParts,
  dateOf,
  partyYears,
  type BirthParts,
} from '#shared/utils/memberFields';
import { useFamilyQuery } from '~/composables/queries/useLists';
import { useCreatePartyMutation } from '~/composables/queries/useParty';

// « Pour quelle occasion ? » (docs/spec/v3/accueil-et-creation.md,
// maquette V3FeteNouvelle): the category in six tiles fills the rest;
// « Pour qui ? » for a birthday, which the event keeps (ticket 118); the name, the date in one field (ticket 160), « Elle
// revient chaque année »; then « Continuer » creates it. Nobody else is
// asked for: people come in by its Secret Santa or its list (ticket 117).
// Opened with ?categorie=birthday&proche=<id>, it comes filled
// (« Bientôt »). Then the screen of today the creation was for
// (?pour=secret-santa or liste, decided by Julien on 20 November 2026),
// else the party.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t, tk } = useT();
const route = useRoute();
useHead({ title: () => `${t('party.create.title')} — ${t('common.appName')}` });
const today = new Date().toLocaleDateString('sv-SE');
const years = partyYears(Number(today.slice(0, 4)));
const family = useFamilyQuery();
const people = computed(() => family.data.value?.members ?? []);

type Form = {
  category: PartyCategory | null;
  /** The family member a birthday is for, `other` for someone else. */
  forWhom: string | null;
  name: string;
  date: BirthParts;
  recurring: boolean;
};
const blank = (): Form => ({
  category: null,
  forWhom: null,
  name: '',
  date: { day: null, month: null, year: null },
  recurring: false,
});
const form = useState<Form>('new-party', blank);

/** The name a category, or the one a birthday is for, proposes. */
const proposedName = (category: PartyCategory, forWhom: string | null) => {
  if (category === 'christmas') return tk('party.category.christmas');
  if (category !== 'birthday' || !forWhom || forWhom === 'other') return '';
  const person = people.value.find((p) => p.id === forWhom);
  if (!person) return '';
  return person.isSelf
    ? t('party.create.myBirthday')
    : t('party.create.birthdayOf', { name: person.firstName });
};
/** Fills what the category, and the one it is for, give. */
const fill = (category: PartyCategory, forWhom: string | null) => {
  const person = people.value.find((p) => p.id === forWhom);
  const defaults = newPartyDefaults(category, {
    today,
    birthDate: person?.birthDate ?? null,
  });
  form.value = {
    ...form.value,
    category,
    forWhom,
    name: proposedName(category, forWhom),
    date: birthParts(defaults.date),
    recurring: defaults.recurring,
  };
};
// From « Bientôt »: a birthday for one of my people, once they are known.
const filledFromQuery = ref(false);
watchEffect(() => {
  const category = route.query.categorie;
  if (filledFromQuery.value || typeof category !== 'string') return;
  if (!PARTY_CATEGORIES.includes(category as PartyCategory)) return;
  const forWhom =
    typeof route.query.proche === 'string' ? route.query.proche : null;
  if (forWhom && !family.data.value) return;
  filledFromQuery.value = true;
  fill(category as PartyCategory, forWhom);
});

const date = computed(() => dateOf(form.value.date));
const ready = computed(
  () =>
    form.value.category !== null &&
    form.value.name.trim() !== '' &&
    date.value !== null,
);
const create = useCreatePartyMutation();
const toast = useMessages();
const errorMessage = useErrorMessage();
const { createFor } = useListOccasion();
/**
 * Where to go once created: what the creation was for, else the party.
 * For a list: the new list, made for it.
 */
const after = async (slug: string) => {
  if (route.query.pour === 'secret-santa') {
    return navigateTo(`/admin/${slug}/editions/nouvelle`);
  }
  return route.query.pour === 'liste'
    ? createFor(slug)
    : navigateTo(`/e/${slug}`);
};
const submit = () => {
  if (!ready.value || !form.value.category || !date.value) return;
  create.mutate(
    {
      category: form.value.category,
      name: form.value.name.trim(),
      date: date.value,
      recurring: form.value.recurring,
      // The one of my people a birthday is for (ticket 118); none for
      // « Quelqu'un d'autre ».
      forMemberId:
        form.value.category === 'birthday' &&
        form.value.forWhom &&
        form.value.forWhom !== 'other'
          ? form.value.forWhom
          : null,
    },
    {
      onSuccess: async ({ slug }) => {
        form.value = blank();
        await after(slug);
      },
      onError: (error) => toast.failed(errorMessage(error)),
    },
  );
};
const emojiOf = (category: PartyCategory) => CATEGORY_DEFAULTS[category].emoji;
</script>

<template>
  <AdminScreen back="/">
    <UiPageTitle>{{ t('party.create.title') }}</UiPageTitle>
    <div
      role="radiogroup"
      :aria-label="t('party.create.title')"
      class="grid grid-cols-3 gap-2"
    >
      <button
        v-for="category in PARTY_CATEGORIES"
        :key="category"
        type="button"
        role="radio"
        :aria-checked="form.category === category"
        class="flex min-h-20 flex-col items-center justify-center gap-1 rounded-2xl bg-default text-sm font-semibold ring-1 ring-default"
        :class="form.category === category ? 'ring-2 ring-primary' : ''"
        :data-testid="`category-${category}`"
        @click="fill(category, null)"
      >
        <UiEmoji :emoji="emojiOf(category)" class="text-2xl" />
        {{ tk(`party.category.${category}`) }}
      </button>
    </div>

    <template v-if="form.category">
      <div v-if="form.category === 'birthday'" class="flex flex-col gap-2">
        <span class="text-[13px] font-semibold text-toned">{{
          t('party.create.forWhom')
        }}</span>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="person in people"
            :key="person.id"
            type="button"
            class="flex h-10 items-center gap-1.5 rounded-full bg-default px-3 text-sm font-semibold ring-1 ring-default"
            :class="form.forWhom === person.id ? 'ring-2 ring-primary' : ''"
            :aria-pressed="form.forWhom === person.id"
            @click="fill('birthday', person.id)"
          >
            <UiEmoji :emoji="person.avatar.emoji" />
            {{ person.isSelf ? t('party.create.me') : person.firstName }}
          </button>
          <button
            type="button"
            class="flex h-10 items-center rounded-full bg-default px-3 text-sm font-semibold ring-1 ring-default"
            :class="form.forWhom === 'other' ? 'ring-2 ring-primary' : ''"
            :aria-pressed="form.forWhom === 'other'"
            @click="fill('birthday', 'other')"
          >
            {{ t('party.create.someoneElse') }}
          </button>
        </div>
      </div>

      <UFormField :label="t('party.create.name')">
        <UInput
          v-model="form.name"
          size="xl"
          class="w-full"
          :maxlength="100"
          data-testid="party-name"
        />
      </UFormField>

      <div class="flex flex-col gap-2">
        <span class="text-sm font-bold">{{ t('party.create.date') }}</span>
        <UiDateField
          v-model="form.date"
          :years="years"
          weekday
          :since="today"
          :label="t('party.create.date')"
          testid="party-date"
        />
      </div>

      <UiList>
        <UiListItem
          v-model:checked="form.recurring"
          :title="t('party.create.recurring')"
        />
      </UiList>

      <UButton
        block
        size="xl"
        :loading="create.isPending.value"
        :disabled="!ready"
        :label="t('party.create.continue')"
        data-testid="party-create"
        @click="submit()"
      />
    </template>
  </AdminScreen>
</template>
