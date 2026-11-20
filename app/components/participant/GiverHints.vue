<script setup lang="ts">
import {
  useRequestHintsMutation,
  type Reveal,
} from '~/composables/queries/usePersonal';
import { giverPortrait, portraitTexts } from '#shared/utils/hints';

// « Pour t'aider à choisir », under the result (README 22.11): the
// receiver's answers in sentences (« Inès préfère : »…), their texts,
// their precise ideas. With no
// hint at all, « Lui demander des pistes », once per draw: a sheet says
// what will happen, then the request leaves at once, anonymous; once the
// draw is revealed (README 22.18), it says who asks.
const props = defineProps<{
  token: string;
  reveal: Reveal & { hints: NonNullable<Reveal['hints']> };
  /** The draw is revealed: the request is no longer anonymous. */
  named?: boolean;
}>();
const { t, tk, locale } = useT();
const organizers = useOrganizers();
const errorMessage = useErrorMessage();
const request = useRequestHintsMutation(() => props.token);
const busy = useBusy(() => request.isPending.value);

const hints = computed(() => props.reveal.hints);
const name = computed(() => props.reveal.receiver.name);
const said = computed(() =>
  giverPortrait(hints.value.portrait.answers, hints.value.mode),
);
/** Second hand and surprise, in one paragraph. */
const sentences = computed(() =>
  [
    said.value.secondHand &&
      tk(`hints.giver.secondHand.${said.value.secondHand}`),
    said.value.surprise &&
      tk(`hints.giver.surprise.${said.value.surprise}`, { name: name.value }),
  ]
    .filter(Boolean)
    .join(' '),
);
const answered = computed(
  () =>
    said.value.prefers.length > 0 ||
    Boolean(sentences.value) ||
    said.value.indifferent.length > 0,
);
/** « le 16 novembre », in the reader's language. */
const updatedOn = computed(() =>
  hints.value.updatedAt
    ? new Intl.DateTimeFormat(locale.value, {
        day: 'numeric',
        month: 'long',
      }).format(new Date(hints.value.updatedAt))
    : '',
);
const texts = computed(() => portraitTexts(hints.value.portrait.texts));
// « Sa liste de cadeaux » (lot 27 ter, maquette PistesResultatListe): a
// link to the gift list the receiver linked to their hints, which opens
// in anonymous mode. With it, « Si tu sèches » no longer shows: the list
// says it better.
const list = computed(() => props.reveal.list ?? null);
const ideas = computed(() => (list.value ? [] : hints.value.ideas));
const empty = computed(
  () =>
    !list.value &&
    !answered.value &&
    texts.value.length === 0 &&
    ideas.value.length === 0,
);
/** Asked now, or earlier in this draw. */
const requested = computed(
  () => hints.value.requested || request.isSuccess.value,
);
/** Whether the receiver got an email: known for sure once just sent. */
const emailed = computed(
  () => request.data.value?.emailed ?? props.reveal.receiverHasEmail,
);
const sheetOpen = ref(false);
const onSend = () =>
  request.mutate(undefined, {
    onSuccess: () => {
      sheetOpen.value = false;
    },
  });
</script>

<template>
  <div class="flex flex-col gap-3.5" data-testid="giver-hints">
    <div class="flex flex-col gap-0.5">
      <div class="flex items-center gap-2">
        <h2 class="font-display text-xl font-bold">
          {{ t('hints.result.title') }}
        </h2>
        <span
          v-if="hints.isNew"
          class="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-inverted"
          data-testid="hints-new"
        >
          {{ t('hints.result.isNew') }}
        </span>
      </div>
      <p v-if="hints.isNew && updatedOn" class="text-[13px] text-toned">
        {{ t('hints.result.updatedOn', { date: updatedOn }) }}
      </p>
    </div>
    <template v-if="!empty">
      <!-- Opened as a page of its own, not inside the app: the list is
           read again from the server, with what the address carries. -->
      <a
        v-if="list"
        :href="list.path"
        class="flex min-h-15 items-center gap-3 rounded-[18px] bg-muted px-3 py-2"
        data-testid="giver-list"
      >
        <ListsTile :icon="list.icon" size="sm" />
        <span class="flex min-w-0 grow flex-col">
          <span class="text-[15px] font-bold break-words">{{
            t('hints.result.list', { title: list.title })
          }}</span>
          <span class="text-[13px] leading-[1.35] text-toned">{{
            t('hints.result.listHelp')
          }}</span>
        </span>
        <UIcon
          name="i-lucide-chevron-right"
          class="size-5 shrink-0 text-muted"
        />
      </a>
      <div
        v-if="answered"
        class="flex flex-col gap-1.5 text-[15px] leading-[1.45]"
        data-testid="giver-portrait"
      >
        <template v-if="said.prefers.length > 0">
          <p>{{ t('hints.giver.prefers', { name }) }}</p>
          <ul class="flex list-disc flex-col gap-0.5 pl-5">
            <li v-for="line in said.prefers" :key="line.question">
              {{ tk(`hints.giver.choices.${line.question}.${line.answer}`) }}
            </li>
          </ul>
        </template>
        <p v-if="sentences">{{ sentences }}</p>
        <p
          v-for="question in said.indifferent"
          :key="question"
          class="text-toned"
        >
          {{
            t('hints.giver.indifferent', {
              subject: tk(`hints.giver.subjects.${question}`),
            })
          }}
        </p>
      </div>
      <div v-for="block in texts" :key="block.key" class="flex flex-col gap-1">
        <p class="text-xs font-bold tracking-[0.04em] text-toned uppercase">
          {{ tk(`hints.texts.${block.key}.giver`) }}
        </p>
        <p class="leading-[1.45] break-words">{{ block.text }}</p>
      </div>
      <div v-if="ideas.length > 0" class="flex flex-col gap-1">
        <p class="text-xs font-bold tracking-[0.04em] text-toned uppercase">
          {{ t('hints.ideas.giver') }}
        </p>
        <ParticipantWishList :wishes="ideas" class="mt-1" />
      </div>
    </template>
    <UiNotice
      v-else-if="requested"
      variant="positive"
      icon="i-lucide-send"
      data-testid="hints-request-sent"
    >
      <span>
        <strong>{{ t('hints.result.sent') }}</strong>
        {{
          emailed
            ? t(`hints.result.sentEmail${named ? 'Named' : ''}`, { name })
            : t(`hints.result.sentPage${named ? 'Named' : ''}`, { name })
        }}
        {{
          reveal.requesterHasEmail
            ? t('hints.result.willEmail')
            : t('hints.result.willSee')
        }}
      </span>
    </UiNotice>
    <template v-else>
      <p class="text-[15px] leading-[1.45] text-toned">
        {{ t('hints.result.none', { name }) }}
      </p>
      <UButton
        block
        size="xl"
        variant="outline"
        icon="i-lucide-message-circle-question"
        class="min-h-12 justify-center font-bold"
        :label="t('hints.result.ask')"
        @click="sheetOpen = true"
      />
      <p
        v-if="!named"
        class="-mt-1.5 text-center text-[13px] leading-[1.4] text-toned"
      >
        {{ t('hints.result.askHint') }}
      </p>
    </template>

    <UiSheet
      v-model:open="sheetOpen"
      :title="t('hints.request.title', { name })"
      :description="
        reveal.receiverHasEmail
          ? t('hints.request.bodyEmail', { name })
          : t('hints.request.bodyPage', { name })
      "
      :busy="request.isPending.value"
    >
      <UiNotice
        variant="checklist"
        :items="[
          named
            ? {
                key: 'named',
                state: 'ok',
                icon: 'i-lucide-eye',
                title: t('hints.request.named'),
                detail: t('hints.request.namedHelp', { name }),
              }
            : {
                key: 'anonymous',
                state: 'ok',
                title: t('hints.request.anonymous'),
                detail: t('hints.request.anonymousHelp', { count: organizers }),
              },
          {
            key: 'once',
            state: 'ok',
            title: t('hints.request.once'),
            detail: t('hints.request.onceHelp'),
          },
        ]"
      />
      <template #footer>
        <p
          v-if="request.isError.value"
          class="flex items-start gap-2 text-sm font-medium text-error"
          role="alert"
        >
          <UIcon
            name="i-lucide-circle-alert"
            class="mt-0.5 size-4 shrink-0"
            aria-hidden="true"
          />
          {{ errorMessage(request.error.value) }}
        </p>
        <UButton
          block
          size="xl"
          class="min-h-13 justify-center font-bold"
          :disabled="request.isPending.value"
          :loading="busy"
          :label="busy ? t('hints.request.sending') : t('hints.request.send')"
          @click="onSend"
        />
        <UButton
          block
          variant="ghost"
          color="neutral"
          class="min-h-11.5 justify-center font-semibold"
          :disabled="request.isPending.value"
          :label="t('hints.request.cancel')"
          @click="sheetOpen = false"
        />
      </template>
    </UiSheet>
  </div>
</template>
