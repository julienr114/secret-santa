<script setup lang="ts">
import { IDEA_TEXT_MAX } from '#server/utils/lists';
import {
  useAddOffListMutation,
  useLinkQuery,
} from '~/composables/queries/useLists';

// « J'offre autre chose à Léo » (README 22.19, maquette ListeHorsListe,
// on a page since it is written, README 23.3): two words the holder alone
// reads; « Dire à Camille que c'est moi ». The others see a surprise.
const route = useRoute();
const token = computed(() => String(route.params.token));
const personId = computed(() => String(route.query.pour ?? ''));
const { t } = useT();
const errorMessage = useErrorMessage();
const goBack = useGoBack();
const { loggedIn } = useUserSession();
const query = useLinkQuery(token);
const add = useAddOffListMutation(token);
const parent = computed(() => `/l/${token.value}`);
const person = computed(() =>
  query.data.value?.people.find((p) => p.id === personId.value),
);
const holder = computed(() => query.data.value?.holder.name ?? '');
const text = ref('');
const tell = ref(true);
const onAdd = () => {
  if (!loggedIn.value) return navigateTo(`${parent.value}/connexion`);
  add.mutate(
    {
      listPersonId: personId.value,
      text: text.value.trim(),
      anonymous: !tell.value,
    },
    { onSuccess: () => goBack(parent.value) },
  );
};
</script>

<template>
  <ListsScreen
    :back="parent"
    :pending="query.isPending.value"
    :error="query.error.value"
  >
    <div class="flex flex-col gap-1">
      <p class="text-sm text-toned">{{ query.data.value?.list.title }}</p>
      <UiPageTitle>{{
        t('lists.offList.title', { name: person?.member.firstName ?? '' })
      }}</UiPageTitle>
      <p class="mt-1 text-[15px] leading-[1.45] text-toned">
        {{ t('lists.offList.intro') }}
      </p>
    </div>
    <UiTextField
      id="off-list-text"
      v-model="text"
      :label="t('lists.offList.label')"
      :maxlength="IDEA_TEXT_MAX"
      :rows="2"
      :hint="t('lists.offList.hint', { name: holder })"
    />
    <div
      class="flex items-start gap-3 rounded-xl bg-default p-3.5 ring-1 ring-default"
    >
      <div class="flex grow flex-col gap-0.5">
        <p class="font-semibold">
          {{ t('lists.offList.tellHolder', { name: holder }) }}
        </p>
        <p class="text-[13px] text-toned">
          {{ t('lists.offList.tellHolderHelp') }}
        </p>
      </div>
      <USwitch
        v-model="tell"
        :aria-label="t('lists.offList.tellHolder', { name: holder })"
      />
    </div>
    <p
      v-if="add.isError.value"
      class="text-sm font-medium text-error"
      role="alert"
    >
      {{ errorMessage(add.error.value) }}
    </p>
    <UiStickyFooter inline>
      <UButton
        block
        size="xl"
        class="h-13 justify-center text-[17px] font-bold"
        :disabled="!text.trim()"
        :loading="add.isPending.value"
        :label="t('lists.offList.add')"
        data-testid="off-list-add"
        @click="onAdd"
      />
    </UiStickyFooter>
  </ListsScreen>
</template>
