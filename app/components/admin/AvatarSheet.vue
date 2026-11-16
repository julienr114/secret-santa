<script setup lang="ts">
import type { Avatar } from '#server/utils/avatars';

// Choosing an icon, the same sheet everywhere: the icon as it will be and
// the title on one line, the picker, then « Annuler » and « Valider » side
// by side. The choice is kept only with « Valider »; the parent saves it.
const props = defineProps<{
  initial: Avatar;
  /** « Mon icône », or the person's. */
  title: string;
  loading?: boolean;
  /** Why the last save failed, if it did. */
  error?: string | null;
}>();
const open = defineModel<boolean>('open', { required: true });
const emit = defineEmits<{ validate: [avatar: Avatar] }>();
const { t } = useT();
const busy = useBusy(() => Boolean(props.loading));
const draft = ref<Avatar>(props.initial);
watch(
  open,
  (opened) => {
    if (opened) draft.value = props.initial;
  },
  { immediate: true },
);
</script>

<template>
  <UiSheet v-model:open="open" :title="title" :busy="loading">
    <template #header>
      <div class="flex items-center gap-3">
        <UiAvatar :avatar="draft" class="size-11! text-[22px]!" />
        <h2 class="font-display text-[22px] leading-[1.15] font-bold">
          {{ title }}
        </h2>
      </div>
    </template>
    <div class="flex flex-col gap-3" data-testid="avatar-sheet">
      <AdminAvatarPicker v-model="draft" />
      <p v-if="error" class="text-sm font-medium text-error" role="alert">
        {{ error }}
      </p>
    </div>
    <template #footer>
      <div class="grid grid-cols-[1fr_2fr] gap-2.5">
        <UButton
          variant="outline"
          color="neutral"
          class="h-12 justify-center text-base font-semibold"
          :disabled="loading"
          :label="t('common.actions.cancel')"
          @click="open = false"
        />
        <UButton
          class="h-12 justify-center text-base font-bold"
          :disabled="loading"
          :loading="busy"
          :label="
            busy ? t('common.actions.saving') : t('common.actions.validate')
          "
          @click="emit('validate', draft)"
        />
      </div>
    </template>
  </UiSheet>
</template>
