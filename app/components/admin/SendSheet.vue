<script setup lang="ts">
import { fullName } from '#server/utils/people';
import type { Participant } from '#server/database/editions';
import {
  NOTE_MAX,
  addNote,
  defaultMessageType,
  messageTypesFor,
  type MessageType,
} from '#server/utils/messages';
import { LOCALES, type Locale } from '#shared/i18n';
import {
  useLinkCopiedMutation,
  useMessagesQuery,
  useSendEmailsMutation,
} from '~/composables/queries/useEdition';
import { useUpdatePersonMutation } from '~/composables/queries/useGroup';
import { useShareMessage } from '~/composables/useShareMessage';

// Sending one participant their message, or sending it again (decided
// on 16 November 2026: only what it takes to send, at first). Two lines
// of the message chosen for them, « Personnaliser » to pick another
// message, read it whole, add a word or change its language, then how to
// send: email first with an address, the phone's share sheet without.
// « Autre moyen, ou un souci ? » turns the sheet into a list of other
// ways and repairs. Once sent, the sheet closes. Sharing and copying start
// in the gesture (Safari, README 13.1): the text is loaded before.
const props = defineProps<{
  slug: string;
  editionId: string;
  status: string;
  participant: Participant;
}>();
const open = defineModel<boolean>('open', { required: true });
const emit = defineEmits<{ sent: [] }>();
const { t, tk, locale } = useT();
const errorMessage = useErrorMessage();
const toast = useToast();

const resend = computed(() => Boolean(props.participant.messageSentAt));
const types = computed(() => messageTypesFor(props.status));
// The message chosen for them; whether the draw was run again is not
// known to the screen yet (PLAN, section 6), so never.
const defaultType = (): MessageType =>
  defaultMessageType(props.status, resend.value, false) ??
  types.value[0] ??
  'invitation';
const type = ref<MessageType>(defaultType());
// What the sheet shows: what it takes to send, with or without the rest
// of « Personnaliser », or the list of other ways and repairs.
const customizing = ref(false);
const view = ref<'send' | 'other'>('send');
const fixingEmail = ref(false);
watch(
  () => props.participant.participationId,
  () => {
    type.value = defaultType();
    customizing.value = false;
    view.value = 'send';
    fixingEmail.value = false;
  },
);
const tabs = computed(() =>
  types.value.map((value) => ({
    value,
    label: tk(`common.messageType.${value}`),
  })),
);

const messages = useMessagesQuery(
  () => props.slug,
  () => props.editionId,
  type,
);
const message = computed(
  () => messages.data.value?.messages[props.participant.participationId],
);
const note = ref('');
const writing = ref(false);
const text = computed(() =>
  message.value ? addNote(message.value.text, note.value, 'after') : undefined,
);

// The language is the person's preferred one: changing it here saves it.
const updatePerson = useUpdatePersonMutation(() => props.slug);
const languages = computed(() =>
  LOCALES.map((value) => ({ value, label: tk(`common.language.${value}`) })),
);
/**
 * Saves the language picked as the person's preferred one.
 * @param language - The language picked.
 * @returns Nothing, or false when it did not change.
 */
const onLanguage = (language: Locale) =>
  language !== props.participant.language &&
  updatePerson.mutate({ id: props.participant.id, language });
const sendEmails = useSendEmailsMutation(
  () => props.slug,
  () => props.editionId,
);
const waiting = computed(
  () =>
    !text.value || updatePerson.isPending.value || sendEmails.isPending.value,
);
const sending = useBusy(() => sendEmails.isPending.value);
const savingLanguage = useBusy(() => updatePerson.isPending.value);

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
  emit('sent');
};
/**
 * Copies the message, then moves on.
 * @returns Nothing.
 */
const onCopy = () => {
  sharer.copy(props.participant.participationId, type.value, text.value);
  emit('sent');
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
      notePosition: 'after',
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
        emit('sent');
      },
      onError,
    },
  );
const name = computed(() => fullName(props.participant));
const title = computed(() =>
  t(
    resend.value
      ? 'adminEdition.screen.sheet.resendTo'
      : 'adminEdition.screen.sheet.sendTo',
    { name: name.value },
  ),
);
const { lookOf } = useFollowLook();
/** Where the participant stands, under the title. */
const look = computed(() => lookOf(props.participant));
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
            {{ look.text }}
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
      <UiMessageBubble
        v-if="!customizing"
        :text="text"
        :link="message?.link"
        :loading-label="t('adminEdition.screen.sheet.loadingMessage')"
        data-testid="send-preview"
      />
      <button
        type="button"
        class="flex min-h-11 items-center gap-1 self-start text-sm font-bold text-primary-ink"
        :class="{ '-mt-3': !customizing }"
        :aria-expanded="customizing"
        @click="customizing = !customizing"
      >
        {{ t('adminEdition.screen.sheet.customize') }}
        <span v-if="otherLanguage" class="font-semibold text-toned"
          >· {{ otherLanguage }}</span
        >
        <UIcon
          :name="customizing ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
          class="size-4"
          aria-hidden="true"
        />
      </button>
      <template v-if="customizing">
        <UiSegmented
          v-if="tabs.length > 1"
          v-model="type"
          :items="tabs"
          :label="t('adminEdition.screen.emails.message')"
        />
        <div class="flex flex-col gap-2">
          <UiMessageBubble
            :text="text"
            :link="message?.link"
            :loading-label="t('adminEdition.screen.sheet.loadingMessage')"
            data-testid="send-preview"
          />
          <div class="flex flex-wrap items-center gap-2">
            <button
              type="button"
              class="flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold ring-1"
              :class="
                writing
                  ? 'bg-primary-tint font-bold text-primary-ink ring-primary-soft'
                  : 'ring-default'
              "
              :aria-expanded="writing"
              @click="writing = !writing"
            >
              <UIcon name="i-lucide-pencil" class="size-4" aria-hidden="true" />
              {{
                writing
                  ? t('adminEdition.screen.sheet.yourWord')
                  : note.trim()
                    ? t('adminEdition.screen.sheet.editWord')
                    : t('adminEdition.screen.sheet.addNote')
              }}
              <UIcon
                :name="
                  writing ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'
                "
                class="size-3.5"
                aria-hidden="true"
              />
            </button>
            <USelect
              :model-value="participant.language"
              :items="languages"
              :loading="savingLanguage"
              icon="i-lucide-globe"
              class="h-10 gap-1.5 rounded-full px-3 text-sm font-semibold"
              :ui="{
                leadingIcon: 'size-4',
                trailingIcon: 'size-3.5',
                value: 'text-sm',
              }"
              :aria-label="
                t('adminEdition.screen.sheet.language', {
                  language: tk(`common.language.${participant.language}`),
                })
              "
              @update:model-value="onLanguage"
            />
          </div>
          <div v-if="writing" class="flex flex-col gap-1">
            <UTextarea
              v-model="note"
              :rows="2"
              :maxlength="NOTE_MAX"
              autoresize
              :maxrows="0"
              autofocus
              :aria-label="t('adminEdition.screen.sheet.yourWord')"
              class="w-full"
              :ui="{ base: 'text-base leading-[1.45]' }"
            />
            <div class="flex items-center justify-between">
              <button
                type="button"
                class="min-h-11 text-sm font-bold text-primary-ink"
                @click="
                  () => {
                    note = '';
                    writing = false;
                  }
                "
              >
                {{ t('adminEdition.screen.sheet.removeWord') }}
              </button>
              <span class="text-[13px] text-toned tabular-nums"
                >{{ note.length }} / {{ NOTE_MAX }}</span
              >
            </div>
          </div>
        </div>
      </template>

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
          class="flex items-center gap-2.5 rounded-[10px] bg-muted px-3 py-2.5"
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
