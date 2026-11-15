<script setup lang="ts">
import type { Avatar } from '#server/utils/avatars';
import { highlightName, matchesName } from '#shared/utils/names';

// Picking one person in a bottom sheet. Past `searchFrom` people, a
// search field narrows the list, accents and capitals ignored, and the
// letters found are marked. All texts come from the parent.

/** A person to choose. */
export type PickablePerson = { id: string; name: string; avatar: Avatar };
const props = withDefaults(
  defineProps<{
    title: string;
    description?: string;
    people: PickablePerson[];
    searchLabel: string;
    clearLabel: string;
    /** Says how many names show, e.g. "4 prénoms sur 42". */
    resultsText: (shown: number, total: number) => string;
    footnote?: string;
    searchFrom?: number;
  }>(),
  { description: undefined, footnote: undefined, searchFrom: 10 },
);
const open = defineModel<boolean>('open', { required: true });
const selected = defineModel<string | null>('selected', { default: null });

const query = ref('');
const searchable = computed(() => props.people.length > props.searchFrom);
const shown = computed(() =>
  searchable.value
    ? props.people.filter((person) => matchesName(query.value, person.name))
    : props.people,
);
</script>

<template>
  <UiSheet v-model:open="open" :title="title" :description="description">
    <div class="flex flex-col gap-3.5 py-2">
      <template v-if="searchable">
        <UInput
          v-model="query"
          icon="i-lucide-search"
          :placeholder="searchLabel"
          :aria-label="searchLabel"
          class="w-full"
        >
          <template v-if="query" #trailing>
            <UButton
              variant="ghost"
              color="neutral"
              size="sm"
              icon="i-lucide-x"
              :aria-label="clearLabel"
              @click="query = ''"
            />
          </template>
        </UInput>
        <p class="text-[13px] text-muted" aria-live="polite">
          {{ resultsText(shown.length, people.length) }}
        </p>
      </template>
      <ul
        role="listbox"
        :aria-label="title"
        class="divide-y divide-divider overflow-hidden rounded-xl ring-1 ring-default"
      >
        <li v-for="person in shown" :key="person.id">
          <button
            type="button"
            role="option"
            :aria-selected="selected === person.id"
            class="flex min-h-14 w-full items-center gap-3 px-3.5 py-2 text-left transition-colors active:bg-muted"
            :class="selected === person.id ? 'bg-primary-tint' : ''"
            @click="selected = person.id"
          >
            <UiAvatar :avatar="person.avatar" />
            <span class="min-w-0 grow truncate font-semibold">
              <template
                v-for="(part, index) in highlightName(query, person.name)"
                :key="index"
              >
                <mark
                  v-if="part.match && searchable"
                  class="rounded-sm bg-warning-soft text-inherit"
                  >{{ part.text }}</mark
                >
                <template v-else>{{ part.text }}</template>
              </template>
            </span>
            <UIcon
              v-if="selected === person.id"
              name="i-lucide-check"
              class="size-5 shrink-0 text-primary"
            />
          </button>
        </li>
      </ul>
      <p v-if="footnote && searchable" class="text-[13px] text-muted">
        {{ footnote }}
      </p>
    </div>
  </UiSheet>
</template>
