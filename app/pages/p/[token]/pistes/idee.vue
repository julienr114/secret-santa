<script setup lang="ts">
import {
  useHintsQuery,
  usePersonalQuery,
  useSaveWishesMutation,
} from '~/composables/queries/usePersonal';

// A precise idea of the gift hints, on a page of its own (README 23.3,
// Correction 18, maquette PistesIdee): the idea and a link, « Supprimer
// l'idée » when it exists, « Valider » fixed at the bottom; « Retour »
// gives the change up. `?n=` is the idea changed (from 1); none adds one.
// The server replaces the whole list each time.
const route = useRoute();
const token = computed(() => String(route.params.token));
const query = useHintsQuery(token);
const personal = usePersonalQuery(token);
const save = useSaveWishesMutation(token);
const { t } = useT();
const errorMessage = useErrorMessage();
const goBack = useGoBack();
const parent = computed(() => `/p/${token.value}/pistes`);

const LABEL_MAX = 200;
const saving = computed(() => save.isPending.value);
const failure = computed(() =>
  save.isError.value ? errorMessage(save.error.value) : null,
);
const canEdit = computed(() => Boolean(query.data.value?.ideasEditable));
const ideas = computed(() => query.data.value?.ideas ?? []);
/** The idea changed, or null for a new one. */
const index = computed(() => {
  const n = Number(route.query.n);
  return Number.isInteger(n) && n >= 1 && n <= ideas.value.length
    ? n - 1
    : null;
});
const label = ref('');
const url = ref('');
watch(
  () => (index.value === null ? null : ideas.value[index.value]),
  (idea) => {
    label.value = idea?.label ?? '';
    url.value = idea?.url ?? '';
  },
  { immediate: true },
);
const context = computed(() =>
  personal.data.value
    ? [
        { label: personal.data.value.groupName, to: `/p/${token.value}` },
        { label: personal.data.value.editionLabel, to: `/p/${token.value}` },
      ]
    : [],
);
/**
 * Saves the list with the idea added, changed or removed, then goes back.
 * @param next - The list afterwards.
 * @returns Nothing: the mutation reports by itself.
 */
const push = (next: { label: string; url: string | null }[]) =>
  save.mutate(next, { onSuccess: () => goBack(parent.value) });
const onValidate = () => {
  const idea = { label: label.value.trim(), url: url.value.trim() || null };
  if (!idea.label) return;
  const at = index.value;
  push(
    at === null
      ? [...ideas.value, idea]
      : ideas.value.map((item, i) => (i === at ? idea : item)),
  );
};
const onRemove = () => {
  const at = index.value;
  if (at === null) return;
  push(ideas.value.filter((_, i) => i !== at));
};
</script>

<template>
  <ParticipantScreen
    :token="token"
    :back="parent"
    :pending="query.isPending.value"
    :error="query.error.value"
    :skeleton="['title', 'card']"
  >
    <div class="flex flex-col gap-1">
      <UiPageContext
        v-if="context.length > 0"
        :parts="context"
        :label="t('common.context')"
      />
      <UiPageTitle>{{
        index === null
          ? t('participant.wishes.sheet.new')
          : t('participant.wishes.sheet.edit')
      }}</UiPageTitle>
      <p class="mt-1 text-[15px] leading-[1.45] text-toned">
        {{ t('participant.wishes.sheet.description') }}
      </p>
    </div>
    <UiTextField
      id="idea-label"
      v-model="label"
      :label="t('participant.wishes.sheet.idea')"
      :maxlength="LABEL_MAX"
      :rows="2"
      :placeholder="t('participant.wishes.sheet.ideaPlaceholder')"
    />
    <UiTextField
      id="idea-url"
      v-model="url"
      :label="t('participant.wishes.sheet.linkLabel')"
      :optional="t('participant.wishes.sheet.optional')"
      :multiline="false"
      inputmode="url"
      placeholder="https://…"
      :hint="t('participant.wishes.sheet.linkHelp')"
    />
    <button
      v-if="index !== null"
      type="button"
      class="flex min-h-11 items-center self-start text-[15px] font-semibold text-error"
      :disabled="saving"
      data-testid="idea-remove"
      @click="onRemove"
    >
      {{ t('participant.wishes.sheet.remove') }}
    </button>
    <p v-if="failure" class="text-sm font-medium text-error" role="alert">
      {{ failure }}
    </p>
    <UiStickyFooter inline>
      <UButton
        block
        size="xl"
        class="h-13 justify-center text-[17px] font-bold"
        :loading="saving"
        :disabled="saving || !label.trim() || !canEdit"
        :label="t('common.actions.validate')"
        data-testid="idea-validate"
        @click="onValidate"
      />
    </UiStickyFooter>
  </ParticipantScreen>
</template>
