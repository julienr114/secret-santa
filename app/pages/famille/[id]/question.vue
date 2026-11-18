<script setup lang="ts">
import {
  HINT_QUESTIONS,
  type HintAnswer,
  type HintQuestion,
} from '#shared/utils/hints';
import {
  useMemberQuery,
  useUpdateMemberMutation,
} from '~/composables/queries/useLists';

// « Répondre aux questions pour Léo » (README 22.19): the six questions of
// the gift hints, one after the other, answered for a person of my
// family. One tap saves the answer and goes on, back to their page after
// the last one.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const router = useRouter();
const id = computed(() => String(route.params.id));
const { t, tk } = useT();
const toast = useToast();
const errorMessage = useErrorMessage();
const goBack = useGoBack();
const query = useMemberQuery(id);
const update = useUpdateMemberMutation(id);
const parent = computed(() => {
  const params = new URLSearchParams();
  if (route.query.liste) params.set('liste', String(route.query.liste));
  if (route.query.place) params.set('place', String(route.query.place));
  const search = params.toString();
  return `/famille/${id.value}${search ? `?${search}` : ''}`;
});
const index = computed(() => {
  const n = Number(route.query.n);
  return Number.isInteger(n) && n >= 1 && n <= HINT_QUESTIONS.length
    ? n - 1
    : 0;
});
const question = computed<HintQuestion>(() => HINT_QUESTIONS[index.value]!);
const current = computed(
  () => query.data.value?.member.answers[question.value] ?? null,
);
const name = computed(() => query.data.value?.member.firstName ?? '');
const onAnswer = (answer: HintAnswer) => {
  if (answer !== current.value) {
    update.mutate(
      { answers: { [question.value]: answer } },
      {
        onError: (error) =>
          toast.add({ title: errorMessage(error), color: 'error' }),
      },
    );
  }
  return index.value + 1 < HINT_QUESTIONS.length
    ? router.replace({ query: { ...route.query, n: index.value + 2 } })
    : goBack(parent.value);
};
</script>

<template>
  <AdminScreen :back="parent">
    <AdminQueryState
      :pending="query.isPending.value"
      :error="query.error.value"
      :skeleton="['title', 'card']"
    >
      <div class="flex flex-col gap-1.5">
        <p class="text-sm text-toned">
          {{ t('lists.person.answer', { name }) }} ·
          {{
            t('hints.question.progress', {
              index: index + 1,
              count: HINT_QUESTIONS.length,
            })
          }}
        </p>
        <UiPageTitle class="leading-[1.1]">
          {{ tk(`hints.questions.${question}.title`) }}
        </UiPageTitle>
      </div>
      <div class="flex flex-col gap-3">
        <button
          v-for="answer in ['first', 'second'] as const"
          :key="answer"
          type="button"
          :aria-pressed="current === answer"
          class="flex min-h-20 w-full flex-col gap-1 rounded-2xl p-4 text-left"
          :class="
            current === answer
              ? 'border-2 border-primary bg-primary-tint'
              : 'border border-default bg-default'
          "
          @click="onAnswer(answer)"
        >
          <span class="font-display text-[22px] leading-[1.15] font-bold">
            {{ tk(`hints.questions.${question}.${answer}`) }}
          </span>
          <span class="text-sm leading-[1.4] text-toned">{{
            tk(`hints.questions.${question}.${answer}Help`)
          }}</span>
        </button>
        <button
          type="button"
          :aria-pressed="current === 'both'"
          class="h-12 rounded-md border font-semibold"
          :class="
            current === 'both'
              ? 'border-primary ring-1 ring-primary'
              : 'border-default'
          "
          @click="onAnswer('both')"
        >
          {{ t('hints.question.both') }}
        </button>
      </div>
    </AdminQueryState>
  </AdminScreen>
</template>
