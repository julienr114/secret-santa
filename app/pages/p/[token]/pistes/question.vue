<script setup lang="ts">
import {
  useHintsQuery,
  usePersonalQuery,
  useSaveHintsMutation,
} from '~/composables/queries/usePersonal';
import {
  HINT_QUESTIONS,
  nextQuestion,
  questionAt,
  type HintAnswer,
  type HintQuestion,
} from '#shared/utils/hints';

// One of the six questions of « Moi et les cadeaux » (README 22.11): two
// big choices and « Les deux me vont ». One tap saves the answer and goes
// on to the next question, back to the page after the last one.
const route = useRoute();
const router = useRouter();
const token = computed(() => String(route.params.token));
const query = useHintsQuery(token);
const personal = usePersonalQuery(token);
const save = useSaveHintsMutation(token);
// Back to the page the questions were opened from, without stacking it.
const goBack = useGoBack();
const { t, tk } = useT();
const errorMessage = useErrorMessage();
const toast = useToast();

const question = computed(() => questionAt(route.query.n));
const index = computed(() => HINT_QUESTIONS.indexOf(question.value) + 1);
const current = computed(
  () => query.data.value?.portrait.answers[question.value] ?? null,
);
const pagePath = computed(() => `/p/${token.value}/pistes`);
const context = computed(() =>
  personal.data.value
    ? `${personal.data.value.groupName} · ${personal.data.value.editionLabel} · ${t('hints.question.context', { index: index.value })}`
    : '',
);

/** The icon of each choice, first then second. */
const ICONS: Record<HintQuestion, [string, string]> = {
  usefulOrSurprising: ['i-lucide-wrench', 'i-lucide-sparkles'],
  objectOrMoment: ['i-lucide-gift', 'i-lucide-ticket'],
  keepOrConsume: ['i-lucide-gem', 'i-lucide-cookie'],
  selfOrShared: ['i-lucide-user', 'i-lucide-users'],
  secondHand: ['i-lucide-recycle', 'i-lucide-package'],
  surprise: ['i-lucide-party-popper', 'i-lucide-list-checks'],
};
const choices = computed(() =>
  (['first', 'second'] as const).map((answer, at) => ({
    answer,
    icon: ICONS[question.value][at],
    title: tk(`hints.questions.${question.value}.${answer}`),
    help: tk(`hints.questions.${question.value}.${answer}Help`),
  })),
);
/** Where a dot of the progress stands: answered, the one asked, or not yet. */
const dots = computed(() =>
  HINT_QUESTIONS.map((key) =>
    key === question.value
      ? 'current'
      : query.data.value?.portrait.answers[key]
        ? 'done'
        : 'todo',
  ),
);

// The answer leaves at once; the next question shows without waiting.
const onAnswer = (answer: HintAnswer) => {
  if (answer !== current.value) {
    save.mutate(
      { answers: { [question.value]: answer } },
      {
        onError: (error) =>
          toast.add({ title: errorMessage(error), color: 'error' }),
      },
    );
  }
  const next = nextQuestion(question.value);
  return next
    ? router.replace({ query: { n: HINT_QUESTIONS.indexOf(next) + 1 } })
    : goBack(pagePath.value);
};
</script>

<template>
  <ParticipantScreen
    :token="token"
    :back="pagePath"
    :pending="query.isPending.value"
    :error="query.error.value"
  >
    <div class="flex min-h-[calc(100dvh-7.5rem)] flex-col gap-5">
      <div class="flex items-center justify-between">
        <div
          role="img"
          :aria-label="t('hints.question.progress', { index })"
          class="flex items-center gap-1.5"
        >
          <span
            v-for="(dot, at) in dots"
            :key="at"
            class="h-2 rounded-full"
            :class="{
              'w-5.5 bg-primary': dot === 'current',
              'w-2 bg-success': dot === 'done',
              'w-2 bg-envelope-fold': dot === 'todo',
            }"
          />
        </div>
        <button
          type="button"
          class="flex min-h-11 items-center text-[15px] font-semibold text-toned underline"
          @click="goBack(pagePath)"
        >
          {{ t('hints.question.later') }}
        </button>
      </div>
      <div class="flex flex-col gap-1.5">
        <p class="text-sm text-toned">{{ context }}</p>
        <UiPageTitle class="leading-[1.1]">
          {{ tk(`hints.questions.${question}.title`) }}
        </UiPageTitle>
      </div>
      <div class="flex flex-col gap-3">
        <button
          v-for="choice in choices"
          :key="choice.answer"
          type="button"
          :aria-pressed="current === choice.answer"
          class="flex min-h-30 w-full items-center gap-3.5 rounded-2xl border bg-default p-4 text-left transition-colors active:bg-muted"
          :class="
            current === choice.answer
              ? 'border-primary ring-1 ring-primary'
              : 'border-default'
          "
          :data-testid="`hint-${choice.answer}`"
          @click="onAnswer(choice.answer)"
        >
          <span
            class="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary"
            aria-hidden="true"
          >
            <UIcon :name="choice.icon" class="size-7" />
          </span>
          <span class="flex flex-col gap-1">
            <span class="font-display text-[22px] leading-[1.15] font-bold">
              {{ choice.title }}
            </span>
            <span class="text-sm leading-[1.4] text-toned">{{
              choice.help
            }}</span>
          </span>
        </button>
      </div>
      <button
        type="button"
        :aria-pressed="current === 'both'"
        class="h-12 rounded-md border bg-transparent font-semibold transition-colors active:bg-muted"
        :class="
          current === 'both'
            ? 'border-primary ring-1 ring-primary'
            : 'border-default'
        "
        data-testid="hint-both"
        @click="onAnswer('both')"
      >
        {{ t('hints.question.both') }}
      </button>
      <p class="mt-auto text-center text-[13px] leading-[1.4] text-toned">
        {{ t('hints.question.footer') }}
      </p>
    </div>
  </ParticipantScreen>
</template>
