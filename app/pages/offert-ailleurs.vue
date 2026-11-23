<script setup lang="ts">
import type { ElsewhereList } from '#server/database/listSharing';
import type { ListIcon } from '#server/utils/lists';
import { useElsewhereQuery } from '~/composables/queries/useLists';

// « Ce que j'offre ailleurs » (docs/spec/v3/listes.md, V3OffreAilleurs):
// the public lists where I offer something without being a member of
// their events, each with its day and what I offer; a tap opens it by its
// link. A list that stops being public is no longer here.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t, locale } = useT();
useHead({
  title: () => `${t('lists.elsewhere.title')} — ${t('common.appName')}`,
});
const query = useElsewhereQuery();
const lists = computed(() => query.data.value?.lists ?? []);

/**
 * The line under a list: its day, and what I offer.
 * @param list - The list.
 * @returns « Le 12 juin · tu offres : un plaid en laine ».
 */
const lineOf = (list: ElsewhereList) => {
  const gifts = list.gifts.join(', ');
  return list.eventDate
    ? t('lists.elsewhere.line', {
        date: new Intl.DateTimeFormat(locale.value, {
          day: 'numeric',
          month: 'long',
          timeZone: 'UTC',
        }).format(new Date(`${list.eventDate}T00:00:00Z`)),
        gifts,
      })
    : t('lists.elsewhere.lineNoDate', { gifts });
};
const iconOf = (list: ElsewhereList) =>
  ({ emoji: list.iconEmoji, color: list.iconColor }) as ListIcon;
</script>

<template>
  <AdminScreen back="/">
    <UiPageTitle>{{ t('lists.elsewhere.title') }}</UiPageTitle>
    <AdminQueryState
      :pending="query.isPending.value"
      :error="query.error.value"
      :skeleton="['icons']"
      :rows="2"
    >
      <UiList data-testid="elsewhere">
        <UiListItem
          v-for="list in lists"
          :key="list.token"
          :to="`/l/${list.token}`"
          :title="list.title"
          :subtitle="lineOf(list)"
        >
          <template #leading>
            <ListsTile :icon="iconOf(list)" />
          </template>
        </UiListItem>
      </UiList>
    </AdminQueryState>
  </AdminScreen>
</template>
