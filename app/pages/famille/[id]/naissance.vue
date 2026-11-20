<script setup lang="ts">
import {
  birthDateOf,
  birthParts,
  birthYears,
  type BirthParts,
} from '#shared/utils/memberFields';

// The date of birth of one of my people (Correction 27, maquette
// ProcheNaissance): three lists, day, month and year, no calendar
// (UiDateSelects). The years from this one back to 110 years ago, the
// most recent first. An incomplete date cannot be validated. « Effacer la
// date » under « Valider ».
definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t } = useT();
const parts = ref<BirthParts>({ day: null, month: null, year: null });
useMemberField((member) => {
  parts.value = birthParts(member.birthDate);
});
const today = new Date().toISOString().slice(0, 10);
const years = birthYears(Number(today.slice(0, 4)));
const date = computed(() => birthDateOf(parts.value, today));
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
      <UiDateSelects
        v-model="parts"
        :years="years"
        :label="t('lists.person.birth')"
        testid="birth"
      />
    </template>
  </ListsMemberFieldPage>
</template>
