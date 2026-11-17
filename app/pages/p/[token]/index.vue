<script setup lang="ts">
import { isIsoDay } from '#server/utils/rules';
import type { Avatar } from '#server/utils/avatars';
import {
  envelopeState,
  participantSteps,
  type ParticipantStep,
  type StepNote,
} from '#server/utils/personal';
import type { Step } from '~/components/ui/Stepper.vue';
import {
  usePersonalQuery,
  useRevealMutation,
  useSaveAvatarMutation,
  type Reveal,
} from '~/composables/queries/usePersonal';
import {
  useClaimMutation,
  useRequestLinkMutation,
} from '~/composables/queries/useAuth';

// Personal page (README 4.3). Opening it shows nothing secret and counts
// nothing: the result only appears after the "Découvrir" button.
const route = useRoute();
const token = computed(() => String(route.params.token));
const personal = usePersonalQuery(token);
const revealMutation = useRevealMutation(token);
const revealing = useBusy(() => revealMutation.isPending.value);
const me = computed(() => personal.data.value);
const { t, locale } = useT();
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

/** Where their own hints stand, under « Mes pistes de cadeaux ». */
const hintsSubtitle = computed(() => {
  if (!me.value?.hasHints) return t('hints.state.none');
  return me.value.hintsEditable
    ? t('hints.state.filledEditable')
    : t('hints.state.filledLocked');
});

const today = new Date().toLocaleDateString('sv-SE');
/**
 * The words of a step of the timeline.
 * @param step - The step and where it stands.
 * @returns Its label, with what it adds (soon, done, in some days…).
 */
const stepLabel = (step: ParticipantStep): string => {
  if (step.key === 'invitation') return t('participant.home.steps.invitation');
  if (step.key === 'draw') {
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
  done: 'i-lucide-star',
};
const steps = computed<Step[]>(() =>
  me.value
    ? participantSteps(me.value.phase, me.value.eventDate, today).map(
        (step) => ({
          label: stepLabel(step),
          state: step.state,
          icon: step.note ? STEP_ICONS[step.note] : undefined,
        }),
      )
    : [],
);

/** Which card the middle of the page shows. */
const view = computed(() => {
  const state = me.value;
  if (!state || state.phase === 'waiting') return 'waiting';
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
 * Under the title, in every state but a closed edition (lot 16 bis):
 * « Budget 30 € · Fête le ven. 25 décembre », whatever is known.
 */
const facts = computed(() => {
  const state = me.value;
  if (!state || state.phase === 'closed') return [];
  const date = isIsoDay(state.eventDate)
    ? new Intl.DateTimeFormat(locale.value, {
        weekday: 'short',
        day: 'numeric',
        month: 'long',
        timeZone: 'UTC',
      }).format(new Date(`${state.eventDate}T12:00:00Z`))
    : state.eventDate;
  return [
    state.budget && {
      label: t('participant.home.facts.budget'),
      value: state.budget,
    },
    date && { label: t('participant.home.facts.party'), value: date },
  ].filter((fact): fact is { label: string; value: string } => Boolean(fact));
});
/** The organiser's words, not on a closed edition. */
const note = computed(() =>
  me.value && me.value.phase !== 'closed' ? me.value.guardianMessage : '',
);
/** No hint from the person they give to, or the edition is closed. */
const withoutHints = computed(
  () => me.value?.receiverHints === 'none' || me.value?.phase === 'closed',
);
/** Title, text and line under the button of the middle card. */
const card = computed(() => {
  const state = me.value;
  switch (view.value) {
    case 'waiting':
      return {
        title: t('participant.home.waiting.title'),
        body: t('participant.home.waiting.body'),
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
          <p v-if="facts.length > 0" class="mt-0.5 text-sm text-toned">
            <template v-for="(fact, at) in facts" :key="fact.label">
              <span v-if="at > 0"> · </span>{{ fact.label }}
              <strong class="font-bold text-default">{{ fact.value }}</strong>
            </template>
          </p>
        </div>
      </div>

      <UiStepper :steps="steps" :label="t('participant.home.steps.label')" />

      <template v-if="view === 'shown' && reveal">
        <ParticipantRevealCard :token="token" :reveal="reveal" />
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
      <UiCard
        v-else
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
          v-if="view === 'waiting' && me.hintsEditable"
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

      <ParticipantOrganizerNote v-if="note && view !== 'shown'" :text="note" />

      <UiList>
        <UiListItem
          v-if="me.giftHints !== 'none'"
          :to="`/p/${token}/pistes`"
          icon="i-lucide-list-checks"
          :title="t('hints.title')"
          :subtitle="hintsSubtitle"
        />
        <UiListItem
          :to="`/p/${token}/journal`"
          icon="i-lucide-scroll-text"
          :title="t('participant.home.journal.title')"
          :subtitle="
            me.journalAlerts > 0
              ? t('participant.home.journal.alerts', {
                  count: me.journalAlerts,
                })
              : t('participant.home.journal.subtitle')
          "
          data-testid="journal-row"
        >
          <template v-if="me.journalAlerts > 0" #trailing>
            <span
              class="size-3 shrink-0 rounded-full bg-alert shadow-[0_0_0_3px_var(--color-warning-soft)]"
              aria-hidden="true"
            />
          </template>
        </UiListItem>
      </UiList>

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
