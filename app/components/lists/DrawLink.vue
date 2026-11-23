<script setup lang="ts">
import type { LinkChoice, SantaLine } from '#server/database/drawLists';
import {
  useLinkDrawMutation,
  useUnlinkDrawMutation,
} from '~/composables/queries/useLists';

// My part of a list and my Secret Santa (docs/spec/v3/listes.md, « Depuis
// mon Secret Santa », « Lier et délier », tickets 147 and 148): under my
// name, a discreet pill per Secret Santa the list is linked to; touched,
// a sheet says what the link means, « Voir mon Secret Santa » and
// « Délier » (V3ListeSecretLie). When one of my Secret Santa of the year
// has no list, « Lier à mon Secret Santa » asks first
// (V3ListeSecretLier, V3ListeSecretLierConfirmer). Never who drew me.
const props = defineProps<{
  listId: string;
  santas: SantaLine[];
  linkable: LinkChoice[];
  /** Whether I manage the list: link and unlink are mine then. */
  manages: boolean;
}>();
const { t } = useT();
const toast = useMessages();
const errorMessage = useErrorMessage();
const link = useLinkDrawMutation(() => props.listId);
const unlink = useUnlinkDrawMutation(() => props.listId);

/** The pill touched, its sheet open. */
const shown = ref<SantaLine | null>(null);
const shownOpen = computed({
  get: () => shown.value !== null,
  set: (open: boolean) => {
    if (!open) shown.value = null;
  },
});
const onUnlink = () => {
  const santa = shown.value;
  if (!santa) return;
  unlink.mutate(santa.partyId, {
    onSuccess: () => {
      shown.value = null;
      toast.done(t('lists.link.unlinked'));
    },
    onError: (error) => toast.failed(errorMessage(error)),
  });
};

/** « Lier » shows while one of my Secret Santa has no list. */
const canLink = computed(
  () => props.manages && props.linkable.some((one) => one.linkedTo === null),
);
const asking = ref(false);
const chosen = ref('');
watch(asking, (open) => {
  if (open) {
    chosen.value =
      props.linkable.find((one) => one.linkedTo === null)?.partyId ??
      props.linkable[0]?.partyId ??
      '';
  }
});
const choice = computed(() =>
  props.linkable.find((one) => one.partyId === chosen.value),
);
const choices = computed(() =>
  props.linkable.map((one) => ({ value: one.partyId, label: one.name })),
);
/** « Il ne sera plus lié à « Noël 2026 ». », when it moves. */
const moves = computed(() =>
  choice.value?.linkedTo === null || !choice.value
    ? ''
    : t('lists.link.moves', {
        title: choice.value.linkedTo || t('lists.home.untitled'),
      }),
);
const onLink = () => {
  if (!choice.value) return;
  link.mutate(choice.value.partyId, {
    onSuccess: () => {
      asking.value = false;
    },
    onError: (error) => toast.failed(errorMessage(error)),
  });
};
</script>

<template>
  <button
    v-for="santa in santas"
    :key="santa.partyId"
    type="button"
    class="relative inline-flex h-5 max-w-full items-center gap-1 self-start rounded-full bg-peach-100 pr-2 pl-1.5 text-[11.5px] font-bold text-toned before:absolute before:-inset-y-3 before:inset-x-0"
    data-testid="person-santa"
    data-no-drag
    @click="shown = santa"
  >
    <span v-if="santa.emoji" class="shrink-0 text-[11px]" aria-hidden="true">{{
      santa.emoji
    }}</span>
    <span class="min-w-0 truncate">{{
      t('lists.doc.santa', { name: santa.name })
    }}</span>
  </button>
  <button
    v-if="canLink"
    type="button"
    class="relative inline-flex min-h-5 items-center gap-1.25 self-start text-[13px] leading-[1.4] text-dimmed italic before:absolute before:-inset-y-3 before:inset-x-0"
    data-testid="person-link"
    data-no-drag
    @click="asking = true"
  >
    <UIcon name="i-lucide-link" class="size-3 shrink-0" aria-hidden="true" />
    {{ t('lists.link.action') }}
  </button>

  <UiSheet
    v-model:open="shownOpen"
    :title="shown ? t('lists.doc.santa', { name: shown.name }) : ''"
    :busy="unlink.isPending.value"
  >
    <template #header>
      <div v-if="shown" class="flex items-center gap-3">
        <UiEventTile
          :emoji="shown.emoji ?? ''"
          :category="shown.category"
          :size="36"
        />
        <h2 class="font-display text-[22px] leading-[1.2] font-bold">
          {{ t('lists.doc.santa', { name: shown.name }) }}
        </h2>
      </div>
    </template>
    <div
      v-if="shown"
      class="-mx-4 flex flex-col gap-3"
      data-testid="link-sheet"
    >
      <p class="px-5 text-[15px] leading-[1.45] text-toned">
        {{ t('lists.link.what') }}
      </p>
      <ul class="divide-y divide-divider border-y border-divider">
        <UiListItem
          :to="shown.path"
          :title="t('lists.link.see')"
          data-testid="link-see"
        />
        <UiListItem
          v-if="manages"
          :title="t('lists.link.unlink')"
          :chevron="false"
          :busy="unlink.isPending.value"
          :on-click="onUnlink"
          data-testid="link-unlink"
        />
      </ul>
    </div>
  </UiSheet>

  <UiSheet
    v-model:open="asking"
    :title="t('lists.link.askTitle')"
    :busy="link.isPending.value"
  >
    <div class="flex flex-col gap-3" data-testid="link-ask">
      <p class="text-[15px] leading-[1.45] text-toned">
        {{ t('lists.link.ask', { name: choice?.name ?? '' }) }}
        {{ moves }}
      </p>
      <UiChoiceList
        v-if="linkable.length > 1"
        v-model="chosen"
        :choices="choices"
        :label="t('lists.link.askTitle')"
      />
      <UButton
        block
        class="h-12 justify-center rounded-2xl text-base font-bold"
        :loading="link.isPending.value"
        :label="t('lists.link.submit')"
        data-testid="link-submit"
        @click="onLink"
      />
    </div>
  </UiSheet>
</template>
