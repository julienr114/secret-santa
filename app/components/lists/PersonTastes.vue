<script setup lang="ts">
import type { Around } from '~/utils/tastes';
import { tastesParagraph } from '~/utils/tastes';

// The tastes of a person on a list (Correction 30, maquettes
// ListeGroupeFil, ListeGroupeFilDeplie): a small paragraph in the running
// text, under their header and above their first ideas, what they like in
// bold. Three lines at most, cut by « … »; only when it is longer, a small
// « Voir plus » under it unrolls it in place (« Voir moins »): no sheet,
// no page. Unrolled is not kept from one visit to the next. Nothing
// written: no paragraph.
const props = defineProps<{
  member: {
    firstName: string;
    answers: Readonly<Record<string, string | null>>;
    texts: Readonly<Record<string, string | null>>;
  };
}>();
const { t, tk, locale } = useT();
const MARK = '\u0000';
/**
 * The words before and after a text, from a sentence of the language.
 * @param sentence - The sentence, written around the mark.
 * @returns The words before and after.
 */
const around = (sentence: string): Around => {
  const [before = '', after = ''] = sentence.split(MARK);
  return [before, after];
};
const parts = computed(() => {
  const name = props.member.firstName;
  return tastesParagraph(props.member.texts, props.member.answers, {
    lately: around(t('lists.tastes.lately', { text: MARK })),
    wouldHelp: around(t('lists.tastes.wouldHelp', { text: MARK })),
    avoid: around(t('lists.tastes.avoid', { text: MARK })),
    prefers: around(t('lists.tastes.prefers', { name, choices: MARK })),
    choice: (question, answer) =>
      tk(`hints.giver.choices.${question}.${answer}`),
    sentence: (question, answer) =>
      tk(`hints.giver.${question}.${answer}`, { name }),
    and: t('lists.share.and'),
    // German nouns keep their capital.
    lowerFirst: locale.value !== 'de',
  });
});
const text = ref<HTMLElement | null>(null);
const unrolled = ref(false);
/** Longer than three lines: « Voir plus » shows. */
const longer = ref(false);
const measure = () => {
  const el = text.value;
  if (!el || unrolled.value) return;
  longer.value = el.scrollHeight > el.clientHeight + 1;
};
const observer = shallowRef<ResizeObserver | null>(null);
onMounted(() => {
  measure();
  observer.value = new ResizeObserver(measure);
  if (text.value) observer.value.observe(text.value);
});
onBeforeUnmount(() => observer.value?.disconnect());
watch(parts, () => nextTick(measure));
</script>

<template>
  <div
    v-if="parts.length > 0"
    class="mt-2 ml-[50px] flex flex-col items-start text-[15px] leading-[1.5] text-toned"
    data-testid="person-tastes"
  >
    <p
      ref="text"
      :class="unrolled ? '' : 'line-clamp-3'"
      data-testid="person-tastes-text"
    >
      <template v-for="(part, index) in parts" :key="index"
        ><strong v-if="part.strong" class="font-semibold text-highlighted">{{
          part.text
        }}</strong
        ><template v-else>{{ part.text }}</template></template
      >
    </p>
    <button
      v-if="longer || unrolled"
      type="button"
      class="-mt-1 -mb-1.5 flex min-h-11 items-center gap-1 text-[13px] font-bold text-toned"
      :aria-expanded="unrolled"
      data-testid="person-tastes-more"
      @click="unrolled = !unrolled"
    >
      {{ unrolled ? t('lists.tastes.less') : t('lists.tastes.more') }}
      <UIcon
        :name="unrolled ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
        class="size-3"
        aria-hidden="true"
      />
    </button>
  </div>
</template>
