<script setup lang="ts">
import type { Avatar } from '#server/utils/avatars';
import type { ContextPart } from '~/components/ui/PageContext.vue';

// The head of a person's screen, or of one's own account: the icon,
// large, with a pencil that changes it in a sheet, then where the screen
// belongs, the title and a line about them.
const props = defineProps<{
  title: string;
  subtitle?: string;
  /** Where the screen belongs; none for one's own account. */
  context?: ContextPart[];
  /** `lg` for a person's page, `md` for a new one. */
  size?: 'md' | 'lg';
  /** The title of the icon's sheet, « Son icône » unless said. */
  avatarTitle?: string;
}>();
const avatar = defineModel<Avatar>('avatar', { required: true });
const { t } = useT();
const open = ref(false);
/**
 * Keeps the icon picked, then closes the sheet.
 * @param next - The icon.
 * @returns Nothing.
 */
const onValidate = (next: Avatar) => {
  avatar.value = next;
  open.value = false;
};
const big = computed(() => props.size !== 'md');
</script>

<template>
  <div class="flex items-center gap-4">
    <button
      type="button"
      class="relative shrink-0 rounded-full focus-visible:ring-2 focus-visible:ring-primary"
      :aria-label="t('adminGroup.personForm.changeAvatar')"
      @click="open = true"
    >
      <UiAvatar
        :avatar="avatar"
        size="xl"
        :class="big ? 'text-4xl!' : 'size-18! text-[32px]!'"
      />
      <span
        class="absolute -right-0.5 -bottom-0.5 flex items-center justify-center rounded-full bg-default text-toned ring-1 ring-default"
        :class="big ? 'size-7' : 'size-6.5'"
        aria-hidden="true"
      >
        <UIcon name="i-lucide-pencil" class="size-3.5" />
      </span>
    </button>
    <div class="flex min-w-0 flex-col gap-1">
      <UiPageContext
        v-if="context?.length"
        :parts="context"
        :label="t('common.context')"
      />
      <UiPageTitle>{{ title }}</UiPageTitle>
      <p v-if="subtitle" class="text-[15px] text-toned">{{ subtitle }}</p>
    </div>
    <AdminAvatarSheet
      v-model:open="open"
      :initial="avatar"
      :title="avatarTitle ?? t('adminGroup.avatar.theirs')"
      @validate="onValidate"
    />
  </div>
</template>
