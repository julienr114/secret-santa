<script setup lang="ts">
import { errorMessage } from '~/utils/errors';

// Loading and error states shared by every admin page.
defineProps<{ pending: boolean; error: unknown }>();
</script>

<template>
  <UAlert
    v-if="error"
    color="error"
    variant="subtle"
    icon="i-lucide-triangle-alert"
    :description="errorMessage(error)"
  />
  <div v-else-if="pending" class="flex flex-col gap-3">
    <USkeleton class="h-8 w-1/2" />
    <USkeleton class="h-32 w-full" />
  </div>
  <slot v-else />
</template>
