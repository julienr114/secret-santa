<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui';
import { rulesSchema, type Rules } from '#server/utils/rules';
import {
  useDashboardQuery,
  useRulesQuery,
  useUpdateRulesMutation,
} from '~/composables/queries/useGroup';

definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t } = useT();
const errorMessage = useErrorMessage();
useHead({
  title: computed(
    () => `${t('adminGroup.rules.shortTitle')} — ${t('common.appName')}`,
  ),
});
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const rules = useRulesQuery(slug);
const dashboard = useDashboardQuery(slug);
const update = useUpdateRulesMutation(slug);
const toast = useToast();
const screen = computed(() => ({
  back: `/admin/${slug.value}`,
  crumbs: [
    {
      label: dashboard.data.value?.group.name ?? slug.value,
      to: `/admin/${slug.value}`,
    },
    { label: t('adminGroup.rules.shortTitle') },
  ],
}));

// Forms start from loaded data: wait for it (also during server rendering).
await rules.suspense();
const state = reactive<Partial<Rules>>({ ...rules.data.value?.rules });
const onSubmit = (event: FormSubmitEvent<Rules>) =>
  update.mutate(event.data, {
    onSuccess: () =>
      toast.add({
        title: t('adminGroup.rules.saved'),
        color: 'success',
        icon: 'i-lucide-check',
      }),
    onError: (error) =>
      toast.add({ title: errorMessage(error), color: 'error' }),
  });
// Offered in one tap while no date is set: this year's Christmas Day.
const christmasDay = `${new Date().getFullYear()}-12-25`;
const notePositionItems = computed(() => [
  { value: 'after', label: t('adminEdition.share.noteAfter') },
  { value: 'before', label: t('adminEdition.share.noteBefore') },
]);
const previousYearsItems = computed(() => [
  { value: 0, label: t('adminGroup.rules.previousYears.none') },
  { value: 1, label: t('adminGroup.rules.previousYears.lastYear') },
  {
    value: 2,
    label: t('adminGroup.rules.previousYears.lastYears', { count: 2 }),
  },
  {
    value: 3,
    label: t('adminGroup.rules.previousYears.lastYears', { count: 3 }),
  },
]);
const sectionTitle =
  'px-1 text-xs font-semibold tracking-wide text-muted uppercase';
</script>

<template>
  <AdminScreen v-bind="screen">
    <h1 class="font-display text-3xl font-bold">
      {{ t('adminGroup.rules.title') }}
    </h1>
    <p class="text-muted">
      {{ t('adminGroup.rules.intro') }}
    </p>
    <AdminQueryState
      :pending="rules.isPending.value"
      :error="rules.error.value"
    >
      <UForm
        :schema="rulesSchema"
        :state="state"
        class="flex flex-col gap-8"
        @submit="onSubmit"
      >
        <section class="flex flex-col gap-4">
          <h2 :class="sectionTitle">{{ t('adminGroup.rules.drawSection') }}</h2>
          <UFormField
            name="excludePreviousYears"
            :label="t('adminGroup.rules.excludePreviousYears')"
            :help="t('adminGroup.rules.excludePreviousYearsHelp')"
          >
            <USelect
              v-model="state.excludePreviousYears"
              :items="previousYearsItems"
              class="w-full"
            />
          </UFormField>
        </section>
        <section class="flex flex-col gap-4">
          <h2 :class="sectionTitle">
            {{ t('adminGroup.rules.resultSection') }}
          </h2>
          <UFormField name="budget" :label="t('adminGroup.rules.budget')">
            <UInput
              v-model="state.budget"
              :placeholder="t('adminGroup.rules.budgetPlaceholder')"
              class="w-full"
            />
          </UFormField>
          <UFormField name="eventDate" :label="t('adminGroup.rules.eventDate')">
            <AdminDateField
              v-model="state.eventDate"
              :suggestion="christmasDay"
            />
          </UFormField>
          <UFormField
            name="guardianMessage"
            :label="t('adminGroup.rules.guardianMessage')"
          >
            <UTextarea
              v-model="state.guardianMessage"
              :rows="3"
              class="w-full"
            />
          </UFormField>
          <UFormField
            name="messageNote"
            :label="t('adminGroup.rules.messageNote')"
            :help="t('adminGroup.rules.messageNoteHelp')"
          >
            <UTextarea
              v-model="state.messageNote"
              :rows="3"
              :maxlength="500"
              class="w-full"
            />
          </UFormField>
          <URadioGroup
            v-model="state.messageNotePosition"
            :items="notePositionItems"
            :legend="t('adminEdition.share.notePlace')"
          />
        </section>
        <section class="flex flex-col gap-4">
          <h2 :class="sectionTitle">
            {{ t('adminGroup.rules.wishlistSection') }}
          </h2>
          <USwitch
            v-model="state.wishlist"
            :label="t('adminGroup.rules.wishlist')"
          />
          <UFormField name="maxWishes" :label="t('adminGroup.rules.maxWishes')">
            <UInputNumber
              v-model="state.maxWishes"
              :min="1"
              :max="50"
              class="w-36"
            />
          </UFormField>
        </section>
        <UButton
          type="submit"
          block
          :loading="update.isPending.value"
          :label="t('common.actions.save')"
        />
      </UForm>
    </AdminQueryState>
  </AdminScreen>
</template>
