<script setup lang="ts">
import { fullName } from '#server/utils/people';
import { addNote } from '#server/utils/messages';
import { useEditionQuery } from '~/composables/queries/useGroup';
import {
  useGuessReminderMutation,
  useMessagesQuery,
  useEmailsPausedQuery,
} from '~/composables/queries/useEdition';
import { formatEventDate } from '#server/utils/rules';

// « Rappeler le jeu » (README 22.17, Correction 16, maquettes DevineRappel
// and DevineRappelGroupe): a page built like « Envoyer par email », with a
// switch on top. « À chacun, par email »: the message for the first one
// ticked, « Personnaliser le message », those who have not played yet
// (never those who passed their turn), ticked when they have an address,
// « Ajouter » otherwise, and one button. « Au groupe »: one message to
// share or copy, naming nobody, with no personal link. As often as wanted.
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
  title: () => context.titleOf(t('adminEdition.game.reminderTitle')),
});
const screen = computed(() => ({
  back: editionPath.value,
  bar: {
    title: t('adminEdition.game.reminderTitle'),
    context: context.parts.value.map((part) => part.label).join(' · '),
    cancel: t('common.actions.cancel'),
  },
}));

const edition = useEditionQuery(slug, id);
// The emails suspended for everyone (ticket 129): EnvoiSuspendu instead.
const emailsPaused = useEmailsPausedQuery();
const paused = computed(() => emailsPaused.data.value?.paused ?? false);
const guess = computed(() => edition.data.value?.guess);
const position = computed(
  () => edition.data.value?.rules.messageNotePosition ?? 'after',
);
/** Those left to remind: not played, not passed their turn. */
const people = computed(() =>
  (edition.data.value?.participants ?? []).filter(
    (p) => p.played === false && !p.skipped,
  ),
);

// The switch, kept in the address so that « Personnaliser » comes back.
const audience = computed({
  get: () => (route.query.vers === 'groupe' ? 'groupe' : 'chacun'),
  set: (value: string) =>
    navigateTo(
      {
        query: {
          ...route.query,
          vers: value === 'groupe' ? 'groupe' : undefined,
        },
      },
      { replace: true },
    ),
});
const audiences = computed(() => [
  { value: 'chacun', label: t('adminEdition.game.toEach') },
  { value: 'groupe', label: t('adminEdition.game.toGroup') },
]);

// The word of « Personnaliser le message », for each audience.
const choice = useMessageChoice(id);
const noteFor = (who: string) =>
  choice.value?.who === who ? choice.value.note : '';

// « À chacun, par email »: the ticks, everyone with an address at first.
const ticks = useState<string[] | null>(`reminder:${id.value}`, () => null);
const withEmail = computed(() => people.value.filter((p) => p.email));
const selected = computed({
  get: () => ticks.value ?? withEmail.value.map((p) => p.participationId),
  set: (pids: string[]) => {
    ticks.value = pids;
  },
});
const isSelected = (pid: string) => selected.value.includes(pid);
const toggle = (pid: string, on: boolean) => {
  selected.value = on
    ? [...selected.value, pid]
    : selected.value.filter((v) => v !== pid);
};
const messages = useMessagesQuery(slug, id, () => 'guessReminder');
const first = computed(
  () =>
    people.value.find((p) => isSelected(p.participationId)) ??
    withEmail.value[0] ??
    people.value[0],
);
const firstMessage = computed(
  () =>
    first.value && messages.data.value?.messages[first.value.participationId],
);
const preview = computed(() =>
  firstMessage.value
    ? addNote(firstMessage.value.text, noteFor('rappel'), position.value)
    : undefined,
);
const customize = (who: 'rappel' | 'groupe') =>
  `${editionPath.value}/message?pour=${who}&type=guessReminder`;
/** « Dernier rappel : aucun. », or its day. */
const lastLine = computed(() => {
  const sentAt = guess.value?.reminderSentAt;
  if (!sentAt) return t('adminEdition.game.lastNone');
  // Who sent it, with more than one organiser (ticket 170).
  const by = guess.value?.reminderBy ?? null;
  return t(
    by
      ? by.me
        ? 'adminEdition.game.lastOnByMe'
        : 'adminEdition.game.lastOnBy'
      : 'adminEdition.game.lastOn',
    {
      date: formatEventDate(sentAt.slice(0, 10), locale.value),
      name: by && !by.me ? by.name : '',
    },
  );
});

const remind = useGuessReminderMutation(slug, id);
const sending = useBusy(() => remind.isPending.value);
/**
 * Sends the reminder to those ticked, then goes back to the edition.
 * @returns Nothing: the mutation reports by itself.
 */
const onSend = () =>
  remind.mutate(
    { note: noteFor('rappel'), participationIds: selected.value },
    {
      onSuccess: () => {
        toast.done(
          t('adminEdition.game.reminderSent', {
            count: selected.value.length,
          }),
        );
        choice.value = null;
        ticks.value = null;
        goBack(editionPath.value);
      },
      onError: (error) => toast.failed(errorMessage(error)),
    },
  );

// « Au groupe »: one message, to share or copy.
const groupText = useGroupReminder();
const groupMessage = computed(() => groupText(guess.value, noteFor('groupe')));
/** Copies the message, and says so. */
const copy = async () => {
  await navigator.clipboard.writeText(groupMessage.value);
  toast.done(t('adminEdition.game.group.copied'));
};
/** Opens the phone's share sheet, or copies where there is none. */
const share = async () => {
  if (!navigator.share) return copy();
  await navigator.share({ text: groupMessage.value }).catch(() => undefined);
};
</script>

<template>
  <AdminScreen v-bind="screen">
    <AdminQueryState
      :pending="edition.isPending.value"
      :error="edition.error.value"
    >
      <AdminEmailsPaused v-if="paused" :to="editionPath" />
      <template v-else>
        <UiSegmented
          v-model="audience"
          :items="audiences"
          :label="t('adminEdition.game.reminderTitle')"
          data-testid="reminder-audience"
        />

        <template v-if="audience === 'chacun'">
          <section class="flex flex-col gap-1.5" data-testid="reminder-each">
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
              data-testid="reminder-preview"
            />
            <NuxtLink
              :to="customize('rappel')"
              class="flex min-h-11 items-center gap-1 self-start text-sm font-bold text-primary-ink"
              @click="ticks = selected"
            >
              {{ t('adminEdition.screen.sheet.customize') }}
              <UIcon
                name="i-lucide-chevron-right"
                class="size-4"
                aria-hidden="true"
              />
            </NuxtLink>
          </section>

          <section class="flex flex-col gap-1.5">
            <UiSectionTitle data-testid="reminder-count">{{
              t('adminEdition.game.notPlayedCount', {
                count: selected.length,
                total: people.length,
              })
            }}</UiSectionTitle>
            <UiList>
              <template v-for="p in people" :key="p.participationId">
                <UiCheckRow
                  v-if="p.email"
                  :avatar="p.avatar"
                  :title="fullName(p)"
                  :subtitle="p.email"
                  :label="
                    t('adminEdition.screen.emails.select', {
                      name: fullName(p),
                    })
                  "
                  :checked="isSelected(p.participationId)"
                  @update:checked="(on) => toggle(p.participationId, on)"
                />
                <li v-else class="flex min-h-15 items-center gap-3 px-4 py-2">
                  <UiAvatar :avatar="p.avatar" />
                  <span class="flex min-w-0 grow flex-col">
                    <span class="truncate font-semibold">{{
                      fullName(p)
                    }}</span>
                    <span
                      class="flex min-w-0 items-center gap-1.25 text-[13px] text-toned"
                    >
                      <UIcon
                        name="i-lucide-circle-dashed"
                        class="size-3.5 shrink-0"
                      />
                      <span class="truncate">{{
                        t('adminEdition.screen.emails.noEmail')
                      }}</span>
                    </span>
                  </span>
                  <NuxtLink
                    :to="`/e/${slug}/membres/${p.id}`"
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
            </UiList>
            <p class="px-1 text-[13px] leading-[1.4] text-toned">
              {{ t('adminEdition.game.noEmailGroup') }}
              {{ lastLine }}
            </p>
          </section>

          <UiStickyFooter>
            <UButton
              block
              size="xl"
              class="h-13 justify-center text-[17px] font-bold"
              :disabled="!selected.length || !preview || remind.isPending.value"
              :loading="sending"
              :label="
                t('adminEdition.screen.emails.send', { count: selected.length })
              "
              data-testid="game-remind-send"
              @click="onSend"
            />
          </UiStickyFooter>
        </template>

        <template v-else>
          <section class="flex flex-col gap-1.5" data-testid="game-group">
            <UiSectionTitle>{{
              t('adminEdition.game.message')
            }}</UiSectionTitle>
            <UiMessageBubble
              :text="groupMessage"
              class="max-w-full"
              data-testid="game-group-message"
            />
            <NuxtLink
              :to="customize('groupe')"
              class="flex min-h-11 items-center gap-1 self-start text-sm font-bold text-primary-ink"
            >
              {{ t('adminEdition.screen.sheet.customize') }}
              <UIcon
                name="i-lucide-chevron-right"
                class="size-4"
                aria-hidden="true"
              />
            </NuxtLink>
          </section>
          <p
            class="rounded-xl bg-muted px-3.5 py-3 text-sm leading-[1.45] text-toned"
          >
            {{ t('adminEdition.game.group.help') }}
          </p>
          <UiStickyFooter>
            <UButton
              block
              size="xl"
              class="h-13 justify-center text-[17px] font-bold"
              :label="t('adminEdition.game.group.share')"
              @click="share"
            />
            <UButton
              block
              size="xl"
              variant="outline"
              color="neutral"
              class="h-12 justify-center font-semibold"
              :label="t('adminEdition.game.group.copy')"
              data-testid="game-group-copy"
              @click="copy"
            />
          </UiStickyFooter>
        </template>
      </template>
    </AdminQueryState>
  </AdminScreen>
</template>
