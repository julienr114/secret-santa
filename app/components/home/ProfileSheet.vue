<script setup lang="ts">
import type { Avatar } from '#server/utils/avatars';
import { useSaveProfileMutation } from '~/composables/queries/useAuth';

// The icon of the account, chosen from the home page in the icon sheet
// and saved with "Valider". Names and language are on "Mon compte".
defineProps<{ initial: Avatar }>();
const open = defineModel<boolean>('open', { required: true });
const { t } = useT();
const errorMessage = useErrorMessage();
const save = useSaveProfileMutation();

/**
 * Saves the icon picked, then closes the sheet.
 * @param avatar - The icon.
 * @returns Nothing: the mutation reports by itself.
 */
const onValidate = (avatar: Avatar) =>
  save.mutate(
    { avatarEmoji: avatar.emoji, avatarColor: avatar.color },
    {
      onSuccess: () => {
        open.value = false;
      },
    },
  );
watch(open, (opened) => {
  if (opened) save.reset();
});
</script>

<template>
  <AdminAvatarSheet
    v-model:open="open"
    :initial="initial"
    :title="t('adminGroup.avatar.title')"
    :loading="save.isPending.value"
    :error="save.isError.value ? errorMessage(save.error.value) : null"
    @validate="onValidate"
  />
</template>
