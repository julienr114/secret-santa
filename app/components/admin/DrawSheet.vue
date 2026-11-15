<script setup lang="ts">
import type { Avatar } from '#server/utils/avatars';
import type { NoticeItem } from '~/components/ui/Notice.vue';
import { stackOf } from '#shared/utils/lists';

// "Lancer le tirage ?": what is about to be drawn (the participants, the
// rules, who of the group is left out) and that it is final, then
// "Tirer au sort" or "Pas encore".
const props = defineProps<{
  slug: string;
  editionId: string;
  avatars: Avatar[];
  exclusionCount: number;
  /** First names of active people of the group left out of the edition. */
  missing: string[];
  loading: boolean;
}>();
const open = defineModel<boolean>('open', { required: true });
const emit = defineEmits<{ confirm: [] }>();
const { t, locale } = useT();

const missingNames = computed(() => {
  const { shown, more } = stackOf(props.missing, 3);
  const list = new Intl.ListFormat(locale.value, { type: 'conjunction' });
  return more > 0
    ? t('adminEdition.screen.drawSheet.andOthers', {
        names: shown.join(', '),
        count: more,
      })
    : list.format(shown);
});
const items = computed<NoticeItem[]>(() => [
  {
    key: 'people',
    state: 'ok',
    title: t('adminEdition.screen.drawSheet.people', {
      count: props.avatars.length,
    }),
  },
  {
    key: 'rules',
    state: 'ok',
    title: t('adminEdition.screen.drawSheet.rules'),
    detail:
      props.exclusionCount > 0
        ? t('adminEdition.screen.drawSheet.rulesDetail', {
            count: props.exclusionCount,
          })
        : t('adminEdition.screen.drawSheet.rulesDetailNone'),
  },
  ...(props.missing.length === 0
    ? []
    : [
        props.missing.length === 1
          ? {
              key: 'missing',
              state: 'warning' as const,
              title: t('adminEdition.screen.drawSheet.missingOne', {
                name: props.missing[0] ?? '',
              }),
              detail: t('adminEdition.screen.drawSheet.missingOneDetail'),
            }
          : {
              key: 'missing',
              state: 'warning' as const,
              title: t('adminEdition.screen.drawSheet.missingMany', {
                count: props.missing.length,
              }),
              detail: t('adminEdition.screen.drawSheet.missingManyDetail', {
                names: missingNames.value,
              }),
            },
      ]),
]);
</script>

<template>
  <UiSheet
    v-model:open="open"
    :title="t('adminEdition.screen.drawSheet.title')"
    :description="t('adminEdition.screen.drawSheet.description')"
  >
    <div class="flex flex-col gap-4 py-2" data-testid="draw-sheet">
      <UiNotice variant="checklist" :items="items">
        <template #trailing="{ item }">
          <UiAvatarStack
            v-if="item.key === 'people'"
            :avatars="avatars"
            :label="item.title"
            class="shrink-0"
          />
        </template>
        <template #detail="{ item }">
          <NuxtLink
            v-if="item.key === 'missing'"
            :to="`/admin/${slug}/editions/${editionId}/ajouter`"
            class="text-[13px] font-bold underline"
            >{{ t('adminEdition.screen.drawSheet.seeAndAdd') }}</NuxtLink
          >
        </template>
      </UiNotice>
      <UiNotice variant="info" icon="i-lucide-lock">
        {{ t('adminEdition.screen.drawSheet.final') }}
      </UiNotice>
    </div>
    <template #footer>
      <UButton
        block
        icon="i-lucide-sparkle"
        :loading="loading"
        :label="t('adminEdition.screen.drawSheet.confirm')"
        @click="emit('confirm')"
      />
      <UButton
        block
        variant="ghost"
        color="neutral"
        :label="t('adminEdition.screen.drawSheet.notYet')"
        @click="open = false"
      />
    </template>
  </UiSheet>
</template>
