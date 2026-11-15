<script setup lang="ts">
import {
  NOTE_MAX,
  addNote,
  messageTypesFor,
  type MessageType,
  type NotePosition,
} from '#server/utils/messages';
import { formatEventDate, partyIsOver } from '#server/utils/rules';
import {
  useEditionQuery,
  usePeopleQuery,
} from '~/composables/queries/useGroup';
import {
  useCheckQuery,
  useClearWaiversMutation,
  useCloseMutation,
  useDrawMutation,
  useMessagesQuery,
  useSendEmailsMutation,
  useWaiveMutation,
} from '~/composables/queries/useEdition';
import { defaultMessageType } from '~/utils/labels';
import { participantStatusLine } from '~/utils/participantStatus';

// Edition cockpit (README section 11): the action of the moment, the
// participants with their badges ("consulté" above all), and a share
// button on every row.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const id = computed(() => String(route.params.id));
const toast = useToast();
const { t, tk, locale } = useT();
const errorMessage = useErrorMessage();
const onError = (error: unknown) =>
  toast.add({ title: errorMessage(error), color: 'error' });

const edition = useEditionQuery(slug, id);
const check = useCheckQuery(slug, id);
const drawMutation = useDrawMutation(slug, id);
const close = useCloseMutation(slug, id);

const status = computed(
  () => edition.data.value?.edition.status ?? 'preparing',
);
const label = computed(
  () =>
    edition.data.value?.edition.label ??
    t('adminEdition.general.editionFallback'),
);
useHead({
  title: computed(() => `${label.value} — ${t('common.appName')}`),
});
const screen = computed(() => ({
  back: `/admin/${slug.value}`,
}));

const canSend = computed(() => status.value !== 'closed');
const canEdit = computed(() => status.value === 'preparing');
const messageType = ref<MessageType>(defaultMessageType(status.value));
watch(status, (s) => {
  messageType.value = defaultMessageType(s);
});
const messageItems = computed(() =>
  messageTypesFor(status.value).map((value) => ({
    value,
    label: tk(`common.messageType.${value}`),
  })),
);
const messages = useMessagesQuery(slug, id, messageType);

const participants = computed(() => edition.data.value?.participants ?? []);
// Reminder, shown on the "add" row: active members left out of the edition.
const people = usePeopleQuery(slug);
const missing = computed(() => {
  const inEdition = new Set(participants.value.map((p) => p.id));
  return (people.data.value?.persons ?? []).filter(
    (p) => p.active && !inEdition.has(p.id),
  );
});
const missingText = computed(() => {
  const names = missing.value.map((p) => p.firstName);
  if (names.length === 0) return undefined;
  return t('adminEdition.cockpit.missing', {
    count: names.length,
    names: new Intl.ListFormat(locale.value, { type: 'conjunction' }).format(
      names,
    ),
  });
});
// Previous-year pairs can be allowed again for this edition, one by one.
const waive = useWaiveMutation(slug, id);
const clearWaivers = useClearWaiversMutation(slug, id);
const confirmWaiver = ref<string | null>(null);
const pairKey = (p: { giverId: string; receiverId: string }) =>
  `${p.giverId}>${p.receiverId}`;
const onWaive = (pair: { giverId: string; receiverId: string }) =>
  waive.mutate(
    { giverId: pair.giverId, receiverId: pair.receiverId },
    {
      onSettled: () => {
        confirmWaiver.value = null;
      },
      onError,
    },
  );
const personOf = (pid: string) => participants.value.find((p) => p.id === pid);
const firstNameOf = (pid: string) => personOf(pid)?.firstName ?? '?';
const viewedCount = computed(
  () => participants.value.filter((p) => p.viewCount > 0).length,
);
// Status line of each participant, with the number of ideas; nothing at
// all for someone with neither before the draw.
const subtitles = computed(() =>
  Object.fromEntries(
    participants.value.flatMap((p) => {
      const line = participantStatusLine(p, status.value, t);
      const ideas = p.wishesCount
        ? t('common.count.ideas', { count: p.wishesCount })
        : '';
      const label = [line?.label, ideas].filter(Boolean).join(' · ');
      return label
        ? [[p.participationId, { label, icon: line?.icon, tone: line?.tone }]]
        : [];
    }),
  ),
);
// Bulk sending by email: the guardian ticks who to write to in the list,
// then picks the message in a sheet. Only people with an address can be
// ticked.
const sendEmails = useSendEmailsMutation(slug, id);
const withEmail = computed(() => participants.value.filter((p) => p.email));
const selecting = ref(false);
const selectedIds = ref<string[]>([]);
const bulkSheetOpen = ref(false);
const bulkType = ref<MessageType>(defaultMessageType(status.value));
// Starts with those still to be reached; everyone if all were sent to.
const startSelecting = () => {
  const pending = withEmail.value.filter((p) => !p.messageSentAt);
  selectedIds.value = (pending.length > 0 ? pending : withEmail.value).map(
    (p) => p.participationId,
  );
  bulkType.value = messageType.value;
  selecting.value = true;
};
const stopSelecting = () => {
  selecting.value = false;
  bulkSheetOpen.value = false;
  selectedIds.value = [];
};
const isSelected = (participationId: string) =>
  selectedIds.value.includes(participationId);
const toggleSelected = (participationId: string) => {
  selectedIds.value = isSelected(participationId)
    ? selectedIds.value.filter((x) => x !== participationId)
    : [...selectedIds.value, participationId];
};
const allSelected = computed(
  () => selectedIds.value.length === withEmail.value.length,
);
const toggleAll = () => {
  selectedIds.value = allSelected.value
    ? []
    : withEmail.value.map((p) => p.participationId);
};
// The organiser's own words, added to what is sent. They follow the rule
// of the edition (set in the group's rules) until the organiser types
// something else here, which then serves for every participant until the
// page is left.
const noteOverride = ref<string | null>(null);
const note = computed({
  get: () => noteOverride.value ?? edition.data.value?.rules.messageNote ?? '',
  set: (value: string) => {
    noteOverride.value = value;
  },
});
const notePositionOverride = ref<NotePosition | null>(null);
const notePosition = computed({
  get: () =>
    notePositionOverride.value ??
    edition.data.value?.rules.messageNotePosition ??
    'after',
  set: (value: NotePosition) => {
    notePositionOverride.value = value;
  },
});
const notePositionItems = useNotePositionItems();
// What the bulk send will say, shown for the first person ticked (each
// one gets it with their own first name, link and language).
const bulkMessages = useMessagesQuery(slug, id, bulkType);
const bulkPreview = computed(() => {
  const first = participants.value.find((p) =>
    selectedIds.value.includes(p.participationId),
  );
  const text = first
    ? bulkMessages.data.value?.messages[first.participationId]?.text
    : undefined;
  return first && text
    ? {
        name: first.firstName,
        text: addNote(text, note.value, notePosition.value),
      }
    : null;
});
const onSendBulk = () =>
  sendEmails.mutate(
    {
      type: bulkType.value,
      audience: 'all',
      participationIds: selectedIds.value,
      note: note.value,
      notePosition: notePosition.value,
    },
    {
      onSuccess: ({ sent, left }) => {
        toast.add({
          title: t('adminEdition.cockpit.email.sent', { count: sent }),
          description: left
            ? t('adminEdition.cockpit.email.left', { count: left })
            : undefined,
          color: 'success',
          icon: 'i-lucide-mail-check',
        });
        stopSelecting();
      },
      onError: (error) => {
        bulkSheetOpen.value = false;
        onError(error);
      },
    },
  );
watch(status, stopSelecting);
// The send button of a row opens a sheet: the language of the message,
// then how to send it (phone share sheet, copy, email if the group has it).
const sendTargetId = ref<string | null>(null);
const sendTarget = computed(
  () =>
    participants.value.find((p) => p.participationId === sendTargetId.value) ??
    null,
);
const sendSheetOpen = computed({
  get: () => sendTarget.value !== null,
  set: (open: boolean) => {
    if (!open) sendTargetId.value = null;
  },
});
const onSend = (participationId: string) => {
  sendTargetId.value = participationId;
};
// Pairs excluded because of previous draws, while the list can change.
const previousPairs = computed(() =>
  canEdit.value ? (check.data.value?.previousPairs ?? []) : [],
);
const exclusionsFooter = computed(
  () =>
    [
      previousPairs.value.length > 0 &&
        t('adminEdition.cockpit.previousDrawsFooter'),
      check.data.value?.historyExclusions &&
        t('adminEdition.cockpit.pendingExclusions', {
          count: check.data.value.historyExclusions,
        }),
    ]
      .filter(Boolean)
      .join(' ') || undefined,
);
const messageLanguageOf = (language: string) =>
  t('adminEdition.cockpit.messageLanguage', {
    language: tk(`common.language.${language}`),
  });
// The party date in the guardian's language. Closing is only offered once
// it has passed; without a real date, nothing says it is too early.
const eventDateText = computed(() =>
  formatEventDate(edition.data.value?.rules.eventDate, locale.value),
);
const canClose = computed(() =>
  partyIsOver(
    edition.data.value?.rules.eventDate,
    new Date().toLocaleDateString('sv-SE'),
  ),
);
const subtitle = computed(() => {
  const rules = edition.data.value?.rules;
  return [
    rules?.budget && t('adminEdition.cockpit.budget', { budget: rules.budget }),
    rules?.eventDate &&
      t('adminEdition.cockpit.eventDate', { date: eventDateText.value }),
  ]
    .filter(Boolean)
    .join(' · ');
});

const confirmDraw = ref(false);
const confirmClose = ref(false);
const runDraw = () =>
  drawMutation.mutate(undefined, {
    onSuccess: () => {
      confirmDraw.value = false;
      toast.add({
        title: t('adminEdition.cockpit.drawDone'),
        description: t('adminEdition.cockpit.drawDoneToast', {
          message: t('common.messageType.drawn'),
        }),
        icon: 'i-lucide-sparkles',
        color: 'success',
      });
    },
    onError,
  });
</script>

<template>
  <AdminScreen v-bind="screen">
    <AdminQueryState
      :pending="edition.isPending.value"
      :error="edition.error.value"
    >
      <div class="flex flex-col gap-1">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <UiPageTitle>{{ label }}</UiPageTitle>
          <AdminStatusBadge :code="status" />
        </div>
        <p v-if="subtitle" class="text-muted">{{ subtitle }}</p>
      </div>

      <!-- Action of the moment -->
      <template v-if="status === 'preparing'">
        <USkeleton
          v-if="check.isPending.value"
          class="h-24 w-full rounded-2xl"
        />
        <template v-else-if="check.data.value">
          <AdminStatusCard
            v-if="check.data.value.problem"
            emoji="🚧"
            tone="problem"
            :title="
              errorMessage({ statusMessage: check.data.value.problem.reason })
            "
            :description="
              [
                check.data.value.problem.blocked.length &&
                  t('adminEdition.cockpit.blocked', {
                    names: check.data.value.problem.blocked.join(', '),
                  }),
                check.data.value.problem.constrained.length &&
                  t('adminEdition.cockpit.constrained', {
                    names: check.data.value.problem.constrained.join(', '),
                  }),
              ]
                .filter(Boolean)
                .join(' ')
            "
          />
          <AdminStatusCard
            v-if="check.data.value.ready"
            emoji="🎲"
            :title="t('adminEdition.cockpit.drawPossible')"
            :description="
              t('adminEdition.cockpit.drawPossibleDescription', {
                count: check.data.value.participantCount,
              })
            "
          >
            <UButton
              v-if="!confirmDraw"
              block
              icon="i-lucide-sparkles"
              :label="t('adminEdition.cockpit.startDraw')"
              @click="confirmDraw = true"
            />
            <div v-else class="flex flex-col gap-2">
              <p
                v-if="missing.length"
                class="flex items-start gap-2 text-sm text-warning"
              >
                <UIcon
                  name="i-lucide-user-round-x"
                  class="mt-0.5 size-4 shrink-0"
                />
                <span>{{
                  t('adminEdition.cockpit.missingWarning', {
                    text: missingText ?? '',
                  })
                }}</span>
              </p>
              <p class="text-sm">
                {{ t('adminEdition.cockpit.drawIsFinal') }}
              </p>
              <div class="flex gap-2">
                <UButton
                  icon="i-lucide-sparkles"
                  :label="t('adminEdition.cockpit.drawNow')"
                  :loading="drawMutation.isPending.value"
                  @click="runDraw"
                />
                <UButton
                  variant="ghost"
                  color="neutral"
                  :label="t('adminEdition.cockpit.notYet')"
                  @click="confirmDraw = false"
                />
              </div>
            </div>
          </AdminStatusCard>
        </template>
      </template>

      <AdminStatusCard
        v-else-if="status === 'drawn'"
        emoji="🎁"
        :title="t('adminEdition.cockpit.drawDone')"
        :description="
          t('adminEdition.cockpit.drawnDescription', {
            viewed: viewedCount,
            total: participants.length,
          })
        "
        :progress="{ value: viewedCount, total: participants.length }"
      >
        <!-- Closing only makes sense once the party is over. -->
        <p v-if="!canClose" class="text-sm text-muted">
          {{ t('adminEdition.cockpit.closeLater', { date: eventDateText }) }}
        </p>
        <UButton
          v-else-if="!confirmClose"
          block
          variant="outline"
          color="neutral"
          icon="i-lucide-archive"
          :label="t('adminEdition.cockpit.closeAfterParty')"
          @click="confirmClose = true"
        />
        <div v-else class="flex flex-col gap-2">
          <p class="text-sm">
            {{ t('adminEdition.cockpit.closeExplanation') }}
          </p>
          <div class="flex gap-2">
            <UButton
              :label="t('adminEdition.cockpit.close')"
              :loading="close.isPending.value"
              @click="close.mutate(undefined, { onError })"
            />
            <UButton
              variant="ghost"
              color="neutral"
              :label="t('common.actions.cancel')"
              @click="confirmClose = false"
            />
          </div>
        </div>
      </AdminStatusCard>

      <AdminStatusCard
        v-else
        emoji="📦"
        tone="quiet"
        :title="t('adminEdition.cockpit.closedNotice')"
      />

      <!-- Sending: the message is chosen in the sheets, not here. -->
      <section v-if="canSend" class="flex flex-col gap-2">
        <template v-if="!selecting">
          <p v-if="withEmail.length === 0" class="px-1 text-xs text-muted">
            {{ t('adminEdition.cockpit.email.noAddress') }}
          </p>
          <UiList v-else :footer="t('adminEdition.cockpit.email.spamTip')">
            <UiListItem
              icon="i-lucide-users"
              :title="t('adminEdition.cockpit.email.bulkTitle')"
              :subtitle="t('adminEdition.cockpit.email.bulkHint')"
            >
              <template #trailing>
                <UButton
                  size="md"
                  class="shrink-0 rounded-full"
                  icon="i-lucide-send"
                  variant="soft"
                  :aria-label="t('adminEdition.cockpit.email.select')"
                  @click="startSelecting"
                />
              </template>
            </UiListItem>
          </UiList>
        </template>
      </section>

      <!-- Participants -->
      <p
        v-if="participants.length === 0 && status === 'closed'"
        class="text-muted"
      >
        {{ t('adminEdition.cockpit.empty') }}
      </p>
      <UiList
        v-else-if="status !== 'closed'"
        :title="t('common.count.participants', { count: participants.length })"
      >
        <li
          v-if="participants.length === 0"
          class="px-4 py-3 text-sm text-muted"
        >
          {{ t('adminEdition.cockpit.empty') }}
        </li>
        <UiListItem
          v-for="p in participants"
          :key="p.participationId"
          :avatar="p.avatar"
          :to="
            selecting
              ? undefined
              : `/admin/${slug}/editions/${id}/participants/${p.participationId}`
          "
          :on-click="
            selecting && p.email
              ? () => toggleSelected(p.participationId)
              : undefined
          "
          :class="{ 'opacity-60': selecting && !p.email }"
          :title="p.firstName"
          :chevron="!canSend"
        >
          <template v-if="selecting" #subtitle>
            <span class="truncate">{{
              p.email ?? t('adminEdition.share.noEmail')
            }}</span>
          </template>
          <template v-else-if="subtitles[p.participationId]" #subtitle>
            <UIcon
              v-if="subtitles[p.participationId]?.icon"
              :name="subtitles[p.participationId]?.icon"
              class="size-4 shrink-0"
              :class="subtitles[p.participationId]?.tone"
            />
            <span class="truncate">{{
              subtitles[p.participationId]?.label
            }}</span>
          </template>
          <template #trailing>
            <!-- The language this person's messages are written in. -->
            <UBadge
              color="neutral"
              variant="subtle"
              size="sm"
              class="shrink-0"
              :label="p.language.toUpperCase()"
              :title="messageLanguageOf(p.language)"
              :aria-label="messageLanguageOf(p.language)"
            />
            <UCheckbox
              v-if="selecting"
              :model-value="isSelected(p.participationId)"
              :disabled="!p.email"
              :aria-label="
                t('adminEdition.cockpit.email.selectPerson', {
                  name: p.firstName,
                })
              "
              class="pointer-events-none shrink-0"
              tabindex="-1"
            />
            <UButton
              v-else-if="canSend"
              size="md"
              class="shrink-0 rounded-full"
              icon="i-lucide-send"
              :color="p.messageSentAt ? 'neutral' : 'primary'"
              :variant="p.messageSentAt ? 'outline' : 'soft'"
              :aria-label="
                p.messageSentAt
                  ? t('adminEdition.cockpit.resendLinkOf', {
                      name: p.firstName,
                    })
                  : t('adminEdition.cockpit.sendLinkOf', { name: p.firstName })
              "
              :disabled="!messages.data.value?.messages[p.participationId]"
              @click.prevent.stop="onSend(p.participationId)"
            />
          </template>
        </UiListItem>
        <!-- Adding closes the list. -->
        <UiListItem
          v-if="canEdit && !selecting"
          :to="`/admin/${slug}/editions/${id}/ajouter`"
          icon="i-lucide-user-plus"
          :title="t('adminEdition.cockpit.addParticipants')"
          :subtitle="missingText"
        >
          <template v-if="missing.length" #trailing>
            <span class="size-2.5 rounded-full bg-warning" aria-hidden="true" />
          </template>
        </UiListItem>
      </UiList>

      <UiList v-if="status === 'drawn'">
        <UiListItem
          v-if="status === 'drawn'"
          :to="`/admin/${slug}/editions/${id}/annuler`"
          icon="i-lucide-rotate-ccw"
          :title="t('adminEdition.cockpit.cancelAndRedraw')"
          :subtitle="t('adminEdition.cockpit.cancelAndRedrawHint')"
          tone="danger"
        />
        <UiListItem
          v-if="status === 'drawn'"
          :to="`/admin/${slug}/editions/${id}/voir-le-tirage`"
          icon="i-lucide-eye"
          :title="t('adminEdition.cockpit.revealOne')"
          :subtitle="t('adminEdition.cockpit.revealOneHint')"
        />
      </UiList>
      <AdminEditionResults
        v-if="status === 'closed' && participants.length"
        :id="id"
        :slug="slug"
        :people="participants"
        :title="
          t('adminEdition.cockpit.resultsTitle', { count: participants.length })
        "
      />
      <!-- One list for every pair that cannot draw each other: the
           group's exclusions, and the pairs of previous draws, which only
           say why and can be lifted for this edition. -->
      <AdminExclusions
        :slug="slug"
        :editable="canEdit"
        :archived="
          status === 'drawn' || status === 'closed'
            ? (edition.data.value?.edition.exclusionsAtDraw ?? [])
            : undefined
        "
        :has-extra="previousPairs.length > 0"
        :title="
          status === 'drawn' || status === 'closed'
            ? t('adminEdition.cockpit.exclusionsAppliedTitle')
            : t('adminEdition.cockpit.exclusionsTitle')
        "
        :footer="exclusionsFooter"
      >
        <template #extra>
          <UiListItem
            v-for="pair in previousPairs"
            :key="`${pair.editionLabel}-${pair.giverId}`"
            :title="`${firstNameOf(pair.giverId)} → ${firstNameOf(pair.receiverId)}`"
            :subtitle="
              t('adminEdition.cockpit.previousDrawReason', {
                edition: pair.editionLabel,
              })
            "
            :chevron="false"
          >
            <template #trailing>
              <div
                v-if="confirmWaiver === pairKey(pair)"
                class="flex shrink-0 items-center gap-1"
              >
                <UButton
                  size="sm"
                  :label="t('adminEdition.cockpit.waive')"
                  :loading="waive.isPending.value"
                  @click.stop="onWaive(pair)"
                />
                <UButton
                  size="sm"
                  variant="ghost"
                  color="neutral"
                  :label="t('common.actions.cancel')"
                  @click.stop="confirmWaiver = null"
                />
              </div>
              <UButton
                v-else
                variant="ghost"
                color="neutral"
                icon="i-lucide-x"
                :aria-label="
                  t('adminEdition.cockpit.waiveLabel', {
                    giver: firstNameOf(pair.giverId),
                    receiver: firstNameOf(pair.receiverId),
                  })
                "
                @click.stop="confirmWaiver = pairKey(pair)"
              />
            </template>
            <template #leading>
              <span
                class="flex w-[3.25rem] shrink-0 items-center"
                aria-hidden="true"
              >
                <UiAvatar
                  v-if="personOf(pair.giverId)"
                  :avatar="personOf(pair.giverId)!.avatar"
                  size="sm"
                  class="outline-2 outline-white"
                />
              </span>
            </template>
          </UiListItem>
        </template>
      </AdminExclusions>
      <div
        v-if="canEdit && check.data.value?.waivedCount"
        class="-mt-4 flex items-center justify-between gap-2 px-1 text-xs text-muted"
      >
        <span>
          {{
            t('adminEdition.cockpit.waived', {
              count: check.data.value.waivedCount,
            })
          }}
        </span>
        <UButton
          size="xs"
          variant="link"
          :label="t('adminEdition.cockpit.restoreAll')"
          :loading="clearWaivers.isPending.value"
          @click="clearWaivers.mutate(undefined, { onError })"
        />
      </div>
    </AdminQueryState>
    <!-- Selection bar: stays at the bottom while ticking people. -->
    <div
      v-if="selecting"
      class="fixed inset-x-0 bottom-0 z-30 border-t border-default bg-page/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <UContainer class="flex items-center gap-2 py-3">
        <div class="min-w-0 grow">
          <p class="truncate text-sm font-medium" aria-live="polite">
            {{
              t('adminEdition.cockpit.email.selected', {
                count: selectedIds.length,
              })
            }}
          </p>
          <button
            type="button"
            class="text-xs text-primary underline"
            @click="toggleAll"
          >
            {{
              allSelected
                ? t('adminEdition.cockpit.email.selectNone')
                : t('adminEdition.cockpit.email.selectAll')
            }}
          </button>
        </div>
        <UButton
          variant="ghost"
          color="neutral"
          :label="t('common.actions.cancel')"
          @click="stopSelecting"
        />
        <UButton
          icon="i-lucide-mail"
          :disabled="selectedIds.length === 0"
          :label="t('adminEdition.cockpit.email.chooseMessage')"
          @click="bulkSheetOpen = true"
        />
      </UContainer>
    </div>
    <div v-if="selecting" class="h-20" aria-hidden="true" />
    <UDrawer
      v-model:open="bulkSheetOpen"
      :title="
        t('adminEdition.cockpit.email.sheetTitle', {
          count: selectedIds.length,
        })
      "
      :description="t('adminEdition.cockpit.email.spamTip')"
    >
      <template #body>
        <URadioGroup
          v-model="bulkType"
          :items="messageItems"
          :legend="t('adminEdition.cockpit.messageTitle')"
          class="py-2"
        />
        <UFormField
          :label="t('adminEdition.share.note')"
          :help="t('adminEdition.share.noteHint')"
          class="py-2"
        >
          <UTextarea
            v-model="note"
            :rows="2"
            :maxlength="NOTE_MAX"
            autoresize
            class="w-full"
          />
        </UFormField>
        <URadioGroup
          v-if="note.trim()"
          v-model="notePosition"
          :items="notePositionItems"
          :legend="t('adminEdition.share.notePlace')"
          orientation="horizontal"
        />
        <div class="flex flex-col gap-1.5 py-2">
          <span
            class="text-xs font-semibold tracking-wide text-muted uppercase"
            >{{
              bulkPreview
                ? t('adminEdition.share.previewFor', { name: bulkPreview.name })
                : t('adminEdition.share.preview')
            }}</span
          >
          <UiTextPreview v-if="bulkPreview">
            {{ bulkPreview.text }}
          </UiTextPreview>
          <USkeleton v-else class="h-28 w-full rounded-lg" />
          <p class="text-xs text-muted">
            {{ t('adminEdition.share.previewEmailNote') }}
          </p>
        </div>
      </template>
      <template #footer>
        <UButton
          block
          icon="i-lucide-mail"
          :loading="sendEmails.isPending.value"
          :label="
            t('adminEdition.cockpit.email.sendCount', {
              count: selectedIds.length,
            })
          "
          @click="onSendBulk"
        />
      </template>
    </UDrawer>
    <UDrawer
      v-model:open="sendSheetOpen"
      :title="
        t('adminEdition.share.sheetTitle', {
          name: sendTarget?.firstName ?? '',
        })
      "
    >
      <template #body>
        <UiList v-if="sendTarget">
          <AdminSendOptions
            v-model:message-type="messageType"
            v-model:note="note"
            v-model:note-position="notePosition"
            :slug="slug"
            :edition-id="id"
            :participant="sendTarget"
            :status="status"
            :text="
              messages.data.value?.messages[sendTarget.participationId]?.text
            "
            @done="sendSheetOpen = false"
          />
        </UiList>
      </template>
    </UDrawer>
  </AdminScreen>
</template>
