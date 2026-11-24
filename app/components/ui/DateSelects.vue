<script setup lang="ts">
import {
  daysIn,
  settleBirth,
  type BirthParts,
} from '#shared/utils/memberFields';

// A date chosen with the three lists of the phone, side by side: day,
// month in full, year (docs/spec/v3/regles-d-ecran.md). Native selects,
// never a drawn calendar nor <input type="date">. The days follow the
// month and the year; a day that no longer exists is cleared.
const props = defineProps<{
  /** The years offered, in their order. */
  years: number[];
  /** The name of the group, read aloud. */
  label: string;
  /** `data-testid` of each list: `${testid}-day`, `-month`, `-year`. */
  testid: string;
}>();
const parts = defineModel<BirthParts>({ required: true });
const { t, locale } = useT();
const months = computed(() =>
  Array.from({ length: 12 }, (_, index) => ({
    value: index + 1,
    label: new Intl.DateTimeFormat(locale.value, {
      month: 'long',
      timeZone: 'UTC',
    }).format(new Date(Date.UTC(2000, index, 1))),
  })),
);
const lists = computed(() => [
  {
    part: 'day' as const,
    label: t('lists.person.field.day'),
    width: 'w-[84px] shrink-0',
    options: Array.from(
      { length: daysIn(parts.value.month, parts.value.year) },
      (_, index) => ({ value: index + 1, label: String(index + 1) }),
    ),
  },
  {
    part: 'month' as const,
    label: t('lists.person.field.month'),
    width: 'min-w-0 grow',
    options: months.value,
  },
  {
    part: 'year' as const,
    label: t('lists.person.field.year'),
    width: 'w-[108px] shrink-0',
    options: props.years.map((year) => ({ value: year, label: String(year) })),
  },
]);
/** One of the three lists changed. */
const choose = (part: keyof BirthParts, value: string) => {
  parts.value = settleBirth({
    ...parts.value,
    [part]: value ? Number(value) : null,
  });
};
const SELECT =
  'h-12 w-full appearance-none rounded-full bg-default pr-9 pl-4 text-base ring-1 ring-accented outline-none focus:ring-2 focus:ring-primary';
</script>

<template>
  <div role="group" :aria-label="label" class="flex gap-2">
    <label
      v-for="list in lists"
      :key="list.part"
      class="flex flex-col gap-1"
      :class="list.width"
    >
      <span class="text-[13px] text-toned">{{ list.label }}</span>
      <span class="relative">
        <select
          :value="parts[list.part] ?? ''"
          :class="SELECT"
          :data-testid="`${testid}-${list.part}`"
          @change="
            choose(list.part, ($event.target as HTMLSelectElement).value)
          "
        >
          <option value="">—</option>
          <option
            v-for="option in list.options"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
        <UIcon
          name="i-lucide-chevron-down"
          class="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted"
        />
      </span>
    </label>
  </div>
</template>
