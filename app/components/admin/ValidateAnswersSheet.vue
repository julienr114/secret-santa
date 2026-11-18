<script setup lang="ts">
import type { NoticeItem } from '~/components/ui/Notice.vue';

// « Valider le tirage ? » (README 22.12, maquette ManuelValider): the
// answers fit together, what validating does (answers fixed, list locked,
// hints open), that nobody sees who gives to whom, then « Valider le
// tirage » or « Pas encore ».
const props = defineProps<{
  /** How many take part. */
  count: number;
  /** The one whose answer follows from the others, or null. */
  deducedName: string | null;
  /** « Devine qui » is on, and a draw of three turns it off. */
  gameOff?: boolean;
  loading: boolean;
}>();
const open = defineModel<boolean>('open', { required: true });
const emit = defineEmits<{ confirm: [] }>();
const { t } = useT();
const busy = useBusy(() => props.loading);

const items = computed<NoticeItem[]>(() =>
  (['locked', 'list', 'hints'] as const).map((key) => ({
    key,
    state: 'ok',
    title: t(`adminEdition.answers.validate.${key}Title`),
    detail: t(`adminEdition.answers.validate.${key}Detail`),
  })),
);
</script>

<template>
  <UiSheet
    v-model:open="open"
    :title="t('adminEdition.answers.validate.title')"
    :description="
      deducedName
        ? t('adminEdition.answers.validate.descriptionDeduced', {
            count: count - 1,
            name: deducedName,
          })
        : t('adminEdition.answers.validate.description', { count })
    "
    :busy="loading"
  >
    <div class="flex flex-col gap-4 py-2" data-testid="validate-sheet">
      <UiNotice variant="checklist" :items="items" />
      <p class="text-sm leading-[1.5] text-toned">
        {{ t('adminEdition.answers.validate.secret') }}
      </p>
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
            ? t('adminEdition.answers.validate.validating')
            : t('adminEdition.answers.validate.confirm')
        "
        @click="emit('confirm')"
      />
      <UButton
        block
        variant="ghost"
        color="neutral"
        class="h-[46px] justify-center font-semibold"
        :disabled="loading"
        :label="t('adminEdition.answers.notYet')"
        @click="open = false"
      />
    </template>
  </UiSheet>
</template>
