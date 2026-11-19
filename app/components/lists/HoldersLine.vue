<script setup lang="ts">
import type { ListDocument } from '#server/http/lists';

// Under the bar « Partage par lien » (lot 25, maquette ListeLiveTeneur):
// who holds the list with me, their icons then « Tu tiens cette liste
// avec Hugo. »; alone, the way to hold it with others. Both lead to
// « Ceux qui tiennent la liste ».
const props = defineProps<{
  listId: string;
  holders: ListDocument['holders'];
}>();
const { t } = useT();
const others = computed(() => props.holders.filter((holder) => !holder.me));
const names = computed(() => {
  const all = others.value.map((holder) => holder.name);
  return all.length > 1
    ? `${all.slice(0, -1).join(', ')} ${t('lists.share.and')} ${all.at(-1)}`
    : (all[0] ?? '');
});
</script>

<template>
  <NuxtLink
    :to="`/listes/${listId}/teneurs`"
    class="-my-2 flex min-h-11 items-center gap-2 self-start text-sm"
    :class="others.length > 0 ? 'text-toned' : 'font-bold text-primary-ink'"
    data-testid="holders-line"
  >
    <template v-if="others.length > 0">
      <UiAvatarStack
        :avatars="holders.map((holder) => holder.avatar)"
        :label="t('lists.holders.title')"
      />
      {{ t('lists.doc.holdersWith', { names }) }}
    </template>
    <template v-else>
      <UIcon name="i-lucide-users" class="size-4" />
      {{ t('lists.doc.holdersAlone') }}
    </template>
    <UIcon name="i-lucide-chevron-right" class="size-4 shrink-0" />
  </NuxtLink>
</template>
