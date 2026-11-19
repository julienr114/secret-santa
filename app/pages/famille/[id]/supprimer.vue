<script setup lang="ts">
import {
  useDeleteMemberMutation,
  useMemberQuery,
} from '~/composables/queries/useLists';

// « Supprimer Hugo ? » (Correction 24, README 22.20, maquette
// FamilleSupprimer): what goes with a person deleted from « Mes
// proches », said before it goes, since it cannot be undone: their page
// and tastes, the lists they are on, their ideas there and the gifts
// already planned for them; and the reminder of « Retirer de cette
// liste », which keeps them.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const id = computed(() => String(route.params.id));
const listId = computed(() =>
  route.query.liste ? String(route.query.liste) : null,
);
const { t } = useT();
const toast = useToast();
const errorMessage = useErrorMessage();
const goBack = useGoBack();
const query = useMemberQuery(id);
const remove = useDeleteMemberMutation();
const member = computed(() => query.data.value?.member);
const removal = computed(() => {
  const what = query.data.value?.removal;
  return what?.allowed ? what : null;
});
const back = computed(() =>
  listId.value ? `/listes/${listId.value}` : `/famille/${id.value}`,
);
useHead({
  title: () =>
    `${t('lists.family.remove.title', { name: member.value?.firstName ?? '' })} — ${t('common.appName')}`,
});
/** « Hugo est sur 1 liste, « Noël 2026 ». » */
const onLists = computed(() => {
  const what = removal.value;
  if (!what || !member.value || what.lists.length === 0) return '';
  return t('lists.family.remove.lists', {
    count: what.lists.length,
    name: member.value.firstName,
    titles: what.lists
      .map((list) =>
        t('lists.family.remove.listTitle', {
          title: list.title || t('lists.home.untitled'),
        }),
      )
      .join(', '),
  });
});
const onRemove = () =>
  remove.mutate(id.value, {
    onSuccess: () => {
      toast.add({
        title: t('lists.doc.memberDeleted', {
          name: member.value?.firstName ?? '',
        }),
        color: 'success',
      });
      return navigateTo(listId.value ? `/listes/${listId.value}` : '/famille', {
        replace: true,
      });
    },
    onError: (error) =>
      toast.add({ title: errorMessage(error), color: 'error' }),
  });
</script>

<template>
  <AdminScreen :back="back">
    <AdminQueryState
      :pending="query.isPending.value"
      :error="query.error.value"
      :skeleton="['title', 'card']"
    >
      <template v-if="member && removal">
        <div class="flex items-center gap-3.5">
          <UiAvatar :avatar="member.avatar" :px="64" />
          <div class="flex min-w-0 flex-col">
            <p class="text-sm text-toned">{{ t('lists.family.title') }}</p>
            <UiPageTitle>{{
              t('lists.family.remove.title', { name: member.firstName })
            }}</UiPageTitle>
          </div>
        </div>
        <div
          class="flex flex-col gap-3 text-base leading-[1.5]"
          data-testid="member-removal"
        >
          <p>
            {{ t('lists.family.remove.noMore', { name: member.firstName }) }}
            {{ t('lists.family.remove.erased') }}
          </p>
          <p v-if="onLists">
            {{ onLists }}
            <template v-if="removal.ideas > 0">{{
              t('lists.family.remove.ideas', { count: removal.ideas })
            }}</template>
            <template v-if="removal.planned > 0">
              {{
                t('lists.family.remove.planned', { count: removal.planned })
              }}</template
            >
          </p>
          <p class="text-toned">
            {{ t('lists.family.remove.final') }}
            <template v-if="onLists">{{
              t('lists.family.remove.rather')
            }}</template>
          </p>
        </div>
        <div class="flex flex-col gap-2.5">
          <UButton
            block
            size="xl"
            color="error"
            class="h-13 justify-center text-[17px] font-bold"
            :loading="remove.isPending.value"
            :label="
              t('lists.family.remove.confirm', { name: member.firstName })
            "
            data-testid="member-delete"
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
