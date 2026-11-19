<script setup lang="ts">
import { isIsoDay } from '#server/utils/rules';
import type { Avatar } from '#server/utils/avatars';
import {
  envelopeState,
  gameTile,
  hintsTile,
  participantSteps,
  type ParticipantStep,
  type StepNote,
} from '#server/utils/personal';
import type { Step } from '~/components/ui/Stepper.vue';
import {
  useOpenAnswerMutation,
  useOpenDrawQuery,
  usePersonalQuery,
  useRevealMutation,
  useSaveAnswerMutation,
  useSaveAvatarMutation,
  type AnswerChoice,
  type AnswerPayload,
  type Reveal,
} from '~/composables/queries/usePersonal';
import {
  useClaimMutation,
  useRequestLinkMutation,
} from '~/composables/queries/useAuth';

// Personal page (README 4.3). Opening it shows nothing secret and counts
// nothing: the result only appears after the "Découvrir" button. Once the
// organiser has revealed the draw (README 22.18), nothing is secret: the
// result is open at once, with who gives to them and the whole draw.
const route = useRoute();
const token = computed(() => String(route.params.token));
const personal = usePersonalQuery(token);
useOrganizersOf(() => personal.data.value?.organizers);
const revealMutation = useRevealMutation(token);
const revealing = useBusy(() => revealMutation.isPending.value);
const me = computed(() => personal.data.value);
const { t, locale } = useT();
const organizers = useOrganizers();
const errorMessage = useErrorMessage();

// Only in this component's state: gone when leaving or reloading the page.
const reveal = ref<Reveal | null>(null);
const onReveal = () =>
  revealMutation.mutate(undefined, {
    onSuccess: (data) => {
      reveal.value = data;
    },
  });
const onHide = () => {
  reveal.value = null;
};
// The page follows the edition by itself: a result still on screen when
// the guardian cancels the draw is no longer valid.
watch(
  () => me.value?.phase,
  (phase) => {
    if (phase === 'waiting') reveal.value = null;
  },
);

/** The draw is revealed: visible to the whole group (README 22.18). */
const opened = computed(
  () => Boolean(me.value?.drawRevealed) && me.value?.phase !== 'waiting',
);
const openDrawQuery = useOpenDrawQuery(token, () => opened.value);
const drawn = computed(() =>
  opened.value ? (openDrawQuery.data.value ?? null) : null,
);

// Avatar: picked in a bottom sheet on a draft, saved with "Valider";
// closing the sheet any other way gives the choice up. The new avatar
// shows at once and is dropped if the save fails.
const toast = useToast();
const saveAvatar = useSaveAvatarMutation(token);
const pickerOpen = ref(false);
const chosen = ref<Avatar | null>(null);
const avatar = computed(() => chosen.value ?? me.value?.avatar ?? null);
/**
 * Opens the icon sheet.
 * @returns Nothing.
 */
const openPicker = () => {
  pickerOpen.value = true;
};
/**
 * Saves the icon picked, shown at once and put back on error.
 * @param next - The icon.
 * @returns Nothing.
 */
const confirmPicker = (next: Avatar) => {
  const current = avatar.value;
  pickerOpen.value = false;
  if (!current) return;
  if (next.emoji === current.emoji && next.color === current.color) return;
  chosen.value = next;
  saveAvatar.mutate(next, {
    onError: (error) => {
      chosen.value = null;
      toast.add({ title: errorMessage(error), color: 'error' });
    },
  });
};

// Keeping the draw in an account: sign up from here and come back, then
// add the draw to the account (only if nobody else's address is on it).
const claim = useClaimMutation(token);
const onClaim = () =>
  claim.mutate(undefined, {
    onSuccess: () =>
      toast.add({
        title: t('participant.account.added'),
        color: 'success',
        icon: 'i-lucide-check',
      }),
    onError: (error) =>
      toast.add({ title: errorMessage(error), color: 'error' }),
  });

// With an address given by the organiser, one tap sends the login link:
// the account is created with this first name, and the draw is in it.
// Without one, the account form opens with the first name filled in.
const signup = useRequestLinkMutation();
const onSignup = () =>
  me.value?.email &&
  signup.mutate({
    email: me.value.email,
    firstName: me.value.firstName,
    next: `/p/${token.value}`,
  });
const prefill = useSignupPrefill();
const onCreate = () => {
  prefill.value = { firstName: me.value?.firstName ?? '', email: '' };
};

// A draw made elsewhere (README 22.12): saying who they give to, or
// seeing and correcting it. The answer is loaded only when asked for, and
// forgotten when the sheets close.
const openAnswer = useOpenAnswerMutation(token);
const saveAnswer = useSaveAnswerMutation(token);
const opening = useBusy(() => openAnswer.isPending.value);
const answerStep = ref<'choose' | 'confirm' | null>(null);
const answerChosen = ref<AnswerChoice | null>(null);
const answerData = ref<AnswerPayload | null>(null);
watch(answerStep, (open) => {
  if (open) return;
  answerChosen.value = null;
  answerData.value = null;
});
/**
 * Loads who they may name and their answer, then opens the list, or the
 * confirmation on their current answer.
 * @returns Nothing: the mutation reports by itself.
 */
const onAnswer = () =>
  openAnswer.mutate(undefined, {
    onSuccess: (data) => {
      answerData.value = data;
      answerChosen.value = data.receiver;
      answerStep.value = data.receiver ? 'confirm' : 'choose';
    },
    onError: (error) =>
      toast.add({ title: errorMessage(error), color: 'error' }),
  });
/**
 * Saves their answer, then closes the sheets.
 * @param personId - The person they give to.
 * @returns Nothing: the mutation reports by itself.
 */
const onConfirmAnswer = (personId: string) =>
  saveAnswer.mutate(personId, {
    onSuccess: () => {
      answerStep.value = null;
      toast.add({
        title: t('participant.answer.saved'),
        color: 'success',
        icon: 'i-lucide-check',
      });
    },
    onError: (error) =>
      toast.add({ title: errorMessage(error), color: 'error' }),
  });

/**
 * The things to do on the page, one tile each (README 22.16): for now
 * « Mes pistes de cadeaux », when the group uses them. Waiting for an
 * action, or done; once they can no longer be changed, only if some were
 * left (decided by Julien on 17 November 2026).
 */
const tiles = computed(() => {
  const state = me.value;
  const kind = state ? hintsTile(state) : null;
  if (!state || !kind) return [];
  const hints =
    kind === 'done'
      ? {
          state: 'done' as const,
          text: state.hintsEditable
            ? t('participant.home.tiles.hintsEditable')
            : t('participant.home.tiles.hintsLocked'),
          short: state.hintsEditable
            ? t('participant.home.tiles.hintsShort')
            : t('participant.home.tiles.hintsShortLocked'),
        }
      : {
          state: 'todo' as const,
          text: t('participant.home.tiles.hintsTodo'),
          short: t('participant.home.tiles.hintsTodo'),
        };
  return [
    {
      key: 'hints',
      to: `/p/${token.value}/pistes`,
      icon: 'i-lucide-list-checks',
      title: t('hints.title'),
      ...hints,
    },
  ];
});
const gameLines = useGameLines();
/**
 * « Et toi, qui t'offre ton cadeau ? » under the result (Correction 15),
 * while the guesses are open and one has neither played nor passed.
 */
const gameInvite = computed(() => {
  const guess = me.value?.guess;
  return guess && guess.open && !guess.played && !guess.skipped
    ? guess.count
    : null;
});
/** The tile « Devine qui » (README 22.17), when the game is on. */
const gameTileView = computed(() => {
  const at = gameTile(me.value?.guess ?? null);
  if (!at) return null;
  const STATES = {
    play: 'todo',
    played: 'done',
    skipped: 'idle',
    waiting: 'idle',
    palmares: 'award',
    answers: 'done',
  } as const;
  const text = t(`participant.home.tiles.game.${at}`);
  const guess = me.value?.guess;
  return {
    // While one may still play: the count and the deadline (Correction 15).
    lines:
      at === 'play' || at === 'played'
        ? [gameLines.count(guess?.count), gameLines.deadline(guess?.endsAt)]
        : [],
    key: 'game',
    to: `/p/${token.value}/devine`,
    icon: 'i-lucide-search',
    title: t('participant.game.title'),
    state: STATES[at],
    text,
    short: text,
  };
});
const allTiles = computed(() =>
  [...tiles.value, gameTileView.value].filter(
    (tile): tile is NonNullable<typeof tile> => Boolean(tile),
  ),
);
/**
 * The palmarès of « Devine qui » has come and is not watched yet: it is
 * the card of the page (maquette DevineTiragePalmares).
 */
const palmaresCard = computed(
  () =>
    Boolean(me.value?.guess?.palmares) &&
    !me.value?.guess?.seen &&
    !reveal.value,
);

const today = new Date().toLocaleDateString('sv-SE');
/** The party has come, or the edition is closed: the past tense. */
const after = computed(() => {
  const state = me.value;
  if (!state) return false;
  if (state.phase === 'closed') return true;
  return isIsoDay(state.eventDate) && today >= state.eventDate;
});
/**
 * The words of a step of the timeline.
 * @param step - The step and where it stands.
 * @returns Its label, with what it adds (soon, done, in some days…).
 */
const stepLabel = (step: ParticipantStep): string => {
  if (step.key === 'invitation') return t('participant.home.steps.invitation');
  if (step.key === 'draw') {
    if (step.note === 'answer') return t('participant.home.steps.answer');
    if (opened.value) return t('participant.home.steps.drawRevealed');
    return step.note === 'soon'
      ? t('participant.home.steps.drawSoon')
      : t('participant.home.steps.drawDone');
  }
  if (step.note === 'inDays') {
    return t('participant.home.steps.partyIn', { count: step.days ?? 0 });
  }
  if (step.note === 'today') return t('participant.home.steps.partyToday');
  if (step.note === 'over') return t('participant.home.steps.partyOver');
  return t('participant.home.steps.party');
};
/** Icon of the current step: a clock before the draw, a star after. */
const STEP_ICONS: Partial<Record<NonNullable<StepNote>, string>> = {
  soon: 'i-lucide-clock',
  answer: 'i-lucide-sparkle',
  done: 'i-lucide-star',
};
const steps = computed<Step[]>(() =>
  me.value
    ? participantSteps(
        me.value.phase,
        me.value.eventDate,
        today,
        Boolean(me.value.answer),
      ).map((step) =>
        // Revealed, once the party has come: every step is behind
        // (README 22.18, TirageDevoileApres).
        view.value === 'openAfter'
          ? { label: stepLabel(step), state: 'done' as const }
          : {
              label: stepLabel(step),
              state: step.state,
              icon: step.note ? STEP_ICONS[step.note] : undefined,
            },
      )
    : [],
);

/** Which card the middle of the page shows. */
const view = computed(() => {
  const state = me.value;
  if (state?.answer) return 'answer';
  if (!state || state.phase === 'waiting') return 'waiting';
  if (opened.value) return after.value ? 'openAfter' : 'open';
  if (reveal.value) return 'shown';
  if (state.phase === 'closed') return 'closed';
  return state.revealed ? 'seen' : 'ready';
});
const envelope = computed(() =>
  envelopeState(
    me.value?.phase ?? 'waiting',
    me.value?.revealed ?? false,
    false,
  ),
);
/**
 * A band across the page, between the header and the timeline, in every
 * state but a closed edition (lot 16 bis): « Fête le ven. 25 décembre »,
 * then « Budget : 30 € », whatever is known; a long budget wraps.
 */
const facts = computed(() => {
  const state = me.value;
  if (!state || state.phase === 'closed' || view.value === 'openAfter') {
    return [];
  }
  const date = isIsoDay(state.eventDate)
    ? new Intl.DateTimeFormat(locale.value, {
        weekday: 'short',
        day: 'numeric',
        month: 'long',
        timeZone: 'UTC',
      }).format(new Date(`${state.eventDate}T12:00:00Z`))
    : state.eventDate;
  return [
    date && {
      icon: 'i-lucide-calendar',
      label: t('participant.home.facts.party'),
      value: date,
    },
    state.budget && {
      icon: 'i-lucide-tag',
      label: t('participant.home.facts.budget'),
      value: state.budget,
    },
  ].filter((fact): fact is { icon: string; label: string; value: string } =>
    Boolean(fact),
  );
});
/** The organiser's words, not on a closed edition nor after the party. */
const note = computed(() =>
  me.value && me.value.phase !== 'closed' && view.value !== 'openAfter'
    ? me.value.guardianMessage
    : '',
);
/** No hint from the person they give to, or the edition is closed. */
const withoutHints = computed(
  () => me.value?.receiverHints === 'none' || me.value?.phase === 'closed',
);
/** Title, text and line under the button of the middle card. */
const card = computed(() => {
  const state = me.value;
  switch (view.value) {
    case 'answer':
      return state?.answer?.given
        ? {
            title: t('participant.answer.card.savedTitle'),
            body: t('participant.answer.card.savedBody', {
              count: state.answer.answered,
              total: state.answer.total,
            }),
            hint: t('participant.answer.card.savedHint'),
          }
        : {
            title: t('participant.answer.card.title'),
            body: t('participant.answer.card.body'),
            hint: t('participant.answer.card.hint', {
              count: organizers.value,
            }),
          };
    case 'waiting':
      return {
        title: t('participant.home.waiting.title'),
        body: t('participant.home.waiting.body', { count: organizers.value }),
        hint: state?.hintsEditable ? t('participant.home.waiting.hint') : '',
      };
    case 'ready':
      return {
        title: t('participant.home.ready.title'),
        body:
          state && state.receiverHints !== 'none'
            ? t('participant.home.ready.bodyHints')
            : t('participant.home.ready.body'),
        hint: t('participant.home.ready.hint'),
      };
    case 'seen':
      // Hints put forward (lot 16 bis): new ones, some, or none yet.
      if (state?.receiverHints === 'new') {
        return {
          title: t('participant.home.seen.newTitle'),
          body: t('participant.home.seen.newBody'),
          hint: '',
        };
      }
      if (state?.receiverHints === 'some') {
        return {
          title: t('participant.home.seen.title'),
          body: t('participant.home.seen.bodyHints'),
          hint: '',
        };
      }
      return {
        title: t('participant.home.seen.title'),
        body: t('participant.home.seen.body'),
        hint: state?.canAskHints ? t('participant.home.seen.noHintsYet') : '',
      };
    default:
      return {
        title: t('participant.home.closed.title'),
        body: state?.revealed
          ? t('participant.home.closed.body')
          : t('participant.home.closed.bodyNotSeen'),
        hint: '',
      };
  }
});
</script>

<template>
  <ParticipantScreen
    :token="token"
    :pending="personal.isPending.value"
    :error="personal.error.value"
    :skeleton="['header', 'steps', 'envelope', 'list']"
  >
    <template v-if="me">
      <div class="flex items-center gap-3">
        <button
          v-if="me.avatarEditable && avatar"
          type="button"
          class="relative shrink-0 rounded-full"
          :aria-label="t('participant.home.changeAvatar')"
          @click="openPicker"
        >
          <UiAvatar :avatar="avatar" size="lg" />
          <span
            class="absolute -right-1 -bottom-1 flex size-7 items-center justify-center rounded-full border border-default bg-default text-muted"
            aria-hidden="true"
          >
            <UIcon name="i-lucide-pencil" class="size-3.5" />
          </span>
        </button>
        <UiAvatar v-else-if="avatar" :avatar="avatar" size="lg" />
        <div class="min-w-0">
          <UiPageTitle>
            {{ t('participant.home.greeting', { firstName: me.firstName }) }}
          </UiPageTitle>
          <p class="text-sm text-muted">
            {{ me.groupName }} · {{ me.editionLabel }}
          </p>
        </div>
      </div>

      <ul
        v-if="facts.length > 0"
        class="-mt-2 flex flex-wrap gap-x-4.5 gap-y-1.5 text-sm leading-[1.4] text-toned"
        data-testid="draw-facts"
      >
        <li
          v-for="fact in facts"
          :key="fact.label"
          class="flex min-w-0 items-start gap-1.5"
        >
          <UIcon
            :name="fact.icon"
            class="mt-0.5 size-4 shrink-0"
            aria-hidden="true"
          />
          <span class="min-w-0 break-words">
            {{ fact.label }}
            <strong class="font-bold text-default">{{ fact.value }}</strong>
          </span>
        </li>
      </ul>

      <UiStepper :steps="steps" :label="t('participant.home.steps.label')" />

      <ParticipantRevealedBanner
        v-if="view === 'open' && drawn"
        :revealed-at="drawn.revealedAt"
        :revealed-by="drawn.revealedBy"
        :journal-path="`/p/${token}/journal`"
      />

      <template v-if="view === 'shown' && reveal">
        <ParticipantRevealCard :token="token" :reveal="reveal" />
        <ParticipantGameInvite
          v-if="gameInvite"
          :token="token"
          :count="gameInvite"
        />
        <ParticipantOrganizerNote v-if="note" :text="note" />
        <div class="-mt-2 flex flex-col items-center gap-2">
          <UButton
            variant="outline"
            color="neutral"
            size="lg"
            block
            class="h-12 justify-center bg-muted font-bold"
            icon="i-lucide-eye-off"
            :label="t('participant.home.shown.hide')"
            @click="onHide"
          />
          <p class="text-center text-[13px] text-muted">
            {{ t('participant.home.shown.hint') }}
          </p>
        </div>
      </template>
      <ParticipantRevealCard
        v-else-if="view === 'open' && drawn"
        :token="token"
        :reveal="drawn"
        open
      />
      <UiCard
        v-else-if="palmaresCard"
        padding="lg"
        class="flex flex-col items-center gap-3 text-center"
        data-testid="palmares-card"
      >
        <UiPodium />
        <h2 class="font-display text-[26px] leading-[1.2] font-bold">
          {{ t('participant.game.arrived') }}
        </h2>
        <p class="text-[15px] text-toned">
          {{ t('participant.game.arrivedBody') }}
        </p>
        <UButton
          :to="`/p/${token}/devine/palmares`"
          block
          size="xl"
          class="justify-center bg-success font-bold hover:bg-success-deep active:bg-success-deep"
          :label="t('participant.game.discover')"
        />
        <button
          v-if="!opened"
          type="button"
          class="mt-1 flex min-h-11 items-center text-[15px] text-toned underline"
          :disabled="revealMutation.isPending.value"
          @click="onReveal"
        >
          {{
            me.revealed
              ? t('participant.game.seeMyResult')
              : t('participant.game.discoverMyResult')
          }}
        </button>
      </UiCard>
      <UiCard
        v-else-if="view === 'openAfter' && drawn"
        padding="lg"
        class="flex flex-col items-center gap-2 text-center"
        data-testid="gave-card"
      >
        <p class="text-muted">{{ t('participant.revealed.gaveTo') }}</p>
        <UiAvatar :avatar="drawn.receiver.avatar" size="xl" />
        <p
          class="font-display text-[44px] leading-tight font-bold break-words text-primary"
          data-testid="receiver"
        >
          {{ drawn.receiver.name }}
        </p>
        <p class="text-sm text-toned">
          {{
            me.phase === 'closed'
              ? t('participant.revealed.closedBody')
              : t('participant.revealed.afterBody')
          }}
        </p>
      </UiCard>
      <UiCard
        v-else-if="!opened || !drawn"
        padding="lg"
        class="flex flex-col items-center gap-3 text-center"
        data-testid="draw-card"
      >
        <UiEnvelope :state="envelope" />
        <h2 class="font-display text-[22px] leading-snug font-bold">
          {{ card.title }}
        </h2>
        <p class="text-sm text-muted">{{ card.body }}</p>
        <UAlert
          v-if="revealMutation.isError.value"
          color="error"
          variant="subtle"
          :description="errorMessage(revealMutation.error.value)"
        />
        <UButton
          v-if="view === 'answer'"
          block
          size="xl"
          class="font-bold"
          :variant="me.answer?.given ? 'outline' : 'solid'"
          :disabled="openAnswer.isPending.value"
          :loading="opening"
          :label="
            me.answer?.given
              ? t('participant.answer.card.review')
              : t('participant.answer.card.action')
          "
          data-testid="answer-open"
          @click="onAnswer"
        />
        <UButton
          v-else-if="view === 'waiting' && me.hintsEditable"
          :to="`/p/${token}/pistes`"
          block
          size="xl"
          icon="i-lucide-list-checks"
          class="font-bold"
          :label="t('participant.home.waiting.action')"
        />
        <UButton
          v-else-if="view !== 'waiting'"
          block
          size="xl"
          icon="i-lucide-gift"
          class="font-bold"
          :variant="me.revealed && withoutHints ? 'outline' : 'solid'"
          :disabled="revealMutation.isPending.value"
          :loading="revealing"
          :label="
            revealing
              ? t('participant.home.ready.revealing')
              : !me.revealed
                ? t('participant.home.ready.reveal')
                : withoutHints
                  ? t('participant.home.seen.revealAgain')
                  : t('participant.home.seen.revealWithHints')
          "
          @click="onReveal"
        />
        <p v-if="card.hint" class="text-[13px] text-muted">{{ card.hint }}</p>
      </UiCard>

      <UiCard
        v-if="view === 'openAfter' && palmaresCard && drawn"
        padding="md"
        class="flex items-center gap-4"
        data-testid="gave-card"
      >
        <UiAvatar :avatar="drawn.receiver.avatar" size="lg" />
        <span class="flex min-w-0 flex-col">
          <span class="text-sm text-toned">{{
            t('participant.revealed.gaveTo')
          }}</span>
          <span
            class="font-display text-[28px] leading-tight font-bold break-words text-primary"
            data-testid="receiver"
            >{{ drawn.receiver.name }}</span
          >
        </span>
      </UiCard>

      <ParticipantOrganizerNote v-if="note && view !== 'shown'" :text="note" />

      <ParticipantDrawLines
        v-if="(view === 'open' || view === 'openAfter') && drawn"
        :santa="drawn.santa"
        :past="after"
        :all-path="`/p/${token}/tirage`"
      />

      <!-- Once revealed, the banner leads to the journal: no alert row. -->
      <ParticipantJournalRow
        v-if="me.journalAlerts > 0 && !opened"
        :to="`/p/${token}/journal`"
        :alerts="me.journalAlerts"
      />
      <div
        v-if="allTiles.length > 0"
        class="grid gap-3"
        :class="allTiles.length > 1 ? 'grid-cols-2' : 'grid-cols-1'"
        data-testid="tiles"
      >
        <UiTile
          v-for="tile in allTiles"
          :key="tile.key"
          :to="tile.to"
          :icon="tile.icon"
          :title="tile.title"
          :state="tile.state"
          :text="allTiles.length > 1 ? tile.short : tile.text"
          :lines="'lines' in tile ? tile.lines : []"
          :compact="allTiles.length > 1"
        />
      </div>
      <ParticipantJournalRow
        v-if="me.journalAlerts === 0 || opened"
        :to="`/p/${token}/journal`"
        :alerts="0"
      />

      <UiCard
        v-if="me.linked === null || me.linked === 'free'"
        padding="lg"
        class="flex flex-col gap-3"
        data-testid="account-invite"
      >
        <p class="font-display text-lg font-bold">
          {{ t('participant.account.title') }}
        </p>
        <p class="text-sm text-muted">
          {{
            me.linked === null
              ? t('participant.account.body')
              : t('participant.account.bodyClaim')
          }}
        </p>
        <template v-if="me.linked === null && me.email">
          <p
            v-if="signup.isSuccess.value"
            class="text-sm font-medium"
            role="status"
          >
            {{ t('participant.account.sent', { email: me.email }) }}
          </p>
          <UButton
            v-if="signup.data.value?.devLink"
            :to="signup.data.value.devLink"
            external
            block
            variant="soft"
            :label="t('auth.login.devLink')"
          />
          <UButton
            v-if="!signup.isSuccess.value"
            block
            variant="soft"
            icon="i-lucide-mail"
            :loading="signup.isPending.value"
            :label="t('participant.account.sendTo', { email: me.email })"
            @click="onSignup"
          />
        </template>
        <UButton
          v-else-if="me.linked === null"
          :to="`/login?mode=signup&next=/p/${token}`"
          block
          variant="soft"
          icon="i-lucide-user-plus"
          :label="t('participant.account.create')"
          @click="onCreate"
        />
        <UButton
          v-else
          block
          variant="soft"
          icon="i-lucide-link"
          :loading="claim.isPending.value"
          :label="t('participant.account.claim')"
          @click="onClaim"
        />
      </UiCard>
      <ParticipantAnswerSheets
        v-if="answerData"
        v-model:step="answerStep"
        v-model:chosen="answerChosen"
        :choices="answerData.choices"
        :saving="saveAnswer.isPending.value"
        @confirm="onConfirmAnswer"
      />
      <AdminAvatarSheet
        v-if="avatar"
        v-model:open="pickerOpen"
        :initial="avatar"
        :title="t('adminGroup.avatar.title')"
        @validate="confirmPicker"
      />
    </template>
  </ParticipantScreen>
</template>
