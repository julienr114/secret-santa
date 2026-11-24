<script setup lang="ts">
import { byName, fullName, type PublicPerson } from '#server/utils/people';
import { notDrawnBy } from '#shared/utils/exclusions';
import { MAX_PARTY_MEMBERS } from '#server/utils/parties';
import { listView } from '#shared/utils/lists';
import type { LinePart } from '#shared/utils/lines';
import { memberNotes, type MemberNote } from '#shared/utils/members';
import type { AddPlace } from '#server/database/membersPage';
import { usePeopleQuery } from '~/composables/queries/useGroup';

// The members of an event (docs/spec/v3/fete.md, « Les membres »,
// V3FeteMembres, ticket 158): one list, those still in first; under a
// first name only what sets them apart (« Organise », « Hors du Secret
// Santa », « ne tire pas Hugo », « pas d'adresse email »). Nobody is added
// to the event itself (ticket 117): one line, « Ajouter quelqu'un », goes
// straight to the one place where someone may be added (a Secret Santa
// being prepared, a list of mine shared with its members), or asks where
// in a sheet when there are several (V3FeteMembresAjouter); with none,
// « Créer un Secret Santa » and « Créer une liste de cadeaux », as on the
// home. At 30 members (V3FeteMembresComplet), the page says so, and a
// state takes the place of the line.
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
const { part } = useLineText();
const exclusions = computed(() => people.data.value?.exclusions ?? []);
/** Those who take part first, then the others, by name in each. */
const sorted = computed(() =>
  persons.value.toSorted(
    (a, b) => Number(b.active) - Number(a.active) || byName(a, b),
  ),
);
/**
 * The words of a note under a first name.
 * @param note - The note.
 * @returns Its words.
 */
const noteText = (note: MemberNote) => {
  if (note.kind === 'organises') return t('adminGroup.people.organises');
  if (note.kind === 'outside') return t('adminGroup.people.outside');
  if (note.kind === 'noSanta') return t('adminGroup.people.noSanta');
  if (note.kind === 'noEmail') return t('adminGroup.people.noEmail');
  const names = new Intl.ListFormat(locale.value, {
    type: 'conjunction',
  }).format(note.names);
  return note.kind === 'santas'
    ? names
    : t('adminGroup.people.notDrawing', { names });
};
/**
 * The line under a member: what sets them apart, the first word with a
 * capital (ticket 158); nothing when all is as usual; or that they are no
 * longer in.
 * @param person - The member.
 * @returns The line, or nothing.
 */
const subtitleOf = (person: PublicPerson) => {
  if (!person.active) return t('adminGroup.people.inactive');
  const line = memberNotes(
    {
      organises: people.data.value?.organising.includes(person.id) ?? false,
      takingPart: people.data.value?.takingPart[person.id] ?? [],
      notDrawing: notDrawnBy(person.id, exclusions.value)
        .map((n) => persons.value.find((p) => p.id === n.personId))
        .filter((p): p is PublicPerson => Boolean(p))
        .map(fullName),
      hasEmail: Boolean(person.email),
    },
    people.data.value?.santas ?? [],
  )
    .map(noteText)
    .join(' · ');
  return line
    ? line.charAt(0).toLocaleUpperCase(locale.value) + line.slice(1)
    : undefined;
};

// « Ajouter quelqu'un » (ticket 158): always to something; the state of
// a full event takes its place.
const places = computed(() =>
  full.value ? [] : (people.data.value?.places ?? []),
);
/**
 * Where a place leads: « Choisir les participants », « Inviter
 * quelqu'un ».
 * @param place - The Secret Santa or the list.
 * @returns The path.
 */
const placeTo = (place: AddPlace) =>
  place.kind === 'list'
    ? `/listes/${place.id}?partage=inviter`
    : `/admin/${slug.value}/editions/${place.id}/ajouter`;
/**
 * Its title: « Au Secret Santa » (with its name when several are being
 * prepared), « À ma liste de cadeaux ».
 * @param place - The Secret Santa or the list.
 * @returns The title.
 */
const placeTitle = (place: AddPlace) => {
  if (place.kind === 'list') return t('adminGroup.people.toList');
  return place.name
    ? t('adminGroup.people.toSantaNamed', { name: place.name })
    : t('adminGroup.people.toSanta');
};
/**
 * Its line in the sheet: what it is for; with several lists, for whom
 * each is.
 * @param place - The Secret Santa or the list.
 * @returns The line.
 */
const placeWhy = (place: AddPlace) => {
  if (place.kind === 'santa') return t('adminGroup.people.toSantaWhy');
  const lists = places.value.filter((one) => one.kind === 'list').length;
  return lists > 1 && place.forWhom
    ? part(place.forWhom as LinePart)
    : t('adminGroup.people.toListWhy');
};
const asking = ref(false);
/** With nowhere to add someone: what may be created, in its order. */
const creates = computed(() => {
  const create = people.data.value?.create;
  if (full.value || places.value.length > 0 || !create) return [];
  const santa = create.santa
    ? [
        {
          key: 'santa',
          to: `/admin/${slug.value}/editions/nouvelle`,
          label: t('party.secretSanta.organise'),
        },
      ]
    : [];
  const list = create.list
    ? [
        {
          key: 'list',
          to: `/listes/nouvelle?pour=${slug.value}`,
          label: t('party.lists.new'),
        },
      ]
    : [];
  return create.santaFirst ? [...santa, ...list] : [...list, ...santa];
});

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
        </UiList>
      </section>
      <UiList v-if="places.length > 0 || creates.length > 0">
        <UiListItem
          v-if="places.length === 1"
          icon="i-lucide-user-plus"
          :title="t('adminGroup.people.add')"
          :subtitle="placeTitle(places[0]!)"
          :to="placeTo(places[0]!)"
          data-testid="members-add"
        />
        <UiListItem
          v-else-if="places.length > 1"
          icon="i-lucide-user-plus"
          :title="t('adminGroup.people.add')"
          :chevron="true"
          :on-click="() => (asking = true)"
          data-testid="members-add"
        />
        <UiAddRow
          v-for="row in creates"
          :key="row.key"
          :to="row.to"
          :label="row.label"
          :data-testid="`members-create-${row.key}`"
        />
      </UiList>
      <UiSheet v-model:open="asking" :title="t('adminGroup.people.add')">
        <ul
          class="-mx-4 divide-y divide-divider border-y border-divider"
          data-testid="members-add-sheet"
        >
          <UiListItem
            v-for="place in places"
            :key="place.id"
            :to="placeTo(place)"
            :icon="
              place.kind === 'santa' ? 'i-lucide-mail' : 'i-lucide-list-checks'
            "
            :icon-tone="place.kind === 'santa' ? 'primary' : 'lilac'"
            :title="placeTitle(place)"
            :subtitle="placeWhy(place)"
            :data-testid="`members-add-${place.kind}`"
          />
        </ul>
      </UiSheet>
    </AdminQueryState>
  </AdminScreen>
</template>
