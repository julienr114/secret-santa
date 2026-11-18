<script setup lang="ts">
import type { Participant } from '#server/database/editions';
import { daysUntil, formatEventDate } from '#server/utils/rules';
import { displayName } from '#server/utils/people';

// « Dévoiler les résultats » (README 22.9). From the day of the party: the
// party, who has not opened their result, that only the organiser will
// see the list, and that it is final (`Devoiler`). Before it: the red
// frame of what it breaks, a phrase to type, and « Attendre la fête » put
// forward (`DevoilerAvant`).
const props = defineProps<{
  eventDate: string;
  participants: Participant[];
  loading: boolean;
}>();
const open = defineModel<boolean>('open', { required: true });
const emit = defineEmits<{ confirm: [early: boolean] }>();
const { t, locale } = useT();

const today = new Date().toLocaleDateString('sv-SE');
/** The party is still to come: revealing breaks the secret early. */
const early = computed(() => today < props.eventDate);
/** The party is today: not « over » yet. */
const partyToday = computed(() => today === props.eventDate);
const date = computed(() => formatEventDate(props.eventDate, locale.value));
const daysLeft = computed(() => daysUntil(props.eventDate, today) ?? 0);

const notViewed = computed(() =>
  props.participants.filter((p) => p.viewCount === 0),
);
/** The row about who has opened their result. */
const viewedRow = computed(() => {
  const missing = notViewed.value;
  if (missing.length === 0) {
    return {
      ok: true,
      title: t('adminEdition.screen.reveal.allViewed'),
      detail: t('adminEdition.screen.reveal.allViewedHint'),
    };
  }
  const others = props.participants.length - missing.length;
  return {
    ok: false,
    title:
      missing.length === 1
        ? t('adminEdition.screen.reveal.notViewedOne', {
            name: displayName(missing[0]!, props.participants),
          })
        : t('adminEdition.screen.reveal.notViewedMany', {
            count: missing.length,
          }),
    detail:
      others === 0
        ? t('adminEdition.screen.reveal.nobodyViewed')
        : t('adminEdition.screen.reveal.othersViewed', { count: others }),
  };
});

const phrase = computed(() => t('adminEdition.screen.reveal.phrase'));
const typed = ref('');
const phraseId = useId();
/** The phrase is copied, whatever the case and the spaces around. */
const copied = computed(
  () =>
    typed.value.trim().toLocaleLowerCase(locale.value) ===
    phrase.value.toLocaleLowerCase(locale.value),
);
watch(open, (isOpen) => {
  if (!isOpen) typed.value = '';
});
</script>

<template>
  <UiSheet
    v-model:open="open"
    :title="
      early
        ? t('adminEdition.screen.reveal.earlyTitle')
        : t('adminEdition.screen.reveal.sheetTitle')
    "
    :description="
      early
        ? t('adminEdition.screen.reveal.earlyIntro', {
            date,
            count: daysLeft,
          })
        : t('adminEdition.screen.reveal.sheetIntro')
    "
    :busy="loading"
    :ui="{ container: 'gap-[18px]' }"
  >
    <div
      v-if="early"
      class="flex flex-col gap-[18px]"
      data-testid="reveal-early"
    >
      <UiNotice
        variant="danger"
        icon="i-lucide-triangle-alert"
        :title="t('adminEdition.screen.reveal.earlyWarning')"
      >
        <UiPointList
          tone="error"
          :points="[
            { text: t('adminEdition.screen.reveal.early1') },
            { text: t('adminEdition.screen.reveal.early2') },
            { text: t('adminEdition.screen.reveal.early3') },
          ]"
        />
      </UiNotice>
      <div class="flex flex-col gap-1.5">
        <label :for="phraseId" class="text-[15px] font-semibold">
          {{ t('adminEdition.screen.reveal.copy', { phrase }) }}
        </label>
        <UInput
          :id="phraseId"
          v-model="typed"
          size="xl"
          autocomplete="off"
          :placeholder="phrase"
          class="w-full"
          :ui="{ base: 'h-12' }"
        />
      </div>
    </div>
    <div v-else class="flex flex-col gap-[18px]" data-testid="reveal-confirm">
      <ul
        class="divide-y divide-divider overflow-hidden rounded-xl ring-1 ring-default"
      >
        <li class="flex items-start gap-3 px-3.5 py-3">
          <span
            class="flex size-7 shrink-0 items-center justify-center rounded-full bg-success-soft text-success-ink"
            aria-hidden="true"
          >
            <UIcon name="i-lucide-check" class="size-4" />
          </span>
          <div class="flex min-w-0 grow flex-col gap-0.5">
            <p class="text-[15px] font-semibold">
              {{
                partyToday
                  ? t('adminEdition.screen.reveal.partyToday')
                  : t('adminEdition.screen.reveal.partyDone')
              }}
            </p>
            <p class="text-[13px] leading-[1.4] text-toned">
              {{
                partyToday
                  ? t('adminEdition.screen.reveal.partyTodayOn', { date })
                  : t('adminEdition.screen.reveal.partyDoneOn', { date })
              }}
            </p>
          </div>
        </li>
        <li
          class="flex items-start gap-3 px-3.5 py-3"
          :class="viewedRow.ok ? '' : 'bg-warning-tint text-warning-ink'"
        >
          <span
            class="flex size-7 shrink-0 items-center justify-center rounded-full"
            :class="
              viewedRow.ok
                ? 'bg-success-soft text-success-ink'
                : 'bg-warning-soft text-warning-ink'
            "
            aria-hidden="true"
          >
            <UIcon
              :name="viewedRow.ok ? 'i-lucide-check' : 'i-lucide-alert-circle'"
              class="size-4"
            />
          </span>
          <div class="flex min-w-0 grow flex-col gap-0.5">
            <p class="text-[15px] font-semibold">{{ viewedRow.title }}</p>
            <p
              class="text-[13px] leading-[1.4]"
              :class="viewedRow.ok ? 'text-toned' : ''"
            >
              {{ viewedRow.detail }}
            </p>
          </div>
        </li>
        <li class="flex items-start gap-3 px-3.5 py-3">
          <span
            class="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-toned"
            aria-hidden="true"
          >
            <UIcon name="i-lucide-eye" class="size-4" />
          </span>
          <div class="flex min-w-0 grow flex-col gap-0.5">
            <p class="text-[15px] font-semibold">
              {{ t('adminEdition.screen.reveal.wholeGroupTitle') }}
            </p>
            <p class="text-[13px] leading-[1.4] text-toned">
              {{ t('adminEdition.screen.reveal.wholeGroupHint') }}
            </p>
          </div>
        </li>
      </ul>
      <p class="flex items-start gap-2.5 text-sm leading-[1.45] text-toned">
        <UIcon name="i-lucide-lock" class="mt-px size-5 shrink-0" />
        {{ t('adminEdition.screen.reveal.final') }}
      </p>
    </div>
    <template #footer>
      <div v-if="early" class="flex flex-col gap-2">
        <UButton
          block
          color="success"
          class="h-13 justify-center text-[17px] font-bold"
          :label="t('adminEdition.screen.reveal.wait')"
          @click="open = false"
        />
        <UButton
          block
          variant="outline"
          color="error"
          class="h-12 justify-center text-base font-bold disabled:opacity-55"
          :disabled="!copied || loading"
          :loading="loading"
          :label="t('adminEdition.screen.reveal.anyway')"
          @click="emit('confirm', true)"
        />
      </div>
      <div v-else class="flex flex-col gap-1.5">
        <UButton
          block
          icon="i-lucide-eye"
          class="h-13 justify-center text-[17px] font-bold"
          :ui="{ leadingIcon: 'size-5' }"
          :disabled="loading"
          :loading="loading"
          :label="
            loading
              ? t('adminEdition.screen.reveal.revealing')
              : t('adminEdition.screen.reveal.action')
          "
          @click="emit('confirm', false)"
        />
        <UButton
          block
          variant="ghost"
          color="neutral"
          class="h-11.5 justify-center text-base font-semibold"
          :label="t('adminEdition.screen.reveal.notYet')"
          @click="open = false"
        />
      </div>
    </template>
  </UiSheet>
</template>
