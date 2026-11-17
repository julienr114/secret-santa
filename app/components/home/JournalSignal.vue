<script setup lang="ts">
import type { JournalSignal } from '#server/utils/audit';
import { formatDay } from '~/utils/labels';

// « Du nouveau au journal. » in a draw's card on the home (README 22.15):
// the alert, when it is alone, with its day, leading straight to what it
// means; several, how many, leading to the journal.
const props = defineProps<{ signal: JournalSignal; path: string }>();
const emit = defineEmits<{ open: [] }>();
const { t, tk, locale } = useT();

const words = computed(() => {
  const { alert, count } = props.signal;
  return alert
    ? tk(`auth.home.journalSignal.${alert.type}`, {
        date: formatDay(alert.createdAt, locale.value),
      })
    : t('auth.home.journalSignal.several', { count });
});
/** The journal, opened on the alert's explanation when it has one. */
const to = computed(() => {
  const alert = props.signal.alert;
  return alert && isJournalAlert(alert.type)
    ? `${props.path}/journal?alerte=${alert.id}`
    : `${props.path}/journal`;
});
</script>

<template>
  <NuxtLink
    :to="to"
    class="flex w-full items-center gap-2.5 rounded-xl bg-warning-tint px-3 py-2.5 text-left text-sm leading-[1.4] text-alert-ink ring-1 ring-warning-ring"
    data-testid="journal-signal"
    @click="emit('open')"
  >
    <UIcon name="i-lucide-info" class="size-4.5 shrink-0" aria-hidden="true" />
    <span class="grow">
      <strong>{{ t('auth.home.journalSignal.lead') }}</strong> {{ words }}
    </span>
    <UIcon
      name="i-lucide-chevron-right"
      class="size-4.5 shrink-0"
      aria-hidden="true"
    />
  </NuxtLink>
</template>
