<script setup lang="ts">
import { z } from 'zod';
import { useAddOrganizerMutation } from '~/composables/queries/useGroup';

// « Nouvel organisateur »: the address of someone who will manage the
// group too. They log in with a link sent to it; no password to hand over,
// and like every organiser they never see the results.
const props = defineProps<{ slug: string; groupName: string }>();
const open = defineModel<boolean>('open', { required: true });
const { t } = useT();
const errorMessage = useErrorMessage();
const add = useAddOrganizerMutation(() => props.slug);
const busy = useBusy(() => add.isPending.value);
const email = ref('');
watch(open, (opened) => {
  if (!opened) return;
  email.value = '';
  add.reset();
});
const valid = computed(() => z.email().safeParse(email.value.trim()).success);
/**
 * Adds the organiser, then closes the sheet.
 * @returns Nothing: the mutation reports by itself.
 */
const onAdd = () =>
  valid.value &&
  add.mutate(email.value.trim(), {
    onSuccess: () => {
      open.value = false;
    },
  });
</script>

<template>
  <UiSheet
    v-model:open="open"
    :title="t('adminGroup.organizers.addTitle')"
    :description="
      t('adminGroup.organizers.addDescription', { name: groupName })
    "
    :busy="add.isPending.value"
  >
    <form
      id="organizer-form"
      class="flex flex-col gap-4"
      novalidate
      @submit.prevent="onAdd"
    >
      <UFormField
        :label="t('adminGroup.organizers.emailLabel')"
        :help="t('adminGroup.organizers.emailHelp')"
        :error="add.isError.value ? errorMessage(add.error.value) : undefined"
        :ui="{
          label: 'text-[15px] font-semibold',
          help: 'text-[13px] leading-[1.4] text-toned',
        }"
      >
        <UInput
          v-model="email"
          type="email"
          inputmode="email"
          autocomplete="off"
          autocapitalize="none"
          size="xl"
          :placeholder="t('adminGroup.personForm.emailPlaceholder')"
          class="w-full"
          :ui="{ base: 'h-12' }"
        />
      </UFormField>
      <UiNotice variant="info" icon="i-lucide-lock">
        {{ t('adminGroup.organizers.noResults') }}
      </UiNotice>
    </form>
    <template #footer>
      <UButton
        type="submit"
        form="organizer-form"
        block
        size="xl"
        class="h-13 justify-center text-[17px] font-bold"
        :disabled="!valid || add.isPending.value"
        :loading="busy"
        :label="busy ? t('common.actions.saving') : t('common.actions.add')"
      />
      <UButton
        block
        variant="ghost"
        color="neutral"
        class="h-[46px] justify-center text-base font-semibold"
        :disabled="add.isPending.value"
        :label="t('common.actions.cancel')"
        @click="open = false"
      />
    </template>
  </UiSheet>
</template>
