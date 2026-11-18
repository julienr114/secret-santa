<script setup lang="ts">
import { z } from 'zod';
import { isIsoDay } from '#server/utils/rules';
import type { FormSubmitEvent } from '@nuxt/ui';
import {
  useCreateEditionMutation,
  useDashboardQuery,
} from '~/composables/queries/useGroup';

// A new edition: its name, the day of the party (Christmas Day offered),
// the budget (taken from the last edition) and a word for the
// participants, written on its own page (Correction 18), both optional,
// then who is taken over. The budget and the word,
// when they differ from the group's, are the edition's own rules, sent
// with it.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const { t } = useT();
const errorMessage = useErrorMessage();
const slug = computed(() => String(route.params.slug));
const dashboard = useDashboardQuery(slug);
const create = useCreateEditionMutation(slug);
const { previous, previousRules, members } = useTakenOver(slug);
const context = useScreenContext(slug);
useHead({
  title: () => context.titleOf(t('adminEdition.newEdition.title')),
});
const screen = computed(() => ({
  back: `/admin/${slug.value}`,
}));

const schema = computed(() =>
  z.object({
    label: z
      .string()
      .trim()
      .min(1, t('adminEdition.newEdition.nameRequired'))
      .max(60),
    eventDate: z.iso.date(t('adminEdition.newEdition.dateRequired')),
    budget: z.string().trim().max(60),
    guardianMessage: z.string().trim().max(300),
  }),
);
type Schema = z.output<typeof schema.value>;
await dashboard.suspense();
const groupRules = computed(() => dashboard.data.value?.rules);
// The party date is required: the group's usual one if it is a real
// date, otherwise picked here, with Christmas Day offered in one tap.
const groupDate = groupRules.value?.eventDate ?? '';
const year = dashboard.data.value?.nextEdition.year ?? new Date().getFullYear();
// Kept while the word is written on its own page (README 23.3), dropped
// once the edition is created or the form is left elsewhere.
const draft = useNewEditionDraft(slug);
draft.value ??= {
  label: dashboard.data.value?.nextEdition.label ?? '',
  eventDate: isIsoDay(groupDate) ? groupDate : '',
  budget: groupRules.value?.budget ?? '',
  guardianMessage: '',
  budgetTouched: false,
};
const state = draft.value;
const wordPath = computed(() => `/admin/${slug.value}/editions/nouvelle/mot`);
onBeforeRouteLeave((to) => {
  if (to.path !== wordPath.value) draft.value = null;
});
// The budget of the last edition, once it is known, unless typed over.
watch(
  previousRules,
  (rules) => {
    if (rules && !state.budgetTouched) state.budget = rules.budget;
  },
  { immediate: true },
);
const christmasDay = `${year}-12-25`;

const saving = ref(false);
const busy = useBusy(() => saving.value);
const failure = ref<unknown>(null);
/**
 * Creates the edition, with its own budget and word when they differ from
 * the group's, and opens it.
 * @param event - The form's values, checked.
 * @returns Once the edition is open.
 */
const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  const { label, eventDate, budget, guardianMessage } = event.data;
  const own =
    budget !== (groupRules.value?.budget ?? '') ||
    guardianMessage !== (groupRules.value?.guardianMessage ?? '');
  saving.value = true;
  failure.value = null;
  try {
    const { edition } = await create.mutateAsync({
      label,
      year,
      eventDate,
      ...(own ? { budget, guardianMessage } : {}),
    });
    await navigateTo(`/admin/${slug.value}/editions/${edition.id}`, {
      replace: true,
    });
  } catch (error) {
    failure.value = error;
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <AdminScreen v-bind="screen">
    <div class="flex flex-col gap-1">
      <UiPageContext
        :parts="context.parts.value"
        :label="t('common.context')"
      />
      <UiPageTitle>{{ t('adminEdition.newEdition.title') }}</UiPageTitle>
    </div>
    <UForm
      :schema="schema"
      :state="state"
      class="flex flex-col gap-6"
      :ui="{}"
      @submit="onSubmit"
    >
      <UFormField
        name="label"
        :label="t('adminEdition.newEdition.nameLabel')"
        :ui="{ label: 'text-[15px] font-semibold' }"
      >
        <UInput
          v-model="state.label"
          size="xl"
          class="w-full"
          :ui="{ base: 'h-12' }"
        />
      </UFormField>
      <UFormField
        name="eventDate"
        :label="t('adminEdition.newEdition.dateLabel')"
        :ui="{ label: 'text-[15px] font-semibold' }"
      >
        <AdminDateField v-model="state.eventDate" :suggestion="christmasDay" />
      </UFormField>
      <UFormField
        name="budget"
        :help="
          previous
            ? t('adminEdition.newEdition.budgetFrom', { label: previous.label })
            : t('adminEdition.newEdition.shownWithResult')
        "
        :ui="{ help: 'text-[13px] leading-[1.4] text-toned' }"
      >
        <template #label>
          <span class="text-[15px] font-semibold"
            >{{ t('adminEdition.newEdition.budgetLabel') }}
            <span class="font-normal text-toned">{{
              t('adminEdition.newEdition.optional')
            }}</span></span
          >
        </template>
        <UInput
          v-model="state.budget"
          size="xl"
          class="w-full"
          :ui="{ base: 'h-12' }"
          @update:model-value="state.budgetTouched = true"
        />
      </UFormField>
      <UiList>
        <UiListItem
          :to="wordPath"
          :title="t('adminEdition.newEdition.messageLabel')"
          :subtitle="t('adminEdition.newEdition.messageRow')"
          :value="
            state.guardianMessage.trim()
              ? state.guardianMessage
              : t('adminEdition.newEdition.messageNone')
          "
          data-testid="new-edition-word"
        />
      </UiList>
      <UiCard
        padding="md"
        class="flex items-center gap-3"
        data-testid="taken-over"
      >
        <UiAvatarStack
          :avatars="members.map((m) => m.avatar)"
          :label="t('common.count.participants', { count: members.length })"
          class="shrink-0"
        />
        <p class="text-sm leading-[1.4] text-toned">
          <strong class="text-default">{{
            t('adminEdition.newEdition.takenOver', { count: members.length })
          }}</strong>
          {{ t('adminEdition.newEdition.adjustLater') }}
        </p>
      </UiCard>
      <UAlert
        v-if="failure"
        color="error"
        variant="subtle"
        :description="errorMessage(failure)"
      />
      <UButton
        type="submit"
        block
        size="xl"
        class="h-12 justify-center font-bold"
        :disabled="saving"
        :loading="busy"
        :label="
          busy
            ? t('adminEdition.newEdition.creating')
            : t('adminEdition.newEdition.submit')
        "
      />
    </UForm>
  </AdminScreen>
</template>
