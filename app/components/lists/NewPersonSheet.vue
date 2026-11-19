<script setup lang="ts">
import { MEMBER_NAME_MAX } from '#server/utils/lists';

// « Quelqu'un d'autre » (README 22.19): a first name in a sheet, for
// someone new among my people, from a list or from « Mes proches ».
defineProps<{ loading?: boolean }>();
const open = defineModel<boolean>('open', { required: true });
const emit = defineEmits<{ add: [firstName: string] }>();
const { t } = useT();
const name = ref('');
watch(open, (now) => {
  if (now) name.value = '';
});
const onSubmit = () => {
  const firstName = name.value.trim();
  if (firstName) emit('add', firstName);
};
</script>

<template>
  <UiSheet
    v-model:open="open"
    :title="t('lists.doc.newPerson.title')"
    :description="t('lists.doc.newPerson.description')"
  >
    <form
      id="new-person-form"
      class="flex flex-col gap-1.5 py-1"
      @submit.prevent="onSubmit"
    >
      <label for="new-person-name" class="text-[15px] font-semibold">{{
        t('lists.doc.newPerson.label')
      }}</label>
      <UInput
        id="new-person-name"
        v-model="name"
        size="xl"
        :maxlength="MEMBER_NAME_MAX"
        autocomplete="off"
        class="w-full"
        :ui="{ base: 'h-12 text-base' }"
      />
    </form>
    <template #footer>
      <UButton
        type="submit"
        form="new-person-form"
        block
        size="xl"
        class="h-12 justify-center font-bold"
        :disabled="!name.trim()"
        :loading="loading"
        :label="t('lists.doc.newPerson.add')"
      />
    </template>
  </UiSheet>
</template>
