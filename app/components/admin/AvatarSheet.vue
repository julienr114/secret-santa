<script setup lang="ts">
import {
  AVATAR_COLORS,
  AVATAR_GROUP_KEYS,
  AVATAR_GROUPS,
  type Avatar,
} from '#server/utils/avatars';
import { AVATAR_SHADES } from '~/utils/avatars';
import type { IconChoice } from '~/components/ui/IconPicker.vue';

// A person's icon, round, with the emojis of the people and the soft
// colours (lot 20): the same sheet for the participants of a draw, the
// members of a group, one's own account and the people of a list.
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
const { tk } = useT();
const families = computed(() =>
  AVATAR_GROUP_KEYS.map((key) => ({
    key,
    label: tk(`adminGroup.avatar.groups.${key}`),
    emojis: AVATAR_GROUPS[key],
  })),
);
const colors = computed(() =>
  AVATAR_COLORS.map((key) => ({
    key,
    label: tk(`adminGroup.avatar.colors.${key}`),
    ...AVATAR_SHADES[key],
  })),
);
/**
 * Passes the icon on, as a person's: the sheet offers nothing else.
 * @param icon - The icon chosen.
 */
const onValidate = (icon: IconChoice) => emit('validate', icon as Avatar);
</script>

<template>
  <UiIconSheet
    v-model:open="open"
    :initial="props.initial"
    :title="title"
    :families="families"
    :colors="colors"
    :loading="loading"
    :error="error"
    @validate="onValidate"
  />
</template>
