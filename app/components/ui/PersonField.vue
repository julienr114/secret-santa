<script setup lang="ts">
import type { Avatar } from '#server/utils/avatars';

// A field that holds one person: their icon and name, or a hint while
// none is chosen, and a chevron. A tap asks the parent to open the
// person picker. The texts come from the parent.
defineProps<{
  label: string;
  /** The person chosen, if any. */
  person?: { name: string; avatar: Avatar } | null;
  placeholder: string;
}>();
const emit = defineEmits<{ open: [] }>();
const id = useId();
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label :for="id" class="text-[15px] font-semibold">{{ label }}</label>
    <button
      :id="id"
      type="button"
      aria-haspopup="listbox"
      class="flex min-h-14 items-center gap-3 rounded-md bg-default px-3 py-1.5 text-left font-semibold ring-1 ring-accented focus-visible:ring-2 focus-visible:ring-primary"
      @click="emit('open')"
    >
      <UiAvatar v-if="person" :avatar="person.avatar" />
      <span
        class="grow truncate"
        :class="{ 'font-normal text-dimmed': !person }"
        >{{ person ? person.name : placeholder }}</span
      >
      <UIcon
        name="i-lucide-chevron-down"
        class="size-5 shrink-0 text-toned"
        aria-hidden="true"
      />
    </button>
  </div>
</template>
