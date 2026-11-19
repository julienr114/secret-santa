<script setup lang="ts">
import { GIFT_HINTS_MODES } from '#shared/utils/hints';
import {
  useDashboardQuery,
  useOrganizersQuery,
  usePeopleQuery,
  useRemoveOrganizerMutation,
} from '~/composables/queries/useGroup';

// The group's settings, each a row whose value changes in its sheet or
// with its switch, saved at once (no « Enregistrer »), or written on its
// own page (the word added to the messages, README 23.3): the draw, the
// participants, the emails to the organisers, the organisers themselves,
// and, for the super-admin, deleting the group.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t, tk } = useT();
const route = useRoute();
const toast = useMessages();
const errorMessage = useErrorMessage();
const slug = computed(() => String(route.params.slug));
const context = useScreenContext(slug);
useHead({ title: () => context.titleOf(t('adminGroup.dashboard.settings')) });
const screen = computed(() => ({ back: `/admin/${slug.value}` }));
const { user } = useUserSession();
const isSuper = computed(() => user.value?.role === 'super_admin');

const { rules, shown, save, saving } = useRuleSaver(slug);
const dashboard = useDashboardQuery(slug);
const people = usePeopleQuery(slug);
const organizers = useOrganizersQuery(slug);
const removeOrganizer = useRemoveOrganizerMutation(slug);
const group = computed(() => dashboard.data.value?.group);

const editing = ref<null | 'years' | 'hints'>(null);
const sheet = (which: 'years' | 'hints') =>
  computed({
    get: () => editing.value === which,
    set: (value) => {
      editing.value = value ? which : null;
    },
  });
const yearsOpen = sheet('years');
const hintsOpen = sheet('hints');

/** What participants may note for their giver (README 22.11). */
const hintsChoices = computed(() =>
  GIFT_HINTS_MODES.map((mode) => ({
    value: mode,
    label: tk(`hints.setting.${mode}`),
    hint: tk(`hints.setting.${mode}Help`),
  })),
);

/** How far back nobody draws the same person again, as a row says it. */
const yearsChoices = computed(() => [
  { value: 0, label: t('adminGroup.rules.previousYears.none') },
  { value: 1, label: t('adminGroup.rules.previousYears.lastYear') },
  {
    value: 2,
    label: t('adminGroup.rules.previousYears.lastYears', { count: 2 }),
  },
  {
    value: 3,
    label: t('adminGroup.rules.previousYears.lastYears', { count: 3 }),
    hint: t('adminGroup.rules.previousYears.tight'),
  },
]);
const yearsValue = computed(() => {
  const years = shown.value.excludePreviousYears ?? 0;
  return years === 0
    ? t('adminGroup.rules.previousYears.noneShort')
    : t('adminGroup.rules.previousYears.short', { count: years });
});
const noteValue = computed(() =>
  shown.value.messageNote
    ? `« ${shown.value.messageNote} »`
    : t('adminEdition.invite.noWords'),
);

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
      <UiPageTitle>{{ t('adminGroup.dashboard.settings') }}</UiPageTitle>
    </div>
    <AdminQueryState
      :pending="rules.isPending.value"
      :error="rules.error.value"
      :skeleton="['list', 'list']"
      :rows="2"
    >
      <UiList
        :title="t('adminGroup.rules.drawSection')"
        :footer="t('adminGroup.rules.tighter')"
      >
        <UiListItem
          :title="t('adminGroup.rules.excludePreviousYearsShort')"
          :value="yearsValue"
          :busy="saving('excludePreviousYears')"
          :busy-label="t('common.actions.saving')"
          :on-click="() => (editing = 'years')"
        />
      </UiList>

      <UiList :title="t('adminGroup.rules.participantsSection')">
        <UiListItem
          :title="t('hints.setting.title')"
          :subtitle="tk(`hints.setting.${shown.giftHints ?? 'full'}`)"
          :chevron="true"
          :busy="saving('giftHints')"
          :busy-label="t('common.actions.saving')"
          :on-click="() => (editing = 'hints')"
          data-testid="gift-hints-setting"
        />
        <UiListItem
          :title="t('adminGroup.rules.messageNote')"
          :value="noteValue"
          :to="`/admin/${slug}/reglages/mot`"
          data-testid="group-note"
        />
      </UiList>

      <UiList
        :title="t('adminGroup.rules.notifySection')"
        :footer="t('adminGroup.rules.notifyHelp')"
        data-testid="notifications"
      >
        <UiListItem
          :checked="shown.notifyJoined ?? true"
          :title="t('adminGroup.rules.notifyJoined')"
          :busy="saving('notifyJoined')"
          @update:checked="(on) => save({ notifyJoined: on })"
        />
        <UiListItem
          :checked="shown.notifyAllViewed ?? true"
          :title="t('adminGroup.rules.notifyAllViewed')"
          :busy="saving('notifyAllViewed')"
          @update:checked="(on) => save({ notifyAllViewed: on })"
        />
        <UiListItem
          :checked="shown.notifyReminder ?? true"
          :title="t('adminGroup.rules.notifyReminder')"
          :subtitle="t('adminGroup.rules.notifyReminderHelp')"
          :busy="saving('notifyReminder')"
          @update:checked="(on) => save({ notifyReminder: on })"
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
      v-model:open="yearsOpen"
      :title="t('adminGroup.rules.excludePreviousYearsShort')"
      :description="t('adminGroup.rules.excludePreviousYearsHelp')"
      :choices="yearsChoices"
      :value="shown.excludePreviousYears ?? 0"
      :validate-label="t('common.actions.validate')"
      :cancel-label="t('common.actions.cancel')"
      @validate="
        (years) => {
          editing = null;
          save({ excludePreviousYears: years });
        }
      "
    />
    <UiChoiceSheet
      v-model:open="hintsOpen"
      :title="t('hints.setting.title')"
      :description="t('hints.setting.help')"
      :choices="hintsChoices"
      :value="shown.giftHints ?? 'full'"
      :validate-label="t('common.actions.validate')"
      :cancel-label="t('common.actions.cancel')"
      @validate="
        (mode) => {
          editing = null;
          save({ giftHints: mode });
        }
      "
    />
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
