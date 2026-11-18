<script setup lang="ts">
import type { WishItem } from '~/composables/queries/usePersonal';
import { hostOf } from '#shared/utils/links';

// « Une idée précise, au cas où » (README 22.11): the precise ideas of the
// gift hints, one row each, then « Ajouter une idée ». Each one is written
// on a page of its own (README 23.3, Correction 18, maquette PistesIdee).
const props = defineProps<{
  token: string;
  ideas: WishItem[];
  max: number;
  editable: boolean;
}>();
const { t } = useT();
const left = computed(() => props.max - props.ideas.length);
const ideaPath = (n?: number) =>
  `/p/${props.token}/pistes/idee${n === undefined ? '' : `?n=${n}`}`;
</script>

<template>
  <section
    v-if="editable || ideas.length > 0"
    class="flex flex-col gap-1.5"
    data-testid="hints-ideas"
  >
    <UiSectionTitle>{{ t('hints.ideas.title') }}</UiSectionTitle>
    <ul
      class="-mx-4 divide-y divide-divider border-y border-default bg-default sm:mx-0 sm:overflow-hidden sm:rounded-lg sm:border"
    >
      <UiListItem
        v-for="(idea, index) in ideas"
        :key="index"
        :title="idea.label"
        :to="editable ? ideaPath(index + 1) : undefined"
        :chevron="editable"
      >
        <template #leading>
          <UiStar :size="16" />
        </template>
        <template v-if="idea.url" #subtitle>
          <UIcon
            name="i-lucide-link"
            class="size-3.5 shrink-0"
            aria-hidden="true"
          />
          <span class="truncate font-semibold text-primary-ink">{{
            hostOf(idea.url)
          }}</span>
        </template>
      </UiListItem>
      <UiListItem
        v-if="editable && left > 0"
        icon="i-lucide-plus"
        :title="t('hints.ideas.add')"
        :subtitle="
          ideas.length === 0
            ? t('hints.ideas.addHint')
            : t('hints.ideas.left', { count: left })
        "
        :to="ideaPath()"
      />
    </ul>
    <p v-if="editable" class="px-1 text-[13px] leading-[1.4] text-toned">
      {{ t('hints.ideas.why') }}
    </p>
  </section>
</template>
