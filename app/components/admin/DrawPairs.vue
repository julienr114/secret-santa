<script setup lang="ts">
import { fullName } from '#server/utils/people';
import type { Avatar } from '#server/utils/avatars';
import type { DrawPair } from '~/composables/queries/useEdition';

// Who gives (or gave, for past editions) to whom: the giver's avatar and
// name, and below "gave to …".
const props = defineProps<{
  pairs: DrawPair[];
  people: {
    id: string;
    firstName: string;
    lastName?: string | null;
    avatar: Avatar;
  }[];
  title?: string;
  footer?: string;
  past?: boolean;
}>();
const { t } = useT();
const personOf = (id: string | null) => props.people.find((p) => p.id === id);
const subtitleOf = (pair: DrawPair) =>
  t(
    props.past ? 'adminEdition.drawPairs.gave' : 'adminEdition.drawPairs.gives',
    {
      name: nameOf(pair.receiverId),
    },
  );
/**
 * The full name of a person of the draw.
 * @param id - The person.
 * @returns Their first and last name, or "?".
 */
const nameOf = (id: string | null) => {
  const person = personOf(id);
  return person ? fullName(person) : '?';
};
</script>

<template>
  <UiList :title="title" :footer="footer">
    <UiListItem
      v-for="pair in pairs"
      :key="pair.giverId"
      :avatar="personOf(pair.giverId)?.avatar"
      :title="nameOf(pair.giverId)"
      :subtitle="subtitleOf(pair)"
    />
  </UiList>
</template>
