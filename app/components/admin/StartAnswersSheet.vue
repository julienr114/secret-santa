<script setup lang="ts">
import type { NoticeItem } from '~/components/ui/Notice.vue';

// « Le tirage a déjà été fait ? » (README 22.12, maquette ManuelDemarrer):
// how it goes (each answers on their page, everything stays closed until
// the last answer, then a draw like the others), and, once, that the
// exclusions are not checked; then « Demander les réponses » or « Pas
// encore ».
const props = defineProps<{
  /** Each exclusion of the group, as « Camille et Hugo ». */
  exclusions: string[];
  /** The rule of the previous years would have applied. */
  history: boolean;
  loading: boolean;
}>();
const open = defineModel<boolean>('open', { required: true });
const emit = defineEmits<{ confirm: [] }>();
const { t } = useT();
const busy = useBusy(() => props.loading);

const items = computed<NoticeItem[]>(() =>
  (['each', 'closed', 'validate'] as const).map((key) => ({
    key,
    state: 'ok',
    icon: 'i-lucide-info',
    title: t(`adminEdition.answers.start.${key}Title`),
    detail: t(`adminEdition.answers.start.${key}Detail`),
  })),
);
/** What is not checked, in bold, then why, or nothing. */
const unchecked = computed(() => {
  const count = props.exclusions.length;
  if (count === 0 && !props.history) return null;
  const what =
    count === 0
      ? t('adminEdition.answers.start.historyOnly')
      : count === 1
        ? t('adminEdition.answers.start.exclusionOne', {
            pair: props.exclusions[0] ?? '',
          })
        : t('adminEdition.answers.start.exclusionMany', { count });
  return {
    what:
      count > 0 && props.history
        ? `${what}${t('adminEdition.answers.start.andHistory')}`
        : what,
    why:
      count > 1
        ? t('adminEdition.answers.start.whyMany')
        : t('adminEdition.answers.start.why'),
  };
});
</script>

<template>
  <UiSheet
    v-model:open="open"
    :title="t('adminEdition.answers.start.title')"
    :description="t('adminEdition.answers.start.description')"
    :busy="loading"
  >
    <div class="flex flex-col gap-4 py-2" data-testid="start-answers-sheet">
      <UiNotice variant="checklist" :items="items" />
      <p class="text-sm leading-[1.5] text-toned">
        <template v-if="unchecked">
          <strong class="font-bold text-default">{{ unchecked.what }}</strong>{{
            unchecked.why
          }}
        </template>
        {{ t('adminEdition.answers.start.back') }}
      </p>
    </div>
    <template #footer>
      <UButton
        block
        class="h-13 justify-center text-[17px] font-bold"
        :disabled="loading"
        :loading="busy"
        :label="t('adminEdition.answers.start.confirm')"
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
