<script setup lang="ts">
import { HINT_TEXTS, HINT_TEXT_MAX, type HintText } from '#shared/utils/hints';
import {
  useMemberQuery,
  useUpdateMemberMutation,
} from '~/composables/queries/useLists';

// One text of the tastes of a person of my family (README 22.19, written
// on a page, 23.3): « En ce moment », « Ce qui lui servirait », « À
// éviter ». « Valider » fixed at the bottom; « Retour » gives it up; an
// empty text is removed.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const id = computed(() => String(route.params.id));
const { t, tk } = useT();
const errorMessage = useErrorMessage();
const goBack = useGoBack();
const query = useMemberQuery(id);
const update = useUpdateMemberMutation(id);
const parent = computed(() => {
  const params = new URLSearchParams();
  if (route.query.liste) params.set('liste', String(route.query.liste));
  if (route.query.place) params.set('place', String(route.query.place));
  const search = params.toString();
  return `/famille/${id.value}${search ? `?${search}` : ''}`;
});
const key = computed<HintText>(() => {
  const asked = String(route.query.texte ?? '');
  return (HINT_TEXTS as readonly string[]).includes(asked)
    ? (asked as HintText)
    : HINT_TEXTS[0];
});
const draft = ref('');
watch(
  () => query.data.value?.member.texts[key.value],
  (text) => {
    draft.value = text ?? '';
  },
  { immediate: true },
);
const context = computed(() =>
  query.data.value
    ? [{ label: query.data.value.member.firstName, to: parent.value }]
    : [],
);
const failure = computed(() =>
  update.isError.value ? errorMessage(update.error.value) : null,
);
const onValidate = () =>
  update.mutate(
    { texts: { [key.value]: draft.value.trim() || null } },
    { onSuccess: () => goBack(parent.value) },
  );
</script>

<template>
  <AdminScreen :back="parent">
    <AdminQueryState
      :pending="query.isPending.value"
      :error="query.error.value"
      :skeleton="['title', 'card']"
    >
      <div class="flex flex-col gap-1">
        <UiPageContext :parts="context" :label="t('common.context')" />
        <UiPageTitle>{{ t(`lists.person.texts.${key}`) }}</UiPageTitle>
      </div>
      <UiTextField
        id="member-text"
        v-model="draft"
        :label="t(`lists.person.texts.${key}`)"
        :maxlength="HINT_TEXT_MAX"
        :placeholder="tk(`hints.texts.${key}.placeholder`)"
      />
      <p v-if="failure" class="text-sm font-medium text-error" role="alert">
        {{ failure }}
      </p>
      <UiStickyFooter>
        <UButton
          block
          size="xl"
          class="h-13 justify-center text-[17px] font-bold"
          :loading="update.isPending.value"
          :label="t('common.actions.validate')"
          data-testid="member-text-validate"
          @click="onValidate"
        />
      </UiStickyFooter>
    </AdminQueryState>
  </AdminScreen>
</template>
