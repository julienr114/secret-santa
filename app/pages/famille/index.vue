<script setup lang="ts">
import { freshAvatar } from '#server/utils/avatars';
import {
  useCreateMemberMutation,
  useFamilyQuery,
  type FamilyEntry,
} from '~/composables/queries/useLists';

// « Mes proches » (Correction 24, README 22.20, maquette Famille): the
// people I hold gift lists for, family, friends or colleagues, those on
// no list included, each with on how many of my lists they are. Touching
// one opens their page, which has « Supprimer de mes proches » at the
// bottom. In « Listes », not in « Mon compte »: it only serves the lists.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t } = useT();
const toast = useMessages();
const errorMessage = useErrorMessage();
const query = useFamilyQuery();
const create = useCreateMemberMutation();
const members = computed(() => query.data.value?.members ?? []);
useHead({ title: () => `${t('lists.family.title')} — ${t('common.appName')}` });

/** « 6 ans · sur 2 listes », « Moi · sur aucune liste ». */
const line = (member: FamilyEntry) =>
  [
    member.isSelf ? t('lists.doc.me') : null,
    member.age === null ? null : t('lists.doc.age', { count: member.age }),
    member.lists > 0
      ? t('lists.family.onLists', { count: member.lists })
      : t('lists.family.onNone'),
  ]
    .filter(Boolean)
    .join(' · ');

const sheetOpen = ref(false);
const onNew = (firstName: string) =>
  create.mutate(
    {
      firstName,
      avatar: freshAvatar(
        members.value.map((m) => m.avatar),
        (n) => Math.floor(Math.random() * n),
      ),
    },
    {
      onSuccess: () => {
        sheetOpen.value = false;
      },
      onError: (error) => toast.failed(errorMessage(error)),
    },
  );
</script>

<template>
  <AdminScreen back="/listes">
    <AdminQueryState
      :pending="query.isPending.value"
      :error="query.error.value"
      :skeleton="['title', 'list']"
    >
      <div class="flex flex-col gap-1">
        <UiPageContext
          :parts="[{ label: t('lists.home.title'), to: '/listes' }]"
          :label="t('common.context')"
        />
        <UiPageTitle>{{ t('lists.family.title') }}</UiPageTitle>
        <p class="text-[15px] text-toned">{{ t('lists.family.intro') }}</p>
      </div>

      <UiList :footer="t('lists.family.help')" data-testid="family-list">
        <UiListItem
          v-for="member in members"
          :key="member.id"
          :title="member.firstName"
          :subtitle="line(member)"
          :avatar="member.avatar"
          :to="`/famille/${member.id}`"
          data-testid="family-member"
        />
      </UiList>

      <UButton
        variant="outline"
        icon="i-lucide-plus"
        class="h-12 justify-center self-start font-bold"
        :label="t('lists.family.add')"
        @click="sheetOpen = true"
      />
    </AdminQueryState>
    <ListsNewPersonSheet
      v-model:open="sheetOpen"
      :loading="create.isPending.value"
      @add="onNew"
    />
  </AdminScreen>
</template>
