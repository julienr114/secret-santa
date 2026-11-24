<script setup lang="ts">
import type { LinkChoice, SantaLine } from '#server/database/drawLists';
import {
  useLinkDrawMutation,
  useUnlinkDrawMutation,
} from '~/composables/queries/useLists';

// My part of a list and my Secret Santa (docs/spec/v3/listes.md, « Lier
// et délier », tickets 147, 148, 153 and 155): under my name, a discreet
// pill per Secret Santa the list is linked to. The pill, and « Lier à un
// Secret Santa » in the menu of my part, open one sheet: my Secret Santa
// of the year, those linked to this list ticked, the others not, each
// with its event's tile (V3ListeSecretLie, V3ListeSecretLierConfirmer).
// Ticking links, unticking unlinks, at once; the sheet stays open. Never
// who drew me.
const props = defineProps<{
  listId: string;
  santas: SantaLine[];
  linkable: LinkChoice[];
  /** Whether I manage the list: only then does the sheet open. */
  manages: boolean;
}>();
const { t } = useT();
const toast = useMessages();
const errorMessage = useErrorMessage();
const link = useLinkDrawMutation(() => props.listId);
const unlink = useUnlinkDrawMutation(() => props.listId);

const open = ref(false);
/** Opens the sheet: from a pill, or from the menu of my part. */
const ask = () => {
  if (props.manages) open.value = true;
};
defineExpose({ ask });

/** What was just ticked or unticked, shown until the list is read again. */
const wanted = ref<Record<string, boolean>>({});
type Row = {
  partyId: string;
  name: string;
  category: SantaLine['category'];
  emoji: string | null;
  linked: boolean;
  /** The other list it is linked to, by name, or null. */
  elsewhere: string | null;
};
/** Those linked to this list first, ticked; then the others. */
const rows = computed<Row[]>(() =>
  [
    ...props.santas.map((santa) => ({
      partyId: santa.partyId,
      name: santa.name,
      category: santa.category,
      emoji: santa.emoji,
      linked: true,
      elsewhere: null,
    })),
    ...props.linkable
      .filter((one) => !props.santas.some((s) => s.partyId === one.partyId))
      .map((one) => ({
        partyId: one.partyId,
        name: one.name,
        category: one.category,
        emoji: one.emoji,
        linked: false,
        elsewhere: one.linkedTo,
      })),
  ].map((row) => ({ ...row, linked: wanted.value[row.partyId] ?? row.linked })),
);
/**
 * Links or unlinks one Secret Santa, at once, said in a message; a
 * failure puts the box back.
 * @param row - Its line.
 * @param on - Ticked or not.
 */
const onToggle = (row: Row, on: boolean) => {
  wanted.value = { ...wanted.value, [row.partyId]: on };
  const settle = () => {
    wanted.value = Object.fromEntries(
      Object.entries(wanted.value).filter(([id]) => id !== row.partyId),
    );
  };
  const done = on
    ? row.elsewhere === null
      ? t('lists.link.linked')
      : t('lists.link.linkedMoved', {
          title: row.elsewhere || t('lists.home.untitled'),
        })
    : t('lists.link.unlinked');
  (on ? link : unlink).mutate(row.partyId, {
    onSuccess: () => toast.done(done),
    onError: (error) => toast.failed(errorMessage(error)),
    onSettled: settle,
  });
};
</script>

<template>
  <component
    :is="manages ? 'button' : 'span'"
    v-for="santa in santas"
    :key="santa.partyId"
    :type="manages ? 'button' : undefined"
    class="relative inline-flex h-5 max-w-full items-center gap-1 self-start rounded-full bg-peach-100 pr-2 pl-1.5 text-[11.5px] font-bold text-toned before:absolute before:-inset-y-3 before:inset-x-0"
    data-testid="person-santa"
    data-no-drag
    @click="ask"
  >
    <span v-if="santa.emoji" class="shrink-0 text-[11px]" aria-hidden="true">{{
      santa.emoji
    }}</span>
    <span class="min-w-0 truncate">{{
      t('lists.doc.santa', { name: santa.name })
    }}</span>
  </component>

  <UiSheet v-model:open="open" :title="t('lists.link.action')">
    <div class="-mx-4 flex flex-col gap-3" data-testid="link-sheet">
      <p class="px-5 text-[15px] leading-[1.45] text-toned">
        {{ t('lists.link.intro') }}
      </p>
      <ul class="divide-y divide-divider border-y border-divider">
        <UiCheckRow
          v-for="row in rows"
          :key="row.partyId"
          :checked="row.linked"
          :title="row.name"
          :subtitle="
            row.elsewhere === null || row.linked
              ? undefined
              : t('lists.link.linkedTo', {
                  title: row.elsewhere || t('lists.home.untitled'),
                })
          "
          :label="row.name"
          data-testid="link-row"
          @update:checked="onToggle(row, $event)"
        >
          <template #leading>
            <UiEventTile
              :emoji="row.emoji ?? ''"
              :category="row.category"
              :size="36"
            />
          </template>
        </UiCheckRow>
      </ul>
    </div>
  </UiSheet>
</template>
