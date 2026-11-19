<script setup lang="ts">
import { MEMBER_FIELD_MAX } from '#server/utils/lists';

// The clothing size of one of my people (Correction 27, maquette
// ProcheTaille): free text, since one may want to say several things,
// but one line, never a text area; 40 characters, with their count. The
// example in grey does the work of a sentence of help: an age, a letter,
// a number or a remark. Emptied and validated, the size is erased.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t } = useT();
const draft = ref('');
useMemberField((member) => {
  draft.value = member.clothingSize ?? '';
});
</script>

<template>
  <ListsMemberFieldPage
    :title="t('lists.person.field.clothing')"
    :title-mine="t('lists.person.field.clothingMine')"
    :patch="{ clothingSize: draft.trim() || null }"
  >
    <template #default>
      <div class="flex flex-col gap-1.5">
        <UInput
          v-model="draft"
          type="text"
          enterkeyhint="done"
          size="xl"
          :maxlength="MEMBER_FIELD_MAX"
          :aria-label="t('lists.person.clothing')"
          :placeholder="t('lists.person.field.clothingPlaceholder')"
          :ui="{ base: 'h-12 text-base placeholder:text-muted' }"
          data-testid="member-field"
        />
        <span
          class="self-end text-[13px] text-toned"
          data-testid="field-count"
          >{{
            t('lists.person.field.counter', {
              count: draft.length,
              max: MEMBER_FIELD_MAX,
            })
          }}</span
        >
      </div>
    </template>
  </ListsMemberFieldPage>
</template>
