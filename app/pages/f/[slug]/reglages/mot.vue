<script setup lang="ts">
import { NOTE_MAX, type NotePosition } from '#server/utils/messages';
import {
  useRulesQuery,
  useUpdateRulesMutation,
} from '~/composables/queries/useGroup';

// The group's word, added to every message and email sent to the
// participants, on a page of its own (README 23.3, Correction 18, maquette
// GroupeMot): the word, then where it goes, « Valider » fixed at the
// bottom, « Retour » gives the change up.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const { t } = useT();
const errorMessage = useErrorMessage();
const goBack = useGoBack();
const context = useScreenContext(slug);
useHead({
  title: () => context.titleOf(t('adminGroup.rules.messageNote')),
});
const parent = computed(() => `/f/${slug.value}/reglages/secret-santa`);
const screen = computed(() => ({ back: parent.value }));

const rules = useRulesQuery(slug);
const update = useUpdateRulesMutation(slug);
const positions = useNotePositionItems();
const note = ref('');
const position = ref<NotePosition>('after');
watch(
  () => rules.data.value?.rules,
  (current) => {
    note.value = current?.messageNote ?? '';
    position.value = current?.messageNotePosition ?? 'after';
  },
  { immediate: true },
);
const saving = computed(() => update.isPending.value);
const failure = computed(() =>
  update.isError.value ? errorMessage(update.error.value) : null,
);
/**
 * Saves the word and where it goes, then goes back.
 * @returns Nothing: the mutation reports by itself.
 */
const onValidate = () =>
  update.mutate(
    { messageNote: note.value.trim(), messageNotePosition: position.value },
    { onSuccess: () => goBack(parent.value) },
  );
</script>

<template>
  <AdminScreen v-bind="screen">
    <AdminQueryState
      :pending="rules.isPending.value"
      :error="rules.error.value"
      :skeleton="['title', 'card']"
    >
      <div class="flex flex-col gap-1">
        <UiPageContext
          :parts="context.parts.value"
          :label="t('common.context')"
        />
        <UiPageTitle>{{ t('adminGroup.rules.messageNote') }}</UiPageTitle>
        <p class="mt-1 text-[15px] leading-[1.45] text-toned">
          {{ t('adminGroup.rules.messageNoteHelp') }}
        </p>
      </div>
      <UiTextField
        id="group-note"
        v-model="note"
        :label="t('adminGroup.rules.yourWord')"
        :maxlength="NOTE_MAX"
        :hint="t('adminGroup.rules.asTyped')"
      />
      <UiChoiceList
        v-model="position"
        :choices="positions"
        :label="t('adminGroup.rules.where')"
        titled
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
          :disabled="saving"
          :label="t('common.actions.validate')"
          data-testid="note-validate"
          @click="onValidate"
        />
      </UiStickyFooter>
    </AdminQueryState>
  </AdminScreen>
</template>
