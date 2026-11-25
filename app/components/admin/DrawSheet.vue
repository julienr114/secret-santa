<script setup lang="ts">
import type { Avatar } from '#server/utils/avatars';
import type { NoticeItem } from '~/components/ui/Notice.vue';
import { stackOf } from '#shared/utils/lists';

// "Lancer le tirage ?": what is about to be drawn (the participants, the
// rules, that everyone gets their link by email, who of the group is
// left out) and that it is final, then
// "Tirer au sort" or "Pas encore".
const props = defineProps<{
  slug: string;
  editionId: string;
  avatars: Avatar[];
  exclusionCount: number;
  /** First names of active people of the group left out of the edition. */
  missing: string[];
  /** First names of those the app cannot email: their link goes by hand. */
  unreached: string[];
  /** « Devine qui » is on, and a draw of three turns it off. */
  gameOff?: boolean;
  loading: boolean;
}>();
const open = defineModel<boolean>('open', { required: true });
const emit = defineEmits<{ confirm: [] }>();
const { t, locale } = useT();
const busy = useBusy(() => props.loading);

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
/** Au tirage, l'application prévient chacun (ticket 169). */
const emailsLine = computed(() => {
  const count = props.unreached.length;
  if (count > 0 && count === props.avatars.length) {
    return {
      title: t('adminEdition.screen.drawSheet.emailsNone'),
      detail: t('adminEdition.screen.drawSheet.emailsNoneDetail'),
    };
  }
  const title = t('adminEdition.screen.drawSheet.emails');
  if (count === 0) {
    return { title, detail: t('adminEdition.screen.drawSheet.emailsDetail') };
  }
  return {
    title,
    detail:
      count === 1
        ? t('adminEdition.screen.drawSheet.emailsButOne', {
            name: props.unreached[0] ?? '',
          })
        : t('adminEdition.screen.drawSheet.emailsButMany', { count }),
  };
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
  {
    key: 'emails',
    state: 'ok',
    ...emailsLine.value,
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
    :busy="loading"
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
      <UiNotice
        v-if="gameOff"
        variant="info"
        icon="i-lucide-search"
        data-testid="draw-game-off"
      >
        {{ t('adminEdition.screen.drawSheet.gameOff') }}
      </UiNotice>
    </div>
    <template #footer>
      <UButton
        block
        icon="i-lucide-sparkle"
        class="h-13 justify-center text-[17px] font-bold"
        :disabled="loading"
        :loading="busy"
        :label="
          busy
            ? t('adminEdition.screen.drawSheet.drawing')
            : t('adminEdition.screen.drawSheet.confirm')
        "
        @click="emit('confirm')"
      />
      <UButton
        block
        variant="ghost"
        color="neutral"
        class="h-[46px] justify-center font-semibold"
        :disabled="loading"
        :label="t('adminEdition.screen.drawSheet.notYet')"
        @click="open = false"
      />
    </template>
  </UiSheet>
</template>
