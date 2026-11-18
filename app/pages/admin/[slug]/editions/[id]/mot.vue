<script setup lang="ts">
import {
  useEditionQuery,
  useUpdateEditionMutation,
} from '~/composables/queries/useGroup';

// The word for the participants of an edition, on a page of its own
// (README 23.3, Correction 18, maquette EditionMot): « Valider » fixed at
// the bottom, « Retour » gives the change up. Opened by « Petit mot » of
// the edition's settings, saved as the edition's own rule; or, with
// `nouvelle` as the edition, by « Nouvelle édition », whose form keeps it
// until the edition is created.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const id = computed(() => String(route.params.id));
const isNew = computed(() => id.value === 'nouvelle');
const { t } = useT();
const errorMessage = useErrorMessage();
const goBack = useGoBack();
const context = useScreenContext(slug, () => (isNew.value ? '' : id.value));
useHead({
  title: () => context.titleOf(t('adminEdition.settings.wordTitle')),
});
const parent = computed(() =>
  isNew.value
    ? `/admin/${slug.value}/editions/nouvelle`
    : `/admin/${slug.value}/editions/${id.value}/reglages`,
);
const screen = computed(() => ({ back: parent.value }));

const WORD_MAX = 300;
const draft = useNewEditionDraft(slug);
const edition = useEditionQuery(slug, id, () => !isNew.value);
const update = useUpdateEditionMutation(slug);
const word = ref('');
watch(
  () =>
    isNew.value
      ? (draft.value?.guardianMessage ?? '')
      : (edition.data.value?.rules.guardianMessage ?? ''),
  (value) => {
    word.value = value;
  },
  { immediate: true },
);
// Without its form, a new edition's word has nowhere to go.
onMounted(() => {
  if (isNew.value && !draft.value) navigateTo(parent.value, { replace: true });
});
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
  if (isNew.value) {
    if (draft.value) draft.value.guardianMessage = value;
    goBack(parent.value);
    return;
  }
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
      :pending="!isNew && edition.isPending.value"
      :error="isNew ? null : edition.error.value"
      :skeleton="['title', 'card']"
    >
      <div class="flex flex-col gap-1">
        <UiPageContext
          :parts="context.parts.value"
          :label="t('common.context')"
        />
        <UiPageTitle>{{ t('adminEdition.settings.wordTitle') }}</UiPageTitle>
      </div>
      <UiTextField
        id="edition-word"
        v-model="word"
        :label="t('adminEdition.screen.rules.wordLabel')"
        :optional="t('adminEdition.newEdition.optional')"
        :maxlength="WORD_MAX"
        :placeholder="t('adminEdition.newEdition.messagePlaceholder')"
        :hint="t('adminEdition.screen.rules.wordHelp')"
      />
      <p v-if="failure" class="text-sm font-medium text-error" role="alert">
        {{ failure }}
      </p>
      <UiStickyFooter>
        <UButton
          block
          size="xl"
          class="h-13 justify-center text-[17px] font-bold"
          :loading="saving"
          :disabled="
            saving ||
            (!isNew && edition.data.value?.edition.status === 'closed')
          "
          :label="t('common.actions.validate')"
          data-testid="word-validate"
          @click="onValidate"
        />
      </UiStickyFooter>
    </AdminQueryState>
  </AdminScreen>
</template>
