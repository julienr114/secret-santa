<script setup lang="ts">
import { messageTypesFor, type MessageType } from '#server/utils/messages';
import { LOCALES, type Locale } from '#shared/i18n';
import { useSendEmailsMutation } from '~/composables/queries/useEdition';
import { useUpdatePersonMutation } from '~/composables/queries/useGroup';
import { useShareMessage } from '~/composables/useShareMessage';

// Everything needed to send one participant their message, as list rows:
// which message, in which language, then how (phone share sheet, copy,
// email when the group sends emails). Used on
// the participant screen and in the "send" sheet of the edition screen.
// Sharing and copying start right on tap (Safari), hence the text given
// ready-made. The language can still be changed at the last moment: it is
// saved as the person's preferred language (their page follows too), and
// the rows wait for the text to come back in that language.
const props = defineProps<{
  slug: string;
  editionId: string;
  participant: {
    /** The person's id (not the participation's). */
    id: string;
    participationId: string;
    firstName: string;
    email: string | null;
    language: Locale;
  };
  /** Status of the edition: it decides which messages can be sent. */
  status: string;
  /** The text of the chosen message for this person, once loaded. */
  text?: string;
  emailEnabled: boolean;
}>();
const emit = defineEmits<{ done: [] }>();
const messageType = defineModel<MessageType>('messageType', {
  required: true,
});

const { t, tk } = useT();
const toast = useToast();
const errorMessage = useErrorMessage();
const sharer = useShareMessage(() => props.slug);
const sendEmails = useSendEmailsMutation(
  () => props.slug,
  () => props.editionId,
);

const updatePerson = useUpdatePersonMutation(() => props.slug);
const messageItems = computed(() =>
  messageTypesFor(props.status).map((value) => ({
    value,
    label: tk(`common.messageType.${value}`),
  })),
);
// Not ready while the language is being saved (the mutation refetches the
// group) or while the text of a newly chosen message is loading.
const switching = computed(() => updatePerson.isPending.value);
const waiting = computed(() => switching.value || !props.text);
const onLanguage = (language: Locale) => {
  if (language === props.participant.language || switching.value) return;
  updatePerson.mutate(
    { id: props.participant.id, language },
    {
      onError: (error) =>
        toast.add({ title: errorMessage(error), color: 'error' }),
    },
  );
};

const onShare = () => {
  sharer.share(
    props.participant.participationId,
    messageType.value,
    props.text,
  );
  emit('done');
};
const onCopy = () => {
  sharer.copy(props.participant.participationId, messageType.value, props.text);
  emit('done');
};
const onEmail = () =>
  sendEmails.mutate(
    {
      type: messageType.value,
      audience: 'all',
      participationIds: [props.participant.participationId],
    },
    {
      onSuccess: () =>
        toast.add({
          title: t('adminEdition.share.emailSent', {
            name: props.participant.firstName,
          }),
          color: 'success',
          icon: 'i-lucide-mail-check',
        }),
      onError: (error) =>
        toast.add({ title: errorMessage(error), color: 'error' }),
      onSettled: () => emit('done'),
    },
  );
</script>

<template>
  <li class="px-4 py-3">
    <URadioGroup
      v-model="messageType"
      :items="messageItems"
      :legend="t('adminEdition.participant.messageTitle')"
      orientation="horizontal"
    />
  </li>
  <li class="flex items-center gap-3 px-4 py-2.5">
    <span class="min-w-0 grow">
      <span class="block font-medium">{{
        t('adminEdition.share.language')
      }}</span>
      <span class="block text-sm text-muted">{{
        t('adminEdition.share.languageHint')
      }}</span>
    </span>
    <span
      class="flex shrink-0 gap-1"
      role="radiogroup"
      :aria-label="t('adminEdition.share.language')"
    >
      <UButton
        v-for="code in LOCALES"
        :key="code"
        size="sm"
        role="radio"
        :aria-checked="code === participant.language"
        :aria-label="tk(`common.language.${code}`)"
        :color="code === participant.language ? 'primary' : 'neutral'"
        :variant="code === participant.language ? 'solid' : 'outline'"
        :loading="switching && updatePerson.variables.value?.language === code"
        :label="code.toUpperCase()"
        @click="onLanguage(code)"
      />
    </span>
  </li>
  <!-- What will be sent, word for word, in the chosen language. -->
  <li class="flex flex-col gap-1.5 px-4 py-3">
    <span class="text-xs font-semibold tracking-wide text-muted uppercase">{{
      t('adminEdition.share.preview')
    }}</span>
    <USkeleton v-if="waiting" class="h-28 w-full rounded-lg" />
    <p
      v-else
      class="rounded-lg bg-muted p-3 text-sm break-words whitespace-pre-line"
      data-testid="message-preview"
    >
      {{ text }}
    </p>
  </li>
  <MobileListItem
    icon="i-lucide-share-2"
    :class="{ 'opacity-50': waiting }"
    :title="t('adminEdition.participant.shareMessage')"
    :subtitle="t('adminEdition.participant.shareMessageHint')"
    :on-click="waiting ? undefined : onShare"
  />
  <MobileListItem
    icon="i-lucide-copy"
    :class="{ 'opacity-50': waiting }"
    :title="t('adminEdition.participant.copyMessage')"
    :on-click="waiting ? undefined : onCopy"
  />
  <template v-if="emailEnabled">
    <MobileListItem
      v-if="participant.email"
      icon="i-lucide-mail"
      :class="{ 'opacity-50': waiting }"
      :title="t('adminEdition.share.emailMessage')"
      :subtitle="participant.email"
      :on-click="waiting ? undefined : onEmail"
    >
      <template v-if="sendEmails.isPending.value" #trailing>
        <UIcon
          name="i-lucide-loader-circle"
          class="size-5 shrink-0 animate-spin text-dimmed"
        />
      </template>
    </MobileListItem>
    <MobileListItem
      v-else
      icon="i-lucide-mail"
      class="opacity-60"
      :title="t('adminEdition.share.emailMessage')"
      :subtitle="t('adminEdition.share.noEmail')"
    />
  </template>
</template>
