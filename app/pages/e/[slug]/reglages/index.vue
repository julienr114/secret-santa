<script setup lang="ts">
import {
  CATEGORY_DEFAULTS,
  PARTY_CATEGORIES,
  type PartyCategory,
} from '#shared/utils/categories';
import {
  useDashboardQuery,
  useOrganizersQuery,
  usePeopleQuery,
  useRemoveOrganizerMutation,
} from '~/composables/queries/useGroup';
import { useFamilyQuery } from '~/composables/queries/useLists';
import {
  usePartyQuery,
  useUpdatePartyMutation,
} from '~/composables/queries/useParty';

// The settings of the party (docs/spec/v3/fete.md, maquette
// V3FeteReglages): only what is its own. Its category, its date, whether
// it comes back; for a birthday, « Pour » (ticket 118), one of my people
// or « Personne »; its organisers (no row to the settings of its Secret
// Santa: they open from its follow-up, ticket 159); deleting it, for the super-admin. « Quelqu'un s'inscrit par
// le lien » is a setting of each Secret Santa (ticket 116). Each saved at once (README 23.3).
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
    label: `${CATEGORY_DEFAULTS[category].emoji} ${tk(`party.category.${category}`)}`,
  })),
);

// « Pour », for a birthday (ticket 118): my people, or « Personne ».
const NOBODY = '';
const forOpen = ref(false);
const family = useFamilyQuery();
const forWhom = computed(() => data.value?.party.forWhom ?? null);
const forPerson = computed(() =>
  family.data.value?.members.find(
    (person) => person.id === forWhom.value?.memberId,
  ),
);
const forValue = computed(() => {
  if (!forWhom.value) return t('party.reglages.nobody');
  return forWhom.value.me ? t('party.create.me') : forWhom.value.firstName;
});
const forChoices = computed(() => [
  ...(family.data.value?.members ?? []).map((person) => ({
    value: person.id,
    label: `${person.avatar.emoji} ${person.isSelf ? t('party.create.me') : person.firstName}`,
  })),
  { value: NOBODY, label: t('party.reglages.nobody') },
]);

// The date opens its page (ticket 160): a sheet never carries a field.
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

// Organisers: adding is a page (ticket 161); removing asks for a second
// tap.
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
          :emoji="CATEGORY_DEFAULTS[data.party.category].emoji"
          :busy="update.isPending.value"
          :on-click="() => (categoryOpen = true)"
        />
        <UiListItem
          v-if="data && data.party.category === 'birthday'"
          :title="t('party.reglages.forWhom')"
          :value="forValue"
          :emoji="forPerson?.avatar.emoji"
          :busy="update.isPending.value"
          :on-click="() => (forOpen = true)"
          data-testid="party-for-whom"
        />
        <UiListItem
          :title="t('party.reglages.date')"
          :subtitle="dateValue"
          :to="`/e/${slug}/reglages/date`"
          data-testid="party-date-row"
        />
        <UiListItem
          v-if="data"
          :checked="data.party.recurring"
          :title="t('party.reglages.recurring')"
          @update:checked="(on) => patch({ recurring: on })"
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
          :to="`/e/${slug}/reglages/organisateur`"
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
    <UiChoiceSheet
      v-if="data"
      v-model:open="forOpen"
      :title="t('party.reglages.forWhom')"
      :choices="forChoices"
      :value="forWhom?.memberId ?? NOBODY"
      :validate-label="t('common.actions.validate')"
      :cancel-label="t('common.actions.cancel')"
      @validate="
        (memberId: string) => {
          forOpen = false;
          // Unchanged: another organiser's choice stays.
          if (memberId !== (forWhom?.memberId ?? NOBODY)) {
            patch({ forMemberId: memberId || null });
          }
        }
      "
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
