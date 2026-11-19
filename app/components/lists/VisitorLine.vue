<script setup lang="ts">
import type { IdeaLine } from '#server/http/lists';

// One idea as those who open the link see it (README 22.19, maquettes
// ListeVisiteur, ListeVisiteurMes, ListePlusieursLigne). The box ticks at
// once: alone, under my first name. Mine, it says how I give it and
// « Changer »; touched again, it unticks. A gift given by several shows
// the icons and names of those in it, and « Se joindre » or « Tu
// participes ». Taken by someone else: crossed out, nothing more.
const props = defineProps<{ idea: IdeaLine }>();
const emit = defineEmits<{
  tick: [];
  untick: [];
  change: [];
  join: [];
}>();
const { t } = useT();
const view = computed(() => props.idea.view);
const crossed = computed(
  () =>
    view.value.kind === 'taken' ||
    (view.value.kind === 'group' && view.value.closed),
);
const mineChecked = computed(
  () =>
    view.value.kind === 'mine' ||
    (view.value.kind === 'group' && view.value.mine),
);
const openGroup = computed(
  () => view.value.kind === 'group' && !view.value.closed && !view.value.mine,
);
/** The names of a group: « Mamie, Tonton et toi », or « 7 personnes ». */
const groupNames = computed(() => {
  const v = view.value;
  if (v.kind !== 'group') return '';
  if (v.people.length === 1 && !v.mine) {
    return t('lists.visitor.groupOne', { name: v.people[0]!.name });
  }
  if (v.people.length > 3) {
    return t('lists.visitor.groupMany', { count: v.people.length });
  }
  const names = props.idea.notes.map((n) =>
    n.me ? t('lists.visitor.you') : n.name,
  );
  return names.length > 1
    ? `${names.slice(0, -1).join(', ')} ${t('lists.visitor.and')} ${names.at(-1)}`
    : (names[0] ?? '');
});
const onBox = () => {
  const v = view.value;
  if (!props.idea.tickable || crossed.value) return;
  if (v.kind === 'free') emit('tick');
  else if (v.kind === 'mine') emit('untick');
  else if (v.kind === 'group') onGroup();
};
/** A gift given by several: mine to change, or one to join. */
const onGroup = () => {
  if (view.value.kind === 'group' && view.value.mine) emit('change');
  else emit('join');
};
</script>

<template>
  <li class="flex items-start gap-3 py-2" data-testid="visitor-idea">
    <button
      type="button"
      role="checkbox"
      :aria-checked="mineChecked || crossed"
      :aria-label="
        mineChecked
          ? t('lists.visitor.untick', { idea: idea.text })
          : t('lists.visitor.tick', { idea: idea.text })
      "
      :disabled="!idea.tickable || crossed"
      class="-m-2.5 flex size-[42px] shrink-0 items-center justify-center"
      data-testid="idea-box"
      @click="onBox"
    >
      <span
        class="flex size-[22px] items-center justify-center rounded-sm"
        :class="
          mineChecked
            ? 'bg-success text-white'
            : openGroup
              ? 'bg-warning-fill text-highlighted'
              : crossed
                ? 'bg-line-strong text-highlighted'
                : 'border-[1.5px] border-accented bg-default'
        "
        aria-hidden="true"
      >
        <UIcon v-if="openGroup" name="i-lucide-plus" class="size-3.5" />
        <UIcon
          v-else-if="mineChecked || crossed"
          name="i-lucide-check"
          class="size-3.5"
        />
      </span>
    </button>
    <div class="flex min-w-0 grow flex-col gap-1">
      <p class="text-base leading-[1.45]">
        <span
          :class="[
            crossed ? 'text-toned line-through' : '',
            mineChecked ? 'font-semibold' : '',
          ]"
          >{{ idea.text
          }}<template v-if="idea.url && idea.text">&nbsp;:</template></span
        >
        <a
          v-if="idea.url"
          :href="idea.url"
          target="_blank"
          rel="noopener noreferrer"
          class="ml-1 text-primary-ink underline"
          >{{ t('lists.doc.linkWord') }}</a
        >
      </p>
      <p
        v-if="view.kind === 'mine'"
        class="text-[13px] text-toned"
        data-testid="idea-mine"
      >
        {{ t('lists.visitor.giving') }} ·
        {{
          view.anonymous
            ? t('lists.visitor.aloneAnonymous')
            : t('lists.visitor.alone')
        }}
        ·
        <button
          type="button"
          class="font-bold text-primary-ink underline"
          @click="emit('change')"
        >
          {{ t('lists.visitor.change') }}
        </button>
      </p>
      <div
        v-if="view.kind === 'group'"
        class="flex items-center gap-2"
        data-testid="idea-group"
      >
        <UiAvatarStack
          :avatars="view.people.map((p) => p.avatar)"
          :label="groupNames"
          :max="3"
        />
        <span class="grow text-[13px] leading-[1.35] text-toned">{{
          view.closed ? t('lists.doc.groupClosed') : groupNames
        }}</span>
        <button
          v-if="!view.closed"
          type="button"
          class="h-9 shrink-0 rounded-full px-3.5 text-sm font-bold ring-1"
          :class="
            view.mine
              ? 'bg-success-soft text-success-ink ring-success'
              : 'bg-warning-tint text-warning-ink ring-warning-ring'
          "
          @click="onGroup"
        >
          {{ view.mine ? t('lists.visitor.joined') : t('lists.visitor.join') }}
        </button>
      </div>
    </div>
  </li>
</template>
