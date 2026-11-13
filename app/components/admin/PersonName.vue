<script setup>
// First name, last name only when another person shares the first name.
const props = defineProps({
  person: { type: Object, required: true },
  people: { type: Array, default: () => [] },
});
const name = computed(() => {
  const homonyms = props.people.filter(
    (p) => p.id !== props.person.id && p.firstName === props.person.firstName,
  );
  return homonyms.length > 0 && props.person.lastName
    ? `${props.person.firstName} ${props.person.lastName}`
    : props.person.firstName;
});
</script>

<template>
  <span>{{ name }}</span>
</template>
