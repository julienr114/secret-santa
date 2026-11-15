<script setup lang="ts">
import type { Participant } from '#server/database/editions';
import { sortParticipants } from '#server/utils/editions';
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
// The number of ideas, and the language of the messages when it is not
// the organiser's: nothing else before the draw.
const subtitleOf = (p: Participant) =>
  [
    p.wishesCount > 0 && t('common.count.ideas', { count: p.wishesCount }),
    p.language !== locale.value &&
      tk(`adminEdition.screen.prepare.messagesIn.${p.language}`),
  ]
    .filter(Boolean)
    .join(' · ') || undefined;
const problemText = computed(() => {
  const problem = props.check?.problem;
  if (!problem) return '';
  return [
    errorMessage({ statusMessage: problem.reason }),
    problem.blocked.length > 0 &&
      t('adminEdition.cockpit.blocked', { names: problem.blocked.join(', ') }),
    problem.constrained.length > 0 &&
      t('adminEdition.cockpit.constrained', {
        names: problem.constrained.join(', '),
      }),
  ]
    .filter(Boolean)
    .join(' ');
});
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
    :eyebrow="t('adminEdition.screen.now')"
    :title="t('adminEdition.screen.prepare.title')"
    :help="t('adminEdition.screen.prepare.help')"
    data-testid="action-card"
  >
    <USkeleton v-if="!check" class="h-5 w-3/4 rounded bg-skeleton" />
    <p
      v-else-if="check.ready"
      class="flex items-start gap-2 text-sm text-muted"
    >
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
    <p v-else class="flex items-start gap-2 text-sm text-error" role="alert">
      <UIcon name="i-lucide-triangle-alert" class="mt-0.5 size-4 shrink-0" />
      {{ problemText }}
    </p>
    <template #action>
      <UButton
        block
        icon="i-lucide-sparkle"
        :disabled="!check?.ready"
        :label="t('adminEdition.screen.prepare.action')"
        @click="emit('draw')"
      />
    </template>
  </UiActionCard>

  <UiList
    :title="t('common.count.participants', { count: participants.length })"
    data-testid="participants"
  >
    <UiListItem
      v-for="p in sorted"
      :key="p.participationId"
      :avatar="p.avatar"
      :to="`${base}/participants/${p.participationId}`"
      :title="p.firstName"
      :subtitle="subtitleOf(p)"
    />
    <UiListItem
      :to="`${base}/ajouter`"
      icon="i-lucide-user-plus"
      :title="t('adminEdition.screen.prepare.add')"
      :subtitle="missingText"
    />
  </UiList>

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
