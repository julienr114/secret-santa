<script setup lang="ts">
import {
  editionStep,
  followState,
  sortParticipants,
} from '#server/utils/editions';
import { formatEventDate, isIsoDay, partyIsOver } from '#server/utils/rules';
import type { Step } from '~/components/ui/Stepper.vue';
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

// The edition screen (README 11, redesigned on 15 November 2026): where
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
    rules.value?.budget &&
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
const step = computed(() => editionStep(status.value, eventDate.value, today));
const steps = computed<Step[]>(() => {
  const at = { prepare: 0, drawn: 1, party: 2 }[step.value];
  const done = status.value === 'closed';
  return (['prepare', 'draw', 'party'] as const).map((key, index) => ({
    label: t(`adminEdition.screen.steps.${key}`),
    state: done || index < at ? 'done' : index === at ? 'current' : 'todo',
    icon: index === 0 ? undefined : 'i-lucide-sparkle',
  }));
});
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
    .map((p) => p.firstName);
});
const exclusionCount = computed(
  () => people.data.value?.exclusions.length ?? 0,
);

const drawOpen = ref(false);
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
const onClose = () => close.mutate(undefined, { onError });

// The send sheet follows one participant; once done, it moves on to the
// next one still to notify.
const sendId = ref<string | null>(null);
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
const toNotify = computed(() =>
  sortParticipants(participants.value, status.value).filter(
    (p) => followState(p) === 'toNotify',
  ),
);
// The one below in the list, or back to the top.
const nextAfter = (participationId: string) => {
  const at = toNotify.value.findIndex(
    (p) => p.participationId === participationId,
  );
  return (
    [...toNotify.value.slice(at + 1), ...toNotify.value.slice(0, at)][0] ?? null
  );
};
const next = computed(() =>
  sendTarget.value && !sendTarget.value.messageSentAt
    ? nextAfter(sendTarget.value.participationId)
    : null,
);
const onSent = () => {
  sendId.value = next.value?.participationId ?? null;
};
const dateOpen = ref(false);
</script>

<template>
  <AdminScreen v-bind="screen">
    <AdminQueryState
      :pending="edition.isPending.value"
      :error="edition.error.value"
    >
      <AdminEditionHeader
        :title="label"
        :subtitle="subtitle"
        :date-text="dateText"
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
        <UiNotice variant="info" icon="i-lucide-archive">
          {{ t('adminEdition.screen.follow.closed') }}
        </UiNotice>
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
      </template>
    </AdminQueryState>

    <AdminDrawSheet
      v-model:open="drawOpen"
      :slug="slug"
      :edition-id="id"
      :avatars="participants.map((p) => p.avatar)"
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
      :next-name="next?.firstName ?? null"
      :left="toNotify.length"
      @sent="onSent"
      @skip="onSent"
    />
    <AdminDateSheet
      v-model:open="dateOpen"
      :slug="slug"
      :edition-id="id"
      :value="eventDate"
    />
  </AdminScreen>
</template>
