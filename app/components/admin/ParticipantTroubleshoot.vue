<script setup lang="ts">
import type { Participant } from '#server/database/editions';
import { fullName } from '#server/utils/people';
import {
  useRegenerateMutation,
  useUnsendMutation,
} from '~/composables/queries/useEdition';

// The repairs of one participant, as rows of the send sheet's « Autre
// moyen, ou un souci ? » list: say the link was not sent after all (once
// it was), or give a new link if it was passed on, which asks for a
// second tap. Neither reveals a result; both go to the journal.
const props = defineProps<{
  slug: string;
  participant: Participant;
}>();
const { t } = useT();
const toast = useMessages();
const errorMessage = useErrorMessage();
/**
 * Shows an error in a toast.
 * @param error - The error of a mutation.
 * @returns Nothing.
 */
const onError = (error: unknown) => toast.failed(errorMessage(error));

const unsend = useUnsendMutation(() => props.slug);
const regenerate = useRegenerateMutation(() => props.slug);
const regenerating = useBusy(() => regenerate.isPending.value);
const name = computed(() => fullName(props.participant));
const confirming = ref(false);
watch(
  () => props.participant.participationId,
  () => {
    confirming.value = false;
  },
);
/**
 * Puts the participant back among those to notify.
 * @returns Nothing: the mutation reports by itself.
 */
const onUnsend = () =>
  unsend.mutate(props.participant.participationId, {
    onSuccess: () => toast.done(t('adminEdition.participant.unsendDone')),
    onError,
  });
/**
 * Gives the participant a new link; the old one stops working.
 * @returns Nothing: the mutation reports by itself.
 */
const onRegenerate = () =>
  regenerate.mutate(props.participant.participationId, {
    onSuccess: () => {
      confirming.value = false;
      toast.done(
        t('adminEdition.participant.linkRegenerated'),
        t('adminEdition.participant.linkRegeneratedDescription'),
      );
    },
    onError,
  });
</script>

<template>
  <UiListItem
    v-if="participant.messageSentAt"
    :title="t('adminEdition.participant.unsend')"
    :subtitle="t('adminEdition.participant.unsendHint', { name })"
    :busy="unsend.isPending.value"
    :busy-label="t('common.actions.saving')"
    :on-click="onUnsend"
  />
  <UiListItem
    v-if="!confirming"
    :title="t('adminEdition.participant.regenerate')"
    :subtitle="t('adminEdition.participant.regenerateHint')"
    :on-click="() => (confirming = true)"
  />
  <li v-else class="flex flex-col gap-2 px-4 py-3">
    <p class="text-sm">
      {{ t('adminEdition.participant.regenerateConfirm', { name }) }}
    </p>
    <div class="flex gap-2">
      <UButton
        class="min-h-11"
        :disabled="regenerate.isPending.value"
        :loading="regenerating"
        :label="t('adminEdition.participant.regenerateAction')"
        @click="onRegenerate"
      />
      <UButton
        variant="ghost"
        color="neutral"
        class="min-h-11"
        :disabled="regenerate.isPending.value"
        :label="t('common.actions.cancel')"
        @click="confirming = false"
      />
    </div>
  </li>
</template>
