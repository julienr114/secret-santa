<script setup lang="ts">
import { useEmailStatusMutation } from '~/composables/queries/useEmailStatus';
import type { BlockWarning } from '#server/utils/stopEmail';

// Under an address that receives nothing (ticket 130, StopSaisie): the
// person asked not to receive emails from Under the Tree, or the address
// does not seem to exist. Said plainly: it is their choice, not a
// failure. The address may be kept; no email will go.
const props = defineProps<{ email: string | null | undefined }>();
const { t } = useT();
const status = useEmailStatusMutation();
const warning = ref<BlockWarning | null>(null);
// Asked once the address is typed, not at each letter.
const timer = ref<ReturnType<typeof setTimeout> | null>(null);
onBeforeUnmount(() => {
  if (timer.value) clearTimeout(timer.value);
});
watch(
  () => props.email?.trim().toLowerCase() ?? '',
  (email) => {
    warning.value = null;
    if (timer.value) clearTimeout(timer.value);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return;
    timer.value = setTimeout(() => ask(email), 400);
  },
  { immediate: true },
);
/**
 * Asks whether an address receives nothing.
 * @param email - The address, lower case.
 */
const ask = (email: string) =>
  status.mutate(
    { emails: [email] },
    {
      onSuccess: (answer) => {
        if (props.email?.trim().toLowerCase() === email) {
          warning.value = answer.warnings[email] ?? null;
        }
      },
    },
  );
</script>

<template>
  <div
    v-if="warning"
    role="status"
    class="flex items-start gap-3 rounded-2xl bg-lilac-100 p-3.5 text-[15px] leading-[1.45] text-lilac-700"
    data-testid="email-block-note"
  >
    <UIcon name="i-lucide-mail-x" class="mt-px size-5 shrink-0" />
    <span v-if="warning === 'refused'"
      ><strong>{{ t('common.emailBlock.refused') }}</strong>
      {{ t('common.emailBlock.refusedNext') }}</span
    >
    <span v-else>{{ t('common.emailBlock.unknown') }}</span>
  </div>
</template>
