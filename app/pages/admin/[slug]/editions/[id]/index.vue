<script setup lang="ts">
import { fullName } from '#server/utils/people';
import { formatEventDate, isIsoDay, partyIsOver } from '#server/utils/rules';
import {
  useDashboardQuery,
  useEditionQuery,
  usePeopleQuery,
} from '~/composables/queries/useGroup';
import {
  useAbandonAnswersMutation,
  useCheckQuery,
  useCloseMutation,
  useDrawMutation,
  useRevealDrawMutation,
  useStartAnswersMutation,
  useValidateAnswersMutation,
} from '~/composables/queries/useEdition';

// The edition screen (README 11): where
// the edition stands in three steps, what to do now, the participants,
// then what can be done later. Each step has its own component; the
// sheets (draw, send, date) are opened from here.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const router = useRouter();
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
const revealDraw = useRevealDrawMutation(slug, id);
const startAnswers = useStartAnswersMutation(slug, id);
const abandonAnswers = useAbandonAnswersMutation(slug, id);
const validateAnswers = useValidateAnswersMutation(slug, id);

const status = computed(
  () => edition.data.value?.edition.status ?? 'preparing',
);
const rules = computed(() => edition.data.value?.rules);
const participants = computed(() => edition.data.value?.participants ?? []);
/** Drawn by the app, or already elsewhere (README 22.12). */
const drawMode = computed(() => edition.data.value?.edition.drawMode ?? 'app');
/** Where the answers stand while they are collected, else null. */
const answers = computed(() =>
  status.value === 'preparing' ? (edition.data.value?.answers ?? null) : null,
);
const redrawn = computed(() => edition.data.value?.redrawn ?? false);
/** The organiser revealed who gave to whom (README 22.9). */
const revealed = computed(() =>
  Boolean(edition.data.value?.edition.revealedAt),
);
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
    status.value === 'closed' || partyReached.value
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
const steps = useEditionSteps(status, eventDate, revealed, drawMode);
/** From the day of the party, revealing is the action of the moment. */
const partyReached = computed(
  () => status.value === 'drawn' && hasDate.value && today >= eventDate.value,
);
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

// A draw already made elsewhere (README 22.12): start collecting the
// answers, give up on them, or validate them into a draw.
const startOpen = ref(false);
/** Each exclusion of the group, as « Camille et Hugo », for the sheet. */
const exclusionPairs = computed(() => {
  const persons = people.data.value?.persons ?? [];
  const nameOf = (personId: string) =>
    persons.find((p) => p.id === personId)?.firstName ?? '?';
  const list = new Intl.ListFormat(locale.value, { type: 'conjunction' });
  return (people.data.value?.exclusions ?? []).map((e) =>
    list.format([nameOf(e.giverId), nameOf(e.receiverId)]),
  );
});
/** The rule of the previous years would have applied to this draw. */
const historyApplies = computed(
  () =>
    (check.data.value?.historyExclusions ?? 0) +
      (check.data.value?.previousPairs.length ?? 0) >
    0,
);
/**
 * Starts collecting the answers, then closes the sheet.
 * @returns Nothing: the mutation reports by itself.
 */
const onStartAnswers = () =>
  startAnswers.mutate(undefined, {
    onSuccess: () => {
      startOpen.value = false;
    },
    onError,
  });
/**
 * Deletes the answers and goes back to the app's draw.
 * @returns Nothing: the mutation reports by itself.
 */
const onAbandonAnswers = () =>
  abandonAnswers.mutate(undefined, {
    onSuccess: () =>
      toast.add({
        title: t('adminEdition.answers.abandoned'),
        icon: 'i-lucide-rotate-ccw',
        color: 'success',
      }),
    onError,
  });
const validateOpen = ref(false);
/** The one whose answer follows from the others, for the sheet. */
const deducedName = computed(() => {
  const personId = answers.value?.deducedFor;
  return participants.value.find((p) => p.id === personId)?.firstName ?? null;
});
/**
 * Validates the answers into a draw, then closes the sheet with a toast.
 * @returns Nothing: the mutation reports by itself.
 */
const onValidateAnswers = () =>
  validateAnswers.mutate(undefined, {
    onSuccess: () => {
      validateOpen.value = false;
      toast.add({
        title: t('adminEdition.answers.validate.done'),
        icon: 'i-lucide-sparkles',
        color: 'success',
      });
    },
    onError,
  });

const revealOpen = ref(false);
/**
 * Reveals the results, then closes the sheet with a toast.
 * @param early - Before the day of the party.
 * @returns Nothing: the mutation reports by itself.
 */
const onReveal = (early: boolean) =>
  revealDraw.mutate(
    { early },
    {
      onSuccess: () => {
        revealOpen.value = false;
        toast.add({
          title: t('adminEdition.screen.reveal.done'),
          icon: 'i-lucide-eye',
          color: 'success',
        });
      },
      onError,
    },
  );

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
// Once the sheet is closed, the address forgets the person too: coming
// back to it (from the email screen, or by reloading) must not open their
// sheet again.
watch(sendId, (pid) => {
  if (pid || route.query.envoyer === undefined) return;
  const { envoyer: _envoyer, ...query } = route.query;
  void router.replace({ query });
});
/**
 * Opens « Personnaliser le message » for one person; the edition's address
 * keeps their sheet, which opens again on the way back.
 * @param participationId - The person's participation.
 * @returns Once on the screen.
 */
const onCustomize = async (participationId: string) => {
  await router.replace({ query: { envoyer: participationId } });
  await navigateTo(
    `/admin/${slug.value}/editions/${id.value}/message?pour=${participationId}`,
  );
};
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
        :date-text="
          status === 'closed' || revealed || partyReached ? null : dateText
        "
        @edit-date="dateOpen = true"
      />
      <UiStepper :steps="steps" :label="t('adminEdition.screen.steps.label')" />

      <AdminPartyDateCard
        v-if="!hasDate && status === 'preparing'"
        :slug="slug"
        :edition-id="id"
      />

      <AdminEditionAnswers
        v-if="status === 'preparing' && answers"
        :slug="slug"
        :edition-id="id"
        :participants="participants"
        :answers="answers"
        :abandoning="abandonAnswers.isPending.value"
        @send="(pid) => (sendId = pid)"
        @validate="validateOpen = true"
        @abandon="onAbandonAnswers"
      />
      <AdminEditionPrepare
        v-else-if="status === 'preparing'"
        :slug="slug"
        :edition-id="id"
        :participants="participants"
        :check="check.data.value"
        :missing="missing"
        :exclusion-count="exclusionCount"
        @draw="drawOpen = true"
        @elsewhere="startOpen = true"
      />
      <AdminEditionRevealed
        v-else-if="status === 'drawn' && revealed"
        :slug="slug"
        :edition-id="id"
        :participants="participants"
        :applied-exclusions="appliedExclusions"
        :closing="close.isPending.value"
        @close="onClose"
      />
      <AdminEditionFollow
        v-else-if="status === 'drawn'"
        :slug="slug"
        :edition-id="id"
        :participants="participants"
        :hints-on="rules?.giftHints !== 'none'"
        :redrawn="redrawn"
        :party-reached="partyReached"
        :can-close="canClose"
        :date-text="dateText"
        :closing="close.isPending.value"
        :budget="rules?.budget"
        :word="rules?.guardianMessage"
        @send="(pid) => (sendId = pid)"
        @close="onClose"
        @reveal="revealOpen = true"
      >
        <template v-if="!hasDate" #after-card>
          <AdminPartyDateCard :slug="slug" :edition-id="id" />
        </template>
      </AdminEditionFollow>
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
          <AdminEditionRuleRows :slug="slug" :edition-id="id" readonly />
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
      :redrawn="redrawn"
      :participant="sendTarget"
      :note-position="rules?.messageNotePosition ?? 'after'"
      :draw-mode="drawMode"
      @sent="onSent"
      @customize="onCustomize(sendTarget.participationId)"
    />
    <AdminStartAnswersSheet
      v-model:open="startOpen"
      :exclusions="exclusionPairs"
      :history="historyApplies"
      :loading="startAnswers.isPending.value"
      @confirm="onStartAnswers"
    />
    <AdminValidateAnswersSheet
      v-model:open="validateOpen"
      :count="participants.length"
      :deduced-name="answers?.card === 'oneMissing' ? deducedName : null"
      :loading="validateAnswers.isPending.value"
      @confirm="onValidateAnswers"
    />
    <AdminRevealSheet
      v-if="hasDate && status === 'drawn' && !revealed"
      v-model:open="revealOpen"
      :event-date="eventDate"
      :participants="participants"
      :loading="revealDraw.isPending.value"
      @confirm="onReveal"
    />
    <AdminPartyDateSheet
      v-model:open="dateOpen"
      :slug="slug"
      :edition-id="id"
      :value="eventDate"
    />
  </AdminScreen>
</template>
