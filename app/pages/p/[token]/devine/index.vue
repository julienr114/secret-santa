<script setup lang="ts">
import {
  useGameQuery,
  useGuessMutation,
  type GamePayload,
} from '~/composables/queries/usePersonal';
import type { GuessOption } from '~/components/participant/GuessSheet.vue';

// « Devine qui » (README 22.17) for one participant. Before the party: one
// guess on one's own Santa (DevineUnique, DevineUniqueFait), or every
// pair (DevinePaires), the line of the person one gives to drawn like the
// others; then the guesses closed (DevineFerme). Once the draw is
// revealed, « Devine qui : les réponses » (DevinePalmares,
// DevinePalmaresVu, DevinePalmaresPeu): the palmarès in images, and one's
// own guesses, corrected only once the images are seen.
const route = useRoute();
const token = computed(() => String(route.params.token));
const query = useGameQuery(token);
const save = useGuessMutation(token);
const { t } = useT();
const toast = useToast();
const errorMessage = useErrorMessage();

const game = computed(() => query.data.value);
const context = computed(() =>
  game.value
    ? [
        { label: game.value.groupName, to: `/p/${token.value}` },
        { label: game.value.editionLabel, to: `/p/${token.value}` },
      ]
    : [],
);
/**
 * A person of the draw, the player named « Moi » (one may name oneself as
 * the giver of someone, decided by Julien on 18 November 2026).
 * @param id - The person.
 * @returns The person with the name to show, or null.
 */
const personOf = (id: string | null | undefined) => {
  const person = game.value?.people.find((p) => p.id === id) ?? null;
  return person && person.id === game.value?.me
    ? { ...person, name: t('participant.game.me') }
    : person;
};
const guessOf = (recipientId: string) =>
  game.value?.mine.find((g) => g.recipientId === recipientId)?.giverId ?? null;
const endText = useGuessEnd();
const end = computed(() => endText(game.value?.endsAt));
/** Every recipient the player may guess for: themselves first. */
const rows = computed(() => {
  const g = game.value;
  if (!g) return [];
  const others = g.mode === 'all' ? g.people.filter((p) => p.id !== g.me) : [];
  return [personOf(g.me)!, ...others].map((person) => ({
    person,
    mine: person.id === g.me,
    guessed: personOf(guessOf(person.id)),
  }));
});
const made = computed(() => game.value?.mine.length ?? 0);
/** « Mon Père Noël » then « Les autres » while open; one list once closed. */
const sections = computed(() =>
  game.value?.open
    ? [
        {
          key: 'santa',
          title: t('participant.game.mySanta'),
          rows: rows.value.slice(0, 1),
        },
        ...(rows.value.length > 1
          ? [
              {
                key: 'others',
                title: t('participant.game.others'),
                rows: rows.value.slice(1),
              },
            ]
          : []),
      ]
    : [{ key: 'mine', title: t('participant.game.mine'), rows: rows.value }],
);

// The sheet: for whom, and the people one may name.
const choosingFor = ref<string | null>(null);
const sheetOpen = computed({
  get: () => choosingFor.value !== null,
  set: (open: boolean) => {
    if (!open) choosingFor.value = null;
  },
});
const options = computed<GuessOption[]>(() => {
  const g = game.value;
  const recipient = choosingFor.value;
  if (!g || !recipient) return [];
  // « Moi » first, except on one's own line: nobody gives to themselves.
  return [
    ...g.people.filter((p) => p.id === g.me),
    ...g.people.filter((p) => p.id !== g.me),
  ]
    .filter((p) => p.id !== recipient)
    .map((p) => personOf(p.id)!)
    .map((p) => {
      const elsewhere = g.mine.find(
        (m) => m.giverId === p.id && m.recipientId !== recipient,
      );
      return {
        ...p,
        movedFrom: elsewhere
          ? elsewhere.recipientId === g.me
            ? t('participant.game.movedFromMe')
            : t('participant.game.movedFrom', {
                name: personOf(elsewhere.recipientId)?.name ?? '',
              })
          : undefined,
      };
    });
});
const sheetTitle = computed(() =>
  choosingFor.value === game.value?.me
    ? t('participant.game.whoGivesMe')
    : t('participant.game.whoGivesTo', {
        name: personOf(choosingFor.value)?.name ?? '',
      }),
);
/**
 * Saves a guess, or takes it back, then closes the sheet.
 * @param giverId - The person named, or null.
 * @returns Nothing: the mutation reports by itself.
 */
const onChoose = (giverId: string | null) => {
  const recipientId = choosingFor.value;
  if (!recipientId) return;
  save.mutate(
    { recipientId, giverId },
    {
      onSuccess: async () => {
        choosingFor.value = null;
        await query.refetch();
      },
      onError: (error) =>
        toast.add({ title: errorMessage(error), color: 'error' }),
    },
  );
};

/** Once revealed: the answers page. */
const results = computed(() => game.value?.results ?? null);
/** The guesses as they were made, the decoy line left out. */
const asMade = computed(() =>
  (results.value?.corrected ?? []).map((c) => ({
    ...c,
    recipient: personOf(c.recipientId),
    guessed: personOf(c.guessedId),
    actual: personOf(c.actualId),
  })),
);
/** The guesses are corrected once the images are seen, or without them. */
const corrected = computed(
  () => Boolean(results.value?.seen) || results.value?.enough === false,
);
const rightCount = computed(() => asMade.value.filter((c) => c.right).length);
type Row = NonNullable<GamePayload['results']>['corrected'][number];
const isMe = (row: Pick<Row, 'recipientId'>) =>
  row.recipientId === game.value?.me;
</script>

<template>
  <ParticipantScreen
    :token="token"
    :back="`/p/${token}`"
    :pending="query.isPending.value"
    :error="query.error.value"
    :skeleton="['title', 'list']"
  >
    <template v-if="game">
      <div class="flex flex-col gap-1">
        <UiPageContext :parts="context" :label="t('common.context')" />
        <UiPageTitle>{{
          game.revealed
            ? t('participant.game.answersTitle')
            : t('participant.game.title')
        }}</UiPageTitle>
        <p class="text-[15px] leading-[1.45] text-toned">
          <template v-if="game.revealed">{{
            results?.enough === false
              ? t('participant.game.answersFew')
              : corrected
                ? t('participant.game.answersSeen')
                : t('participant.game.answersWaiting')
          }}</template>
          <template v-else-if="!game.open">{{
            t('participant.game.closedSince', { end })
          }}</template>
          <template v-else-if="game.mode === 'santa'">{{
            t('participant.game.introSanta', { end })
          }}</template>
          <template v-else>{{
            t('participant.game.introAll', { end })
          }}</template>
        </p>
      </div>

      <!-- The answers, once the draw is revealed. -->
      <template v-if="game.revealed && results">
        <NuxtLink
          v-if="results.enough"
          :to="`/p/${token}/devine/palmares`"
          class="flex items-center gap-4 rounded-2xl bg-pine-700 px-5 py-4 text-white active:bg-pine-800"
          data-testid="palmares-link"
        >
          <span
            class="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/15"
            aria-hidden="true"
          >
            <UIcon name="i-lucide-sparkle" class="size-6" />
          </span>
          <span class="flex min-w-0 grow flex-col">
            <span class="font-display text-[19px] leading-[1.2] font-bold">{{
              results.seen
                ? t('participant.game.rewatch')
                : t('participant.game.discover')
            }}</span>
            <span class="text-sm opacity-90">{{
              t('participant.game.palmaresHint')
            }}</span>
          </span>
          <UIcon
            name="i-lucide-chevron-right"
            class="size-5 shrink-0"
            aria-hidden="true"
          />
        </NuxtLink>
        <UiList
          v-if="asMade.length > 0"
          :title="
            corrected
              ? t('participant.game.mineScore', {
                  right: rightCount,
                  count: asMade.length,
                })
              : t('participant.game.mine')
          "
          data-testid="my-guesses"
        >
          <li
            v-for="row in asMade"
            :key="row.recipientId"
            class="flex min-h-15 items-center gap-3 px-4 py-2"
          >
            <template v-if="corrected">
              <span
                class="flex size-7 shrink-0 items-center justify-center rounded-full"
                :class="
                  row.right
                    ? 'bg-success-soft text-success-ink'
                    : 'bg-primary-soft text-primary-ink'
                "
                aria-hidden="true"
              >
                <UIcon
                  :name="row.right ? 'i-lucide-check' : 'i-lucide-x'"
                  class="size-4"
                />
              </span>
              <span class="flex min-w-0 grow flex-col">
                <span class="truncate font-semibold">{{
                  isMe(row)
                    ? t('participant.game.mySantaWas', {
                        name: row.actual?.name ?? '',
                      })
                    : t('participant.game.theirSantaWas', {
                        name: row.recipient?.name ?? '',
                        giver: row.actual?.name ?? '',
                      })
                }}</span>
                <span class="text-[13px] text-toned">{{
                  row.right
                    ? t('participant.game.right')
                    : t('participant.game.youSaid', {
                        name: row.guessed?.name ?? '',
                      })
                }}</span>
              </span>
              <UiAvatar v-if="row.actual" :avatar="row.actual.avatar" />
            </template>
            <template v-else>
              <UiAvatar v-if="row.recipient" :avatar="row.recipient.avatar" />
              <span class="min-w-0 grow truncate font-semibold">{{
                isMe(row)
                  ? t('participant.game.whoGivesMeShort')
                  : t('participant.game.whoGivesTo', {
                      name: row.recipient?.name ?? '',
                    })
              }}</span>
              <span
                v-if="row.guessed"
                class="flex items-center gap-1.5 font-semibold"
              >
                <UiAvatar :avatar="row.guessed.avatar" size="sm" />
                {{ row.guessed.name }}
              </span>
            </template>
          </li>
        </UiList>
      </template>

      <!-- « Qui m'offre ? », guesses open: one big guess. -->
      <template v-else-if="game.open && game.mode === 'santa'">
        <div
          class="flex min-h-[50dvh] flex-col items-center justify-center gap-4 text-center"
          data-testid="santa-guess"
        >
          <p
            class="text-sm font-bold tracking-[0.08em] text-primary-ink uppercase"
          >
            {{
              rows[0]?.guessed
                ? t('participant.game.myGuess')
                : t('participant.game.whoGivesMeCaps')
            }}
          </p>
          <template v-if="rows[0]?.guessed">
            <span
              class="flex size-32 items-center justify-center rounded-full text-6xl shadow-[0_12px_30px_rgba(60,30,10,0.12)]"
            >
              <UiAvatar
                :avatar="rows[0].guessed.avatar"
                size="xl"
                class="size-32! text-6xl!"
              />
            </span>
            <p
              class="font-display text-[52px] leading-[1.05] font-bold text-primary-ink"
            >
              {{ rows[0].guessed.name }}
            </p>
          </template>
          <span
            v-else
            class="flex size-32 items-center justify-center rounded-full border-2 border-dashed border-envelope-fold font-display text-6xl font-bold text-mustard-700"
            aria-hidden="true"
            >?</span
          >
        </div>
        <UiStickyFooter>
          <UButton
            block
            size="xl"
            class="h-13 justify-center text-[17px] font-bold"
            :variant="rows[0]?.guessed ? 'outline' : 'solid'"
            :label="
              rows[0]?.guessed
                ? t('participant.game.changeMind')
                : t('participant.game.makeGuess')
            "
            data-testid="guess-open"
            @click="choosingFor = game.me"
          />
          <p class="text-center text-[13px] text-toned">
            {{ t('participant.game.secret') }}
          </p>
        </UiStickyFooter>
      </template>

      <!-- « Toutes les paires », open; or every mode once closed. -->
      <template v-else>
        <UiCard
          v-if="!game.open"
          padding="lg"
          class="flex flex-col items-center gap-1 text-center"
          data-testid="guesses-closed"
        >
          <h2 class="font-display text-[22px] font-bold">
            {{ t('participant.game.atParty') }}
          </h2>
          <p class="text-sm text-toned">
            {{ t('participant.game.atPartyBody') }}
          </p>
        </UiCard>
        <UiList
          v-for="section in sections"
          :key="section.key"
          :title="section.title"
          data-testid="guess-rows"
        >
          <li
            v-for="row in section.rows"
            :key="row.person.id"
            class="flex min-h-15 items-center gap-3 px-4 py-2"
          >
            <UiAvatar :avatar="row.person.avatar" />
            <span class="min-w-0 grow truncate font-semibold">{{
              row.mine
                ? t('participant.game.whoGivesMeShort')
                : t('participant.game.whoGivesTo', {
                    name: row.person.name,
                  })
            }}</span>
            <template v-if="!game.open">
              <span
                v-if="row.guessed"
                class="flex items-center gap-1.5 font-semibold"
              >
                <UiAvatar :avatar="row.guessed.avatar" size="sm" />
                {{ row.guessed.name }}
              </span>
              <span v-else class="text-sm text-toned">{{
                t('participant.game.noGuess')
              }}</span>
            </template>
            <button
              v-else-if="row.guessed"
              type="button"
              class="flex min-h-11 items-center gap-1.5 rounded-full bg-muted py-1 pr-3 pl-1 font-semibold ring-1 ring-default"
              :aria-label="
                t('participant.game.changeFor', {
                  name: row.mine ? t('participant.game.you') : row.person.name,
                })
              "
              @click="choosingFor = row.person.id"
            >
              <UiAvatar :avatar="row.guessed.avatar" size="sm" />
              {{ row.guessed.name }}
              <UIcon
                name="i-lucide-pen-line"
                class="size-3.5 text-dimmed"
                aria-hidden="true"
              />
            </button>
            <button
              v-else
              type="button"
              class="flex min-h-11 items-center rounded-full border border-dashed border-primary px-4 text-[15px] font-semibold text-primary-ink"
              @click="choosingFor = row.person.id"
            >
              {{ t('participant.game.choose') }}
            </button>
          </li>
        </UiList>
        <p
          v-if="game.open"
          class="text-center text-[13px] text-toned"
          data-testid="guess-count"
        >
          {{ t('participant.game.count', { count: made }) }}
        </p>
      </template>

      <ParticipantGuessSheet
        v-model:open="sheetOpen"
        :title="sheetTitle"
        :description="
          choosingFor === game.me
            ? t('participant.game.canChange')
            : t('participant.game.oneGift')
        "
        :options="options"
        :current="choosingFor ? guessOf(choosingFor) : null"
        :saving="save.isPending.value"
        @choose="onChoose"
      />
    </template>
  </ParticipantScreen>
</template>
