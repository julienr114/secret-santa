<script setup lang="ts">
import type { GuessMode } from '#server/utils/guesses';
import { formatEventDate } from '#server/utils/rules';
import { instantOf } from '#shared/utils/dates';
import type { GuessSummary } from '~/composables/queries/useGroup';
import { useSetGuessMutation } from '~/composables/queries/useEdition';

// « Devine qui » (README 22.17, maquette DevineReglage): no guesses, « Qui
// m'offre ? » or « Toutes les paires », and the end of the guesses on the
// day of the party, read and saved in this browser's time zone. A change
// that deletes guesses (back to « Qui m'offre ? », or the game off) asks
// once more before saving.
const props = defineProps<{
  slug: string;
  editionId: string;
  guess: GuessSummary;
  /** The day of the party (ISO). */
  eventDate: string;
}>();
const open = defineModel<boolean>('open', { required: true });
const { t, locale } = useT();
const errorMessage = useErrorMessage();
const save = useSetGuessMutation(
  () => props.slug,
  () => props.editionId,
);

const zone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;
/** The end of the guesses as `HH:MM` here, or 18:00 by default. */
const timeOf = (iso: string | null) =>
  iso
    ? new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
      }).format(new Date(iso))
    : '18:00';
const mode = ref<GuessMode>(props.guess.mode);
const time = ref(timeOf(props.guess.endsAt));
const confirming = ref(false);
watch(open, (isOpen) => {
  if (!isOpen) return;
  mode.value = props.guess.mode;
  time.value = timeOf(props.guess.endsAt);
  confirming.value = false;
  save.reset();
});
watch(mode, () => {
  confirming.value = false;
});
const choices = computed(() =>
  (['none', 'santa', 'all'] as const).map((value) => ({
    value,
    label: t(`adminEdition.guess.mode.${value}`),
    hint: t(`adminEdition.guess.modeHint.${value}`),
  })),
);
/** Guesses would be deleted: back to « Qui m'offre ? », or off. */
const lossy = computed(
  () =>
    props.guess.players > 0 &&
    ((props.guess.mode === 'all' && mode.value === 'santa') ||
      (props.guess.mode !== 'none' && mode.value === 'none')),
);
/**
 * Saves the game, after a second tap when guesses would be deleted.
 * @returns Nothing: the mutation reports by itself.
 */
const onValidate = () => {
  if (lossy.value && !confirming.value) {
    confirming.value = true;
    return;
  }
  save.mutate(
    mode.value === 'none'
      ? { mode: 'none' }
      : {
          mode: mode.value,
          endsAt: instantOf(props.eventDate, time.value, zone()),
          timeZone: zone(),
        },
    {
      onSuccess: () => {
        open.value = false;
      },
    },
  );
};
</script>

<template>
  <UiSettingSheet
    v-model:open="open"
    :title="t('adminEdition.guess.title')"
    :description="t('adminEdition.guess.description')"
    :validate-label="
      confirming
        ? t('adminEdition.guess.confirmLoss')
        : t('common.actions.validate')
    "
    :cancel-label="t('common.actions.cancel')"
    :error="save.isError.value ? errorMessage(save.error.value) : null"
    :loading="save.isPending.value"
    :disabled="mode !== 'none' && !time"
    @validate="onValidate"
  >
    <UiChoiceList
      v-model="mode"
      :choices="choices"
      :label="t('adminEdition.guess.title')"
    />
    <label v-if="mode !== 'none'" class="flex flex-col gap-2">
      <span class="text-[15px] font-semibold">{{
        t('adminEdition.guess.endLabel', {
          date: formatEventDate(eventDate, locale),
        })
      }}</span>
      <UInput
        v-model="time"
        type="time"
        size="xl"
        class="w-35"
        data-testid="guess-end"
      />
    </label>
    <UiNotice
      v-if="confirming"
      variant="caution"
      icon="i-lucide-triangle-alert"
    >
      {{
        mode === 'none'
          ? t('adminEdition.guess.lossOff')
          : t('adminEdition.guess.lossSanta')
      }}
    </UiNotice>
    <UiNotice v-else-if="mode !== 'none'" variant="caution">
      {{ t('adminEdition.guess.answersWhen') }}
    </UiNotice>
  </UiSettingSheet>
</template>
