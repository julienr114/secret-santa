<script setup lang="ts">
import type { ListDocument } from '#server/http/lists';

// The bar on top of a list (docs/spec/v3/listes.md, « La barre du haut
// d'une liste »): folded, one row, the stage of the sharing and a button
// (« Partager » on a draft, « Modifier » after, « Le lien » for who « aide
// à écrire », who reads who chose: ListeAidePartage). The button unrolls
// it where it is, over the list, which does not move (ticket 138): the
// address with « Copier le lien », then « Qui verra ta liste ? » for who
// manages the list (V3ListeQui…, V3ListeAideLien). It stays stuck under
// the top bar, its content scrolls when taller than the screen;
// « Fermer », Échap or a touch outside folds it without changing
// anything.
const props = defineProps<{
  doc: ListDocument;
  readonly?: boolean;
  /** Who manages the list, for who only helps to write. */
  managerName?: string;
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
  const said =
    stage === 'draft'
      ? t('lists.sharing.draftHint')
      : stage === 'public'
        ? t('lists.sharing.publicHint')
        : stage === 'giver'
          ? t('lists.sharing.giverHint')
          : members > 0
            ? t('lists.sharing.members', { count: members })
            : t('lists.sharing.nobody');
  return props.readonly && props.managerName
    ? `${said} · ${t('lists.sharing.chosenBy', { name: props.managerName })}`
    : said;
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
const open = ref(false);
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
  await nextTick();
  (on
    ? content.value?.querySelector<HTMLElement>('button, a')
    : toggle.value
  )?.focus();
};

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
          <span class="text-[13px] leading-[1.3] text-toned">{{
            subtitle
          }}</span>
        </span>
        <button
          ref="toggle"
          type="button"
          class="flex h-9 shrink-0 items-center rounded-full bg-default px-3 text-sm font-bold ring-1 ring-default"
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
        class="flex min-h-0 flex-col gap-2.5 overflow-y-auto overscroll-contain pt-2.5 pb-2"
        data-testid="share-content"
      >
        <div
          class="mx-2 flex shrink-0 items-center gap-2.5 rounded-[18px] bg-muted py-1.5 pr-1.5 pl-3"
        >
          <span
            class="min-w-0 grow truncate text-sm font-semibold"
            data-testid="share-link"
            >{{ url.replace(/^https?:\/\//, '') }}</span
          >
          <button
            type="button"
            class="flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-default px-3 text-sm font-bold ring-1 ring-default"
            data-testid="copy-link"
            @click="onCopy"
          >
            <span aria-live="polite">{{
              copied ? t('lists.share.copied') : t('lists.sharing.copyLink')
            }}</span>
          </button>
        </div>
        <ListsSharingPanel
          v-if="!readonly"
          :list-id="doc.list.id"
          :draft="sharing.stage === 'draft'"
          @done="setOpen(false)"
        />
      </div>
    </div>
  </div>
</template>
