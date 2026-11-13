<script setup lang="ts">
import { displayName, type Named } from '#server/utils/people';

// First name, last name only when another person shares the first name.
const props = defineProps<{ person: Named; people?: Named[] }>();
const name = computed(() => displayName(props.person, props.people ?? []));
</script>

<template>
  <span>{{ name }}</span>
</template>
