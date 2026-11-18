<script setup lang="ts">
import { fullName } from '#server/utils/people';
import { NOTE_MAX, addNote } from '#server/utils/messages';
import { formatEventDate } from '#server/utils/rules';
import type {
  EditionParticipant,
  GuessSummary,
} from '~/composables/queries/useGroup';
import {
  useGuessReminderMutation,
  useMessagesQuery,
} from '~/composables/queries/useEdition';

// « Rappeler le jeu » (README 22.17, maquette DevineRappel): who has not
// made a guess yet (never those who passed their turn), the email they
// will get, a word to add, and the send, as often as wanted (Correction
// 15), with the date of the last one. Who has no address is said, with
// the button of their row to share their link; « Écrire au groupe »
// opens a message for everyone. Never a guess.
const props = defineProps<{
  slug: string;
  editionId: string;
  /** Those who have not played yet. */
  people: EditionParticipant[];
  guess: GuessSummary;
  notePosition: 'before' | 'after';
}>();
const open = defineModel<boolean>('open', { required: true });
const emit = defineEmits<{ send: [participationId: string] }>();
const { t, locale } = useT();
const groupOpen = ref(false);
/** « Dernier rappel : aucun. », or its day. */
const lastLine = computed(() =>
  props.guess.reminderSentAt
    ? t('adminEdition.game.lastOn', {
        date: formatEventDate(
          props.guess.reminderSentAt.slice(0, 10),
          locale.value,
        ),
      })
    : t('adminEdition.game.lastNone'),
);
const toast = useToast();
const errorMessage = useErrorMessage();
const remind = useGuessReminderMutation(
  () => props.slug,
  () => props.editionId,
);
const sending = useBusy(() => remind.isPending.value);

const reachable = computed(() => props.people.filter((p) => p.email));
const unreachable = computed(() => props.people.filter((p) => !p.email));
const first = computed(() => reachable.value[0] ?? null);
const messages = useMessagesQuery(
  () => props.slug,
  () => props.editionId,
  () => 'guessReminder',
);
const note = ref('');
const writing = ref(false);
watch(open, (isOpen) => {
  if (isOpen) return;
  note.value = '';
  writing.value = false;
});
const firstMessage = computed(() =>
  first.value
    ? messages.data.value?.messages[first.value.participationId]
    : undefined,
);
const preview = computed(() =>
  firstMessage.value
    ? addNote(firstMessage.value.text, note.value, props.notePosition)
    : undefined,
);
const names = (list: EditionParticipant[]) =>
  list.map((p) => p.firstName).join(', ');
/**
 * Sends the reminder, then closes with a toast.
 * @returns Nothing: the mutation reports by itself.
 */
const onSend = () =>
  remind.mutate(
    { note: note.value },
    {
      onSuccess: () => {
        open.value = false;
        toast.add({
          title: t('adminEdition.game.reminderSent', {
            count: reachable.value.length,
          }),
          color: 'success',
          icon: 'i-lucide-mail-check',
        });
      },
      onError: (error) =>
        toast.add({ title: errorMessage(error), color: 'error' }),
    },
  );
</script>

<template>
  <UiSheet
    v-model:open="open"
    :title="t('adminEdition.game.reminderTitle')"
    :busy="remind.isPending.value"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <span
          class="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-ink"
          aria-hidden="true"
        >
          <UIcon name="i-lucide-search" class="size-5" />
        </span>
        <div class="flex min-w-0 grow flex-col">
          <h2 class="font-display text-[22px] leading-[1.15] font-bold">
            {{ t('adminEdition.game.reminderTitle') }}
          </h2>
          <p class="text-sm text-toned">
            {{ t('adminEdition.game.notPlayed', { count: people.length }) }}
          </p>
        </div>
        <button
          type="button"
          class="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted"
          :aria-label="t('adminEdition.trouble.close')"
          @click="open = false"
        >
          <UIcon name="i-lucide-x" class="size-5" />
        </button>
      </div>
    </template>
    <div class="flex flex-col gap-4 py-2" data-testid="game-reminder">
      <section class="flex flex-col gap-1.5">
        <UiSectionTitle>{{
          t('adminEdition.game.notPlayedTitle')
        }}</UiSectionTitle>
        <ul
          class="divide-y divide-divider overflow-hidden rounded-xl ring-1 ring-default"
        >
          <li
            v-for="p in people"
            :key="p.participationId"
            class="flex min-h-15 items-center gap-3 px-3.5 py-2"
          >
            <UiAvatar :avatar="p.avatar" />
            <span class="flex min-w-0 grow flex-col">
              <span class="truncate font-semibold">{{ fullName(p) }}</span>
              <span class="text-[13px] text-toned">{{
                p.email
                  ? t('adminEdition.game.willGetEmail')
                  : t('adminEdition.game.noEmail')
              }}</span>
            </span>
            <button
              v-if="!p.email"
              type="button"
              class="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary"
              :aria-label="
                t('adminEdition.cockpit.sendLinkOf', { name: fullName(p) })
              "
              @click="emit('send', p.participationId)"
            >
              <UIcon name="i-lucide-send" class="size-5" />
            </button>
          </li>
        </ul>
      </section>
      <section v-if="first" class="flex flex-col gap-1.5">
        <UiSectionTitle>{{ t('adminEdition.game.message') }}</UiSectionTitle>
        <UiMessageBubble
          :text="preview"
          :link="firstMessage?.link"
          class="max-w-full"
          :loading-label="t('adminEdition.screen.sheet.loadingMessage')"
        />
        <UButton
          v-if="!writing"
          variant="outline"
          color="neutral"
          icon="i-lucide-plus"
          class="self-start rounded-full"
          :label="t('adminEdition.game.addWord')"
          @click="writing = true"
        />
        <UTextarea
          v-else
          v-model="note"
          :rows="3"
          :maxlength="NOTE_MAX"
          autoresize
          :placeholder="t('adminEdition.customize.wordPlaceholder')"
          :aria-label="t('adminEdition.customize.word')"
          class="w-full"
        />
      </section>
    </div>
    <template #footer>
      <UButton
        v-if="first"
        block
        size="xl"
        icon="i-lucide-mail"
        class="min-h-14 justify-center font-bold"
        :disabled="remind.isPending.value"
        :loading="sending"
        data-testid="game-remind-send"
        @click="onSend"
      >
        <span class="flex flex-col items-start leading-tight">
          <span>{{ t('adminEdition.game.sendEmail') }}</span>
          <span class="text-[13px] font-semibold opacity-90">{{
            t('adminEdition.game.to', { names: names(reachable) })
          }}</span>
        </span>
      </UButton>
      <UButton
        block
        size="xl"
        variant="outline"
        icon="i-lucide-message-circle"
        class="min-h-12 justify-center font-bold"
        :label="t('adminEdition.game.writeGroup')"
        data-testid="game-write-group"
        @click="groupOpen = true"
      />
      <p class="text-center text-[13px] leading-[1.4] text-toned">
        {{ lastLine }}
        <template v-if="unreachable.length > 0">
          {{
            t('adminEdition.game.shareThem', {
              names: names(unreachable),
              count: unreachable.length,
            })
          }}
        </template>
      </p>
    </template>
  </UiSheet>
  <AdminGameGroupSheet v-model:open="groupOpen" :guess="guess" />
</template>
