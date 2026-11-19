<script setup lang="ts">
import { fullName } from '#server/utils/people';
import { followState } from '#server/utils/editions';
import { shortDay } from '#shared/utils/dates';
import type { EditionParticipant } from '~/composables/queries/useGroup';
import {
  addNote,
  defaultMessageType,
  messageTypesFor,
  type MessageType,
  type NotePosition,
} from '#server/utils/messages';
import {
  useLinkCopiedMutation,
  useMessagesQuery,
  useSendEmailsMutation,
} from '~/composables/queries/useEdition';
import { useShareMessage } from '~/composables/useShareMessage';

// Sending one participant their message, or sending it again (decided
// on 16 November 2026: only what it takes to send). The message chosen
// for them, whole, and « Personnaliser le message », a screen of its own
// to pick another, add a word or change its language (« Modifier le
// message » once done); then how to send: email first with an address,
// the phone's share sheet without.
// « Autre moyen, ou un souci ? » turns the sheet into a list of other
// ways and repairs. Once sent, the sheet closes. Sharing and copying start
// in the gesture (Safari, README 13.1): the text is loaded before.
const props = defineProps<{
  slug: string;
  editionId: string;
  status: string;
  /** Drawn again after a cancelled draw. */
  redrawn: boolean;
  participant: EditionParticipant;
  /** Where a word added goes: above or below the message (group rule). */
  notePosition: NotePosition;
  /** A draw made elsewhere asks for answers (README 22.12). */
  drawMode?: string;
}>();
const open = defineModel<boolean>('open', { required: true });
const emit = defineEmits<{ sent: []; customize: [] }>();
const { t, tk, locale } = useT();
const errorMessage = useErrorMessage();
const toast = useToast();

const resend = computed(() => Boolean(props.participant.messageSentAt));
const types = computed(() => messageTypesFor(props.status, props.drawMode));
/** While the answers of a draw made elsewhere are collected. */
const answering = computed(
  () => props.status === 'preparing' && props.drawMode === 'elsewhere',
);
// The message chosen on « Personnaliser le message » for this person, or
// the one for them (« Nouveau tirage » once the draw was run again).
const choice = useMessageChoice(() => props.editionId);
const chosen = computed(() =>
  choice.value?.who === props.participant.participationId ? choice.value : null,
);
const type = computed<MessageType>(
  () =>
    chosen.value?.type ??
    defaultMessageType(props.status, resend.value, props.redrawn, {
      mode: props.drawMode ?? 'app',
      inConflict: props.participant.answerStatus === 'toCheck',
    }) ??
    types.value[0] ??
    'invitation',
);
const note = computed(() => chosen.value?.note ?? '');
// What the sheet shows: what it takes to send, or the list of other ways
// and repairs.
const view = ref<'send' | 'other'>('send');
const fixingEmail = ref(false);
watch(
  () => props.participant.participationId,
  () => {
    view.value = 'send';
    fixingEmail.value = false;
  },
);

const messages = useMessagesQuery(
  () => props.slug,
  () => props.editionId,
  type,
);
const message = computed(
  () => messages.data.value?.messages[props.participant.participationId],
);
const text = computed(() =>
  message.value
    ? addNote(message.value.text, note.value, props.notePosition)
    : undefined,
);
const sendEmails = useSendEmailsMutation(
  () => props.slug,
  () => props.editionId,
);
const waiting = computed(() => !text.value || sendEmails.isPending.value);
const sending = useBusy(() => sendEmails.isPending.value);
/**
 * The message is on its way: forgets the choice, then closes.
 * @returns Nothing.
 */
const done = () => {
  if (chosen.value) choice.value = null;
  emit('sent');
};

/**
 * Shows an error in a toast.
 * @param error - The error of a mutation.
 * @returns Nothing.
 */
const onError = (error: unknown) =>
  toast.add({ title: errorMessage(error), color: 'error' });
const sharer = useShareMessage(() => props.slug);
/**
 * Opens the phone's share sheet with the message, then moves on.
 * @returns Nothing.
 */
const onShare = () => {
  sharer.share(props.participant.participationId, type.value, text.value);
  done();
};
/**
 * Copies the message, then moves on.
 * @returns Nothing.
 */
const onCopy = () => {
  sharer.copy(props.participant.participationId, type.value, text.value);
  done();
};
const linkCopied = useLinkCopiedMutation(() => props.slug);
/**
 * Copies the personal link alone and journals it.
 * @returns Once the link is copied.
 */
const onCopyLink = async () => {
  if (!message.value) return;
  await navigator.clipboard.writeText(message.value.link);
  toast.add({
    title: t('adminEdition.participant.linkCopied'),
    color: 'success',
    icon: 'i-lucide-clipboard-check',
  });
  linkCopied.mutate(props.participant.participationId);
};
/**
 * Emails the message to this participant, then moves on.
 * @returns Nothing: the mutation reports by itself.
 */
const onEmail = () =>
  sendEmails.mutate(
    {
      type: type.value,
      audience: 'all',
      participationIds: [props.participant.participationId],
      note: note.value,
      notePosition: props.notePosition,
    },
    {
      onSuccess: () => {
        toast.add({
          title: t('adminEdition.screen.sheet.emailSent', {
            name: fullName(props.participant),
          }),
          color: 'success',
          icon: 'i-lucide-mail-check',
        });
        done();
      },
      onError,
    },
  );
const name = computed(() => fullName(props.participant));
const title = computed(() =>
  answering.value
    ? tk(`adminEdition.answers.sheet.${type.value}`, { name: name.value })
    : t(
        resend.value
          ? 'adminEdition.screen.sheet.resendTo'
          : 'adminEdition.screen.sheet.sendTo',
        { name: name.value },
      ),
);
const { lookOf } = useFollowLook();
const { answerLook } = useAnswerLook();
/** Where the participant stands, under the title. */
const look = computed(() =>
  answering.value
    ? answerLook(props.participant.answerStatus ?? 'toNotify')
    : lookOf(props.participant),
);
/** The state's words, with the day of the last send while waiting. */
const lookText = computed(() => {
  const sentAt = props.participant.messageSentAt;
  if (answering.value) {
    return props.participant.answerStatus === 'asked' && sentAt
      ? t('adminEdition.answers.sheet.askedOn', {
          date: shortDay(sentAt, locale.value),
        })
      : look.value.text;
  }
  return followState(props.participant) === 'notOpened' && sentAt
    ? t('adminEdition.screen.sheet.sentOn', {
        date: shortDay(sentAt, locale.value),
      })
    : look.value.text;
});
/** The message's language, said next to « Personnaliser » when not ours. */
const otherLanguage = computed(() =>
  props.participant.language === locale.value
    ? null
    : tk(`common.languageIn.${props.participant.language}`),
);
/** What « Autre moyen, ou un souci ? » holds, in a few words. */
const otherHint = computed(() =>
  resend.value
    ? t('adminEdition.screen.sheet.otherResend')
    : props.participant.email
      ? t('adminEdition.screen.sheet.otherFirst')
      : t('adminEdition.screen.sheet.otherNoEmail'),
);
// The address is added in place on the sheet, or corrected from the list.
const editingEmail = ref(false);
watch(
  () => props.participant.participationId,
  () => {
    editingEmail.value = false;
  },
);
</script>
<template>
  <UiSheet
    v-model:open="open"
    :title="title"
    :busy="sendEmails.isPending.value"
  >
    <template #header>
      <div class="flex w-full items-center gap-3">
        <UiAvatar :avatar="participant.avatar" class="size-12 text-[22px]" />
        <div class="flex min-w-0 grow flex-col gap-0.5">
          <h2
            class="truncate font-display text-[22px] leading-[1.15] font-bold"
          >
            {{ title }}
          </h2>
          <p class="flex items-center gap-1.25 text-sm" :class="look.tone">
            <UIcon
              :name="look.icon"
              class="size-3.5 shrink-0"
              :class="look.iconTone"
            />
            {{ lookText }}
          </p>
        </div>
        <button
          type="button"
          class="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted focus-visible:ring-2 focus-visible:ring-primary"
          :aria-label="t('adminEdition.screen.sheet.close')"
          @click="open = false"
        >
          <UIcon name="i-lucide-x" class="size-[18px]" />
        </button>
      </div>
    </template>

    <div
      v-if="view === 'send'"
      class="flex flex-col gap-4"
      data-testid="send-sheet"
    >
      <div class="flex flex-col gap-1">
        <UiMessageBubble
          :text="text"
          :link="message?.link"
          :loading-label="t('adminEdition.screen.sheet.loadingMessage')"
          data-testid="send-preview"
        />
        <button
          type="button"
          class="flex min-h-11 items-center gap-1 self-start text-sm font-bold text-primary-ink"
          @click="emit('customize')"
        >
          {{
            chosen
              ? t('adminEdition.screen.sheet.editMessage')
              : t('adminEdition.screen.sheet.customize')
          }}
          <span v-if="otherLanguage" class="font-semibold text-toned"
            >· {{ otherLanguage }}</span
          >
          <UIcon
            name="i-lucide-chevron-right"
            class="size-4"
            aria-hidden="true"
          />
        </button>
      </div>

      <div class="mt-4 flex flex-col gap-2.5">
        <UButton
          v-if="participant.email"
          block
          icon="i-lucide-mail"
          :disabled="waiting"
          :loading="sending"
          class="min-h-14 gap-2.5 px-3 py-1.5"
          @click="onEmail"
        >
          <span class="flex min-w-0 flex-col items-start leading-[1.2]">
            <span class="text-[17px] font-bold">{{
              sending
                ? t('adminEdition.screen.sheet.sending')
                : resend
                  ? t('adminEdition.screen.sheet.resendByEmail')
                  : t('adminEdition.screen.sheet.byEmail')
            }}</span>
            <span class="max-w-full truncate text-[13px] font-medium">{{
              participant.email
            }}</span>
          </span>
        </UButton>
        <UButton
          v-else
          block
          icon="i-lucide-share-2"
          :disabled="waiting"
          class="h-13 gap-2 text-[17px] font-bold"
          :label="t('adminEdition.screen.sheet.shareWide')"
          @click="onShare"
        />
        <div
          v-if="participant.email && !resend"
          class="grid grid-cols-2 gap-2.5"
        >
          <UButton
            block
            variant="outline"
            color="neutral"
            icon="i-lucide-share-2"
            class="h-[46px] gap-2 text-[15px] font-semibold"
            :disabled="waiting"
            :label="t('adminEdition.screen.sheet.share')"
            @click="onShare"
          />
          <UButton
            block
            variant="outline"
            color="neutral"
            icon="i-lucide-copy"
            class="h-[46px] gap-2 text-[15px] font-semibold"
            :disabled="waiting"
            :label="t('adminEdition.screen.sheet.copy')"
            @click="onCopy"
          />
        </div>
        <UButton
          v-else-if="!participant.email"
          block
          variant="outline"
          color="neutral"
          icon="i-lucide-copy"
          class="h-[46px] gap-2 text-[15px] font-semibold"
          :disabled="waiting"
          :label="t('adminEdition.screen.sheet.copyMessage')"
          @click="onCopy"
        />
        <AdminEmailInline
          v-if="!participant.email && editingEmail"
          :slug="slug"
          :person-id="participant.id"
          :label="t('adminEdition.screen.sheet.emailLabel', { name })"
          :help="t('adminEdition.screen.sheet.emailHelp', { name })"
          @saved="editingEmail = false"
        />
        <div
          v-else-if="!participant.email"
          class="flex items-center gap-2.5 rounded-md bg-muted px-3 py-2.5"
          data-testid="no-address"
        >
          <UIcon
            name="i-lucide-mail"
            class="size-[18px] shrink-0 text-toned"
            aria-hidden="true"
          />
          <p class="grow text-sm leading-[1.35]">
            {{ t('adminEdition.screen.sheet.noAddress', { name }) }}
          </p>
          <button
            type="button"
            class="flex min-h-11 items-center px-1 text-sm font-bold text-primary-ink underline"
            :aria-label="
              t('adminEdition.screen.emails.addEmailLabel', { name })
            "
            @click="editingEmail = true"
          >
            {{ t('adminEdition.screen.emails.addEmail') }}
          </button>
        </div>
      </div>

      <button
        type="button"
        class="-mx-4 -mb-2 flex min-h-15 items-center gap-3 border-t border-divider px-4 py-2 text-left"
        @click="view = 'other'"
      >
        <span class="flex min-w-0 grow flex-col">
          <span class="text-[15px] font-semibold">{{
            t('adminEdition.screen.sheet.other')
          }}</span>
          <span class="truncate text-[13px] text-toned">{{ otherHint }}</span>
        </span>
        <UIcon
          name="i-lucide-chevron-right"
          class="size-5 shrink-0 text-dimmed"
          aria-hidden="true"
        />
      </button>
    </div>

    <div v-else class="flex flex-col gap-3" data-testid="send-other">
      <button
        type="button"
        class="-ml-1 flex min-h-11 items-center gap-1 self-start px-1 text-sm font-bold text-primary-ink"
        @click="view = 'send'"
      >
        <UIcon name="i-lucide-chevron-left" class="size-4" aria-hidden="true" />
        {{ t('common.actions.back') }}
      </button>
      <UiList
        :title="resend ? t('adminEdition.screen.sheet.emailFails') : undefined"
      >
        <template v-if="resend && participant.email">
          <UiListItem
            :title="t('adminEdition.screen.sheet.shareWhatsApp')"
            :on-click="onShare"
          />
          <UiListItem
            :title="t('adminEdition.screen.sheet.copyMessage')"
            :on-click="onCopy"
          />
        </template>
        <UiListItem
          :title="t('adminEdition.screen.sheet.copyLink')"
          :on-click="onCopyLink"
        />
        <template v-if="participant.email">
          <li v-if="fixingEmail" class="px-4 py-3">
            <AdminEmailInline
              :slug="slug"
              :person-id="participant.id"
              :initial="participant.email"
              :label="t('adminEdition.screen.sheet.emailLabel', { name })"
              :help="t('adminEdition.screen.sheet.emailHelp', { name })"
              @saved="fixingEmail = false"
            />
          </li>
          <UiListItem
            v-else
            :title="t('adminEdition.screen.sheet.fixEmail')"
            :subtitle="participant.email"
            :on-click="() => (fixingEmail = true)"
          />
        </template>
        <AdminParticipantTroubleshoot
          v-if="!resend"
          :slug="slug"
          :participant="participant"
        />
      </UiList>
      <UiList
        v-if="resend"
        :title="t('adminEdition.participant.troubleshooting')"
        data-testid="troubleshoot"
      >
        <AdminParticipantTroubleshoot :slug="slug" :participant="participant" />
      </UiList>
    </div>
  </UiSheet>
</template>
