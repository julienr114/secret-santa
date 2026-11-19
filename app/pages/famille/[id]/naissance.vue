<script setup lang="ts">
import {
  birthDateOf,
  birthParts,
  birthYears,
  daysIn,
  settleBirth,
  type BirthParts,
} from '#shared/utils/memberFields';

// The date of birth of one of my people (Correction 27, maquette
// ProcheNaissance): three lists, day, month and year, no calendar. The
// month in full; the years from this one back to 110 years ago, the most
// recent first; the days follow the month and the year. An incomplete
// date cannot be validated. « Effacer la date » under « Valider ».
definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t, locale } = useT();
const parts = ref<BirthParts>({ day: null, month: null, year: null });
useMemberField((member) => {
  parts.value = birthParts(member.birthDate);
});
const today = new Date().toISOString().slice(0, 10);
const years = birthYears(Number(today.slice(0, 4)));
const months = computed(() =>
  Array.from({ length: 12 }, (_, index) => ({
    value: index + 1,
    label: new Intl.DateTimeFormat(locale.value, {
      month: 'long',
      timeZone: 'UTC',
    }).format(new Date(Date.UTC(2000, index, 1))),
  })),
);
const days = computed(() =>
  Array.from(
    { length: daysIn(parts.value.month, parts.value.year) },
    (_, index) => index + 1,
  ),
);
/** One of the three lists changed. */
const choose = (part: keyof BirthParts, value: string) => {
  parts.value = settleBirth({
    ...parts.value,
    [part]: value ? Number(value) : null,
  });
};
const date = computed(() => birthDateOf(parts.value, today));
const SELECT =
  'h-12 w-full appearance-none rounded-full bg-default pr-9 pl-4 text-base ring-1 ring-accented outline-none focus:ring-2 focus:ring-primary';
</script>

<template>
  <ListsMemberFieldPage
    :title="t('lists.person.field.birth')"
    :title-mine="t('lists.person.field.birthMine')"
    :patch="date ? { birthDate: date } : null"
    :clear-label="t('lists.person.field.clearDate')"
    :clear-patch="{ birthDate: null }"
  >
    <template #default>
      <div
        role="group"
        :aria-label="t('lists.person.birth')"
        class="flex gap-2"
      >
        <label
          v-for="list in [
            {
              part: 'day' as const,
              label: t('lists.person.field.day'),
              width: 'w-[84px] shrink-0',
              options: days.map((day) => ({ value: day, label: String(day) })),
            },
            {
              part: 'month' as const,
              label: t('lists.person.field.month'),
              width: 'min-w-0 grow',
              options: months,
            },
            {
              part: 'year' as const,
              label: t('lists.person.field.year'),
              width: 'w-[108px] shrink-0',
              options: years.map((year) => ({
                value: year,
                label: String(year),
              })),
            },
          ]"
          :key="list.part"
          class="flex flex-col gap-1"
          :class="list.width"
        >
          <span class="text-[13px] text-toned">{{ list.label }}</span>
          <span class="relative">
            <select
              :value="parts[list.part] ?? ''"
              :class="SELECT"
              :data-testid="`birth-${list.part}`"
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
  </ListsMemberFieldPage>
</template>
