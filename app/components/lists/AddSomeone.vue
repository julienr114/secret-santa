<script setup lang="ts">
import type { ListDocument } from '#server/http/lists';
import { freshAvatar } from '#server/utils/avatars';
import {
  useAddPersonMutation,
  useDeleteMemberMutation,
  useMakeSingleMutation,
} from '~/composables/queries/useLists';

// « Ajouter quelqu'un » (README 22.19), the same block in a draft and in a
// shared list, at the bottom of the document: my people not on the list
// yet, in pills, then « Quelqu'un d'autre », a first name in a sheet. A
// name touched joins the list with their ideas nobody gave last time
// (nothing says so under the pills: Julien, 19 November 2026).
// Someone added by mistake goes from here (Correction 24, maquettes
// ListeNouvelle, ProcheSupprime): the pill of a person who is on none of
// my lists is cut in two, the first name adds, the cross deletes them
// from « Mes proches », at once and with « Annuler ». Under the pills,
// the way to the page « Mes proches ».
const props = defineProps<{
  listId: string;
  family: ListDocument['family'];
  onList: ListDocument['people'];
  /**
   * « Une liste sans personne » (lot 27 bis, maquettes ListeNouvelle,
   * ListeSansPersonne). In an empty document, one more pill makes the
   * list one. Under such a list the block is a single pill, « Une
   * personne », which opens the usual choice: the first person added
   * takes the ideas already written, and the list is then by person.
   */
  single?: boolean;
}>();
const { t } = useT();
const errorMessage = useErrorMessage();
const toast = useMessages();
const add = useAddPersonMutation(() => props.listId);
const makeSingle = useMakeSingleMutation(() => props.listId);
/** Under a list without people: « Une personne » was touched. */
const choosing = ref(false);
/** Whether the pills of my people show. */
const picking = computed(() => !props.single || choosing.value);
/** The people on the list: none on a list without people. */
const there = computed(() => (props.single ? [] : props.onList));
const onError = (error: unknown) => toast.failed(errorMessage(error));
const adding = ref<string | null>(null);
const onAdd = (memberId: string) => {
  adding.value = memberId;
  add.mutate(
    { memberId },
    {
      onError,
      onSettled: () => {
        adding.value = null;
      },
    },
  );
};
const sheetOpen = ref(false);
const onNew = (firstName: string) =>
  add.mutate(
    {
      newMember: {
        firstName,
        avatar: freshAvatar(
          [...props.family, ...props.onList.map((p) => p.member)].map(
            (m) => m.avatar,
          ),
          (n) => Math.floor(Math.random() * n),
        ),
      },
    },
    {
      onSuccess: () => {
        sheetOpen.value = false;
      },
      onError,
    },
  );

const remove = useDeleteMemberMutation();
const removal = useDelayedRemoval((memberId, done) =>
  remove.mutate(memberId, { onError, onSettled: done }),
);
const shown = computed(() =>
  props.family.filter((member) => member.id !== removal.leaving.value),
);
/** Deleted from here: on none of my lists, and not « Moi ». */
const deletable = (member: ListDocument['family'][number]) =>
  member.lists === 0 && !member.isSelf;
</script>

<template>
  <section
    class="flex flex-col gap-3 border-t border-default pt-5"
    data-testid="add-someone"
  >
    <h2 class="font-display text-[24px] leading-[1.2] font-bold">
      {{ t('lists.doc.addSomeone') }}
    </h2>
    <div v-if="!picking" class="flex flex-wrap gap-2">
      <button
        type="button"
        class="flex h-11 items-center gap-2 rounded-full border border-dashed border-accented px-4 font-semibold text-primary-ink"
        data-testid="single-add-person"
        @click="choosing = true"
      >
        <UIcon name="i-lucide-plus" class="size-4" />
        {{ t('lists.single.onePerson') }}
      </button>
    </div>
    <div v-else class="flex flex-wrap gap-2">
      <div
        v-for="member in shown"
        :key="member.id"
        class="flex h-11 items-center rounded-full bg-default font-semibold ring-1 ring-default"
        data-testid="family-pill"
      >
        <button
          type="button"
          class="flex h-11 items-center gap-2 pl-1"
          :class="deletable(member) ? 'pr-2' : 'pr-4'"
          :disabled="adding !== null"
          @click="onAdd(member.id)"
        >
          <UiAvatar :avatar="member.avatar" size="sm" />
          {{ member.firstName }}
        </button>
        <button
          v-if="deletable(member)"
          type="button"
          class="flex h-11 w-10 items-center justify-center rounded-r-full border-l border-default text-toned"
          :aria-label="t('lists.doc.deleteMember', { name: member.firstName })"
          data-testid="family-cross"
          @click="
            removal.start(
              member.id,
              t('lists.doc.memberDeleted', { name: member.firstName }),
            )
          "
        >
          <UIcon name="i-lucide-x" class="size-4" />
        </button>
      </div>
      <button
        type="button"
        class="flex h-11 items-center gap-2 rounded-full border border-dashed border-accented px-4 font-semibold text-primary-ink"
        @click="sheetOpen = true"
      >
        <UIcon name="i-lucide-plus" class="size-4" />
        {{ t('lists.doc.someoneElse') }}
      </button>
      <button
        v-if="!single && onList.length === 0"
        type="button"
        class="flex h-11 items-center rounded-full border border-dashed border-accented px-4 font-semibold text-primary-ink"
        :disabled="makeSingle.isPending.value"
        data-testid="single-pill"
        @click="makeSingle.mutate(undefined, { onError })"
      >
        {{ t('lists.single.pill') }}
      </button>
    </div>
    <div class="flex flex-col gap-1 text-sm leading-[1.45] text-toned">
      <p v-if="single" data-testid="single-sorted">
        {{ t('lists.single.sorted') }}
      </p>
      <p v-else-if="onList.length === 0">{{ t('lists.single.pillHelp') }}</p>
      <p v-if="shown.length === 0 && there.length > 0">
        {{ t('lists.doc.allIn') }}
      </p>
      <NuxtLink
        v-if="picking"
        to="/famille"
        class="flex min-h-11 items-center gap-1 self-start font-bold text-primary-ink"
      >
        {{ t('lists.family.title') }}
        <UIcon name="i-lucide-chevron-right" class="size-4" />
      </NuxtLink>
    </div>
    <ListsNewPersonSheet
      v-model:open="sheetOpen"
      :loading="add.isPending.value"
      @add="onNew"
    />
  </section>
</template>
