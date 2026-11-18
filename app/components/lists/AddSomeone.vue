<script setup lang="ts">
import type { ListDocument } from '#server/http/lists';
import { freshAvatar } from '#server/utils/avatars';
import { MEMBER_NAME_MAX } from '#server/utils/lists';
import { useAddPersonMutation } from '~/composables/queries/useLists';

// « Ajouter quelqu'un » (README 22.19), the same block in a draft and in a
// shared list, at the bottom of the document: the people of my family not
// on the list yet, in pills, then « Quelqu'un d'autre », a first name in a
// sheet. A name touched joins the list with their ideas nobody gave last
// time.
const props = defineProps<{
  listId: string;
  family: ListDocument['family'];
  onList: ListDocument['people'];
}>();
const { t } = useT();
const errorMessage = useErrorMessage();
const toast = useToast();
const add = useAddPersonMutation(() => props.listId);
const onError = (error: unknown) =>
  toast.add({ title: errorMessage(error), color: 'error' });
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
const name = ref('');
watch(sheetOpen, (open) => {
  if (open) name.value = '';
});
const onNew = () => {
  const firstName = name.value.trim();
  if (!firstName) return;
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
};
</script>

<template>
  <section
    class="flex flex-col gap-3 border-t border-[#dccbad] pt-5"
    data-testid="add-someone"
  >
    <h2 class="font-display text-[24px] leading-[1.2] font-bold">
      {{ t('lists.doc.addSomeone') }}
    </h2>
    <div class="flex flex-wrap gap-2">
      <button
        v-for="member in family"
        :key="member.id"
        type="button"
        class="flex h-11 items-center gap-2 rounded-full bg-default pr-4 pl-1 font-semibold ring-1 ring-[#dccbad]"
        :disabled="adding !== null"
        @click="onAdd(member.id)"
      >
        <UiAvatar :avatar="member.avatar" size="sm" />
        {{ member.firstName }}
      </button>
      <button
        type="button"
        class="flex h-11 items-center gap-2 rounded-full border border-dashed border-[#d8c49b] px-4 font-semibold text-primary-ink"
        @click="sheetOpen = true"
      >
        <UIcon name="i-lucide-plus" class="size-4" />
        {{ t('lists.doc.someoneElse') }}
      </button>
    </div>
    <p class="text-sm text-toned">
      {{
        family.length === 0 && onList.length > 0
          ? t('lists.doc.allIn')
          : t('lists.doc.addHint')
      }}
    </p>
    <UiSheet
      v-model:open="sheetOpen"
      :title="t('lists.doc.newPerson.title')"
      :description="t('lists.doc.newPerson.description')"
    >
      <form
        id="new-person-form"
        class="flex flex-col gap-1.5 py-1"
        @submit.prevent="onNew"
      >
        <label for="new-person-name" class="text-[15px] font-semibold">{{
          t('lists.doc.newPerson.label')
        }}</label>
        <UInput
          id="new-person-name"
          v-model="name"
          size="xl"
          :maxlength="MEMBER_NAME_MAX"
          autocomplete="off"
          class="w-full"
          :ui="{ base: 'h-12 text-base' }"
        />
      </form>
      <template #footer>
        <UButton
          type="submit"
          form="new-person-form"
          block
          size="xl"
          class="h-12 justify-center font-bold"
          :disabled="!name.trim()"
          :loading="add.isPending.value"
          :label="t('lists.doc.newPerson.add')"
        />
      </template>
    </UiSheet>
  </section>
</template>
