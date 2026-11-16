<script setup lang="ts">
import type { Participant } from '#server/database/editions';
import { fullName } from '#server/utils/people';
import {
  useRegenerateMutation,
  useRemoveParticipantMutation,
  useUnsendMutation,
} from '~/composables/queries/useEdition';

// The repairs of one participant, at the bottom of the send sheet: say
// the link was not sent after all, give a new link if it was passed on,
// take them out of the edition before the draw. The last two ask for a
// second tap. None of them reveals a result; all go to the journal.
const props = defineProps<{
  slug: string;
  editionId: string;
  status: string;
  participant: Participant;
}>();
const emit = defineEmits<{ removed: [] }>();
const { t } = useT();
const toast = useToast();
const errorMessage = useErrorMessage();
const onError = (error: unknown) =>
  toast.add({ title: errorMessage(error), color: 'error' });

const unsend = useUnsendMutation(() => props.slug);
const regenerate = useRegenerateMutation(() => props.slug);
const remove = useRemoveParticipantMutation(
  () => props.slug,
  () => props.editionId,
);
const name = computed(() => fullName(props.participant));
const confirm = ref<null | 'regenerate' | 'remove'>(null);
watch(
  () => props.participant.participationId,
  () => {
    confirm.value = null;
  },
);
/**
 * Puts the participant back among those to notify.
 * @returns Nothing: the mutation reports by itself.
 */
const onUnsend = () =>
  unsend.mutate(props.participant.participationId, {
    onSuccess: () =>
      toast.add({
        title: t('adminEdition.participant.unsendDone'),
        color: 'success',
      }),
    onError,
  });
/**
 * Gives the participant a new link; the old one stops working.
 * @returns Nothing: the mutation reports by itself.
 */
const onRegenerate = () =>
  regenerate.mutate(props.participant.participationId, {
    onSuccess: () => {
      confirm.value = null;
      toast.add({
        title: t('adminEdition.participant.linkRegenerated'),
        description: t('adminEdition.participant.linkRegeneratedDescription'),
        color: 'success',
      });
    },
    onError,
  });
/**
 * Takes the participant out of the edition, before the draw.
 * @returns Nothing: the mutation reports by itself.
 */
const onRemove = () =>
  remove.mutate(props.participant.participationId, {
    onSuccess: () => emit('removed'),
    onError,
  });
</script>

<template>
  <UiList
    :title="t('adminEdition.participant.troubleshooting')"
    :footer="t('adminEdition.participant.troubleshootingFooter')"
    data-testid="troubleshoot"
  >
    <UiListItem
      v-if="participant.messageSentAt && status !== 'closed'"
      icon="i-lucide-undo-2"
      :title="t('adminEdition.participant.unsend')"
      :subtitle="t('adminEdition.participant.unsendHint', { name })"
      :on-click="onUnsend"
    />
    <template v-if="status !== 'closed'">
      <UiListItem
        v-if="confirm !== 'regenerate'"
        icon="i-lucide-refresh-cw"
        :title="t('adminEdition.participant.regenerate')"
        :subtitle="t('adminEdition.participant.regenerateHint')"
        :on-click="() => (confirm = 'regenerate')"
      />
      <li v-else class="flex flex-col gap-2 px-4 py-3">
        <p class="text-sm">
          {{ t('adminEdition.participant.regenerateConfirm', { name }) }}
        </p>
        <div class="flex gap-2">
          <UButton
            class="min-h-11"
            :label="t('adminEdition.participant.regenerateAction')"
            :loading="regenerate.isPending.value"
            @click="onRegenerate"
          />
          <UButton
            variant="ghost"
            color="neutral"
            class="min-h-11"
            :label="t('common.actions.cancel')"
            @click="confirm = null"
          />
        </div>
      </li>
    </template>
    <template v-if="status === 'preparing'">
      <UiListItem
        v-if="confirm !== 'remove'"
        icon="i-lucide-user-minus"
        tone="danger"
        :title="t('adminEdition.participant.remove')"
        :on-click="() => (confirm = 'remove')"
      />
      <li v-else class="flex flex-col gap-2 px-4 py-3">
        <p class="text-sm">
          {{ t('adminEdition.participant.removeConfirm', { name }) }}
        </p>
        <div class="flex gap-2">
          <UButton
            color="error"
            class="min-h-11"
            :label="t('adminEdition.participant.removeAction')"
            :loading="remove.isPending.value"
            @click="onRemove"
          />
          <UButton
            variant="ghost"
            color="neutral"
            class="min-h-11"
            :label="t('common.actions.cancel')"
            @click="confirm = null"
          />
        </div>
      </li>
    </template>
    <UiListItem
      v-else-if="status === 'drawn'"
      icon="i-lucide-user-minus"
      :title="t('adminEdition.participant.remove')"
      :subtitle="t('adminEdition.participant.removeLocked')"
    />
  </UiList>
</template>
