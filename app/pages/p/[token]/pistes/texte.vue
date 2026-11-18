<script setup lang="ts">
import {
  useHintsQuery,
  usePersonalQuery,
  useSaveHintsMutation,
} from '~/composables/queries/usePersonal';
import { HINT_TEXTS, HINT_TEXT_MAX, type HintText } from '#shared/utils/hints';

// One text of the gift hints, on a page of its own (README 23.3,
// Correction 18, maquettes PistesTexteMoment, PistesTexteServirait,
// PistesTexteEviter): its help under the title, the field, « Valider »
// fixed at the bottom; « Retour » gives the change up. An empty text is
// removed.
const route = useRoute();
const token = computed(() => String(route.params.token));
const query = useHintsQuery(token);
const personal = usePersonalQuery(token);
const save = useSaveHintsMutation(token);
const { t, tk } = useT();
const errorMessage = useErrorMessage();
const goBack = useGoBack();
const parent = computed(() => `/p/${token.value}/pistes`);

const key = computed<HintText>(() => {
  const asked = String(route.query.texte ?? '');
  return (HINT_TEXTS as readonly string[]).includes(asked)
    ? (asked as HintText)
    : HINT_TEXTS[0];
});
const draft = ref('');
watch(
  () => query.data.value?.portrait.texts[key.value],
  (text) => {
    draft.value = text ?? '';
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
/** Saves the text, then goes back to the gift hints. */
const onValidate = () =>
  save.mutate(
    { texts: { [key.value]: draft.value.trim() || null } },
    { onSuccess: () => goBack(parent.value) },
  );
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
      <UiPageTitle>{{ tk(`hints.texts.${key}.title`) }}</UiPageTitle>
      <p class="mt-1 text-[15px] leading-[1.45] text-toned">
        {{ tk(`hints.texts.${key}.help`) }}
      </p>
    </div>
    <UiTextField
      id="hint-text"
      v-model="draft"
      :label="tk(`hints.texts.${key}.title`)"
      :maxlength="HINT_TEXT_MAX"
      :placeholder="tk(`hints.texts.${key}.placeholder`)"
      data-testid="hint-text-field"
    />
    <p
      v-if="save.isError.value"
      class="flex items-start gap-2 text-sm font-medium text-error"
      role="alert"
    >
      {{ errorMessage(save.error.value) }}
    </p>
    <UiStickyFooter>
      <UButton
        block
        size="xl"
        class="h-13 justify-center text-[17px] font-bold"
        :loading="save.isPending.value"
        :disabled="save.isPending.value || !query.data.value?.editable"
        :label="t('common.actions.validate')"
        data-testid="hint-text-validate"
        @click="onValidate"
      />
    </UiStickyFooter>
  </ParticipantScreen>
</template>
