<script setup lang="ts">
import { useDeleteGroupMutation } from '~/composables/queries/useGroups';

// Deleting a group and everything in it (super-admin only): what goes for
// good, the group's identifier to type, and keeping the group offered
// first.
const props = defineProps<{
  groupId: string;
  slug: string;
  name: string;
  personCount: number;
  editionCount: number;
}>();
const open = defineModel<boolean>('open', { required: true });
const { t } = useT();
const errorMessage = useErrorMessage();
const toast = useToast();
const remove = useDeleteGroupMutation();
const busy = useBusy(() => remove.isPending.value);
const typed = ref('');
watch(open, (opened) => {
  if (!opened) return;
  typed.value = '';
  remove.reset();
});
const ready = computed(() => typed.value.trim() === props.slug);
const points = computed(() => [
  { text: t('adminGroup.deleteGroup.people', { count: props.personCount }) },
  {
    text: t('adminGroup.deleteGroup.editions', { count: props.editionCount }),
  },
  { text: t('adminGroup.deleteGroup.journal') },
  { text: t('adminGroup.deleteGroup.links') },
]);
/**
 * Deletes the group, then goes home.
 * @returns Nothing: the mutation reports by itself.
 */
const onDelete = () =>
  ready.value &&
  remove.mutate(
    { id: props.groupId, confirm: typed.value.trim() },
    {
      onSuccess: () => {
        toast.add({
          title: t('adminGroup.dashboard.deleteDone'),
          color: 'success',
          icon: 'i-lucide-check',
        });
        navigateTo('/', { replace: true });
      },
    },
  );
</script>

<template>
  <UiSheet
    v-model:open="open"
    :title="t('adminGroup.dashboard.deleteTitle', { name })"
    :description="t('adminGroup.deleteGroup.superOnly')"
    :busy="remove.isPending.value"
  >
    <div class="flex flex-col gap-4">
      <UiNotice
        variant="danger"
        icon="i-lucide-triangle-alert"
        :title="t('adminGroup.deleteGroup.title')"
      >
        <UiPointList :points="points" tone="error" />
      </UiNotice>
      <UFormField
        :label="t('adminGroup.dashboard.deleteConfirmLabel', { slug })"
        :error="
          remove.isError.value ? errorMessage(remove.error.value) : undefined
        "
        :ui="{ label: 'text-[15px] font-semibold' }"
      >
        <UInput
          v-model="typed"
          autocomplete="off"
          autocapitalize="off"
          size="xl"
          class="w-full"
          :ui="{ base: 'h-12' }"
        />
      </UFormField>
    </div>
    <template #footer>
      <UButton
        block
        color="secondary"
        size="xl"
        class="h-13 justify-center text-[17px] font-bold"
        :disabled="remove.isPending.value"
        :label="t('adminGroup.deleteGroup.keep')"
        @click="open = false"
      />
      <UButton
        block
        color="error"
        variant="outline"
        size="xl"
        class="h-12 justify-center font-bold"
        :disabled="!ready || remove.isPending.value"
        :loading="busy"
        :label="
          busy
            ? t('adminGroup.deleteGroup.deleting')
            : t('adminGroup.dashboard.deleteAction')
        "
        @click="onDelete"
      />
    </template>
  </UiSheet>
</template>
