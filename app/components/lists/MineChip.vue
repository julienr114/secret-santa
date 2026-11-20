<script setup lang="ts">
// My own state under an idea, in one pill (Correction 29, maquettes
// ListeVisiteurMes, ListeVisiteurAnonyme): « Tu l'offres » with a gift,
// in mint; « Tu l'offres en anonyme » with a small mask, in aubergine as
// the bar of the anonymous mode; « Tu participes » with a tick, in mint.
// It opens the sheet of what I give, and says so (Correction 30): a line
// around it and « › » at its end, by the link as in the document.
defineProps<{
  state: 'alone' | 'anonymous' | 'group';
  /** Touched: it opens the sheet of what I give (in the document). */
  button?: boolean;
}>();
const { t } = useT();
</script>

<template>
  <UiChip
    :button="button"
    opens
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
