<script setup lang="ts">
import { formatEventDate } from '#server/utils/rules';
import { instantOf } from '#shared/utils/dates';
import {
  newSecretSantaDate,
  newSecretSantaYear,
} from '#shared/utils/newSecretSanta';
import { useCreateEditionMutation } from '~/composables/queries/useGroup';
import { useNewSecretSantaQuery } from '~/composables/queries/useHome';
import { usePartyQuery } from '~/composables/queries/useParty';

// A new Secret Santa (docs/spec/v3/secret-santa.md, « Le créer »,
// V3TirageNouveau): five rows of the same shape, the value on the right,
// each opening its page (regles-d-ecran.md, « Des lignes, pas des
// champs »), then the card of « Devine qui », chosen in place (ticket
// 150). The values start from the party and from the previous Secret
// Santa; a first one plays every pair. Below, who is taken over, then « Créer le Secret Santa »;
// the participants are adjusted on the next screen. An account at its
// limit is sent to the screen of the limit, anyone to the screen of the
// pause while new Secret Santa are paused.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const { t, tk, locale } = useT();
const errorMessage = useErrorMessage();
const slug = computed(() => String(route.params.slug));
const party = usePartyQuery(slug);
const create = useCreateEditionMutation(slug);
const limit = useNewSecretSantaQuery(true);
// Today here, as « Pour quelle occasion ? » reads it.
const today = new Date().toLocaleDateString('sv-SE');
const partyYear = computed(() => party.data.value?.year ?? null);
const startDate = computed(() =>
  newSecretSantaDate(
    partyYear.value,
    party.data.value?.party.usualDate ?? null,
    today,
  ),
);
const draft = useNewEditionDraft(slug);
const year = computed(() =>
  newSecretSantaYear(
    draft.value?.eventDate ?? startDate.value,
    partyYear.value,
    today,
  ),
);
const { previous, previousRules, previousGuessMode, members, pending } =
  useTakenOver(slug, year);
const partyName = computed(() => party.data.value?.party.name ?? '');
const title = computed(() => t('party.secretSanta.row', { year: year.value }));
useHead({
  title: () => `${title.value} — ${partyName.value} — ${t('common.appName')}`,
});
const screen = computed(() => ({ back: `/e/${slug.value}` }));

// Paused, or at the limit, nothing to fill: its own screen says why.
watch(
  () => limit.data.value,
  (data) => {
    if (data?.paused) navigateTo('/secret-santa/pause', { replace: true });
    else if (data?.limitReached) {
      navigateTo('/secret-santa/limite', { replace: true });
    }
  },
  { immediate: true },
);
// Filled once, when the party and the previous Secret Santa are known;
// kept while a row is changed on its page, dropped once the form is left.
watch(
  () => !pending.value && Boolean(party.data.value),
  (ready) => {
    if (!ready || draft.value) return;
    const category = party.data.value?.party.category ?? 'christmas';
    draft.value = {
      label: `${tk(`party.category.${category}`)} ${year.value}`,
      eventDate: startDate.value,
      budget: previousRules.value?.budget ?? '',
      guardianMessage: '',
      messageNote: previousRules.value?.messageNote ?? '',
      guessMode: previousGuessMode.value,
    };
  },
  { immediate: true },
);
const base = computed(() => `/admin/${slug.value}/editions/nouvelle`);
onBeforeRouteLeave((to) => {
  if (!to.path.startsWith(`${base.value}/`)) draft.value = null;
});

const none = computed(() => t('adminEdition.newEdition.messageNone'));
/** The five rows, in the order of the mockup. */
const rows = computed(() => {
  const d = draft.value;
  if (!d) return [];
  return [
    { key: 'nom', title: t('adminEdition.newEdition.nameRow'), value: d.label },
    {
      key: 'date',
      title: t('adminEdition.newEdition.dateLabel'),
      value: d.eventDate
        ? formatEventDate(d.eventDate, locale.value)
        : t('adminEdition.newEdition.dateToChoose'),
    },
    {
      key: 'budget',
      title: t('adminEdition.newEdition.budgetLabel'),
      value: d.budget || none.value,
    },
    {
      key: 'mot',
      title: t('adminEdition.newEdition.messageLabel'),
      value: d.guardianMessage || none.value,
    },
    {
      key: 'message',
      title: t('adminGroup.rules.messageNote'),
      value: d.messageNote || none.value,
    },
  ];
});
const takenOver = computed(() =>
  previous.value
    ? t('adminEdition.newEdition.takenOverFrom', {
        count: members.value.length,
        year: previous.value.year,
      })
    : t('adminEdition.newEdition.partyMembers', {
        count: members.value.length,
      }),
);

const saving = ref(false);
const busy = useBusy(() => saving.value);
const failure = ref<unknown>(null);
/** The end of the guesses: 18 h on the day of the party, here. */
const zone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;
/**
 * Creates the Secret Santa with the values of its rows, and opens it.
 * @returns Once it is open.
 */
const onCreate = async () => {
  const d = draft.value;
  if (!d?.eventDate) return;
  saving.value = true;
  failure.value = null;
  try {
    const { edition } = await create.mutateAsync({
      label: d.label,
      year: year.value,
      eventDate: d.eventDate,
      budget: d.budget,
      guardianMessage: d.guardianMessage,
      messageNote: d.messageNote,
      guess:
        d.guessMode === 'none'
          ? { mode: 'none' }
          : {
              mode: d.guessMode,
              endsAt: instantOf(d.eventDate, '18:00', zone()),
              timeZone: zone(),
            },
    });
    await navigateTo(`/admin/${slug.value}/editions/${edition.id}`, {
      replace: true,
    });
  } catch (error) {
    failure.value = error;
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <AdminScreen v-bind="screen">
    <AdminQueryState
      :pending="!draft"
      :error="party.error.value"
      :skeleton="['title', 'list']"
      :rows="5"
    >
      <div class="flex flex-col gap-1">
        <UiPageContext
          :parts="[{ label: partyName, to: `/e/${slug}` }]"
          :label="t('common.context')"
        />
        <UiPageTitle>{{ title }}</UiPageTitle>
      </div>
      <UiList data-testid="new-secret-santa">
        <UiListItem
          v-for="row in rows"
          :key="row.key"
          :title="row.title"
          :value="row.value"
          :to="`${base}/${row.key}`"
          :data-testid="`new-secret-santa-${row.key}`"
        />
      </UiList>
      <AdminGuessChoice
        v-if="draft"
        v-model="draft.guessMode"
        :possible="members.length >= 4"
      />
      <UiCard
        padding="md"
        class="flex items-center gap-3"
        data-testid="taken-over"
      >
        <UiAvatarStack
          :avatars="members.map((m) => m.avatar)"
          :label="t('common.count.participants', { count: members.length })"
          class="shrink-0"
        />
        <p class="text-sm leading-[1.4] font-bold">{{ takenOver }}</p>
      </UiCard>
      <UAlert
        v-if="failure"
        color="error"
        variant="subtle"
        :description="errorMessage(failure)"
      />
      <UButton
        block
        size="xl"
        class="h-12 justify-center font-bold"
        :disabled="saving || !draft?.eventDate"
        :loading="busy"
        :label="
          busy
            ? t('adminEdition.newEdition.creating')
            : t('adminEdition.newEdition.submit')
        "
        data-testid="new-secret-santa-submit"
        @click="onCreate"
      />
    </AdminQueryState>
  </AdminScreen>
</template>
