<script setup lang="ts">
import { parseDate, type DateValue } from '@internationalized/date';
import { formatEventDate, isIsoDay } from '#server/utils/rules';

// A day, picked in a calendar that opens as a bottom sheet (easier than a
// popover or a typed field on a phone). The model is an ISO day
// ("2026-12-25") or an empty string, shown as a field with its figures.
// `suggestion` is a day offered in one tap, below the field while it is
// empty and in the calendar, which opens on it when nothing is set.
const props = defineProps<{ suggestion?: string }>();
const model = defineModel<string>({ default: '' });
const { t, locale } = useT();

const toDate = (iso: string | undefined) =>
  isIsoDay(iso) ? parseDate(iso) : undefined;
const value = computed(() => toDate(model.value));
const suggested = computed(() => toDate(props.suggestion));
// A value saved before the date picker existed: free text, shown as is.
const legacy = computed(() =>
  model.value && !isIsoDay(model.value) ? model.value : '',
);
/**
 * A day written out in the interface's language.
 * @param iso - An ISO day.
 * @param style - `numeric` (25/12/2026) or `long` (25 décembre 2026).
 * @returns The day as words or figures.
 */
const dayOf = (iso: string, style: 'numeric' | 'long') =>
  new Intl.DateTimeFormat(locale.value, {
    ...(style === 'long'
      ? { dateStyle: 'long' as const }
      : {
          day: '2-digit' as const,
          month: '2-digit' as const,
          year: 'numeric' as const,
        }),
    timeZone: 'UTC',
  }).format(new Date(`${iso}T12:00:00Z`));
const label = computed(() =>
  value.value
    ? dayOf(model.value, 'numeric')
    : legacy.value || t('adminGroup.rules.eventDatePlaceholder'),
);
/** Offered below the field while it is empty. */
const offer = computed(() =>
  !model.value && props.suggestion && isIsoDay(props.suggestion)
    ? t('adminGroup.rules.eventDateSuggest', {
        date: dayOf(props.suggestion, 'long'),
      })
    : null,
);

const open = ref(false);
const set = (iso: string) => {
  model.value = iso;
  open.value = false;
};
// The calendar's event type also covers ranges and multiple days, which
// this field never asks for: only a single day is taken.
const onPick = (next: unknown) => {
  if (next && !Array.isArray(next) && 'calendar' in (next as object)) {
    set((next as DateValue).toString());
  }
};
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <button
      type="button"
      class="flex h-12 w-full items-center rounded-md bg-default pl-3 text-left text-base ring-1 ring-accented focus-visible:ring-2 focus-visible:ring-primary"
      :aria-label="model ? undefined : t('adminGroup.rules.eventDatePick')"
      @click="open = true"
    >
      <span class="grow truncate" :class="{ 'text-dimmed': !model }">{{
        label
      }}</span>
      <UIcon
        name="i-lucide-calendar"
        class="mx-3 size-5 shrink-0 text-toned"
        aria-hidden="true"
      />
    </button>
    <button
      v-if="offer && suggestion"
      type="button"
      class="min-h-11 self-start rounded-full bg-default px-3 text-sm font-semibold ring-1 ring-default"
      @click="model = suggestion"
    >
      {{ offer }}
    </button>
  </div>
  <UDrawer
    v-model:open="open"
    :title="t('adminGroup.rules.eventDate')"
    :description="t('adminGroup.rules.eventDateHelp')"
  >
    <template #body>
      <UCalendar
        :model-value="value"
        :placeholder="value ?? suggested"
        class="mx-auto py-2"
        @update:model-value="onPick"
      />
    </template>
    <template #footer>
      <UButton
        v-if="suggestion && suggestion !== model"
        block
        variant="soft"
        :label="
          t('adminGroup.rules.eventDateSuggest', {
            date: formatEventDate(suggestion, locale),
          })
        "
        @click="set(suggestion)"
      />
      <UButton
        v-if="model"
        block
        variant="ghost"
        color="neutral"
        :label="t('adminGroup.rules.eventDateClear')"
        @click="set('')"
      />
    </template>
  </UDrawer>
</template>
