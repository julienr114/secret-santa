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
import {
  useCreatePartyMutation,
  usePartyCandidatesQuery,
} from '~/composables/queries/useParty';

// « Pour quelle occasion ? » (docs/spec/v3/accueil-et-creation.md,
// maquettes V3FeteNouvelle and V3FeteMembresReprendre): the category in
// six tiles fills the rest; « Pour qui ? » for a birthday; the name, the
// date in three lists, « Elle revient chaque année »; then « Qui est de
// la fête ? », the people taken from parties I organise. Opened with
// ?categorie=birthday&proche=<id>, it comes filled (« Bientôt »). Then
// the screen of today the creation was for (?pour=secret-santa or
// liste, decided by Julien on 20 November 2026), else the party.
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
  memberIds: string[];
  from: string[];
};
const blank = (): Form => ({
  category: null,
  forWhom: null,
  name: '',
  date: { day: null, month: null, year: null },
  recurring: false,
  memberIds: [],
  from: [],
});
const form = useState<Form>('new-party', blank);
const step = computed(() =>
  route.query.etape === 'membres' ? 'members' : 'occasion',
);

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
const toMembers = () =>
  navigateTo({ query: { ...route.query, etape: 'membres' } });

// « Qui est de la fête ? »
const candidates = usePartyCandidatesQuery();
const shownPeople = computed(() => {
  const all = (candidates.data.value?.people ?? []).filter((person) =>
    form.value.from.includes(person.partyId),
  );
  return all.filter(
    (person, index) =>
      person.email === null ||
      all.findIndex((other) => other.email === person.email) === index,
  );
});
/** Takes a party's people in, or out. */
const toggleFrom = (partyId: string) => {
  const on = !form.value.from.includes(partyId);
  const ofParty = (candidates.data.value?.people ?? [])
    .filter((person) => person.partyId === partyId)
    .map((person) => person.id);
  form.value = {
    ...form.value,
    from: on
      ? [...form.value.from, partyId]
      : form.value.from.filter((id) => id !== partyId),
    memberIds: on
      ? [...new Set([...form.value.memberIds, ...ofParty])]
      : form.value.memberIds.filter((id) => !ofParty.includes(id)),
  };
};
const toggleMember = (id: string) => {
  form.value = {
    ...form.value,
    memberIds: form.value.memberIds.includes(id)
      ? form.value.memberIds.filter((one) => one !== id)
      : [...form.value.memberIds, id],
  };
};
const chosen = computed(() =>
  shownPeople.value.filter((person) =>
    form.value.memberIds.includes(person.id),
  ),
);

const create = useCreatePartyMutation();
const toast = useMessages();
const errorMessage = useErrorMessage();
/** Where to go once created: what the creation was for, else the party. */
const after = (slug: string, invite: boolean) => {
  if (invite) return `/e/${slug}/invitation`;
  if (route.query.pour === 'secret-santa') {
    return `/admin/${slug}/editions/nouvelle`;
  }
  return route.query.pour === 'liste' ? '/listes/nouvelle' : `/e/${slug}`;
};
const submit = (invite = false) => {
  if (!ready.value || !form.value.category || !date.value) return;
  create.mutate(
    {
      category: form.value.category,
      name: form.value.name.trim(),
      date: date.value,
      recurring: form.value.recurring,
      memberIds: chosen.value.map((person) => person.id),
    },
    {
      onSuccess: async ({ slug }) => {
        form.value = blank();
        await navigateTo(after(slug, invite));
      },
      onError: (error) => toast.failed(errorMessage(error)),
    },
  );
};
const emojiOf = (category: PartyCategory) =>
  CATEGORY_DEFAULTS[category].emoji ?? '✨';
</script>

<template>
  <AdminScreen :back="step === 'members' ? '/e/nouvelle' : '/'">
    <template v-if="step === 'occasion'">
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
          <span class="text-[13px] font-semibold text-toned">{{
            t('party.create.date')
          }}</span>
          <UiDateSelects
            v-model="form.date"
            :years="years"
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
          :disabled="!ready"
          :label="t('party.create.continue')"
          @click="toMembers"
        />
      </template>
    </template>

    <template v-else>
      <div class="flex flex-col gap-1">
        <p v-if="form.category" class="text-sm font-semibold text-toned">
          <UiEmoji :emoji="emojiOf(form.category)" /> {{ form.name }}
        </p>
        <UiPageTitle>{{ t('party.create.who') }}</UiPageTitle>
      </div>
      <section
        v-if="(candidates.data.value?.parties.length ?? 0) > 0"
        class="flex flex-col gap-2"
      >
        <UiSectionTitle>{{ t('party.create.takeFrom') }}</UiSectionTitle>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="party in candidates.data.value?.parties ?? []"
            :key="party.id"
            type="button"
            class="flex h-10 items-center gap-1.5 rounded-full bg-default px-3 text-sm font-semibold ring-1 ring-default"
            :class="form.from.includes(party.id) ? 'ring-2 ring-primary' : ''"
            :aria-pressed="form.from.includes(party.id)"
            @click="toggleFrom(party.id)"
          >
            <UiEmoji :emoji="party.iconEmoji ?? emojiOf(party.category)" />
            {{ party.name }}
          </button>
        </div>
      </section>
      <UiList v-if="shownPeople.length > 0">
        <UiListItem
          v-for="person in shownPeople"
          :key="person.id"
          :avatar="person.avatar"
          :title="person.firstName"
          :subtitle="person.email ?? t('party.create.noEmail')"
          :chevron="false"
          :on-click="() => toggleMember(person.id)"
        >
          <template #trailing>
            <span
              role="checkbox"
              :aria-checked="form.memberIds.includes(person.id)"
              :aria-label="person.firstName"
              class="flex size-6 shrink-0 items-center justify-center rounded-full"
              :class="
                form.memberIds.includes(person.id)
                  ? 'bg-primary text-inverted'
                  : 'ring-2 ring-accented'
              "
            >
              <UIcon
                v-if="form.memberIds.includes(person.id)"
                name="i-lucide-check"
                class="size-4"
              />
            </span>
          </template>
        </UiListItem>
      </UiList>
      <UiList>
        <UiListItem
          icon="i-lucide-link"
          icon-tone="neutral"
          :title="t('party.create.inviteOthers')"
          :subtitle="t('party.create.inviteOthersHint')"
          :chevron="true"
          :on-click="() => submit(true)"
        />
      </UiList>
      <UButton
        block
        size="xl"
        :loading="create.isPending.value"
        :disabled="!ready"
        :label="t('party.create.submit', { count: chosen.length + 1 })"
        data-testid="party-create"
        @click="submit()"
      />
    </template>
  </AdminScreen>
</template>
