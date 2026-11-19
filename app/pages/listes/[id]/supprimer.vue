<script setup lang="ts">
import {
  useDeleteListForGoodMutation,
  useListQuery,
} from '~/composables/queries/useLists';

// « Supprimer la liste ? » (asked by Julien on 19 November 2026: a list
// could not be deleted), on the model of « Supprimer de mes proches »
// (Correction 24): what goes with the list, said before it goes, since
// it cannot be undone: its ideas, the gifts already planned (those who
// ticked them are not told), its link, and that it goes for the others
// who hold it; the people stay among « Mes proches ». For those who
// manage the list only.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const id = computed(() => String(route.params.id));
const { t } = useT();
const toast = useMessages();
const errorMessage = useErrorMessage();
const goBack = useGoBack();
const query = useListQuery(id);
const remove = useDeleteListForGoodMutation();
const doc = computed(() => query.data.value);
const back = computed(() => `/listes/${id.value}`);
const title = computed(() =>
  doc.value?.list.title
    ? t('lists.delete.title', { title: doc.value.list.title })
    : t('lists.delete.titleUntitled'),
);
useHead({ title: () => `${title.value} — ${t('common.appName')}` });
const ideas = computed(() =>
  (doc.value?.people ?? []).reduce(
    (sum, person) => sum + person.ideas.length,
    0,
  ),
);
/** The others who hold it: « Hugo et Mamie ». */
const others = computed(() => {
  const names = (doc.value?.holders ?? [])
    .filter((holder) => !holder.me)
    .map((holder) => holder.name);
  return names.length > 1
    ? `${names.slice(0, -1).join(', ')} ${t('lists.share.and')} ${names.at(-1)}`
    : (names[0] ?? '');
});
const onRemove = () =>
  remove.mutate(id.value, {
    onSuccess: () => {
      toast.done(t('lists.delete.done'));
      return navigateTo('/listes', { replace: true });
    },
    onError: (error) => toast.failed(errorMessage(error)),
  });
</script>

<template>
  <AdminScreen :back="back">
    <AdminQueryState
      :pending="query.isPending.value"
      :error="query.error.value"
      :skeleton="['title', 'card']"
    >
      <template v-if="doc && doc.manages">
        <div class="flex items-center gap-3.5">
          <ListsTile :icon="doc.list.icon" size="lg" />
          <div class="flex min-w-0 flex-col">
            <p class="text-sm text-toned">{{ t('lists.home.title') }}</p>
            <UiPageTitle>{{ title }}</UiPageTitle>
          </div>
        </div>
        <div
          class="flex flex-col gap-3 text-base leading-[1.5]"
          data-testid="list-removal"
        >
          <p v-if="ideas > 0 || doc.planned > 0">
            <template v-if="ideas > 0">{{
              t('lists.delete.ideas', { count: ideas })
            }}</template>
            <template v-if="doc.planned > 0">
              {{ t('lists.delete.planned', { count: doc.planned }) }}</template
            >
          </p>
          <p v-if="doc.list.status !== 'draft' || others">
            <template v-if="doc.list.status !== 'draft'">{{
              t('lists.delete.link')
            }}</template>
            <template v-if="others">
              {{ t('lists.delete.holders', { names: others }) }}</template
            >
          </p>
          <p v-if="doc.people.length > 0">{{ t('lists.delete.people') }}</p>
          <p class="text-toned">{{ t('lists.delete.final') }}</p>
        </div>
        <div class="flex flex-col gap-2.5">
          <UButton
            block
            size="xl"
            color="error"
            class="h-13 justify-center text-[17px] font-bold"
            :loading="remove.isPending.value"
            :label="t('lists.delete.confirm')"
            data-testid="list-delete"
            @click="onRemove"
          />
          <UButton
            block
            size="xl"
            variant="ghost"
            color="neutral"
            class="h-12 justify-center font-semibold"
            :label="t('common.actions.cancel')"
            @click="goBack(back)"
          />
        </div>
      </template>
    </AdminQueryState>
  </AdminScreen>
</template>
