<script setup lang="ts">
import { LIST_NOTE_MAX } from '#server/utils/lists';
import { useListQuery } from '~/composables/queries/useLists';

// « Personnaliser le message » of a list (README 23.3: written on a page):
// the sentence before the link, kept while the app is open; the link and
// the word about the app stay at the end. « Valider » keeps it, « Retour »
// gives it up.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const id = computed(() => String(route.params.id));
const { t } = useT();
const goBack = useGoBack();
const query = useListQuery(id);
const parent = computed(() => `/listes/${id.value}/partager`);
const { sentence } = useListMessage(id, () => query.data.value, '');
const draft = ref('');
watch(
  () => (query.data.value ? sentence.value : null),
  (value) => {
    if (value !== null) draft.value = value;
  },
  { immediate: true },
);
const onValidate = () => {
  sentence.value = draft.value.trim() || sentence.value;
  goBack(parent.value);
};
</script>

<template>
  <AdminScreen :back="parent">
    <AdminQueryState
      :pending="query.isPending.value"
      :error="query.error.value"
      :skeleton="['title', 'card']"
    >
      <div class="flex flex-col gap-1">
        <UiPageTitle>{{ t('lists.share.personalize') }}</UiPageTitle>
        <p class="mt-1 text-[15px] leading-[1.45] text-toned">
          {{ t('lists.share.personalizeHelp') }}
        </p>
      </div>
      <UiTextField
        id="list-message"
        v-model="draft"
        :label="t('lists.share.personalizeLabel')"
        :maxlength="LIST_NOTE_MAX"
      />
      <UiStickyFooter>
        <UButton
          block
          size="xl"
          class="h-13 justify-center text-[17px] font-bold"
          :label="t('common.actions.validate')"
          @click="onValidate"
        />
      </UiStickyFooter>
    </AdminQueryState>
  </AdminScreen>
</template>
