<script setup lang="ts">
import { GUESS_MODES, type GuessMode } from '#server/utils/guesses';
import { birthParts, dateOf, partyYears } from '#shared/utils/memberFields';
import type { NewEditionDraft } from '~/composables/useNewEditionDraft';
import { usePartyQuery } from '~/composables/queries/useParty';

// One row of a new Secret Santa on its own page (docs/spec/v3/
// regles-d-ecran.md, « Des lignes, pas des champs »): where it comes from
// above the title, the title, the field, « Valider » under it; « Retour »
// gives the change up. The form keeps the value until the Secret Santa
// is created.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const field = computed(() => String(route.params.champ));
const party = usePartyQuery(slug);
// « Père Noël » only in a Christmas party (docs/spec/v3/vocabulaire.md).
const { t, tk } = useT({
  christmas: () =>
    (party.data.value?.party.category ?? 'christmas') === 'christmas',
});
const goBack = useGoBack();
const draft = useNewEditionDraft(slug);
const parent = computed(() => `/admin/${slug.value}/editions/nouvelle`);
const screen = computed(() => ({ back: parent.value }));

/** What each row keeps, with its title and its limits. */
const FIELDS = {
  nom: { key: 'label', max: 60 },
  budget: { key: 'budget', max: 60 },
  mot: { key: 'guardianMessage', max: 300 },
  message: { key: 'messageNote', max: 500 },
} as const satisfies Record<
  string,
  { key: keyof NewEditionDraft; max: number }
>;
type TextField = keyof typeof FIELDS;
const isText = (value: string): value is TextField => value in FIELDS;

const titles = computed<Record<string, string>>(() => ({
  nom: t('adminEdition.newEdition.nameRow'),
  date: t('adminEdition.newEdition.dateLabel'),
  budget: t('adminEdition.newEdition.budgetLabel'),
  devine: t('adminEdition.guess.title'),
  mot: t('adminEdition.newEdition.messageLabel'),
  message: t('adminGroup.rules.messageNote'),
}));
const title = computed(() => titles.value[field.value] ?? '');
const titleOf = computed(() =>
  t('party.secretSanta.row', {
    year: (draft.value?.eventDate || String(new Date().getFullYear())).slice(
      0,
      4,
    ),
  }),
);
useHead({ title: () => `${title.value} — ${t('common.appName')}` });

// Without its form, or for a row that does not exist, back to the form.
onMounted(() => {
  if (!draft.value || !(field.value in titles.value)) {
    navigateTo(parent.value, { replace: true });
  }
});

const text = ref('');
const date = ref(birthParts(null));
const guess = ref<GuessMode>('none');
watch(
  draft,
  (d) => {
    if (!d) return;
    if (isText(field.value)) text.value = String(d[FIELDS[field.value].key]);
    date.value = birthParts(d.eventDate || null);
    guess.value = d.guessMode;
  },
  { immediate: true },
);
const years = partyYears(new Date().getFullYear());
const guessChoices = computed(() =>
  GUESS_MODES.map((value) => ({
    value,
    label: t(`adminEdition.guess.mode.${value}`),
    hint: tk(`adminEdition.guess.modeHint.${value}`),
  })),
);
/** The name is required, and so is a full date. */
const invalid = computed(
  () =>
    (field.value === 'nom' && !text.value.trim()) ||
    (field.value === 'date' && !dateOf(date.value)),
);

/**
 * Keeps the value in the form and goes back to it.
 * @returns Nothing.
 */
const onValidate = () => {
  const d = draft.value;
  if (!d || invalid.value) return;
  if (isText(field.value)) {
    draft.value = { ...d, [FIELDS[field.value].key]: text.value.trim() };
  } else if (field.value === 'date') {
    draft.value = { ...d, eventDate: dateOf(date.value) ?? d.eventDate };
  } else if (field.value === 'devine') {
    draft.value = { ...d, guessMode: guess.value };
  }
  goBack(parent.value);
};
</script>

<template>
  <AdminScreen v-bind="screen">
    <div class="flex flex-col gap-1">
      <UiPageContext
        :parts="[
          {
            label: party.data.value?.party.name ?? '',
            to: `/e/${slug}`,
          },
          { label: titleOf, to: parent },
        ]"
        :label="t('common.context')"
      />
      <UiPageTitle>{{ title }}</UiPageTitle>
    </div>
    <UiTextField
      v-if="isText(field)"
      :id="`new-secret-santa-${field}`"
      v-model="text"
      :label="title"
      :maxlength="FIELDS[field].max"
      :multiline="field === 'mot' || field === 'message'"
      :placeholder="
        field === 'mot'
          ? t('adminEdition.newEdition.messagePlaceholder')
          : undefined
      "
    />
    <UiDateSelects
      v-else-if="field === 'date'"
      v-model="date"
      :years="years"
      :label="title"
      testid="new-secret-santa-date"
    />
    <UiChoiceList
      v-else-if="field === 'devine'"
      v-model="guess"
      :choices="guessChoices"
      :label="title"
      plain
    />
    <UiStickyFooter inline>
      <UButton
        block
        size="xl"
        class="h-13 justify-center text-[17px] font-bold"
        :disabled="invalid"
        :label="t('common.actions.validate')"
        data-testid="field-validate"
        @click="onValidate"
      />
    </UiStickyFooter>
  </AdminScreen>
</template>
