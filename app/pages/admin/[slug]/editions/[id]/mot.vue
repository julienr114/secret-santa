<script setup lang="ts">
import {
  useEditionQuery,
  useUpdateEditionMutation,
} from '~/composables/queries/useGroup';

// The word for the participants of an edition, on a page of its own
// (README 23.3, Correction 18, maquette EditionMot): « Valider » fixed at
// the bottom, « Retour » gives the change up. Opened by « Petit mot » of
// the edition's settings, saved as the edition's own rule. The word of a
// new Secret Santa has its own page (nouvelle/[champ].vue).
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const id = computed(() => String(route.params.id));
const { t } = useT();
const errorMessage = useErrorMessage();
const goBack = useGoBack();
const context = useScreenContext(slug, id);
useHead({
  title: () => context.titleOf(t('adminEdition.settings.wordTitle')),
});
const parent = computed(
  () => `/admin/${slug.value}/editions/${id.value}/reglages`,
);
const screen = computed(() => ({ back: parent.value }));

const WORD_MAX = 300;
const edition = useEditionQuery(slug, id);
const update = useUpdateEditionMutation(slug);
const word = ref('');
watch(
  () => edition.data.value?.rules.guardianMessage ?? '',
  (value) => {
    word.value = value;
  },
  { immediate: true },
);
const saving = computed(() => update.isPending.value);
const failure = computed(() =>
  update.isError.value ? errorMessage(update.error.value) : null,
);

/**
 * Keeps the word: in the new edition's form, or as the edition's own rule
 * (keeping its other own rules: the route replaces them all), then goes
 * back.
 * @returns Nothing: the mutation reports by itself.
 */
const onValidate = () => {
  const value = word.value.trim();
  update.mutate(
    {
      id: id.value,
      rulesOverride: {
        ...(edition.data.value?.edition.rulesOverride ?? {}),
        guardianMessage: value,
      },
    },
    { onSuccess: () => goBack(parent.value) },
  );
};
</script>

<template>
  <AdminScreen v-bind="screen">
    <AdminQueryState
      :pending="edition.isPending.value"
      :error="edition.error.value"
      :skeleton="['title', 'card']"
    >
      <div class="flex flex-col gap-1">
        <UiPageContext
          :parts="context.parts.value"
          :label="t('common.context')"
        />
        <UiPageTitle>{{ t('adminEdition.settings.wordTitle') }}</UiPageTitle>
        <!-- Where it goes (ticket 150, EditionMot). -->
        <p class="mt-1 text-[15px] leading-[1.45] text-toned">
          {{ t('adminEdition.settings.wordWhere') }}
        </p>
      </div>
      <UiTextField
        id="edition-word"
        v-model="word"
        :label="t('adminEdition.screen.rules.wordLabel')"
        :optional="t('adminEdition.newEdition.optional')"
        :maxlength="WORD_MAX"
        :placeholder="t('adminEdition.newEdition.messagePlaceholder')"
      />
      <p v-if="failure" class="text-sm font-medium text-error" role="alert">
        {{ failure }}
      </p>
      <UiStickyFooter inline>
        <UButton
          block
          size="xl"
          class="h-13 justify-center text-[17px] font-bold"
          :loading="saving"
          :disabled="saving || edition.data.value?.edition.status === 'closed'"
          :label="t('common.actions.validate')"
          data-testid="word-validate"
          @click="onValidate"
        />
      </UiStickyFooter>
    </AdminQueryState>
  </AdminScreen>
</template>
