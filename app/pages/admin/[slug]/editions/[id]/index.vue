<script setup lang="ts">
import { fullName } from '#server/utils/people';
import { formatEventDate, isIsoDay, partyIsOver } from '#server/utils/rules';
import {
  useDashboardQuery,
  useEditionQuery,
  usePeopleQuery,
} from '~/composables/queries/useGroup';
import {
  useCheckQuery,
  useCloseMutation,
  useDrawMutation,
} from '~/composables/queries/useEdition';

// The edition screen (README 11): where
// the edition stands in three steps, what to do now, the participants,
// then what can be done later. Each step has its own component; the
// sheets (draw, send, date) are opened from here.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const id = computed(() => String(route.params.id));
const toast = useToast();
const { t, locale } = useT();
const errorMessage = useErrorMessage();
/**
 * Shows an error in a toast.
 * @param error - The error of a mutation.
 * @returns Nothing.
 */
const onError = (error: unknown) =>
  toast.add({ title: errorMessage(error), color: 'error' });

const edition = useEditionQuery(slug, id);
const dashboard = useDashboardQuery(slug);
const people = usePeopleQuery(slug);
const check = useCheckQuery(slug, id);
const drawMutation = useDrawMutation(slug, id);
const close = useCloseMutation(slug, id);

const status = computed(
  () => edition.data.value?.edition.status ?? 'preparing',
);
const rules = computed(() => edition.data.value?.rules);
const participants = computed(() => edition.data.value?.participants ?? []);
const label = computed(
  () =>
    edition.data.value?.edition.label ??
    t('adminEdition.general.editionFallback'),
);
useHead({ title: () => `${label.value} — ${t('common.appName')}` });
const screen = computed(() => ({ back: `/admin/${slug.value}` }));
const subtitle = computed(() =>
  [
    dashboard.data.value?.group.name,
    status.value === 'closed'
      ? dateText.value &&
        t('adminEdition.screen.closed.partedOn', { date: dateText.value })
      : rules.value?.budget &&
        t('adminEdition.screen.budget', { budget: rules.value.budget }),
  ]
    .filter(Boolean)
    .join(' · '),
);

const today = new Date().toLocaleDateString('sv-SE');
const eventDate = computed(() => rules.value?.eventDate ?? '');
const hasDate = computed(() => isIsoDay(eventDate.value));
const dateText = computed(() =>
  hasDate.value ? formatEventDate(eventDate.value, locale.value) : null,
);
const steps = useEditionSteps(status, eventDate);
// Closing waits for the day after the party (README 21.3).
const canClose = computed(
  () =>
    status.value === 'drawn' &&
    hasDate.value &&
    partyIsOver(eventDate.value, today),
);

// People of the group left out of the edition, for the add row and the
// draw sheet.
const missing = computed(() => {
  const inEdition = new Set(participants.value.map((p) => p.id));
  return (people.data.value?.persons ?? [])
    .filter((p) => p.active && !inEdition.has(p.id))
    .map(fullName);
});
const avatars = computed(() => participants.value.map((p) => p.avatar));
/** How many exclusions the draw applied, for a closed edition. */
const appliedExclusions = computed(
  () => edition.data.value?.edition.exclusionsAtDraw?.length ?? 0,
);
const exclusionCount = computed(
  () => people.data.value?.exclusions.length ?? 0,
);

const drawOpen = ref(false);
/**
 * Draws, then closes the sheet with a toast.
 * @returns Nothing: the mutation reports by itself.
 */
const runDraw = () =>
  drawMutation.mutate(undefined, {
    onSuccess: () => {
      drawOpen.value = false;
      toast.add({
        title: t('adminEdition.cockpit.drawDone'),
        icon: 'i-lucide-sparkles',
        color: 'success',
      });
    },
    onError,
  });
/**
 * Closes the edition.
 * @returns Nothing: the mutation reports by itself.
 */
const onClose = () => close.mutate(undefined, { onError });

// The send sheet follows one participant; once done, it moves on to the
// next one still to notify.
// Opened from a link to a participant (the former participant page).
const sendId = ref<string | null>(
  typeof route.query.envoyer === 'string' ? route.query.envoyer : null,
);
const sendTarget = computed(
  () =>
    participants.value.find((p) => p.participationId === sendId.value) ?? null,
);
const sendOpen = computed({
  get: () => sendTarget.value !== null,
  set: (open: boolean) => {
    if (!open) sendId.value = null;
  },
});
/**
 * Closes the send sheet once the message is on its way.
 * @returns Nothing.
 */
const onSent = () => {
  sendId.value = null;
};
const dateOpen = ref(false);
</script>

<template>
  <AdminScreen v-bind="screen">
    <AdminQueryState
      :pending="edition.isPending.value"
      :error="edition.error.value"
      :skeleton="['title', 'stepper', 'card', 'list']"
    >
      <AdminEditionHeader
        :title="label"
        :subtitle="subtitle"
        :date-text="status === 'closed' ? null : dateText"
        @edit-date="dateOpen = true"
      />
      <UiStepper :steps="steps" :label="t('adminEdition.screen.steps.label')" />

      <AdminPartyDateCard
        v-if="!hasDate && status !== 'closed'"
        :slug="slug"
        :edition-id="id"
      />

      <AdminEditionPrepare
        v-if="status === 'preparing'"
        :slug="slug"
        :edition-id="id"
        :participants="participants"
        :check="check.data.value"
        :missing="missing"
        :exclusion-count="exclusionCount"
        @draw="drawOpen = true"
      />
      <AdminEditionFollow
        v-else-if="status === 'drawn'"
        :slug="slug"
        :edition-id="id"
        :participants="participants"
        :can-close="canClose"
        :date-text="dateText"
        :closing="close.isPending.value"
        @send="(pid) => (sendId = pid)"
        @close="onClose"
      />
      <template v-else>
        <UiCard
          padding="lg"
          class="flex items-start gap-3.5"
          data-testid="closed-notice"
        >
          <span
            class="flex size-11 shrink-0 items-center justify-center rounded-full bg-success-soft text-success-ink"
            aria-hidden="true"
          >
            <UIcon name="i-lucide-archive" class="size-5.5" />
          </span>
          <div class="flex flex-col gap-1">
            <h2 class="font-display text-xl font-bold">
              {{ t('adminEdition.screen.closed.title') }}
            </h2>
            <p class="text-sm text-muted">
              {{ t('adminEdition.screen.closed.body') }}
            </p>
          </div>
        </UiCard>
        <AdminEditionResults
          v-if="participants.length"
          :id="id"
          :slug="slug"
          :people="participants"
          :title="
            t('adminEdition.cockpit.resultsTitle', {
              count: participants.length,
            })
          "
        />
        <UiList>
          <UiListItem
            :to="`/admin/${slug}/editions/${id}/exclusions`"
            icon="i-lucide-ban"
            icon-tone="neutral"
            :title="t('adminEdition.screen.closed.exclusions')"
            :subtitle="
              appliedExclusions > 0
                ? t('adminEdition.screen.prepare.exclusionsCount', {
                    count: appliedExclusions,
                  })
                : t('adminEdition.screen.closed.exclusionsNone')
            "
          />
          <UiListItem
            :to="`/admin/${slug}/journal`"
            icon="i-lucide-file-text"
            icon-tone="neutral"
            :title="t('adminEdition.screen.closed.journal')"
            :subtitle="t('adminEdition.screen.closed.journalHint')"
          />
        </UiList>
        <UButton
          :to="`/admin/${slug}/editions/nouvelle`"
          block
          size="xl"
          variant="outline"
          icon="i-lucide-plus"
          class="min-h-12 justify-center font-bold"
          :label="t('adminEdition.screen.closed.next')"
        />
      </template>
    </AdminQueryState>

    <AdminDrawSheet
      v-model:open="drawOpen"
      :slug="slug"
      :edition-id="id"
      :avatars="avatars"
      :exclusion-count="exclusionCount"
      :missing="missing"
      :loading="drawMutation.isPending.value"
      @confirm="runDraw"
    />
    <AdminSendSheet
      v-if="sendTarget"
      v-model:open="sendOpen"
      :slug="slug"
      :edition-id="id"
      :status="status"
      :participant="sendTarget"
      @sent="onSent"
    />
    <AdminPartyDateSheet
      v-model:open="dateOpen"
      :slug="slug"
      :edition-id="id"
      :value="eventDate"
    />
  </AdminScreen>
</template>
