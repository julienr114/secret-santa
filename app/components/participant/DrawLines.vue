<script setup lang="ts">
import type { DrawPerson } from '~/composables/queries/usePersonal';

// Under a revealed draw (README 22.18, maquettes TirageDevoileAvant and
// TirageDevoileAvantQui): « Qui m'offre mon cadeau ? », folded by default
// (keeping the surprise is a choice) and folded again on leaving the page,
// then « Voir tout le tirage ». In the past tense once the party has come.
const props = defineProps<{
  santa: DrawPerson | null;
  /** The party has come: « Qui m'a offert… ». */
  past: boolean;
  /** The page « Qui offre à qui ». */
  allPath: string;
}>();
const { t } = useT();
// Only in this component's state: folded again when coming back.
const open = ref(false);
const tense = computed(() => (props.past ? 'Past' : ''));
</script>

<template>
  <UiList data-testid="draw-lines">
    <li v-if="santa">
      <button
        type="button"
        class="flex min-h-15 w-full items-center gap-3 px-4 py-2 text-left transition-colors active:bg-muted"
        :aria-expanded="open"
        data-testid="santa-line"
        @click="open = !open"
      >
        <span
          class="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-toned"
          aria-hidden="true"
        >
          <UIcon name="i-lucide-gift" class="size-5" />
        </span>
        <span class="flex min-w-0 grow flex-col">
          <span class="font-semibold">{{
            t(`participant.revealed.santaTitle${tense}`)
          }}</span>
          <span class="text-[13px] text-toned">{{
            open
              ? t('participant.revealed.santaHide')
              : t(`participant.revealed.santaShow${tense}`)
          }}</span>
        </span>
        <UIcon
          :name="open ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
          class="size-5 shrink-0 text-dimmed"
          aria-hidden="true"
        />
      </button>
      <div
        v-if="open"
        class="flex items-center gap-3 pr-4 pb-4 pl-17 pt-1"
        data-testid="santa-shown"
      >
        <UiAvatar :avatar="santa.avatar" size="lg" />
        <p class="leading-[1.35]">
          {{ t(`participant.revealed.santaIs${tense}.before`) }}
          <strong class="font-display text-[22px] font-bold text-primary">{{
            santa.name
          }}</strong>
          {{ t(`participant.revealed.santaIs${tense}.after`) }}
        </p>
      </div>
    </li>
    <UiListItem
      :to="allPath"
      icon="i-lucide-repeat-2"
      icon-tone="neutral"
      :title="t('participant.revealed.all')"
      :subtitle="t(`participant.revealed.allHint${tense}`)"
    />
  </UiList>
</template>
