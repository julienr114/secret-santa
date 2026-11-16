<script setup lang="ts">
import { fullName } from '#server/utils/people';
import type { Participant } from '#server/database/editions';
import { sortParticipants } from '#server/utils/editions';
import { FOLD_STEP, listView } from '#shared/utils/lists';
import type { DrawCheck } from '~/composables/queries/useEdition';

// Step 1 of an edition, "Préparer": what to do now (check the list, then
// start the draw), the participants, and what can be done if wished
// (let people know before the draw, exclusions). Nothing about sending:
// the follow-up starts with the draw (README 13.2).
const props = defineProps<{
  slug: string;
  editionId: string;
  participants: Participant[];
  check: DrawCheck | undefined;
  /** First names of active people of the group left out of the edition. */
  missing: string[];
  exclusionCount: number;
}>();
const emit = defineEmits<{ draw: [] }>();
const { t, tk, locale } = useT();
const errorMessage = useErrorMessage();

const base = computed(() => `/admin/${props.slug}/editions/${props.editionId}`);
const sorted = computed(() =>
  sortParticipants(props.participants, 'preparing'),
);
/**
 * The line under a participant before the draw: their number of ideas,
 * and the language of their messages when it is not the organiser's.
 * @param p - The participant.
 * @returns The line, or undefined when there is nothing to say.
 */
const subtitleOf = (p: Participant) =>
  [
    p.wishesCount > 0 && t('common.count.ideas', { count: p.wishesCount }),
    p.language !== locale.value &&
      tk(`adminEdition.screen.prepare.messagesIn.${p.language}`),
  ]
    .filter(Boolean)
    .join(' · ') || undefined;
const empty = computed(() => props.participants.length === 0);
const problem = computed(() =>
  props.check && !props.check.ready ? props.check.problem : null,
);
/** The people the draw cannot place, each with why, and their icon. */
const blockedPeople = computed(() => {
  const avatarOf = (name: string) =>
    props.participants.find((p) => p.firstName === name)?.avatar;
  return [
    ...(problem.value?.blocked ?? []).map((name) => ({
      name,
      avatar: avatarOf(name),
      why: t('adminEdition.screen.impossible.blocked'),
    })),
    ...(problem.value?.constrained ?? []).map((name) => ({
      name,
      avatar: avatarOf(name),
      why: t('adminEdition.screen.impossible.constrained'),
    })),
  ];
});
const problemHelp = computed(() =>
  problem.value?.reason === 'no_solution'
    ? t('adminEdition.screen.impossible.help', {
        count: props.participants.length,
      })
    : errorMessage({ statusMessage: problem.value?.reason }),
);

// Past ten people, a search; past twelve, the list folds after six rows.
const SEARCH_FROM = 10;
const SHOWN = 6;
const query = ref('');
const opened = ref(0);
const searchable = computed(() => props.participants.length > SEARCH_FROM);
const view = computed(() =>
  listView(sorted.value, {
    query: query.value,
    opened: opened.value,
    shown: SHOWN,
    nameOf: fullName,
  }),
);
const missingText = computed(() =>
  props.missing.length === 0
    ? undefined
    : t('adminEdition.cockpit.missing', {
        count: props.missing.length,
        names: new Intl.ListFormat(locale.value, {
          type: 'conjunction',
        }).format(props.missing),
      }),
);
</script>

<template>
  <UiActionCard
    v-if="empty"
    :eyebrow="t('adminEdition.screen.now')"
    :title="t('adminEdition.screen.empty.title')"
    data-testid="action-card"
  >
    <p class="text-sm text-muted">{{ t('adminEdition.screen.empty.body') }}</p>
    <template #action>
      <UButton
        :to="`${base}/ajouter`"
        block
        size="xl"
        icon="i-lucide-user-plus"
        class="min-h-14 justify-center font-bold"
        :label="t('adminEdition.screen.prepare.add')"
      />
      <UButton
        :to="`/admin/${slug}/invitation`"
        block
        variant="ghost"
        class="min-h-11 justify-center font-semibold"
        :label="t('adminEdition.screen.empty.invite')"
      />
    </template>
  </UiActionCard>
  <UiActionCard
    v-else-if="problem"
    :eyebrow="t('adminEdition.screen.impossible.eyebrow')"
    :title="t('adminEdition.screen.impossible.title')"
    data-testid="action-card"
  >
    <ul v-if="blockedPeople.length" class="flex flex-col gap-2">
      <li
        v-for="person in blockedPeople"
        :key="person.name"
        class="flex items-center gap-2.5 text-sm"
      >
        <UiAvatar v-if="person.avatar" :avatar="person.avatar" size="sm" />
        <span
          ><strong>{{ person.name }}</strong> : {{ person.why }}</span
        >
      </li>
    </ul>
    <p class="text-sm text-muted" role="alert">{{ problemHelp }}</p>
    <template #action>
      <UButton
        :to="`${base}/exclusions`"
        block
        size="xl"
        icon="i-lucide-ban"
        class="min-h-14 justify-center font-bold"
        :label="t('adminEdition.screen.impossible.exclusions')"
      />
      <UButton
        :to="`${base}/ajouter`"
        block
        variant="outline"
        icon="i-lucide-user-plus"
        class="min-h-11 justify-center"
        :label="t('adminEdition.screen.prepare.add')"
      />
    </template>
  </UiActionCard>
  <UiActionCard
    v-else
    :eyebrow="t('adminEdition.screen.now')"
    :title="t('adminEdition.screen.prepare.title')"
    :help="t('adminEdition.screen.prepare.help')"
    data-testid="action-card"
  >
    <USkeleton v-if="!check" class="h-5 w-3/4 rounded bg-skeleton" />
    <p v-else class="flex items-start gap-2 text-sm text-muted">
      <UIcon
        name="i-lucide-check"
        class="mt-0.5 size-4 shrink-0 text-success"
      />
      {{
        t('adminEdition.screen.prepare.ready', {
          count: check.participantCount,
        })
      }}
    </p>
    <template #action>
      <UButton
        block
        size="xl"
        class="min-h-14 justify-center font-bold"
        icon="i-lucide-sparkle"
        :disabled="!check?.ready"
        :label="t('adminEdition.screen.prepare.action')"
        @click="emit('draw')"
      />
    </template>
  </UiActionCard>

  <section class="flex flex-col gap-1.5" data-testid="participants">
    <UiSectionTitle>{{
      empty
        ? t('adminEdition.screen.empty.list')
        : t('common.count.participants', { count: participants.length })
    }}</UiSectionTitle>
    <UiSearchField
      v-if="searchable"
      v-model="query"
      class="mb-1.5"
      :label="t('adminEdition.screen.lists.search')"
      :clear-label="t('adminEdition.screen.lists.clear')"
    />
    <UiList>
      <li v-if="empty" class="px-4 py-3 text-sm text-muted">
        {{ t('adminEdition.screen.empty.none') }}
      </li>
      <li
        v-else-if="view.shown.length === 0"
        class="px-4 py-3 text-sm text-muted"
      >
        {{ t('adminEdition.screen.lists.noMatch') }}
      </li>
      <UiFoldedRows
        :fold="view"
        :key-of="(p) => p.participationId"
        :avatar-of="(p) => p.avatar"
        :more-label="(count) => t('adminEdition.screen.lists.more', { count })"
        :collapse-label="t('adminEdition.screen.lists.collapse')"
        @more="opened += FOLD_STEP"
        @collapse="opened = 0"
      >
        <template #row="{ item: p }">
          <UiListItem
            :avatar="p.avatar"
            :to="`${base}/participants/${p.participationId}`"
            :title="fullName(p)"
            :subtitle="subtitleOf(p)"
          />
        </template>
      </UiFoldedRows>
      <UiListItem
        v-if="!empty"
        :to="`${base}/ajouter`"
        icon="i-lucide-user-plus"
        :title="t('adminEdition.screen.prepare.add')"
        :subtitle="missingText"
      />
    </UiList>
  </section>

  <UiList :title="t('adminEdition.screen.prepare.optional')">
    <UiListItem
      :to="`${base}/emails?type=invitation`"
      icon="i-lucide-mail"
      :title="t('adminEdition.screen.prepare.notifyBefore')"
      :subtitle="t('adminEdition.screen.prepare.notifyBeforeHint')"
    />
    <UiListItem
      :to="`${base}/exclusions`"
      icon="i-lucide-ban"
      :title="t('adminEdition.screen.prepare.exclusions')"
      :subtitle="
        exclusionCount > 0
          ? t('adminEdition.screen.prepare.exclusionsCount', {
              count: exclusionCount,
            })
          : t('adminEdition.screen.prepare.exclusionsNone')
      "
    />
  </UiList>
</template>
