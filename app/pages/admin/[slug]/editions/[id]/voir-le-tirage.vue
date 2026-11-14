<script setup lang="ts">
import { z } from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';
import {
  useDashboardQuery,
  useEditionQuery,
} from '~/composables/queries/useGroup';
import {
  useRevealOneMutation,
  type DrawPair,
} from '~/composables/queries/useEdition';

// Last-resort access to one participant's result (decisions of
// 2026-11-13): the guardian could open the personal links anyway, so this
// official way is guarded and, above all, written to the journal every
// participant reads, with the name of the person whose result was seen.
// One person at a time: a doubt about someone does not expose the draw.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const { t } = useT();
const errorMessage = useErrorMessage();
const slug = computed(() => String(route.params.slug));
const id = computed(() => String(route.params.id));
const edition = useEditionQuery(slug, id);
const dashboard = useDashboardQuery(slug);
const reveal = useRevealOneMutation(slug, id);

useHead({
  title: computed(
    () => `${t('adminEdition.reveal.title')} — ${t('common.appName')}`,
  ),
});
const screen = computed(() => ({
  back: `/admin/${slug.value}/editions/${id.value}`,
  crumbs: [
    {
      label: dashboard.data.value?.group.name ?? slug.value,
      to: `/admin/${slug.value}`,
    },
    {
      label:
        edition.data.value?.edition.label ??
        t('adminEdition.general.editionFallback'),
      to: `/admin/${slug.value}/editions/${id.value}`,
    },
    { label: t('adminEdition.reveal.title') },
  ],
}));

// Checked by the server as is: the sentence stays in French in every
// language, only the texts around it are translated.
const SENTENCE = 'JE VEUX VOIR LE TIRAGE';
const schema = computed(() =>
  z.object({
    personId: z.string().min(1, t('adminEdition.reveal.personRequired')),
    sentence: z
      .string()
      .refine(
        (v) => v.trim().toUpperCase() === SENTENCE,
        t('adminEdition.reveal.sentenceRequired', { sentence: SENTENCE }),
      ),
    understood: z
      .boolean()
      .refine((v) => v, t('adminEdition.general.tickToConfirm')),
  }),
);
type Schema = z.output<typeof schema.value>;
const state = reactive<Schema>({
  personId: '',
  sentence: '',
  understood: false,
});

// Shown only in this component's state: gone when leaving the screen.
const pairs = ref<DrawPair[] | null>(null);
const participants = computed(() => edition.data.value?.participants ?? []);
const personItems = computed(() =>
  participants.value.map((p) => ({ label: p.firstName, value: p.id })),
);
const onAnother = () => {
  pairs.value = null;
  Object.assign(state, { personId: '', sentence: '', understood: false });
};
const onSubmit = (event: FormSubmitEvent<Schema>) =>
  reveal.mutate(
    {
      personId: event.data.personId,
      sentence: event.data.sentence,
    },
    {
      onSuccess: (data) => {
        pairs.value = [data.pair];
      },
    },
  );
</script>

<template>
  <AdminScreen v-bind="screen">
    <UiPageTitle>
      {{ t('adminEdition.reveal.title') }}
    </UiPageTitle>
    <template v-if="pairs">
      <UAlert
        color="warning"
        variant="subtle"
        icon="i-lucide-eye"
        :description="t('adminEdition.reveal.shownNotice')"
      />
      <AdminDrawPairs :pairs="pairs" :people="participants" />
      <UButton
        variant="subtle"
        color="neutral"
        block
        :label="t('adminEdition.reveal.another')"
        @click="onAnother"
      />
    </template>
    <template v-else>
      <ul class="flex list-disc flex-col gap-1 pl-5 text-sm text-muted">
        <li>{{ t('adminEdition.reveal.warningLastResort') }}</li>
        <li>{{ t('adminEdition.reveal.warningJournal') }}</li>
        <li>{{ t('adminEdition.reveal.warningEphemeral') }}</li>
      </ul>
      <UForm
        :schema="schema"
        :state="state"
        class="flex flex-col gap-5"
        @submit="onSubmit"
      >
        <UFormField
          name="personId"
          :label="t('adminEdition.reveal.personLabel')"
          required
        >
          <USelect
            v-model="state.personId"
            :items="personItems"
            :placeholder="t('adminEdition.reveal.personPlaceholder')"
            class="w-full"
          />
        </UFormField>
        <UFormField
          name="sentence"
          :label="
            t('adminEdition.reveal.sentenceLabel', { sentence: SENTENCE })
          "
          required
        >
          <UInput
            v-model="state.sentence"
            autocomplete="off"
            autocapitalize="characters"
            class="w-full"
          />
        </UFormField>
        <UFormField name="understood">
          <UCheckbox
            v-model="state.understood"
            :label="t('adminEdition.reveal.understood')"
          />
        </UFormField>
        <UAlert
          v-if="reveal.isError.value"
          color="error"
          variant="subtle"
          :description="errorMessage(reveal.error.value)"
        />
        <UButton
          type="submit"
          color="neutral"
          block
          icon="i-lucide-eye"
          :loading="reveal.isPending.value"
          :label="t('adminEdition.reveal.submit')"
        />
      </UForm>
    </template>
  </AdminScreen>
</template>
