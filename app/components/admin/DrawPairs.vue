<script setup lang="ts">
import type { Avatar } from '#server/utils/avatars';
import type { DrawPair } from '~/composables/queries/useEdition';

// Who gives (or gave, for past editions) to whom: the giver's avatar and
// name, and below "a offert à …".
const props = defineProps<{
  pairs: DrawPair[];
  people: { id: string; firstName: string; avatar: Avatar }[];
  title?: string;
  footer?: string;
  past?: boolean;
}>();
const personOf = (id: string | null) => props.people.find((p) => p.id === id);
</script>

<template>
  <MobileList :title="title" :footer="footer">
    <MobileListItem
      v-for="pair in pairs"
      :key="pair.giverId"
      :avatar="personOf(pair.giverId)?.avatar"
      :title="personOf(pair.giverId)?.firstName ?? '?'"
      :subtitle="`${past ? 'a offert à' : 'offre à'} ${personOf(pair.receiverId)?.firstName ?? '?'}`"
    />
  </MobileList>
</template>
