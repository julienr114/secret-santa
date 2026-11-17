<script setup lang="ts">
import type { Avatar } from '#server/utils/avatars';

// Choosing a guess (README 22.17, maquettes DevineChoisir and
// DevineChoisirPaire): the people one may name, the one chosen checked,
// and, for someone already named for another, where the guess comes
// from (« Ton pronostic pour Hugo : le choisir le déplace ici »). « Effacer
// ce pronostic » takes it back. A tap saves.
export type GuessOption = {
  id: string;
  name: string;
  avatar: Avatar;
  /** Already named for someone else: who, as the sheet says it. */
  movedFrom?: string;
};
defineProps<{
  title: string;
  description: string;
  options: GuessOption[];
  /** The person guessed now, if any. */
  current: string | null;
  saving: boolean;
}>();
const open = defineModel<boolean>('open', { required: true });
const emit = defineEmits<{ choose: [giverId: string | null] }>();
const { t } = useT();
</script>

<template>
  <UiSheet
    v-model:open="open"
    :title="title"
    :description="description"
    :busy="saving"
  >
    <ul
      role="listbox"
      :aria-label="title"
      class="my-2 divide-y divide-divider overflow-hidden rounded-xl ring-1 ring-default"
      data-testid="guess-options"
    >
      <li v-for="option in options" :key="option.id">
        <button
          type="button"
          role="option"
          :aria-selected="current === option.id"
          class="flex min-h-14 w-full items-center gap-3 px-3.5 py-2 text-left transition-colors active:bg-muted"
          :class="current === option.id ? 'bg-primary-tint' : ''"
          :disabled="saving"
          @click="emit('choose', option.id)"
        >
          <UiAvatar :avatar="option.avatar" />
          <span class="flex min-w-0 grow flex-col">
            <span class="truncate font-semibold">{{ option.name }}</span>
            <span v-if="option.movedFrom" class="text-[13px] text-toned">{{
              option.movedFrom
            }}</span>
          </span>
          <span
            v-if="current === option.id"
            class="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-inverted"
            aria-hidden="true"
          >
            <UIcon name="i-lucide-check" class="size-4" />
          </span>
        </button>
      </li>
    </ul>
    <template #footer>
      <button
        v-if="current"
        type="button"
        class="flex min-h-11 items-center justify-center text-[15px] font-semibold text-toned underline"
        :disabled="saving"
        data-testid="guess-clear"
        @click="emit('choose', null)"
      >
        {{ t('participant.game.clear') }}
      </button>
    </template>
  </UiSheet>
</template>
