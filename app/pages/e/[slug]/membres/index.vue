<script setup lang="ts">
import { byName, fullName, type PublicPerson } from '#server/utils/people';
import { notDrawnBy } from '#shared/utils/exclusions';
import { MAX_PARTY_MEMBERS } from '#server/utils/parties';
import { listView } from '#shared/utils/lists';
import { usePeopleQuery } from '~/composables/queries/useGroup';

// The members of a group: one list, those who take part first, each with
// their address and who they never draw; then « Ajouter une personne ».
// An event has no invitation link: each Secret Santa has its own (ticket
// 116). At 30 members (docs/spec/v3/fete.md, V3FeteMembresComplet), the
// page says so, and a state takes the place of « Ajouter une personne ».
definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t, locale } = useT();
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const people = usePeopleQuery(slug);
const context = useScreenContext(slug);
useHead({ title: () => context.titleOf(t('adminGroup.people.title')) });
const screen = computed(() => ({ back: `/e/${slug.value}` }));

const persons = computed(() => people.data.value?.persons ?? []);
const activeCount = computed(
  () => persons.value.filter((person) => person.active).length,
);
const full = computed(() => activeCount.value >= MAX_PARTY_MEMBERS);

const { membersLine } = useMembersLine();
const exclusions = computed(() => people.data.value?.exclusions ?? []);
/** Those who take part first, then the others, by name in each. */
const sorted = computed(() =>
  persons.value.toSorted(
    (a, b) => Number(b.active) - Number(a.active) || byName(a, b),
  ),
);
/**
 * The line under a member: their address, and who they never draw; or
 * that they no longer take part.
 * @param person - The member.
 * @returns The line.
 */
const subtitleOf = (person: PublicPerson) => {
  if (!person.active) return t('adminGroup.people.inactive');
  const names = notDrawnBy(person.id, exclusions.value)
    .map((n) => persons.value.find((p) => p.id === n.personId))
    .filter((p): p is PublicPerson => Boolean(p))
    .map(fullName);
  return [
    person.email ?? t('adminEdition.screen.emails.noEmail'),
    names.length
      ? t('adminGroup.people.notDrawing', {
          names: new Intl.ListFormat(locale.value, {
            type: 'conjunction',
          }).format(names),
        })
      : '',
  ]
    .filter(Boolean)
    .join(' · ');
};

// Past ten people, a search; past twelve, six rows then a fold row.
const SEARCH_FROM = 10;
const SHOWN = 6;
const query = ref('');
const expanded = ref(false);
const searchable = computed(() => persons.value.length > SEARCH_FROM);
const view = computed(() =>
  listView(sorted.value, {
    query: query.value,
    expanded: expanded.value,
    shown: SHOWN,
    nameOf: fullName,
  }),
);
</script>

<template>
  <AdminScreen v-bind="screen">
    <div class="flex flex-col gap-1">
      <UiPageContext
        :parts="context.parts.value"
        :label="t('common.context')"
      />
      <UiPageTitle>{{ t('adminGroup.people.title') }}</UiPageTitle>
      <p
        v-if="full"
        class="text-[15px] font-bold text-toned"
        data-testid="members-count"
      >
        {{
          t('party.full.count', {
            count: activeCount,
            max: MAX_PARTY_MEMBERS,
          })
        }}
      </p>
    </div>
    <AdminQueryState
      :pending="people.isPending.value"
      :error="people.error.value"
      :skeleton="['list']"
      :rows="6"
    >
      <section class="flex flex-col gap-1.5" data-testid="members">
        <UiSectionTitle v-if="searchable">{{
          membersLine(persons)
        }}</UiSectionTitle>
        <UiSearchField
          v-if="searchable"
          v-model="query"
          class="mb-1.5"
          :label="t('adminEdition.screen.lists.search')"
          :clear-label="t('adminEdition.screen.lists.clear')"
        />
        <UiList>
          <li
            v-if="persons.length > 0 && view.shown.length === 0"
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
            <template #row="{ item: person }">
              <UiListItem
                :avatar="person.avatar"
                :to="`/e/${slug}/membres/${person.id}`"
                :title="fullName(person)"
                :subtitle="subtitleOf(person)"
                :class="{ 'opacity-50': !person.active }"
              />
            </template>
          </UiFoldedRows>
          <UiListItem
            v-if="full"
            icon="i-lucide-users"
            icon-tone="neutral"
            :title="t('party.full.title')"
            :subtitle="t('party.full.text', { max: MAX_PARTY_MEMBERS })"
            data-testid="party-full"
          />
          <UiListItem
            v-else
            :to="`/e/${slug}/membres/nouvelle`"
            icon="i-lucide-user-plus"
            :title="t('adminGroup.people.add')"
          />
        </UiList>
      </section>
    </AdminQueryState>
  </AdminScreen>
</template>
