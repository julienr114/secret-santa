<script setup lang="ts">
import { SECRET_SANTA_LIMIT } from '#server/utils/quota';
import { useNewSecretSantaQuery } from '~/composables/queries/useHome';

// The limit of Secret Santa (docs/spec/v3/secret-santa.md, V3TirageLimite):
// « Créer › Un Secret Santa » leads here once I organise as many as my
// account may. The Secret Santa that keep me there, each opening its page.
// There is nothing to ask anyone.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t } = useT();
const query = useNewSecretSantaQuery(true);
const santas = computed(() => query.data.value?.secretSantas ?? []);
const count = computed(() => santas.value.length || SECRET_SANTA_LIMIT);
const title = computed(() =>
  t('party.secretSanta.limit.title', { count: count.value }),
);
useHead({ title: () => `${title.value} — ${t('common.appName')}` });
</script>

<template>
  <AdminScreen :back="'/'">
    <AdminQueryState
      :pending="query.isPending.value"
      :error="query.error.value"
      :skeleton="['title', 'list']"
      :rows="3"
    >
      <div class="flex flex-col gap-4">
        <UiPageTitle>{{ title }}</UiPageTitle>
        <p class="text-[15px] leading-[1.45] text-toned">
          {{ t('party.secretSanta.limit.text') }}
        </p>
      </div>
      <UiList data-testid="limit-secret-santas">
        <UiListItem
          v-for="santa in santas"
          :key="santa.id"
          icon="i-lucide-mail"
          icon-tone="neutral"
          :title="santa.partyName"
          :subtitle="
            [
              santa.label,
              santa.status === 'preparing'
                ? t('party.secretSanta.limit.preparing')
                : t('party.secretSanta.limit.drawn'),
            ].join(' · ')
          "
          :to="`/admin/${santa.partySlug}/editions/${santa.id}`"
        />
      </UiList>
    </AdminQueryState>
  </AdminScreen>
</template>
