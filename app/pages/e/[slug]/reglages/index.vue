<script setup lang="ts">
import {
  CATEGORY_DEFAULTS,
  PARTY_CATEGORIES,
  type PartyCategory,
} from '#shared/utils/categories';
import {
  birthParts,
  dateOf,
  partyYears,
  type BirthParts,
} from '#shared/utils/memberFields';
import {
  useDashboardQuery,
  useOrganizersQuery,
  usePeopleQuery,
  useRemoveOrganizerMutation,
} from '~/composables/queries/useGroup';
import {
  usePartyQuery,
  useUpdatePartyMutation,
} from '~/composables/queries/useParty';

// The settings of the party (docs/spec/v3/fete.md, maquette
// V3FeteReglages): only what is its own. Its category, its date, whether
// it comes back; a row to the settings of its Secret Santa; the email
// « Quelqu'un rejoint la fête par le lien »; its organisers; deleting it,
// for the super-admin. Each saved at once (README 23.3).
definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t, tk, locale } = useT();
const route = useRoute();
const toast = useMessages();
const errorMessage = useErrorMessage();
const slug = computed(() => String(route.params.slug));
const context = useScreenContext(slug);
useHead({ title: () => context.titleOf(t('party.settings')) });
const screen = computed(() => ({ back: `/e/${slug.value}` }));
const { user } = useUserSession();
const isSuper = computed(() => user.value?.role === 'super_admin');

const { shown, save, saving } = useRuleSaver(slug);
const party = usePartyQuery(slug);
const update = useUpdatePartyMutation(slug);
const dashboard = useDashboardQuery(slug);
const people = usePeopleQuery(slug);
const organizers = useOrganizersQuery(slug);
const removeOrganizer = useRemoveOrganizerMutation(slug);
const group = computed(() => dashboard.data.value?.group);
const data = computed(() => party.data.value);

/** Saves one setting of the party, a failure told in a toast. */
const patch = (body: Parameters<typeof update.mutate>[0]) =>
  update.mutate(body, {
    onError: (error) => toast.failed(errorMessage(error)),
  });

// The category, in its sheet.
const categoryOpen = ref(false);
const categoryChoices = computed(() =>
  PARTY_CATEGORIES.map((category) => ({
    value: category,
    label: `${CATEGORY_DEFAULTS[category].emoji ?? '✨'} ${tk(`party.category.${category}`)}`,
  })),
);

// The date, in three lists in its sheet.
const dateOpen = ref(false);
const years = partyYears(Number(new Date().toISOString().slice(0, 4)));
const parts = ref<BirthParts>({ day: null, month: null, year: null });
const openDate = () => {
  parts.value = birthParts(data.value?.year?.date ?? null);
  dateOpen.value = true;
};
const dateValue = computed(() => {
  const date = data.value?.year?.date;
  if (!date) return undefined;
  const day = new Intl.DateTimeFormat(locale.value, {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(new Date(`${date}T12:00:00Z`));
  return data.value?.party.recurring
    ? t('party.reglages.dateValue', { date: day })
    : t('party.reglages.dateValueOnce', { date: day });
});
const saveDate = () => {
  const date = dateOf(parts.value);
  if (!date) return;
  dateOpen.value = false;
  patch({ date });
};
/** The latest Secret Santa of the year: its settings (ticket 105). */
const latestSanta = computed(() => data.value?.secretSantas.at(-1));

// Organisers: removing asks for a second tap.
const adding = ref(false);
const confirmId = ref<string | null>(null);
/**
 * Removes an organiser.
 * @param accountId - Their account.
 * @returns Nothing: the mutation reports by itself.
 */
const onRemove = (accountId: string) =>
  removeOrganizer.mutate(accountId, {
    onSettled: () => {
      confirmId.value = null;
    },
    onError: (error) => toast.failed(errorMessage(error)),
  });
const deleting = ref(false);
</script>

<template>
  <AdminScreen v-bind="screen">
    <div class="flex flex-col gap-1">
      <UiPageContext
        :parts="context.parts.value"
        :label="t('common.context')"
      />
      <UiPageTitle>{{ t('party.settings') }}</UiPageTitle>
    </div>
    <AdminQueryState
      :pending="party.isPending.value"
      :error="party.error.value"
      :skeleton="['settings', 'settings', 'settings']"
      :rows="2"
    >
      <UiList :title="t('party.reglages.party')" data-testid="party-settings">
        <UiListItem
          v-if="data"
          :title="t('party.reglages.category')"
          :value="tk(`party.category.${data.party.category}`)"
          :emoji="CATEGORY_DEFAULTS[data.party.category].emoji ?? '✨'"
          :busy="update.isPending.value"
          :on-click="() => (categoryOpen = true)"
        />
        <UiListItem
          :title="t('party.reglages.date')"
          :subtitle="dateValue"
          :chevron="true"
          :on-click="openDate"
        />
        <UiListItem
          v-if="data"
          :checked="data.party.recurring"
          :title="t('party.reglages.recurring')"
          @update:checked="(on) => patch({ recurring: on })"
        />
      </UiList>

      <UiList v-if="latestSanta" :title="t('party.reglages.secretSanta')">
        <UiListItem
          :title="
            t('party.reglages.secretSantaRow', { year: latestSanta.year })
          "
          :to="`/admin/${slug}/editions/${latestSanta.id}/reglages`"
        />
      </UiList>

      <UiList :title="t('party.reglages.email')" data-testid="notifications">
        <UiListItem
          :checked="shown.notifyJoined ?? true"
          :title="t('party.reglages.joined')"
          :busy="saving('notifyJoined')"
          @update:checked="(on) => save({ notifyJoined: on })"
        />
      </UiList>

      <UiList
        id="organisateurs"
        :title="t('adminGroup.organizers.title')"
        data-testid="organizers"
      >
        <UiListItem
          v-for="organizer in organizers.data.value?.organizers ?? []"
          :key="organizer.accountId"
          :title="organizer.email"
          :subtitle="organizer.me ? t('adminGroup.organizers.you') : undefined"
        >
          <template v-if="!organizer.me" #trailing>
            <div
              v-if="confirmId === organizer.accountId"
              class="flex shrink-0 items-center gap-1"
            >
              <UButton
                size="sm"
                color="error"
                class="min-h-11"
                :label="t('adminGroup.organizers.remove')"
                :loading="removeOrganizer.isPending.value"
                @click="onRemove(organizer.accountId)"
              />
              <UButton
                size="sm"
                variant="ghost"
                color="neutral"
                class="min-h-11"
                :label="t('common.actions.cancel')"
                @click="confirmId = null"
              />
            </div>
            <UButton
              v-else
              variant="ghost"
              color="neutral"
              icon="i-lucide-x"
              class="-mr-3 size-11 justify-center"
              :aria-label="
                t('adminGroup.organizers.removeLabel', {
                  email: organizer.email,
                })
              "
              @click="confirmId = organizer.accountId"
            />
          </template>
        </UiListItem>
        <UiListItem
          icon="i-lucide-plus"
          :title="t('adminGroup.organizers.add')"
          :subtitle="t('adminGroup.organizers.addHint')"
          :on-click="() => (adding = true)"
        />
      </UiList>

      <UiRestricted v-if="isSuper" :label="t('auth.account.superAdmin')" flush>
        <ul>
          <UiListItem
            icon="i-lucide-trash-2"
            tone="danger"
            :title="t('adminGroup.dashboard.deleteGroup')"
            :on-click="() => (deleting = true)"
          />
        </ul>
      </UiRestricted>
    </AdminQueryState>

    <UiChoiceSheet
      v-if="data"
      v-model:open="categoryOpen"
      :title="t('party.reglages.category')"
      :choices="categoryChoices"
      :value="data.party.category"
      :validate-label="t('common.actions.validate')"
      :cancel-label="t('common.actions.cancel')"
      @validate="
        (category: PartyCategory) => {
          categoryOpen = false;
          patch({ category });
        }
      "
    />
    <UiSheet v-model:open="dateOpen" :title="t('party.reglages.date')">
      <UiDateSelects
        v-model="parts"
        :years="years"
        :label="t('party.reglages.date')"
        testid="party-date"
      />
      <template #footer>
        <UButton
          block
          :disabled="!dateOf(parts)"
          :label="t('common.actions.validate')"
          @click="saveDate"
        />
        <UButton
          block
          color="neutral"
          variant="ghost"
          :label="t('common.actions.cancel')"
          @click="dateOpen = false"
        />
      </template>
    </UiSheet>
    <AdminOrganizerSheet
      v-model:open="adding"
      :slug="slug"
      :group-name="group?.name ?? ''"
    />
    <AdminDeleteGroupSheet
      v-if="isSuper && group"
      v-model:open="deleting"
      :group-id="group.id"
      :slug="slug"
      :name="group.name"
      :person-count="people.data.value?.persons.length ?? 0"
      :edition-count="dashboard.data.value?.editions.length ?? 0"
    />
  </AdminScreen>
</template>
