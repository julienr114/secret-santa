<script setup lang="ts">
import { deadlineOf } from '#server/utils/nudges';
import { NOTE_MAX } from '#server/utils/messages';
import type { GuessSummary } from '~/composables/queries/useGroup';

// « Écrire au groupe » (README 22.17, Correction 15, DevineRappelGroupe):
// one message for everyone, to share or copy for WhatsApp or SMS. It gives
// the count and the deadline, names nobody and holds no personal link.
const props = defineProps<{ guess: GuessSummary }>();
const open = defineModel<boolean>('open', { required: true });
const { t } = useT();
const toast = useToast();
const endText = useGuessEnd();
const note = ref('');
const writing = ref(false);
watch(open, (isOpen) => {
  if (isOpen) return;
  note.value = '';
  writing.value = false;
});

// The deadline is read in this browser's zone, once mounted.
const zone = ref<string | null>(null);
onMounted(() => {
  zone.value = Intl.DateTimeFormat().resolvedOptions().timeZone;
});
const message = computed(() => {
  const { endsAt, players, total } = props.guess;
  const deadline =
    endsAt && zone.value
      ? deadlineOf(endsAt, new Date().toISOString(), zone.value)
      : null;
  const opening =
    deadline?.kind === 'lastDay'
      ? t('adminEdition.game.group.lastDay')
      : deadline
        ? t('adminEdition.game.group.days', { count: deadline.days })
        : t('adminEdition.game.group.until', {
            end: endsAt ? endText(endsAt) : '',
          });
  const count =
    players === 0
      ? t('adminEdition.game.group.nobody')
      : t('adminEdition.game.group.count', {
          count: players,
          total,
        });
  return [
    [opening, count, t('adminEdition.game.group.tail')].join(' '),
    note.value.trim(),
    t('adminEdition.game.group.personal'),
  ]
    .filter(Boolean)
    .join('\n\n');
});

/** Copies the message, and says so. */
const copy = async () => {
  await navigator.clipboard.writeText(message.value);
  toast.add({
    title: t('adminEdition.game.group.copied'),
    color: 'success',
    icon: 'i-lucide-check',
  });
};
/** Opens the phone's share sheet, or copies where there is none. */
const share = async () => {
  if (!navigator.share) return copy();
  await navigator.share({ text: message.value }).catch(() => undefined);
};
</script>

<template>
  <UiSheet v-model:open="open" :title="t('adminEdition.game.writeGroup')">
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
            {{ t('adminEdition.game.writeGroup') }}
          </h2>
          <p class="text-sm text-toned">
            {{ t('adminEdition.game.group.subtitle') }}
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
    <section class="flex flex-col gap-1.5 py-2" data-testid="game-group">
      <UiSectionTitle>{{ t('adminEdition.game.message') }}</UiSectionTitle>
      <UiMessageBubble
        :text="message"
        class="max-w-full"
        data-testid="game-group-message"
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
    <template #footer>
      <UButton
        block
        size="xl"
        class="min-h-14 justify-center font-bold"
        :label="t('adminEdition.game.group.share')"
        @click="share"
      />
      <UButton
        block
        size="xl"
        variant="outline"
        color="neutral"
        class="min-h-12 justify-center font-semibold"
        :label="t('adminEdition.game.group.copy')"
        data-testid="game-group-copy"
        @click="copy"
      />
      <p class="text-center text-[13px] leading-[1.4] text-toned">
        {{ t('adminEdition.game.group.help') }}
      </p>
    </template>
  </UiSheet>
</template>
