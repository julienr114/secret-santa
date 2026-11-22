<script setup lang="ts">
import { byName, fullName, type PublicPerson } from '#server/utils/people';
import { notDrawnBy } from '#shared/utils/exclusions';
import { MAX_PARTY_MEMBERS } from '#server/utils/parties';
import { listView } from '#shared/utils/lists';
import { namesPart, type LinePart } from '#shared/utils/lines';
import type { EntryPart } from '#shared/utils/members';
import type { AddPlace } from '#server/database/membersPage';
import { usePeopleQuery } from '~/composables/queries/useGroup';

// The members of an event (docs/spec/v3/fete.md, « Les membres »,
// V3FeteMembres): one list, those still in first, each with by where they
// came in (« Secret Santa », « La liste de Camille »), who they never draw
// and whether they have no address. Nobody is added to the event itself
// (ticket 117): « Ajouter quelqu'un » has a line « Au Secret Santa » for
// each being prepared and « À ma liste » for each list of mine shared with
// its members. At 30 members (V3FeteMembresComplet), the page says so, a
// state takes the place of the section, and the Secret Santa says its link
// is paused.
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
 * The words of a way in: « Secret Santa », its name, « La liste de
 * Camille ».
 * @param entry - The way in.
 * @returns Its words.
 */
const entryText = (entry: EntryPart) => {
  if (entry.kind === 'list') {
    return part(namesPart('lines.list.of', [entry.holder]));
  }
  return entry.name ?? t('adminGroup.people.bySanta');
};
/**
 * The line under a member: by where they came in, who they never draw,
 * and that they have no address; or that they are no longer in.
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
    (people.data.value?.entries[person.id] ?? []).map(entryText).join(', '),
    names.length
      ? t('adminGroup.people.notDrawing', {
          names: new Intl.ListFormat(locale.value, {
            type: 'conjunction',
          }).format(names),
        })
      : '',
    person.email ? '' : t('adminGroup.people.noEmail'),
  ]
    .filter(Boolean)
    .join(' · ');
};

// « Ajouter quelqu'un »: always to something (ticket 117).
const places = computed(() =>
  (people.data.value?.places ?? []).filter(
    (place) => !full.value || place.kind === 'santa',
  ),
);
/**
 * Where a line of « Ajouter quelqu'un » leads.
 * @param place - The Secret Santa or the list.
 * @returns The path.
 */
const placeTo = (place: AddPlace) => {
  if (place.kind === 'list') return `/listes/${place.id}/inviter`;
  const at = `/admin/${slug.value}/editions/${place.id}`;
  return full.value ? `${at}/invitation` : `${at}/ajouter`;
};
/**
 * Its title: « Au Secret Santa » (with its name when several are being
 * prepared), « À ma liste ».
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
 * Its line: « 5 participants · lien actif », « En pause · l'événement est
 * complet », « Pour Léo, Zoé et moi ».
 * @param place - The Secret Santa or the list.
 * @returns The line.
 */
const placeSubtitle = (place: AddPlace) => {
  if (place.kind === 'list') {
    return place.forWhom ? part(place.forWhom as LinePart) : undefined;
  }
  if (full.value) return t('party.full.paused');
  return [
    part({
      key: 'lines.organiser.participants',
      params: { count: place.participants },
    }),
    place.linkActive ? t('adminGroup.people.linkActive') : '',
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
        </UiList>
      </section>
      <section
        v-if="places.length > 0"
        class="flex flex-col gap-1.5"
        data-testid="members-add"
      >
        <UiSectionTitle v-if="!full">{{
          t('adminGroup.people.add')
        }}</UiSectionTitle>
        <UiList>
          <UiListItem
            v-for="place in places"
            :key="place.id"
            :to="placeTo(place)"
            :icon="place.kind === 'santa' ? 'i-lucide-link' : 'i-lucide-list'"
            :title="placeTitle(place)"
            :subtitle="placeSubtitle(place)"
            :data-testid="`members-add-${place.kind}`"
          />
        </UiList>
      </section>
    </AdminQueryState>
  </AdminScreen>
</template>
