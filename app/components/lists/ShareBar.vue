<script setup lang="ts">
import type { ListDocument } from '#server/http/lists';
import { shareMissing, type ShareAsk } from '#server/utils/lists';
import { useShareListMutation } from '~/composables/queries/useLists';

// « Partage par lien », the bar on top of the document of a list (README
// 22.19, maquettes ListeEtatBrouillon, ListeEtatPubliee): one row, an
// icon, a title that names neither an action nor a state, and the switch,
// which says whether the list has its link. Not shared: a padlock, nothing
// to unfold; the switch is off. Turned on while the list has no name or
// nobody on it, it stays off and the bar says what is missing, as an
// error, until it is there. Shared: the bar stays white, only the switch
// and the globe are green; the title unfolds, in place, the link and
// « Copier », « Partager » (the phone's share sheet, with a ready-made
// message, shown only where there is one; no « Par email », asked by
// Julien on 19 November 2026: the share sheet has the mail app too), « Personnaliser le message » and
// « Changer de lien ». Nothing full nor
// red. Turned off, sharing stops at once, with « Annuler » in the toast;
// turned on again, the link is the same. The bar stays stuck under the
// top bar while the list scrolls.
// Someone who « aide à écrire » (lot 25 bis; Correction 28, maquettes
// ListeAidePartage, ListeAideSansPartage) cannot turn the sharing on, but
// may send the link once it is: the globe, « Activé par Camille » and a
// button « Partager » (the phone's share sheet, else the link copied);
// or the padlock and « Pas encore activé par Camille », nothing to touch.
// No switch, no « Changer de lien », no « Personnaliser le message ».
// The name being typed counts at once (`title`): it is saved as it is
// typed, and the list read again a moment later.
const props = defineProps<{
  doc: ListDocument;
  readonly?: boolean;
  title?: string;
  /** Who manages the list, for who only helps to write. */
  managerName?: string;
}>();
const { t, tk } = useT();
const toast = useMessages();
const errorMessage = useErrorMessage();
const id = computed(() => props.doc.list.id);
const share = useShareListMutation(id);

const stored = computed(() => props.doc.list.status !== 'draft');
/** What the switch was just asked, until the list says so itself. */
const asked = ref<boolean | null>(null);
const shared = computed(() => asked.value ?? stored.value);
const missing = computed(() =>
  shareMissing({
    title: props.title ?? props.doc.list.title,
    peopleCount: props.doc.people.length,
  }),
);
const blocked = computed(() => !shared.value && missing.value.length > 0);
/** The switch was touched while something was missing. */
const tried = ref(false);

const open = ref(false);
// The bar stays under the top bar while the list scrolls (lot 24 bis);
// unfolded, it folds back as soon as one scrolls, so as not to hide the
// list.
// Unfolding moves the page by itself (the browser keeps what one was
// reading in place): only what scrolls after that counts.
const openedAt = ref<number | null>(null);
watch(open, (now) => {
  openedAt.value = null;
  if (!now) return;
  window.setTimeout(() => {
    if (open.value) openedAt.value = window.scrollY;
  }, 300);
});
const onScroll = () => {
  if (
    open.value &&
    openedAt.value !== null &&
    Math.abs(window.scrollY - openedAt.value) > 24
  ) {
    open.value = false;
    confirming.value = false;
  }
};
onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }));
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll));
const confirming = ref(false);
const url = computed(() =>
  stored.value && props.doc.list.shareToken && import.meta.client
    ? `${window.location.origin}/l/${props.doc.list.shareToken}`
    : '',
);
const { whole } = useListMessage(id, () => props.doc, url);
const send = (ask: ShareAsk, then: () => void) =>
  share.mutate(
    { ask },
    {
      onSuccess: then,
      onError: (error) => toast.failed(errorMessage(error)),
      onSettled: () => {
        asked.value = null;
      },
    },
  );
const turnOn = () => {
  asked.value = true;
  send('on', () => {
    open.value = true;
  });
};
const turnOff = () => {
  asked.value = false;
  open.value = false;
  confirming.value = false;
  send('off', () => toast.undo(t('lists.share.stopped'), turnOn));
};
const onSwitch = (on: boolean) => {
  if (on && blocked.value) {
    tried.value = true;
    return;
  }
  tried.value = false;
  return on ? turnOn() : turnOff();
};
const onRenew = () =>
  send('renew', () => {
    confirming.value = false;
    toast.done(t('lists.share.changed'));
  });

// « Copier » answers where it was touched: « Copié », for a moment.
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
// « Partager » only where the device has a share sheet: elsewhere (a
// computer), « Copier » is enough. The sheet must open right on the tap,
// before any wait (Safari).
const canShare = ref(false);
onMounted(() => {
  canShare.value = typeof navigator.share === 'function';
});
const onSend = () => navigator.share({ text: whole.value }).catch(() => null);
/** « Partager », for who helps to write: the share sheet, or the link. */
const onHelperShare = () => (canShare.value ? onSend() : onCopy());
</script>

<template>
  <div
    class="sticky top-[calc(3.5rem+env(safe-area-inset-top)+0.5rem)] z-10 -mt-1 rounded-[24px] bg-default shadow-card ring-1 ring-default"
    data-testid="share-bar"
  >
    <div
      v-if="readonly"
      class="flex min-h-12 items-center gap-2 pr-2 pl-3.5"
      data-testid="share-readonly"
    >
      <UIcon
        :name="shared ? 'i-lucide-globe' : 'i-lucide-lock'"
        class="size-5 shrink-0"
        :class="shared ? 'text-success' : 'text-toned'"
      />
      <span class="flex min-h-11 min-w-0 grow flex-col justify-center">
        <span class="text-sm font-bold">{{ t('lists.share.title') }}</span>
        <span class="text-[13px] leading-[1.3] text-toned">{{
          shared
            ? t('lists.share.onBy', { name: managerName ?? '' })
            : t('lists.share.offBy', { name: managerName ?? '' })
        }}</span>
      </span>
      <button
        v-if="shared && url"
        type="button"
        class="flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-default px-3.5 text-sm font-bold ring-1 ring-default"
        data-testid="share-helper"
        @click="onHelperShare"
      >
        <UIcon
          :name="copied ? 'i-lucide-check' : 'i-lucide-send'"
          class="size-[18px]"
        />
        <span aria-live="polite">{{
          copied ? t('lists.share.copied') : t('lists.share.send')
        }}</span>
      </button>
    </div>
    <div v-else class="flex min-h-12 items-center gap-2 pr-2 pl-3.5">
      <UIcon
        :name="shared ? 'i-lucide-globe' : 'i-lucide-lock'"
        class="size-5 shrink-0"
        :class="shared ? 'text-success' : 'text-toned'"
      />
      <button
        v-if="shared"
        type="button"
        class="flex min-h-11 min-w-0 grow items-center gap-1 text-left text-sm font-bold"
        :aria-expanded="open"
        aria-controls="share-panel"
        data-testid="share-title"
        @click="open = !open"
      >
        {{ t('lists.share.title') }}
        <UIcon
          :name="open ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
          class="size-5 text-toned"
        />
      </button>
      <span v-else class="min-w-0 grow text-sm font-bold">{{
        t('lists.share.title')
      }}</span>
      <USwitch
        :model-value="shared"
        color="success"
        size="lg"
        :disabled="share.isPending.value"
        :aria-label="t('lists.share.title')"
        data-testid="share-switch"
        @update:model-value="onSwitch"
      />
    </div>
    <p
      v-if="!readonly && blocked && tried"
      class="px-3.5 pb-3 text-[13px] leading-[1.45] font-medium text-error"
      role="alert"
      data-testid="share-missing"
    >
      {{ missing.map((what) => tk(`lists.share.missing.${what}`)).join(' ') }}
    </p>
    <div
      v-if="shared && open && url && !readonly"
      id="share-panel"
      class="flex flex-col gap-2.5 px-3.5 pb-3.5"
      data-testid="share-panel"
    >
      <div
        class="flex items-center gap-2.5 rounded-[18px] bg-muted py-2 pr-2 pl-3"
      >
        <span
          class="min-w-0 grow overflow-x-auto text-[15px] font-semibold whitespace-nowrap select-all [scrollbar-width:none]"
          data-testid="share-link"
          >{{ url.replace(/^https?:\/\//, '') }}</span
        >
        <button
          type="button"
          class="flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-default px-3 text-sm font-bold ring-1 ring-default"
          data-testid="copy-link"
          @click="onCopy"
        >
          <UIcon
            :name="copied ? 'i-lucide-check' : 'i-lucide-copy'"
            class="size-[18px]"
          />
          <span aria-live="polite">{{
            copied ? t('lists.share.copied') : t('lists.share.copy')
          }}</span>
        </button>
      </div>
      <UButton
        v-if="canShare"
        block
        variant="outline"
        color="neutral"
        icon="i-lucide-send"
        class="h-12 justify-center text-base font-bold"
        :label="t('lists.share.send')"
        data-testid="share-send"
        @click="onSend"
      />
      <p class="text-[13px] leading-[1.45] text-toned">
        {{ t('lists.share.help') }}
      </p>
      <div
        v-if="confirming"
        class="flex flex-wrap items-center gap-x-4 text-sm"
        data-testid="share-renew"
      >
        <p class="grow">{{ t('lists.share.changeConfirm') }}</p>
        <button
          type="button"
          class="flex min-h-11 items-center font-bold underline underline-offset-2"
          :disabled="share.isPending.value"
          @click="onRenew"
        >
          {{ t('lists.share.change') }}
        </button>
        <button
          type="button"
          class="flex min-h-11 items-center font-bold text-toned underline underline-offset-2"
          @click="confirming = false"
        >
          {{ t('common.actions.cancel') }}
        </button>
      </div>
      <p v-else class="flex flex-wrap gap-x-4 text-sm font-bold text-toned">
        <NuxtLink
          :to="`/listes/${id}/message`"
          class="flex min-h-11 items-center underline underline-offset-2"
          >{{ t('lists.share.personalize') }}</NuxtLink
        >
        <button
          type="button"
          class="flex min-h-11 items-center underline underline-offset-2"
          @click="confirming = true"
        >
          {{ t('lists.share.changeLink') }}
        </button>
      </p>
    </div>
  </div>
</template>
