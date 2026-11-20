<script setup lang="ts">
// « Créer », the sheet of the tab (docs/spec/v3/accueil-et-creation.md):
// two lines without a subtitle, each opening « Pour quelle occasion ? ».
// Until the Secret Santa (105) and the list (106) have their own first
// step, a party is created first, then the screen of today.
const open = defineModel<boolean>('open', { required: true });
const { t } = useT();
/** Each line opens its screen: the sheet goes. */
const close = () => {
  open.value = false;
};
</script>

<template>
  <UiSheet v-model:open="open" :title="t('common.create.title')">
    <UiList>
      <UiListItem
        :title="t('common.create.secretSanta')"
        icon="i-lucide-mail"
        icon-tone="neutral"
        to="/f/nouvelle?pour=secret-santa"
        :on-click="close"
      />
      <UiListItem
        :title="t('common.create.list')"
        icon="i-lucide-list-checks"
        icon-tone="lilac"
        to="/f/nouvelle?pour=liste"
        :on-click="close"
      />
    </UiList>
  </UiSheet>
</template>
