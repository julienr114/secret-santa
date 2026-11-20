<script setup lang="ts">
import { fullName } from '#server/utils/people';
import type { EditionParticipant as Participant } from '~/composables/queries/useGroup';
import { preselectedForAnswers, sortByAnswer } from '#server/utils/answers';
import {
  followState,
  preselectedForEmail,
  sortParticipants,
} from '#server/utils/editions';
import { listView, stackOf } from '#shared/utils/lists';
import {
  addNote,
  messageTypesFor,
  type MessageType,
} from '#server/utils/messages';
import { useEditionQuery } from '~/composables/queries/useGroup';
import {
  useMessagesQuery,
  useSendEmailsMutation,
} from '~/composables/queries/useEdition';

// Sending one message by email to several participants: what it will
// look like, with « Personnaliser le message » to pick another or add a
// word, then who gets it (those still to notify start ticked; a whole row
// ticks; people without an address can only get one), then send. The
// choice and the ticks hold while customising.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const id = computed(() => String(route.params.id));
const editionPath = computed(() => `/admin/${slug.value}/editions/${id.value}`);
const { t, locale } = useT();
const toast = useMessages();
const errorMessage = useErrorMessage();
const goBack = useGoBack();
const context = useScreenContext(slug, id);
useHead({
  title: () => context.titleOf(t('adminEdition.screen.emails.title')),
});
const screen = computed(() => ({
  back: editionPath.value,
  bar: {
    title: t('adminEdition.screen.emails.title'),
    context: context.parts.value.map((part) => part.label).join(' · '),
    cancel: t('common.actions.cancel'),
  },
}));

const edition = useEditionQuery(slug, id);
const status = computed(
  () => edition.data.value?.edition.status ?? 'preparing',
);
const participants = computed(() => {
  const list = edition.data.value?.participants ?? [];
  // While answers are collected, in the order of the « Réponses » list.
  return answering.value
    ? sortByAnswer(
        list.map((p) => ({
          ...p,
          answerStatus: p.answerStatus ?? ('toNotify' as const),
        })),
        fullName,
      )
    : sortParticipants(list, status.value);
});

const drawMode = computed(() => edition.data.value?.edition.drawMode ?? 'app');
/** While the answers of a draw made elsewhere are collected. */
const answering = computed(
  () => status.value === 'preparing' && drawMode.value === 'elsewhere',
);
const types = computed(() => messageTypesFor(status.value, drawMode.value));
const asked = computed(() => String(route.query.type ?? ''));
const choice = useMessageChoice(id);
const chosen = computed(() =>
  choice.value?.who === 'plusieurs' ? choice.value : null,
);
const type = computed<MessageType>(
  () =>
    chosen.value?.type ??
    types.value.find((v) => v === asked.value) ??
    types.value[0] ??
    'invitation',
);
const note = computed(() => chosen.value?.note ?? '');
const position = computed(
  () => edition.data.value?.rules.messageNotePosition ?? 'after',
);
const customizePath = computed(
  () => `${editionPath.value}/message?pour=plusieurs&type=${type.value}`,
);

const withEmail = computed(() => participants.value.filter((p) => p.email));
const { lookOf } = useFollowLook();
const { answerLook } = useAnswerLook();
/**
 * What a row says under the name: no address, or where the person stands.
 * @param p - The participant.
 * @returns The icon, the tone classes of the icon and the words, the words.
 */
const rowLook = (p: Participant) =>
  p.email
    ? answering.value
      ? answerLook(p.answerStatus ?? 'toNotify')
      : lookOf(p)
    : {
        icon: 'i-lucide-circle-dashed',
        iconTone: 'text-toned',
        tone: 'text-toned',
        text: t('adminEdition.screen.emails.noEmail'),
      };
// The ticks: those still to notify at first, then as changed here; kept
// when going to « Personnaliser le message », which previews for them.
const ticks = useEmailSelection(id);
const preselected = computed(() =>
  participants.value
    .filter((p) =>
      answering.value
        ? preselectedForAnswers(type.value, p)
        : preselectedForEmail(p),
    )
    .map((p) => p.participationId),
);
const selected = computed({
  get: () => ticks.value ?? preselected.value,
  set: (pids: string[]) => {
    ticks.value = pids;
  },
});
/**
 * Whether a participation is ticked.
 * @param pid - The participation.
 * @returns True when ticked.
 */
const isSelected = (pid: string) => selected.value.includes(pid);
/**
 * Ticks or unticks a participation.
 * @param pid - The participation.
 * @param on - True to tick it.
 * @returns Nothing.
 */
const toggle = (pid: string, on: boolean) => {
  selected.value = on
    ? [...selected.value, pid]
    : selected.value.filter((v) => v !== pid);
};
const allSelected = computed(
  () => selected.value.length === withEmail.value.length,
);
/**
 * Ticks everyone with an address, or nobody when all are ticked.
 * @returns Nothing.
 */
const toggleAll = () => {
  selected.value = allSelected.value
    ? []
    : withEmail.value.map((p) => p.participationId);
};

// Past ten people, a search; past twelve, five rows then a fold row. The
// selection always covers the whole list, shown or not.
const SEARCH_FROM = 10;
const SHOWN = 5;
const query = ref('');
const expanded = ref(false);
const searchable = computed(() => participants.value.length > SEARCH_FROM);
const view = computed(() =>
  listView(participants.value, {
    query: query.value,
    expanded: expanded.value,
    shown: SHOWN,
    nameOf: fullName,
  }),
);

// The preview shows the message of the first one ticked; with nobody
// ticked, of the first one with an address, or of the first of all, so
// that it never waits for nobody.
const messages = useMessagesQuery(slug, id, type);
const first = computed(
  () =>
    participants.value.find((p) => isSelected(p.participationId)) ??
    participants.value.find((p) => p.email) ??
    participants.value[0],
);
const firstMessage = computed(
  () =>
    first.value && messages.data.value?.messages[first.value.participationId],
);
const preview = computed(() =>
  firstMessage.value
    ? addNote(firstMessage.value.text, note.value, position.value)
    : undefined,
);

const sendEmails = useSendEmailsMutation(slug, id);
const sending = useBusy(() => sendEmails.isPending.value);
/**
 * Says who was just sent the message: up to three first names, then how
 * many others.
 * @param names - The first names of those sent to.
 * @returns "Inès, Louis et Rose sont prévenus."
 */
const sentTo = (names: string[]) => {
  const { shown, more } = stackOf(names, 3);
  const list =
    more > 0
      ? t('adminEdition.screen.drawSheet.andOthers', {
          names: shown.join(', '),
          count: more,
        })
      : new Intl.ListFormat(locale.value, { type: 'conjunction' }).format(
          shown,
        );
  return t('adminEdition.screen.sentTo', { names: list, count: names.length });
};
/**
 * Sends the message to those ticked, then goes back to the edition.
 * @returns Nothing: the mutation reports by itself.
 */
const onSend = () =>
  sendEmails.mutate(
    {
      type: type.value,
      audience: 'all',
      participationIds: selected.value,
      note: note.value,
      notePosition: position.value,
    },
    {
      onSuccess: ({ sent, left }) => {
        const names = participants.value
          .filter((p) => isSelected(p.participationId))
          .map(fullName);
        toast.done(
          t('adminEdition.cockpit.email.sent', { count: sent }),
          left === 0 && sent > 0 ? sentTo(names) : undefined,
        );
        choice.value = null;
        ticks.value = null;
        goBack(editionPath.value);
      },
      onError: (error: unknown) => toast.failed(errorMessage(error)),
    },
  );
</script>

<template>
  <AdminScreen v-bind="screen">
    <AdminQueryState
      :pending="edition.isPending.value"
      :error="edition.error.value"
    >
      <section class="flex flex-col gap-1.5" data-testid="email-message">
        <UiSectionTitle>{{
          t('adminEdition.screen.emails.previewFor', {
            name: first ? fullName(first) : '',
          })
        }}</UiSectionTitle>
        <UiMessageBubble
          :text="first ? preview : undefined"
          :link="firstMessage?.link"
          class="max-w-full"
          :loading-label="t('adminEdition.screen.sheet.loadingMessage')"
          data-testid="email-preview"
        />
        <p class="text-[13px] leading-[1.4] text-toned">
          {{ t('adminEdition.screen.emails.each') }}
        </p>
        <NuxtLink
          :to="customizePath"
          class="flex min-h-11 items-center gap-1 self-start text-sm font-bold text-primary-ink"
          @click="ticks = selected"
        >
          {{
            chosen
              ? t('adminEdition.screen.sheet.editMessage')
              : t('adminEdition.screen.sheet.customize')
          }}
          <UIcon
            name="i-lucide-chevron-right"
            class="size-4"
            aria-hidden="true"
          />
        </NuxtLink>
      </section>

      <section
        class="flex flex-col gap-1.5 transition-opacity"
        :class="{
          'pointer-events-none opacity-50': sendEmails.isPending.value,
        }"
        :inert="sendEmails.isPending.value || undefined"
        :aria-busy="sendEmails.isPending.value || undefined"
        data-testid="email-people"
      >
        <div class="flex items-center justify-between gap-2">
          <UiSectionTitle aria-live="polite" data-testid="email-count">{{
            t('adminEdition.screen.emails.selected', {
              count: selected.length,
              total: participants.length,
            })
          }}</UiSectionTitle>
          <button
            type="button"
            class="h-11 px-1 text-sm font-bold text-primary-ink underline disabled:opacity-50"
            :disabled="!withEmail.length"
            @click="toggleAll"
          >
            {{
              allSelected
                ? t('adminEdition.screen.emails.selectNone')
                : t('adminEdition.screen.emails.selectAll')
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
            :key-of="(p) => p.participationId"
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
                v-if="p.email"
                :avatar="p.avatar"
                :title="fullName(p)"
                :label="
                  t('adminEdition.screen.emails.select', { name: fullName(p) })
                "
                :checked="isSelected(p.participationId)"
                @update:checked="(on) => toggle(p.participationId, on)"
              >
                <template #subtitle>
                  <span
                    v-if="
                      answering
                        ? p.answerStatus === 'toNotify'
                        : followState(p) === 'toNotify'
                    "
                    class="truncate"
                    >{{
                      answering
                        ? t('adminEdition.answers.status.toNotify')
                        : t('adminEdition.screen.lists.series.toNotify')
                    }}
                    · {{ p.email }}</span
                  >
                  <template v-else>
                    <UIcon
                      :name="rowLook(p).icon"
                      class="size-3.5 shrink-0"
                      :class="rowLook(p).iconTone"
                    />
                    <span class="truncate" :class="rowLook(p).tone">{{
                      rowLook(p).text
                    }}</span>
                  </template>
                </template>
              </UiCheckRow>
              <li v-else class="flex min-h-15 items-center gap-3 px-4 py-2">
                <UiAvatar :avatar="p.avatar" />
                <span class="flex min-w-0 grow flex-col">
                  <span class="truncate font-semibold">{{ fullName(p) }}</span>
                  <span
                    class="flex min-w-0 items-center gap-1.25 text-[13px] text-toned"
                  >
                    <UIcon :name="rowLook(p).icon" class="size-3.5 shrink-0" />
                    <span class="truncate">{{ rowLook(p).text }}</span>
                  </span>
                </span>
                <NuxtLink
                  :to="`/f/${slug}/membres/${p.id}`"
                  class="flex min-h-11 shrink-0 items-center px-1 text-sm font-bold text-primary underline"
                  :aria-label="
                    t('adminEdition.screen.emails.addEmailLabel', {
                      name: fullName(p),
                    })
                  "
                  >{{ t('adminEdition.screen.emails.addEmail') }}</NuxtLink
                >
              </li>
            </template>
          </UiFoldedRows>
        </UiList>
      </section>

      <p class="text-sm leading-[1.45] text-toned">
        {{ t('adminEdition.screen.emails.spam') }}
      </p>

      <UiStickyFooter>
        <UButton
          block
          size="xl"
          icon="i-lucide-mail"
          class="h-13 justify-center text-[17px] font-bold"
          :disabled="!selected.length || !preview || sendEmails.isPending.value"
          :loading="sending"
          :label="
            sending
              ? t('adminEdition.screen.emails.sending', {
                  count: selected.length,
                })
              : t('adminEdition.screen.emails.send', { count: selected.length })
          "
          @click="onSend"
        />
      </UiStickyFooter>
    </AdminQueryState>
  </AdminScreen>
</template>
