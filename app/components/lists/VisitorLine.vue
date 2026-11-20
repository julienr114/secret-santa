<script setup lang="ts">
import type { IdeaLine } from '#server/http/lists';
import { ideaChips, namesInOne } from '~/utils/givers';

// One idea as those who open the link see it (README 22.19, Correction
// 29, maquettes ListeVisiteur, ListeVisiteurMes, ListeVisiteurAnonyme,
// ListeVisiteurToucher, ListePlusieursLigne). The box of a free idea
// ticks at once, following my « mode anonyme ». Under the text, the link
// on a line of its own, then one row of pills and nothing else: no
// sentence, no underlined link. The others of a gift given by several by
// first name (« 7 personnes » beyond three), « Au complet », my own state
// in one pill, « Se joindre » last. No « Changer »: the whole line of an
// idea I give is the button that opens its sheet (alone or with others,
// say it is me, « Finalement, je ne l'offre plus »); its green box, above
// that button, unticks at once, without the sheet (asked by Julien on 20
// November 2026). Taken by someone else: crossed out, nothing more.
const props = defineProps<{ idea: IdeaLine }>();
const emit = defineEmits<{
  tick: [];
  untick: [];
  change: [];
  join: [];
}>();
const { t } = useT();
const view = computed(() => props.idea.view);
const chips = computed(() => ideaChips(view.value));
const crossed = computed(
  () =>
    view.value.kind === 'taken' ||
    (view.value.kind === 'group' && view.value.closed && !view.value.mine),
);
const openGroup = computed(() => chips.value.join);
const host = computed(() => (props.idea.url ? linkHost(props.idea.url) : ''));
const names = computed(() =>
  namesInOne(
    chips.value.givers.map((pill) => pill.name ?? ''),
    t('lists.share.and'),
  ),
);
/** « Se joindre à Mamie et Tonton pour Vélo 16 pouces ». */
const joinLabel = computed(() =>
  names.value
    ? t('lists.chips.joinWith', { names: names.value, idea: props.idea.text })
    : t('lists.chips.joinIdea', { idea: props.idea.text }),
);
/** « Circuit de billes, tu l'offres en anonyme : modifier ou ne plus l'offrir ». */
const mineLabel = computed(() => {
  const idea = props.idea.text;
  if (chips.value.mine === 'anonymous') {
    return t('lists.chips.mineAnonymousLabel', { idea });
  }
  return chips.value.mine === 'group'
    ? t('lists.chips.mineGroupLabel', { idea })
    : t('lists.chips.mineLabel', { idea });
});
const onBox = () => {
  if (view.value.kind === 'free') emit('tick');
  else if (openGroup.value) emit('join');
};
// After the first tick on this device (Correction 30, maquette
// ListeCocheGuide): the line stays in the light over the veil, its note
// pointed at « Tu l'offres › ».
const guide = useTickGuide();
const guided = computed(
  () => guide.pointed.value === props.idea.id && chips.value.mine !== null,
);
onBeforeUnmount(() => {
  if (guided.value) guide.understood();
});
</script>

<template>
  <li
    class="relative flex items-start gap-[var(--line-gap,12px)] py-[13px]"
    :class="[
      chips.mine
        ? '-mx-2.5 rounded-2xl px-2.5 has-[[data-line-button]:active]:bg-muted'
        : '',
      guided ? 'z-50 bg-page' : '',
    ]"
    data-testid="visitor-idea"
  >
    <!-- An idea I give: the whole line is the button of its sheet. Its
         link, above it, stays a link. -->
    <button
      v-if="chips.mine"
      type="button"
      class="absolute inset-0 rounded-2xl"
      :aria-label="mineLabel"
      data-line-button
      data-testid="idea-open"
      @click="emit('change')"
    />
    <button
      v-if="chips.mine"
      type="button"
      role="checkbox"
      aria-checked="true"
      :aria-label="t('lists.visitor.untick', { idea: idea.text })"
      class="relative z-10 -m-2.5 flex size-[42px] shrink-0 items-center justify-center"
      data-testid="idea-box"
      @click="emit('untick')"
    >
      <span
        class="flex size-[22px] items-center justify-center rounded-sm bg-success text-white"
        aria-hidden="true"
      >
        <UIcon name="i-lucide-check" class="size-3.5" />
      </span>
    </button>
    <button
      v-else
      type="button"
      role="checkbox"
      :aria-checked="crossed"
      :aria-label="
        openGroup ? joinLabel : t('lists.visitor.tick', { idea: idea.text })
      "
      :disabled="crossed"
      class="-m-2.5 flex size-[42px] shrink-0 items-center justify-center"
      data-testid="idea-box"
      @click="onBox"
    >
      <span
        class="flex size-[22px] items-center justify-center rounded-sm"
        :class="
          openGroup
            ? 'bg-warning-fill text-highlighted'
            : crossed
              ? 'bg-line-strong text-highlighted'
              : 'border-[1.5px] border-accented bg-default'
        "
        aria-hidden="true"
      >
        <UIcon v-if="openGroup" name="i-lucide-plus" class="size-3.5" />
        <UIcon v-else-if="crossed" name="i-lucide-check" class="size-3.5" />
      </span>
    </button>
    <div class="pointer-events-none flex min-w-0 grow flex-col">
      <p
        class="text-base/[22px]"
        :class="[
          crossed ? 'text-toned line-through' : '',
          chips.mine ? 'font-semibold' : '',
        ]"
      >
        {{ idea.text }}
      </p>
      <ListsIdeaLink
        v-if="idea.url && host"
        :url="idea.url"
        :host="host"
        class="pointer-events-auto"
      />
      <div
        v-if="
          chips.givers.length > 0 ||
          chips.crowd ||
          chips.closed ||
          chips.mine ||
          chips.join
        "
        class="mt-1.5 flex flex-wrap items-center gap-1.5"
        data-testid="idea-group"
      >
        <UiChip
          v-for="(pill, index) in chips.givers"
          :key="index"
          data-testid="idea-who"
          >{{ pill.name }}</UiChip
        >
        <UiChip v-if="chips.crowd" icon="i-lucide-users">{{
          t('lists.visitor.groupMany', { count: chips.crowd })
        }}</UiChip>
        <UiChip
          v-if="chips.closed"
          icon="i-lucide-users"
          data-testid="idea-closed"
          >{{ t('lists.chips.closed') }}</UiChip
        >
        <ListsMineChip
          v-if="chips.mine"
          :state="chips.mine"
          :data-testid="chips.mine === 'group' ? 'idea-joined' : 'idea-mine'"
        />
        <UiChip
          v-if="chips.join"
          button
          kind="action"
          icon="i-lucide-plus"
          class="pointer-events-auto"
          :aria-label="joinLabel"
          data-testid="idea-join"
          @click="emit('join')"
          >{{ t('lists.visitor.join') }}</UiChip
        >
      </div>
    </div>
    <div
      v-if="guided"
      class="absolute inset-x-0 top-[calc(100%-6px)] z-10 pl-8"
      data-testid="tick-notice"
    >
      <ListsVeilNote
        tone="plum"
        tip="left"
        name="tick"
        :title="t('lists.guide.title')"
        :body="
          chips.mine === 'anonymous'
            ? t('lists.guide.bodyAnonymous')
            : t('lists.guide.body')
        "
        @understood="guide.understood()"
      />
    </div>
  </li>
</template>
