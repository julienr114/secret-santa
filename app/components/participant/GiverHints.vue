<script setup lang="ts">
import {
  useRequestHintsMutation,
  type Reveal,
} from '~/composables/queries/usePersonal';
import { portraitTags, portraitTexts } from '#shared/utils/hints';

// « Pour t'aider à choisir », under the result (README 22.11): the
// receiver's answers as tags, their texts, their precise ideas. With no
// hint at all, « Lui demander des pistes », once per draw: a sheet says
// what will happen, then the request leaves at once, anonymous.
const props = defineProps<{
  token: string;
  reveal: Reveal & { hints: NonNullable<Reveal['hints']> };
}>();
const { t, tk } = useT();
const errorMessage = useErrorMessage();
const request = useRequestHintsMutation(() => props.token);
const busy = useBusy(() => request.isPending.value);

const hints = computed(() => props.reveal.hints);
const name = computed(() => props.reveal.receiver.name);
const tags = computed(() =>
  portraitTags(hints.value.portrait.answers).map(({ question, answer }) =>
    tk(`hints.tags.${question}.${answer}`),
  ),
);
const texts = computed(() => portraitTexts(hints.value.portrait.texts));
const empty = computed(
  () =>
    tags.value.length === 0 &&
    texts.value.length === 0 &&
    hints.value.ideas.length === 0,
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
    <h2 class="font-display text-xl font-bold">
      {{ t('hints.result.title') }}
    </h2>
    <template v-if="!empty">
      <UiTagList v-if="tags.length > 0" :tags="tags" />
      <div v-for="block in texts" :key="block.key" class="flex flex-col gap-1">
        <p class="text-xs font-bold tracking-[0.04em] text-toned uppercase">
          {{ tk(`hints.texts.${block.key}.giver`) }}
        </p>
        <p class="leading-[1.45] break-words">{{ block.text }}</p>
      </div>
      <div v-if="hints.ideas.length > 0" class="flex flex-col gap-1">
        <p class="text-xs font-bold tracking-[0.04em] text-toned uppercase">
          {{ t('hints.ideas.giver') }}
        </p>
        <ParticipantWishList :wishes="hints.ideas" class="mt-1" />
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
            ? t('hints.result.sentEmail', { name })
            : t('hints.result.sentPage', { name })
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
      <p class="-mt-1.5 text-center text-[13px] leading-[1.4] text-toned">
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
          {
            key: 'anonymous',
            state: 'ok',
            title: t('hints.request.anonymous'),
            detail: t('hints.request.anonymousHelp'),
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
