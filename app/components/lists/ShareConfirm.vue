<script setup lang="ts">
import type { SharingAsk } from '#server/utils/listSharing';
import {
  useSaveSharingMutation,
  useShareListMutation,
} from '~/composables/queries/useLists';

// A question before a step, a level of the bar of a list (docs/spec/v3/
// listes.md, « Resserrer le partage », « Tout le monde », « Changer de
// lien », ticket 141; V3ListeQuiRetirer, V3ListeQuiOuvrir,
// V3ListeLienChanger): « ‹ Retirer « Chez Mamie » ? », what it does, and
// one button that takes the step. The back cancels. Taken, the bar goes
// back to its first level (`done`).

/** The question, and the step it asks for. */
export type ShareQuestion = {
  title: string;
  text: string;
  submit: string;
  /** Saves this sharing, or gives the list a new link. */
  step: { kind: 'save'; ask: SharingAsk } | { kind: 'renew' };
};
const props = defineProps<{ listId: string; question: ShareQuestion }>();
const emit = defineEmits<{ back: []; done: [] }>();
const { t } = useT();
const toast = useMessages();
const errorMessage = useErrorMessage();
const save = useSaveSharingMutation(() => props.listId);
const renew = useShareListMutation(() => props.listId);
const busy = computed(() => save.isPending.value || renew.isPending.value);
const onSubmit = () => {
  const onError = (error: Error) => toast.failed(errorMessage(error));
  const { step } = props.question;
  if (step.kind === 'renew') {
    renew.mutate(
      { ask: 'renew' },
      {
        onSuccess: () => {
          toast.done(t('lists.share.changed'));
          emit('done');
        },
        onError,
      },
    );
    return;
  }
  save.mutate(step.ask, { onSuccess: () => emit('done'), onError });
};
</script>

<template>
  <div class="flex flex-col gap-3" data-testid="share-confirm">
    <ListsShareLevelTitle :title="question.title" @back="emit('back')" />
    <p class="px-3.5 text-[15px] leading-[1.45]">{{ question.text }}</p>
    <div class="px-2">
      <UButton
        block
        variant="outline"
        class="h-11 justify-center rounded-md text-[15px] font-bold"
        :loading="busy"
        :label="question.submit"
        data-testid="share-confirm-submit"
        @click="onSubmit"
      />
    </div>
  </div>
</template>
