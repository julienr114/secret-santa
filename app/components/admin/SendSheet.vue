<script setup lang="ts">
import type { Participant } from '#server/database/editions';
import { followState } from '#server/utils/editions';
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
// if the email does not arrive. Sharing and copying start in the gesture
// (Safari, README 13.1): the text is loaded before.
const props = defineProps<{
  slug: string;
  editionId: string;
  status: string;
  participant: Participant;
  /** First name of the next one to notify, once this one is done. */
  nextName: string | null;
  /** How many are still to notify, this one included. */
  left: number;
}>();
const open = defineModel<boolean>('open', { required: true });
const emit = defineEmits<{ sent: []; skip: [] }>();
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
            name: props.participant.firstName,
          }),
          color: 'success',
          icon: 'i-lucide-mail-check',
        });
        emit('sent');
      },
      onError,
    },
  );
const statusLine = computed(() => {
  const state = followState(props.participant);
  return state === 'viewed'
    ? t('adminEdition.screen.follow.state.viewed', {
        count: props.participant.viewCount,
      })
    : t(`adminEdition.screen.follow.state.${state}`);
});
</script>

<template>
  <UiSheet
    v-model:open="open"
    :title="
      resend
        ? t('adminEdition.screen.sheet.resendTo', {
            name: participant.firstName,
          })
        : t('adminEdition.screen.sheet.sendTo', { name: participant.firstName })
    "
  >
    <template #header>
      <div class="flex items-center gap-3">
        <UiAvatar :avatar="participant.avatar" class="size-12 text-xl" />
        <div class="min-w-0 grow">
          <h2 class="truncate font-display text-[22px] font-bold">
            {{
              resend
                ? t('adminEdition.screen.sheet.resendTo', {
                    name: participant.firstName,
                  })
                : t('adminEdition.screen.sheet.sendTo', {
                    name: participant.firstName,
                  })
            }}
          </h2>
          <p class="truncate text-sm text-muted">
            {{
              resend || left === 0
                ? statusLine
                : t('adminEdition.screen.sheet.left', { count: left })
            }}
          </p>
        </div>
        <UButton
          color="neutral"
          variant="soft"
          icon="i-lucide-x"
          class="size-11 shrink-0 justify-center rounded-full"
          :aria-label="t('adminEdition.screen.sheet.close')"
          @click="open = false"
        />
      </div>
    </template>
    <div class="flex flex-col gap-4 py-2" data-testid="send-sheet">
      <UTabs
        v-if="tabs.length > 1"
        v-model="type"
        :items="tabs"
        :content="false"
        class="w-full"
      />
      <UiTextPreview v-if="text" data-testid="send-preview">{{
        text
      }}</UiTextPreview>
      <USkeleton v-else class="h-28 w-full rounded-lg bg-skeleton" />
      <div class="flex flex-wrap gap-2">
        <UButton
          variant="outline"
          color="neutral"
          icon="i-lucide-pencil"
          class="rounded-full"
          :label="t('adminEdition.screen.sheet.addNote')"
          @click="writing = !writing"
        />
        <USelect
          :model-value="participant.language"
          :items="languages"
          icon="i-lucide-globe"
          class="rounded-full"
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
    <template #footer>
      <UButton
        v-if="participant.email"
        block
        icon="i-lucide-mail"
        :disabled="waiting"
        :loading="sendEmails.isPending.value"
        class="flex-col gap-0 py-2"
        @click="onEmail"
      >
        <span class="font-bold">{{
          resend
            ? t('adminEdition.screen.sheet.resendByEmail')
            : t('adminEdition.screen.sheet.byEmail')
        }}</span>
        <span class="text-[13px] font-medium opacity-90">{{
          participant.email
        }}</span>
      </UButton>
      <UButton
        v-else
        block
        icon="i-lucide-share-2"
        :disabled="waiting"
        :label="t('adminEdition.screen.sheet.share')"
        @click="onShare"
      />
      <template v-if="resend">
        <NuxtLink
          v-if="participant.email"
          :to="`/admin/${slug}/personnes/${participant.id}`"
          class="text-center text-sm font-bold text-primary-ink"
          >{{ t('adminEdition.screen.sheet.wrongAddress') }}</NuxtLink
        >
        <p class="pt-1 text-xs font-bold tracking-wide text-muted uppercase">
          {{ t('adminEdition.screen.sheet.other') }}
        </p>
        <div class="grid grid-cols-3 gap-2">
          <UButton
            v-if="participant.email"
            variant="outline"
            color="neutral"
            icon="i-lucide-share-2"
            class="min-h-17 flex-col justify-center text-[13px]"
            :disabled="waiting"
            :label="t('adminEdition.screen.sheet.share')"
            @click="onShare"
          />
          <UButton
            variant="outline"
            color="neutral"
            icon="i-lucide-copy"
            class="min-h-17 flex-col justify-center text-[13px]"
            :disabled="waiting"
            :label="t('adminEdition.screen.sheet.copyMessage')"
            @click="onCopy"
          />
          <UButton
            variant="outline"
            color="neutral"
            icon="i-lucide-link"
            class="min-h-17 flex-col justify-center text-[13px]"
            :disabled="!message"
            :label="t('adminEdition.screen.sheet.copyLink')"
            @click="onCopyLink"
          />
        </div>
        <p class="text-[13px] text-muted">
          {{
            t('adminEdition.screen.sheet.otherHint', {
              name: participant.firstName,
            })
          }}
        </p>
      </template>
      <template v-else>
        <div class="grid grid-cols-2 gap-2">
          <UButton
            v-if="participant.email"
            block
            variant="outline"
            color="neutral"
            icon="i-lucide-share-2"
            :disabled="waiting"
            :label="t('adminEdition.screen.sheet.share')"
            @click="onShare"
          />
          <UButton
            block
            variant="outline"
            color="neutral"
            icon="i-lucide-copy"
            :class="{ 'col-span-2': !participant.email }"
            :disabled="waiting"
            :label="t('adminEdition.screen.sheet.copy')"
            @click="onCopy"
          />
        </div>
        <UiNotice
          v-if="nextName"
          variant="positive"
          icon="i-lucide-arrow-right"
        >
          <span class="grow">{{
            t('adminEdition.screen.sheet.next', { name: nextName })
          }}</span>
          <button
            type="button"
            class="min-h-11 shrink-0 font-bold underline"
            @click="emit('skip')"
          >
            {{ t('adminEdition.screen.sheet.skip') }}
          </button>
        </UiNotice>
      </template>
    </template>
  </UiSheet>
</template>
