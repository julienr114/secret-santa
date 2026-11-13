<script setup lang="ts">
import { parseDate, type DateValue } from '@internationalized/date';
import { formatEventDate, isIsoDay } from '#server/utils/rules';

// A day, picked in a calendar that opens as a bottom sheet (easier than a
// popover or a typed field on a phone). The model is an ISO day
// ("2026-12-25") or an empty string. `suggestion` is a day offered in one
// tap; the calendar opens on it when nothing is set.
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
const label = computed(() =>
  value.value
    ? new Intl.DateTimeFormat(locale.value, {
        dateStyle: 'long',
        timeZone: 'UTC',
      }).format(new Date(`${model.value}T12:00:00Z`))
    : legacy.value || t('adminGroup.rules.eventDatePick'),
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
  <UButton
    block
    variant="outline"
    color="neutral"
    icon="i-lucide-calendar"
    class="justify-start font-normal"
    :class="{ 'text-dimmed': !model }"
    :label="label"
    @click="open = true"
  />
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
