<script setup lang="ts">
import type { Avatar } from '#server/utils/avatars';
import { useSaveProfileMutation } from '~/composables/queries/useAuth';

// The avatar of the account, chosen from the home page in a bottom sheet
// and saved with "Valider". Names and language are on "Mon compte".
const props = defineProps<{ initial: Avatar }>();
const open = defineModel<boolean>('open', { required: true });
const { t } = useT();
const errorMessage = useErrorMessage();
const save = useSaveProfileMutation();

const avatar = ref<Avatar>(props.initial);
// Each opening starts again from what is saved.
watch(
  open,
  (isOpen) => {
    if (!isOpen) return;
    avatar.value = props.initial;
    save.reset();
  },
  { immediate: true },
);
const onValidate = () =>
  save.mutate(
    { avatarEmoji: avatar.value.emoji, avatarColor: avatar.value.color },
    {
      onSuccess: () => {
        open.value = false;
      },
    },
  );
</script>

<template>
  <UDrawer
    v-model:open="open"
    :title="t('adminGroup.avatar.title')"
    :description="t('adminGroup.avatar.description')"
  >
    <template #body>
      <AdminAvatarPicker v-model="avatar" />
      <UAlert
        v-if="save.isError.value"
        color="error"
        variant="subtle"
        class="mt-4"
        :description="errorMessage(save.error.value)"
      />
    </template>
    <template #footer>
      <UButton
        block
        :loading="save.isPending.value"
        :label="t('common.actions.validate')"
        @click="onValidate"
      />
    </template>
  </UDrawer>
</template>
