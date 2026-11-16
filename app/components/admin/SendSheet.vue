<script setup lang="ts">
import { fullName } from '#server/utils/people';
import type { Participant } from '#server/database/editions';
import {
  NOTE_MAX,
  addNote,
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

// Sending one participant their message, or sending it again: the
// message, its text as it will go, a word to add and its language, then
// how. With an address, email comes first; without one, the phone's
// share sheet. Someone already reached gets the reminder, and other ways
// if the email does not arrive. The repairs stay folded at the bottom.
// Sharing and copying start in the gesture (Safari, README 13.1): the
// text is loaded before.
const props = defineProps<{
  slug: string;
  editionId: string;
  status: string;
  participant: Participant;
  /** The next one to notify, once this one is done. */
  next: Participant | null;
  /** How many are still to notify, this one included. */
  left: number;
}>();
const open = defineModel<boolean>('open', { required: true });
const emit = defineEmits<{ sent: []; skip: []; removed: [] }>();
const { t, tk } = useT();
const errorMessage = useErrorMessage();
const toast = useToast();

const resend = computed(() => Boolean(props.participant.messageSentAt));
const types = computed(() => messageTypesFor(props.status));
/**
 * The message offered first: the reminder for someone already reached,
 * otherwise the first message of the step.
 * @returns The message type.
 */
const defaultType = (): MessageType =>
  resend.value && types.value.includes('reminder')
    ? 'reminder'
    : (types.value[0] ?? 'invitation');
const type = ref<MessageType>(defaultType());
watch(
  () => props.participant.participationId,
  () => {
    type.value = defaultType();
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
const waiting = computed(() => !text.value || updatePerson.isPending.value);

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
const sendEmails = useSendEmailsMutation(
  () => props.slug,
  () => props.editionId,
);
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
/** Where the participant stands, under the title once reached. */
const look = computed(() =>
  resend.value || props.left === 0 ? lookOf(props.participant) : null,
);
/** Stands in for the name, to set it in bold within the sentence. */
const NAME_SLOT = '\u0000';
/** "Une fois envoyé, le panneau passe à", the next name, then "." */
const nextWords = computed(() =>
  t('adminEdition.screen.sheet.next', { name: NAME_SLOT }).split(NAME_SLOT),
);
const personPath = computed(
  () => `/admin/${props.slug}/personnes/${props.participant.id}`,
);
</script>

<template>
  <UiSheet v-model:open="open" :title="title">
    <template #header>
      <div class="flex w-full items-center gap-3">
        <UiAvatar :avatar="participant.avatar" class="size-12 text-[22px]" />
        <div class="flex min-w-0 grow flex-col gap-0.5">
          <h2
            class="truncate font-display text-[22px] leading-[1.15] font-bold"
          >
            {{ title }}
          </h2>
          <p
            v-if="look"
            class="flex items-center gap-1.25 text-sm"
            :class="look.tone"
          >
            <UIcon
              :name="look.icon"
              class="size-3.5 shrink-0"
              :class="look.iconTone"
            />
            {{ look.text }}
          </p>
          <p v-else class="text-sm text-toned">
            {{ t('adminEdition.screen.sheet.left', { count: left }) }}
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
    <div class="flex flex-col gap-[18px]" data-testid="send-sheet">
      <UiSegmented
        v-if="tabs.length > 1"
        v-model="type"
        :items="tabs"
        :label="t('adminEdition.screen.emails.message')"
      />
      <div class="flex flex-col gap-2">
        <UiMessageBubble
          v-if="text"
          :text="text"
          :link="message?.link"
          data-testid="send-preview"
        />
        <USkeleton v-else class="h-28 w-[92%] rounded-2xl bg-skeleton" />
        <div class="flex flex-wrap items-center gap-2">
          <UButton
            variant="outline"
            color="neutral"
            icon="i-lucide-pencil"
            class="h-10 gap-1.5 rounded-full px-3 text-sm font-semibold"
            :ui="{ leadingIcon: 'size-4' }"
            :label="t('adminEdition.screen.sheet.addNote')"
            @click="writing = !writing"
          />
          <USelect
            :model-value="participant.language"
            :items="languages"
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
        <UTextarea
          v-if="writing"
          v-model="note"
          :rows="2"
          :maxlength="NOTE_MAX"
          autoresize
          :aria-label="t('adminEdition.screen.sheet.addNote')"
          class="w-full"
        />
      </div>

      <div class="flex flex-col" :class="resend ? 'gap-3.5' : 'gap-2.5'">
        <div v-if="participant.email" class="flex flex-col gap-0.5">
          <UButton
            block
            icon="i-lucide-mail"
            :disabled="waiting"
            :loading="sendEmails.isPending.value"
            class="min-h-14 gap-2.5 px-3 py-1.5"
            @click="onEmail"
          >
            <span class="flex min-w-0 flex-col items-start leading-[1.2]">
              <span class="text-[17px] font-bold">{{
                resend
                  ? t('adminEdition.screen.sheet.resendByEmail')
                  : t('adminEdition.screen.sheet.byEmail')
              }}</span>
              <span class="max-w-full truncate text-[13px] font-medium">{{
                participant.email
              }}</span>
            </span>
          </UButton>
          <NuxtLink
            v-if="resend"
            :to="personPath"
            class="flex min-h-11 items-center self-center text-sm font-bold text-primary-ink underline"
            >{{ t('adminEdition.screen.sheet.wrongAddress') }}</NuxtLink
          >
        </div>
        <UButton
          v-else
          block
          icon="i-lucide-share-2"
          :disabled="waiting"
          class="h-13 gap-2 text-[17px] font-bold"
          :label="t('adminEdition.screen.sheet.shareWide')"
          @click="onShare"
        />

        <section v-if="resend" class="flex flex-col gap-2">
          <h3 class="text-xs font-bold tracking-[0.04em] text-toned uppercase">
            {{ t('adminEdition.screen.sheet.other') }}
          </h3>
          <div class="grid grid-cols-3 gap-2">
            <UButton
              v-if="participant.email"
              variant="outline"
              color="neutral"
              icon="i-lucide-share-2"
              class="min-h-17 flex-col justify-center gap-1.5 rounded-lg px-1 py-2 text-[13px] leading-[1.2] font-semibold"
              :disabled="waiting"
              :label="t('adminEdition.screen.sheet.share')"
              @click="onShare"
            />
            <UButton
              variant="outline"
              color="neutral"
              icon="i-lucide-copy"
              class="min-h-17 flex-col justify-center gap-1.5 rounded-lg px-1 py-2 text-[13px] leading-[1.2] font-semibold"
              :disabled="waiting"
              :label="t('adminEdition.screen.sheet.copyMessage')"
              @click="onCopy"
            />
            <UButton
              variant="outline"
              color="neutral"
              icon="i-lucide-link"
              class="min-h-17 flex-col justify-center gap-1.5 rounded-lg px-1 py-2 text-[13px] leading-[1.2] font-semibold"
              :disabled="!message"
              :label="t('adminEdition.screen.sheet.copyLink')"
              @click="onCopyLink"
            />
          </div>
          <p class="text-[13px] leading-[1.4] text-toned">
            {{ t('adminEdition.screen.sheet.otherHint', { name }) }}
          </p>
        </section>
        <div v-else-if="participant.email" class="grid grid-cols-2 gap-2.5">
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
          v-else
          block
          variant="outline"
          color="neutral"
          icon="i-lucide-copy"
          class="h-[46px] gap-2 text-[15px] font-semibold"
          :disabled="waiting"
          :label="t('adminEdition.screen.sheet.copyMessage')"
          @click="onCopy"
        />

        <div
          v-if="!participant.email"
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
          <NuxtLink
            :to="personPath"
            class="flex min-h-11 items-center px-1 text-sm font-bold text-primary-ink underline"
            :aria-label="
              t('adminEdition.screen.emails.addEmailLabel', { name })
            "
            >{{ t('adminEdition.screen.emails.addEmail') }}</NuxtLink
          >
        </div>
        <div
          v-if="next && !resend"
          class="flex items-center gap-2.5 rounded-[10px] bg-success-tint px-3 py-2.5"
          data-testid="send-next"
        >
          <UiAvatar :avatar="next.avatar" class="size-8 text-[15px]" />
          <p class="grow text-sm leading-[1.35] text-success-ink">
            {{ nextWords[0] }}<strong>{{ fullName(next) }}</strong
            >{{ nextWords[1] }}
          </p>
          <button
            type="button"
            class="h-11 shrink-0 px-2 text-sm font-bold text-success-ink underline"
            @click="emit('skip')"
          >
            {{ t('adminEdition.screen.sheet.skip') }}
          </button>
        </div>
      </div>

      <AdminParticipantTroubleshoot
        class="-mb-2"
        :slug="slug"
        :edition-id="editionId"
        :status="status"
        :participant="participant"
        @removed="emit('removed')"
      />
    </div>
  </UiSheet>
</template>
