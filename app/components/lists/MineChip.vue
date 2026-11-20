<script setup lang="ts">
// My own state under an idea, in one pill (Correction 29, maquettes
// ListeVisiteurMes, ListeVisiteurAnonyme): « Tu l'offres » with a gift,
// in mint; « Tu l'offres en anonyme » with a small mask, in aubergine as
// the bar of the anonymous mode; « Tu participes » with a tick, in mint.
defineProps<{ state: 'alone' | 'anonymous' | 'group' }>();
const { t } = useT();
</script>

<template>
  <UiChip
    :kind="state === 'anonymous' ? 'anonymous' : 'mine'"
    :icon="
      state === 'group'
        ? 'i-lucide-check'
        : state === 'anonymous'
          ? 'i-lucide-venetian-mask'
          : 'i-lucide-gift'
    "
  >
    {{
      state === 'group'
        ? t('lists.visitor.joined')
        : state === 'anonymous'
          ? t('lists.chips.givingAnonymous')
          : t('lists.visitor.giving')
    }}
  </UiChip>
</template>
