<script setup lang="ts">
import type { ListDocument } from '#server/http/lists';

// The bar on top of a list (docs/spec/v3/listes.md, « La barre du haut
// d'une liste », V3ListeNouvelle, V3Liste, V3ListePublique): it says the
// stage of the sharing, and it always has the link. Two rows: the stage
// with its button (« Partager » on a draft, « Modifier » after), then the
// address with « Copier le lien ». Who « aide à écrire » has no button,
// and reads who chose (ListeAidePartage). The bar stays stuck under the
// top bar while the list scrolls.
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
const editing = ref(false);

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
    class="sticky top-[calc(3.5rem+env(safe-area-inset-top)+0.5rem)] z-10 -mt-1 flex flex-col gap-1.5 rounded-[24px] bg-default pt-1.5 pr-2 pb-2 pl-3.5 shadow-card ring-1 ring-default"
    data-testid="share-bar"
  >
    <div class="flex min-h-11 items-center gap-2.5">
      <UIcon
        :name="icon"
        class="size-5 shrink-0"
        :class="sharing.stage === 'draft' ? 'text-toned' : 'text-success'"
      />
      <span class="flex min-w-0 grow flex-col" data-testid="share-stage">
        <span class="truncate text-sm font-bold">{{ title }}</span>
        <span class="text-[13px] leading-[1.3] text-toned">{{ subtitle }}</span>
      </span>
      <button
        v-if="!readonly"
        type="button"
        class="flex h-9 shrink-0 items-center rounded-full bg-default px-3 text-sm font-bold ring-1 ring-default"
        data-testid="share-open"
        @click="editing = true"
      >
        {{
          sharing.stage === 'draft'
            ? t('lists.sharing.share')
            : t('lists.sharing.edit')
        }}
      </button>
    </div>
    <div
      class="flex items-center gap-2.5 rounded-[18px] bg-muted py-1.5 pr-1.5 pl-3"
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
    <ListsSharingSheet
      v-if="!readonly"
      v-model:open="editing"
      :list-id="doc.list.id"
      :draft="sharing.stage === 'draft'"
      :url="url"
    />
  </div>
</template>
