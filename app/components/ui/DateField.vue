<script setup lang="ts">
import { CalendarDate } from '@internationalized/date';
import { dateOf, type BirthParts } from '#shared/utils/memberFields';
import { boundsOf, checkDate, fullDate } from '#shared/utils/dateField';

// A date in one field (ticket 160, docs/spec/v3/regles-d-ecran.md, « Les
// dates », V3FeteNouvelle, ProcheNaissance): three segments, in the order
// of the language, typed in one go (the number pad on a phone), dressed
// as our fields. Under it, the date in full once the three are there:
// what the field understood. A date out of its years, or still to come
// for a birth, is refused by us, not only marked. The group bears the
// name of the field for a screen reader; the segments keep « jour »,
// « mois », « année ». Same model as the three lists it replaces.
const props = defineProps<{
  /** The years offered. */
  years: number[];
  /** The name of the field, read aloud. */
  label: string;
  /** `data-testid` of the group; its date in full is `${testid}-full`. */
  testid: string;
  /** The day of the week in the date in full: an event, not a birth. */
  weekday?: boolean;
  /** The last day allowed (« 2026-11-25 »): a birth is not to come. */
  until?: string;
}>();
const parts = defineModel<BirthParts>({ required: true });
const { t, locale } = useT();
const bounds = computed(() => boundsOf(props.years, props.until));

/** The day of some parts, for the field; nothing until all three are there. */
const calendarOf = (value: BirthParts): CalendarDate | undefined => {
  const iso = dateOf(value);
  if (!iso) return undefined;
  const [year, month, day] = iso.split('-').map(Number);
  return new CalendarDate(year!, month!, day!);
};
// The field keeps what is typed, even out of bounds, so that the
// segments stay as written; the model gets only a date we accept.
const typed = shallowRef<CalendarDate | undefined>(calendarOf(parts.value));
watch(
  () => dateOf(parts.value),
  (iso) => {
    if (iso && iso !== typed.value?.toString()) {
      typed.value = calendarOf(parts.value);
    }
  },
);
const typedParts = computed<BirthParts>(() =>
  typed.value
    ? { day: typed.value.day, month: typed.value.month, year: typed.value.year }
    : { day: null, month: null, year: null },
);
const check = computed(() => checkDate(typedParts.value, bounds.value));
/**
 * A date typed: kept in the model when it is in its bounds.
 * @param value - The day the field understood, or nothing.
 */
const onTyped = (value: CalendarDate | undefined) => {
  typed.value = value;
  parts.value =
    check.value === 'ok'
      ? typedParts.value
      : { day: null, month: null, year: null };
};
const full = computed(() =>
  check.value === 'ok' && typed.value
    ? fullDate(typed.value.toString(), locale.value, props.weekday ?? false)
    : '',
);
const refusal = computed(() => {
  if (check.value === 'outside') {
    return t('common.date.outside', {
      from: bounds.value.from,
      to: bounds.value.to,
    });
  }
  return check.value === 'future' ? t('common.date.future') : '';
});
const id = useId();
</script>

<template>
  <div
    role="group"
    :aria-label="label"
    :aria-describedby="full || refusal ? `${id}-said` : undefined"
    class="flex flex-col gap-1.5"
    :data-testid="testid"
  >
    <UInputDate
      :model-value="typed"
      :locale="locale"
      :min-value="new CalendarDate(bounds.from, 1, 1)"
      :max-value="new CalendarDate(bounds.to, 12, 31)"
      :highlight="check === 'outside' || check === 'future'"
      :color="check === 'outside' || check === 'future' ? 'error' : 'primary'"
      size="xl"
      class="w-full"
      :ui="{
        base: 'h-13 w-full rounded-[14px] bg-default px-3.5 text-base',
        segment: 'tabular-nums',
      }"
      @update:model-value="
        (value) => onTyped(value as CalendarDate | undefined)
      "
    />
    <p
      v-if="refusal"
      :id="`${id}-said`"
      class="text-[13px] leading-[1.4] font-medium text-error"
      role="alert"
      :data-testid="`${testid}-full`"
    >
      {{ refusal }}
    </p>
    <p
      v-else-if="full"
      :id="`${id}-said`"
      class="text-[13px] leading-[1.4] text-toned"
      aria-live="polite"
      :data-testid="`${testid}-full`"
    >
      {{ full }}
    </p>
  </div>
</template>
