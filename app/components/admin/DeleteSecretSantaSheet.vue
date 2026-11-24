<script setup lang="ts">
import { useDeleteSecretSantaMutation } from '~/composables/queries/useEdition';

// « Supprimer ce Secret Santa » (ticket 108, Q-008), while it is not drawn:
// what goes, what stays, and keeping it offered first, like deleting an
// event. Then the page of the event (docs/spec/v3/navigation.md).
const props = defineProps<{
  slug: string;
  editionId: string;
  label: string;
  participants: number;
}>();
const open = defineModel<boolean>('open', { required: true });
const { t } = useT();
const toast = useMessages();
const errorMessage = useErrorMessage();
const remove = useDeleteSecretSantaMutation(
  () => props.slug,
  () => props.editionId,
);
const points = computed(() => [
  { text: t('adminEdition.delete.links', { count: props.participants }) },
  { text: t('adminEdition.delete.members') },
]);
/**
 * Deletes the Secret Santa, then opens its event.
 * @returns Nothing: the mutation reports by itself.
 */
const onDelete = () =>
  remove.mutate(undefined, {
    onSuccess: async () => {
      open.value = false;
      toast.done(t('adminEdition.delete.done'));
      await navigateTo(`/e/${props.slug}`, { replace: true });
    },
    onError: (error) => toast.failed(errorMessage(error)),
  });
</script>

<template>
  <UiSheet
    v-model:open="open"
    :title="t('adminEdition.delete.title', { label })"
    :busy="remove.isPending.value"
  >
    <UiNotice
      variant="danger"
      icon="i-lucide-triangle-alert"
      :title="t('adminEdition.delete.forGood')"
    >
      <UiPointList :points="points" tone="error" />
    </UiNotice>
    <template #footer>
      <UButton
        block
        color="secondary"
        size="xl"
        class="h-13 justify-center text-[17px] font-bold"
        :disabled="remove.isPending.value"
        :label="t('adminEdition.delete.keep')"
        @click="open = false"
      />
      <UButton
        block
        color="error"
        variant="outline"
        size="xl"
        class="h-12 justify-center font-bold"
        :loading="remove.isPending.value"
        :label="t('adminEdition.delete.confirm')"
        data-testid="delete-secret-santa-confirm"
        @click="onDelete"
      />
    </template>
  </UiSheet>
</template>
