<script setup lang="ts">
import type { Participant } from '#server/database/editions';
import { fullName } from '#server/utils/people';
import {
  useRegenerateMutation,
  useUnsendMutation,
} from '~/composables/queries/useEdition';

// The repairs of one participant already sent a message, folded at the
// bottom of the send sheet: say the link was not sent after all, or give
// a new link if it was passed on, which asks for a second tap. None of
// them reveals a result; both go to the journal.
const props = defineProps<{
  slug: string;
  status: string;
  participant: Participant;
}>();
const { t } = useT();
const toast = useToast();
const errorMessage = useErrorMessage();
/**
 * Shows an error in a toast.
 * @param error - The error of a mutation.
 * @returns Nothing.
 */
const onError = (error: unknown) =>
  toast.add({ title: errorMessage(error), color: 'error' });

const unsend = useUnsendMutation(() => props.slug);
const regenerate = useRegenerateMutation(() => props.slug);
const regenerating = useBusy(() => regenerate.isPending.value);
const name = computed(() => fullName(props.participant));
const open = ref(false);
const confirming = ref(false);
watch(
  () => props.participant.participationId,
  () => {
    open.value = false;
    confirming.value = false;
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
      confirming.value = false;
      toast.add({
        title: t('adminEdition.participant.linkRegenerated'),
        description: t('adminEdition.participant.linkRegeneratedDescription'),
        color: 'success',
      });
    },
    onError,
  });
</script>

<template>
  <section class="-mx-4 border-t border-divider" data-testid="troubleshoot">
    <button
      type="button"
      :aria-expanded="open"
      class="flex min-h-13 w-full items-center justify-between px-4 text-left text-[15px] font-bold text-toned"
      @click="open = !open"
    >
      {{ t('adminEdition.participant.troubleshooting') }}
      <UIcon
        :name="open ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
        class="size-[18px]"
        aria-hidden="true"
      />
    </button>
    <ul v-if="open" class="divide-y divide-divider border-t border-divider">
      <li v-if="status !== 'closed'">
        <button
          type="button"
          class="flex min-h-15 w-full flex-col justify-center px-4 py-2 text-left active:bg-muted"
          :disabled="unsend.isPending.value"
          @click="onUnsend"
        >
          <span class="font-semibold">{{
            t('adminEdition.participant.unsend')
          }}</span>
          <span class="text-sm leading-[1.35] text-toned">{{
            t('adminEdition.participant.unsendHint', { name })
          }}</span>
        </button>
      </li>
      <li v-if="status !== 'closed'">
        <button
          v-if="!confirming"
          type="button"
          class="flex min-h-15 w-full flex-col justify-center px-4 py-2 text-left active:bg-muted"
          @click="confirming = true"
        >
          <span class="font-semibold">{{
            t('adminEdition.participant.regenerate')
          }}</span>
          <span class="text-sm leading-[1.35] text-toned">{{
            t('adminEdition.participant.regenerateHint')
          }}</span>
        </button>
        <div v-else class="flex flex-col gap-2 px-4 py-3">
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
        </div>
      </li>
    </ul>
  </section>
</template>
