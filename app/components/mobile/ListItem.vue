<script setup lang="ts">
import type { Avatar } from '#server/utils/avatars';

// One row: optional leading avatar or icon, title and subtitle, trailing slot and a
// chevron when it opens another screen.
defineProps<{
  to?: string;
  title: string;
  subtitle?: string;
  icon?: string;
  avatar?: Avatar;
  emoji?: string;
  tone?: 'default' | 'danger';
}>();
defineEmits<{ click: [] }>();

// A string in <component :is> does not resolve global components.
const NuxtLink = resolveComponent('NuxtLink');
</script>

<template>
  <li>
    <component
      :is="to ? NuxtLink : 'button'"
      :to="to"
      :type="to ? undefined : 'button'"
      class="flex min-h-14 w-full items-center gap-3 px-4 py-2.5 text-left transition-colors active:bg-muted"
      @click="$emit('click')"
    >
      <AdminAvatar v-if="avatar" :avatar="avatar" />
      <span
        v-else-if="emoji || icon"
        class="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
        aria-hidden="true"
      >
        <span v-if="emoji" class="text-lg">{{ emoji }}</span>
        <UIcon v-else :name="icon!" class="size-5" />
      </span>
      <span class="min-w-0 grow">
        <span
          class="block truncate font-medium"
          :class="tone === 'danger' ? 'text-error' : ''"
        >
          {{ title }}
        </span>
        <span v-if="subtitle" class="block truncate text-sm text-muted">{{
          subtitle
        }}</span>
      </span>
      <slot name="trailing" />
      <UIcon
        v-if="to"
        name="i-lucide-chevron-right"
        class="size-5 shrink-0 text-dimmed"
      />
    </component>
  </li>
</template>
