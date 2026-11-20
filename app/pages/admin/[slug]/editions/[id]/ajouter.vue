<script setup lang="ts">
import { byName, fullName } from '#server/utils/people';
import { listView } from '#shared/utils/lists';
import { participantChanges, toggleChosen } from '#shared/utils/participants';
import {
  useEditionQuery,
  usePeopleQuery,
} from '~/composables/queries/useGroup';
import {
  useAddParticipantMutation,
  useRemoveParticipantMutation,
} from '~/composables/queries/useEdition';

// Choosing who takes part, before the draw: every active member of the
// group with a box, ticked when they take part. Saving adds the newly
// ticked and removes the unticked, one call each, then goes back to the
// edition. Someone new is created, or invited by link, below.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const id = computed(() => String(route.params.id));
const editionPath = computed(() => `/admin/${slug.value}/editions/${id.value}`);
const toast = useMessages();
const { t } = useT();
const errorMessage = useErrorMessage();
const goBack = useGoBack();
const edition = useEditionQuery(slug, id);
const people = usePeopleQuery(slug);
const add = useAddParticipantMutation(slug, id);
const remove = useRemoveParticipantMutation(slug, id);

const context = useScreenContext(slug, id);
useHead({
  title: () => context.titleOf(t('adminEdition.addParticipants.title')),
});
const screen = computed(() => ({ back: editionPath.value }));

// Once drawn, the list is locked: back to the edition.
watch(
  () => edition.data.value?.edition.status,
  (status) =>
    status &&
    status !== 'preparing' &&
    navigateTo(editionPath.value, { replace: true }),
  { immediate: true },
);

const participants = computed(() => edition.data.value?.participants ?? []);
const members = computed(() =>
  (people.data.value?.persons ?? []).filter((p) => p.active).toSorted(byName),
);
const current = computed(() => participants.value.map((p) => p.id));
// The boxes ticked, kept while creating someone new on the next screen;
// null until a box changes, then forgotten on leaving or saving.
const ticked = useChosenParticipants(id);
const chosen = computed(() => ticked.value ?? current.value);
onBeforeRouteLeave((to) => {
  if (!to.path.endsWith('/membres/nouvelle')) ticked.value = null;
});
/**
 * Whether a member is ticked.
 * @param personId - The member.
 * @returns True when ticked.
 */
const isChosen = (personId: string) => chosen.value.includes(personId);
/**
 * Ticks or unticks a member.
 * @param personId - The member.
 * @param on - True to tick them.
 * @returns Nothing.
 */
const choose = (personId: string, on: boolean) => {
  ticked.value = toggleChosen(chosen.value, personId, on);
};
const allChosen = computed(
  () => members.value.length > 0 && members.value.every((p) => isChosen(p.id)),
);
/**
 * Ticks every member, or none when all are ticked.
 * @returns Nothing.
 */
const chooseAll = () => {
  ticked.value = allChosen.value ? [] : members.value.map((p) => p.id);
};

// Past ten people, a search; past twelve, six rows then a fold row.
const SEARCH_FROM = 10;
const SHOWN = 6;
const query = ref('');
const expanded = ref(false);
const searchable = computed(() => members.value.length > SEARCH_FROM);
const view = computed(() =>
  listView(members.value, {
    query: query.value,
    expanded: expanded.value,
    shown: SHOWN,
    nameOf: fullName,
  }),
);

const saving = ref(false);
const busy = useBusy(() => saving.value);
const count = computed(() => chosen.value.length);
/**
 * Saves the list: adds, then removes, one call each, then back to the
 * edition with what changed.
 * @returns Once every call answered.
 */
const onSave = async () => {
  const changes = participantChanges(current.value, chosen.value);
  const total = chosen.value.length;
  const participationOf = (personId: string) =>
    participants.value.find((p) => p.id === personId)?.participationId ?? '';
  saving.value = true;
  try {
    await Promise.all(changes.add.map((personId) => add.mutateAsync(personId)));
    await Promise.all(
      changes.remove.map((personId) =>
        remove.mutateAsync(participationOf(personId)),
      ),
    );
    toast.done(t('adminEdition.addParticipants.saved', { count: total }));
    ticked.value = null;
    goBack(editionPath.value);
  } catch (error) {
    toast.failed(errorMessage(error));
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <AdminScreen v-bind="screen">
    <AdminQueryState
      :pending="people.isPending.value || edition.isPending.value"
      :error="people.error.value ?? edition.error.value"
      :skeleton="['title', 'list']"
      :rows="6"
    >
      <div class="flex flex-col gap-1">
        <UiPageContext
          :parts="context.parts.value"
          :label="t('common.context')"
        />
        <UiPageTitle>{{ t('adminEdition.addParticipants.title') }}</UiPageTitle>
        <p class="text-[15px] text-toned">
          {{ t('adminEdition.addParticipants.subtitle') }}
        </p>
      </div>

      <section
        class="flex flex-col gap-1.5"
        :class="{ 'pointer-events-none opacity-50': saving }"
        :inert="saving || undefined"
        :aria-busy="saving || undefined"
        data-testid="members"
      >
        <div class="flex items-center justify-between gap-2">
          <UiSectionTitle>{{
            t('adminEdition.addParticipants.members', {
              count: members.length,
            })
          }}</UiSectionTitle>
          <button
            type="button"
            class="min-h-11 px-1 text-sm font-bold text-primary-ink"
            @click="chooseAll"
          >
            {{
              allChosen
                ? t('adminEdition.addParticipants.noneChosen')
                : t('adminEdition.addParticipants.allChosen')
            }}
          </button>
        </div>
        <UiSearchField
          v-if="searchable"
          v-model="query"
          class="mb-1.5"
          :label="t('adminEdition.screen.lists.search')"
          :clear-label="t('adminEdition.screen.lists.clear')"
        />
        <UiList>
          <li
            v-if="view.shown.length === 0"
            class="px-4 py-3 text-sm text-muted"
          >
            {{ t('adminEdition.screen.lists.noMatch') }}
          </li>
          <UiFoldedRows
            :fold="view"
            :key-of="(p) => p.id"
            :avatar-of="(p) => p.avatar"
            :more-label="
              (count) => t('adminEdition.screen.lists.more', { count })
            "
            :collapse-label="t('adminEdition.screen.lists.collapse')"
            @more="expanded = true"
            @collapse="expanded = false"
          >
            <template #row="{ item: p }">
              <UiCheckRow
                :avatar="p.avatar"
                :title="fullName(p)"
                :subtitle="p.email ?? t('adminEdition.screen.emails.noEmail')"
                :label="
                  t('adminEdition.addParticipants.choose', {
                    name: fullName(p),
                  })
                "
                :checked="isChosen(p.id)"
                @update:checked="(on) => choose(p.id, on)"
              />
            </template>
          </UiFoldedRows>
        </UiList>
      </section>

      <UiList :title="t('adminEdition.addParticipants.someoneNew')">
        <UiListItem
          :to="`/f/${slug}/membres/nouvelle?edition=${id}`"
          icon="i-lucide-user-plus"
          :title="t('adminEdition.addParticipants.create')"
          :subtitle="t('adminEdition.addParticipants.createHint')"
        />
        <UiListItem
          :to="`/f/${slug}/invitation`"
          icon="i-lucide-link"
          :title="t('adminEdition.screen.empty.invite')"
          :subtitle="t('adminEdition.addParticipants.inviteHint')"
        />
      </UiList>

      <UiStickyFooter>
        <UButton
          block
          size="xl"
          class="h-13 justify-center text-[17px] font-bold"
          :disabled="saving"
          :loading="busy"
          :label="
            busy
              ? t('common.actions.saving')
              : t('adminEdition.addParticipants.save', { count })
          "
          @click="onSave"
        />
      </UiStickyFooter>
    </AdminQueryState>
  </AdminScreen>
</template>
