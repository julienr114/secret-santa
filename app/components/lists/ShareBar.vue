<script setup lang="ts">
import type { ListDocument } from '#server/http/lists';
import {
  shareDepth,
  shareLevelOf,
  type ShareLevel,
} from '#shared/utils/navigation';
import type { ShareQuestion } from '~/components/lists/ShareConfirm.vue';

// The bar on top of a list (docs/spec/v3/listes.md, « La barre du haut
// d'une liste »): folded, one row, the stage of the sharing and a button
// (« Partager » on a draft, « Modifier » after, « Le lien » for who « aide
// à écrire »: ListeAidePartage); its name and its sentence on one line
// each, cut by « … » (ticket 141). The button unrolls
// it where it is, over the list, which does not move (ticket 138): the
// address with « Copier le lien », then « Qui verra ta liste ? » for who
// manages the list (V3ListeQui…, V3ListeAideLien). It stays stuck under
// the top bar, its content scrolls when taller than the screen;
// « Fermer », Échap or a touch outside folds it without changing
// anything.
// Unrolled, it has its own navigation (« On reste dans la barre », ticket
// 139): under its head, which stays, « Quelqu'un d'autre » and « Reprendre
// ceux d'un autre événement » are levels further (`?partage=inviter`,
// `reprendre`), which come in from the right in a quarter of a second, the
// height following; « ‹ » and the back of the phone go back one level.
// A question before a step is such a level too (`confirmer`, ticket 141):
// the back cancels it.
// Folded from anywhere, it opens again on the first level, what was
// written forgotten.
const props = defineProps<{
  doc: ListDocument;
  readonly?: boolean;
}>();
const { t } = useT();
const toast = useMessages();

const sharing = computed(() => props.doc.sharing);
const title = computed(() => {
  const { stage, events } = sharing.value;
  if (stage === 'draft') return t('lists.sharing.draft');
  if (stage === 'public') return t('lists.sharing.public');
  return events.join(', ');
});
const subtitle = computed(() => {
  const { stage, members } = sharing.value;
  if (stage === 'draft') return t('lists.sharing.draftHint');
  if (stage === 'public') return t('lists.sharing.publicHint');
  if (stage === 'giver') return t('lists.sharing.giverHint');
  return members > 0
    ? t('lists.sharing.members', { count: members })
    : t('lists.sharing.nobody');
});
const icon = computed(
  () =>
    ({
      draft: 'i-lucide-lock',
      giver: 'i-lucide-user-round',
      parties: 'i-lucide-users',
      public: 'i-lucide-globe',
    })[sharing.value.stage],
);

const url = computed(() =>
  props.doc.list.shareToken && import.meta.client
    ? `${window.location.origin}/l/${props.doc.list.shareToken}`
    : '',
);
const route = useRoute();
const router = useRouter();
/** The question asked, while its level shows. */
const question = ref<ShareQuestion | null>(null);
const asked = computed<ShareLevel>(() =>
  props.readonly ? '' : shareLevelOf(route.query.partage),
);
// A question known only to this page: an address that asks for it alone
// gives the first level.
const level = computed<ShareLevel>(() =>
  asked.value === 'confirmer' && !question.value ? '' : asked.value,
);
const open = ref(false);
/** The levels this bar pushed in the history: « ‹ » goes back by it. */
const pushed = ref(0);
/** What was touched at each level left, to give it the focus back. */
const touched = ref<string[]>([]);
/** Forward or back, for the way the levels slide. */
const forward = ref(true);
const contentId = useId();
const toggle = useTemplateRef<HTMLButtonElement>('toggle');
const content = useTemplateRef<HTMLElement>('content');
const card = useTemplateRef<HTMLElement>('card');
// Unrolled, the bar keeps the room of its folded row and floats over
// the rest: its height, read as it unrolls.
const folded = ref(0);
const label = computed(() => {
  if (open.value) return t('lists.sharing.close');
  if (props.readonly) return t('lists.sharing.theLink');
  return sharing.value.stage === 'draft'
    ? t('lists.sharing.share')
    : t('lists.sharing.edit');
});

/**
 * Unrolls or folds the bar: the focus goes into it, then back to its
 * button.
 * @param on - Unrolled.
 * @returns Once the focus has moved.
 */
const setOpen = async (on: boolean) => {
  if (on) folded.value = card.value?.offsetHeight ?? 0;
  open.value = on;
  if (!on) {
    toFirst();
    adding.value = null;
    draft.value = { firstName: '', email: '' };
  }
  await nextTick();
  (on
    ? content.value?.querySelector<HTMLElement>('button, a')
    : toggle.value
  )?.focus();
};

/**
 * The address of a level, the rest of the query kept.
 * @param to - The level.
 * @returns The route.
 */
const at = (to: ShareLevel) => {
  const { partage: _level, ...query } = route.query;
  return { query: to ? { ...query, partage: to } : query };
};
/**
 * One level further: what was touched is remembered for the way back.
 * @param to - The level.
 * @param from - The `data-share-focus` of what was touched.
 * @returns Once there.
 */
const goTo = async (to: ShareLevel, from: string) => {
  touched.value = [...touched.value, from];
  await router.push(at(to));
};
/** « ‹ »: one level back, by the history when this bar went forward. */
const goBack = async () => {
  if (pushed.value > 0) {
    router.back();
    return;
  }
  await router.replace(at(level.value === 'reprendre' ? 'inviter' : ''));
};
/** Back to the first level, from anywhere. */
function toFirst() {
  if (pushed.value > 0) router.go(-pushed.value);
  else if (level.value !== '') void router.replace(at(''));
}
// The level moves (« ‹ », the back of the phone, `toFirst`): the way it
// slides, and the focus, on the title of a level further or back on what
// was touched.
watch(level, async (now, before) => {
  const depth = shareDepth(now);
  const was = shareDepth(before);
  if (now !== 'confirmer') question.value = null;
  forward.value = depth > was;
  // Pushed here or by the forward of the browser, gone back by any way.
  pushed.value = Math.max(0, pushed.value + depth - was);
  const back = depth < was ? touched.value[depth] : undefined;
  touched.value = touched.value.slice(0, depth);
  if (!open.value) return;
  await nextTick();
  (back
    ? content.value?.querySelector<HTMLElement>(`[data-share-focus="${back}"]`)
    : content.value?.querySelector<HTMLElement>('[data-share-title]')
  )?.focus();
});
/** « Ajouter » unrolled, kept while the bar is. */
const adding = ref<boolean | null>(null);
/** What « Quelqu'un d'autre » holds, kept while the bar is unrolled. */
const draft = ref({ firstName: '', email: '' });
/**
 * A question before a step, one level further.
 * @param asking - The question.
 * @param from - The `data-share-focus` of what was touched.
 * @returns Once there.
 */
const onAsk = (asking: ShareQuestion, from: string) => {
  question.value = asking;
  return goTo('confirmer', from);
};
/** Sent: back to the first level, « Ajouter » folded. */
const onSent = () => {
  adding.value = false;
  touched.value = [];
  toFirst();
};

// The height follows the level that comes in, in the same quarter of a
// second; the level that goes lies over it meanwhile.
const stage = useTemplateRef<HTMLElement>('stage');
const height = ref<number | null>(null);
const onBeforeLeave = (el: Element) => {
  height.value = (el as HTMLElement).offsetHeight;
};
const onEnter = (el: Element) => {
  requestAnimationFrame(() => {
    height.value = (el as HTMLElement).offsetHeight;
  });
};
const onAfterEnter = () => {
  height.value = null;
};
const slide = computed(() =>
  forward.value
    ? { from: 'translate-x-full', to: '-translate-x-full' }
    : { from: '-translate-x-full', to: 'translate-x-full' },
);

/**
 * A touch outside the unrolled bar folds it, and does only that: what
 * was under the finger is neither focused nor pressed.
 * @param event - The touch, caught before the page sees it.
 */
const onOutside = (event: PointerEvent) => {
  if (!(event.target instanceof Node) || card.value?.contains(event.target)) {
    return;
  }
  event.preventDefault();
  event.stopPropagation();
  const swallow = (click: MouseEvent) => {
    click.preventDefault();
    click.stopPropagation();
  };
  document.addEventListener('click', swallow, { capture: true, once: true });
  // A touch that scrolled instead never clicks: the next touch is free.
  document.addEventListener(
    'pointerdown',
    () => document.removeEventListener('click', swallow, { capture: true }),
    { capture: true, once: true },
  );
  void setOpen(false);
};
watch(open, (on) => {
  if (on) document.addEventListener('pointerdown', onOutside, true);
  else document.removeEventListener('pointerdown', onOutside, true);
});
onBeforeUnmount(() =>
  document.removeEventListener('pointerdown', onOutside, true),
);

// Asked by an address (« À ma liste » in « Membres »): unrolled at once.
onMounted(() => {
  if (level.value !== '') void setOpen(true);
});

// « Copier le lien » answers where it was touched: « Copié », for a moment.
const copied = ref(false);
const onCopy = async () => {
  if (!(await copyText(url.value))) {
    toast.failed(t('lists.share.copyFailed'));
    return;
  }
  copied.value = true;
  window.setTimeout(() => {
    copied.value = false;
  }, 2000);
};
</script>

<template>
  <div
    class="sticky top-[calc(3.5rem+env(safe-area-inset-top)+0.5rem)] z-20 -mt-1"
    :style="open ? { height: `${folded}px` } : undefined"
    data-testid="share-bar"
    @keydown.esc="open && setOpen(false)"
  >
    <div
      ref="card"
      class="flex max-h-[calc(100dvh-3.5rem-env(safe-area-inset-top)-1rem-var(--tab-bar)-env(safe-area-inset-bottom))] flex-col overflow-hidden rounded-[24px] bg-default ring-1 ring-default"
      :class="open ? 'absolute inset-x-0 top-0 shadow-raised' : 'shadow-card'"
      data-testid="share-card"
    >
      <div
        class="flex min-h-13 shrink-0 items-center gap-2.5 pr-2 pl-3.5"
        :class="{ '-mb-1.5': open }"
      >
        <UIcon :name="icon" class="size-5 shrink-0 text-success" />
        <span class="flex min-w-0 grow flex-col" data-testid="share-stage">
          <span class="truncate text-sm font-bold">{{ title }}</span>
          <span class="truncate text-[13px] leading-[1.3] text-toned">{{
            subtitle
          }}</span>
        </span>
        <button
          ref="toggle"
          type="button"
          class="relative flex h-9 shrink-0 items-center rounded-full bg-default px-3 text-sm font-bold ring-1 ring-default after:absolute after:inset-x-0 after:-inset-y-1"
          :aria-expanded="open"
          :aria-controls="contentId"
          data-testid="share-open"
          @click="setOpen(!open)"
        >
          {{ label }}
        </button>
      </div>
      <div
        v-if="open"
        :id="contentId"
        ref="content"
        class="flex min-h-0 flex-col overflow-x-hidden overflow-y-auto overscroll-contain pt-2.5 pb-2"
        data-testid="share-content"
      >
        <div
          ref="stage"
          class="relative shrink-0 transition-[height] duration-250 ease-out motion-reduce:transition-none"
          :style="height === null ? undefined : { height: `${height}px` }"
        >
          <Transition
            :enter-from-class="slide.from"
            enter-active-class="transition-transform duration-250 ease-out motion-reduce:transition-none"
            :leave-to-class="slide.to"
            leave-active-class="absolute inset-x-0 top-0 transition-transform duration-250 ease-out motion-reduce:transition-none"
            @before-leave="onBeforeLeave"
            @enter="onEnter"
            @after-enter="onAfterEnter"
          >
            <ListsShareInvite
              v-if="level === 'inviter'"
              v-model="draft"
              :list-id="doc.list.id"
              @back="goBack"
              @sent="onSent"
              @take="goTo('reprendre', 'take')"
            />
            <ListsShareTake
              v-else-if="level === 'reprendre'"
              :list-id="doc.list.id"
              @back="goBack"
              @sent="onSent"
            />
            <ListsShareConfirm
              v-else-if="level === 'confirmer' && question"
              :list-id="doc.list.id"
              :question="question"
              @back="goBack"
              @done="toFirst"
            />
            <div v-else class="flex flex-col gap-2">
              <!-- The corners nest: the button's radius is the field's less
                   the space between them. -->
              <div
                class="mx-2 flex shrink-0 items-center gap-2 rounded-[16px] bg-muted py-1 pr-1 pl-3"
              >
                <span
                  class="min-w-0 grow truncate text-sm font-semibold"
                  data-testid="share-link"
                  >{{ url.replace(/^https?:\/\//, '') }}</span
                >
                <button
                  type="button"
                  class="relative flex h-9 shrink-0 items-center gap-1.5 rounded-[12px] bg-default px-3 text-sm font-bold ring-1 ring-default after:absolute after:inset-x-0 after:-inset-y-1"
                  data-testid="copy-link"
                  @click="onCopy"
                >
                  <span aria-live="polite">{{
                    copied
                      ? t('lists.share.copied')
                      : t('lists.sharing.copyLink')
                  }}</span>
                </button>
              </div>
              <ListsSharingPanel
                v-if="!readonly"
                v-model:adding="adding"
                :list-id="doc.list.id"
                @someone-else="goTo('inviter', 'someone-else')"
                @ask="onAsk"
              />
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>
