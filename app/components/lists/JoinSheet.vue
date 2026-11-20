<script setup lang="ts">
import type { IdeaLine } from '#server/http/lists';
import {
  type ClaimRoute,
  useTickMutation,
} from '~/composables/queries/useLists';
import { ideaShort } from '~/utils/ideaShort';

// « Se joindre » (README 22.19, maquettes ListeRejoindre,
// ListeRejoindreSept): always through this sheet, since my first name
// becomes visible: who is in, with their words, the one who opened it
// first; « Je participe » or « Pas cette fois ».
const props = defineProps<{
  /** By the link of the list, or in its holder's document. */
  via: ClaimRoute;
  idea: IdeaLine;
  forName: string;
}>();
const open = defineModel<boolean>('open', { required: true });
const { t } = useT();
const toast = useMessages();
const errorMessage = useErrorMessage();
const tick = useTickMutation(() => props.via);
const count = computed(() => props.idea.notes.length);
const onJoin = () =>
  tick.mutate(
    { ideaId: props.idea.id },
    {
      onSuccess: () => {
        open.value = false;
      },
      onError: (error) => toast.failed(errorMessage(error)),
    },
  );
</script>

<template>
  <UiSheet
    v-model:open="open"
    :title="t('lists.claim.together', { idea: ideaShort(idea.text) })"
    :description="
      !forName
        ? count > 2
          ? t('lists.single.forMany', { count })
          : t('lists.single.forJoining')
        : count > 2
          ? t('lists.claim.forMany', { name: forName, count })
          : t('lists.claim.forJoining', { name: forName })
    "
    :busy="tick.isPending.value"
  >
    <div class="flex flex-col gap-4 py-1" data-testid="join-sheet">
      <ul
        class="max-h-72 divide-y divide-default overflow-y-auto rounded-xl bg-default ring-1 ring-default"
      >
        <li
          v-for="(person, index) in idea.notes"
          :key="index"
          class="flex items-center gap-3 px-3.5 py-2.5"
        >
          <UiAvatar :avatar="person.avatar" />
          <div class="flex min-w-0 grow flex-col">
            <span class="font-semibold">{{ person.name }}</span>
            <span v-if="person.note" class="text-[13px] text-toned"
              >« {{ person.note }} »</span
            >
          </div>
          <span
            v-if="index === 0 && count > 2"
            class="rounded-full bg-muted px-2 py-0.5 text-xs font-bold"
            >{{ t('lists.claim.opened') }}</span
          >
        </li>
      </ul>
      <UiNotice variant="caution" icon="i-lucide-users">
        {{ t('lists.claim.joinVisible') }}
        <strong>{{ t('lists.claim.joinVisibleBold') }}</strong>
        {{ t('lists.claim.joinVisibleEnd') }}
      </UiNotice>
    </div>
    <template #footer>
      <div class="flex flex-col gap-1">
        <UButton
          block
          size="xl"
          class="h-12 justify-center font-bold"
          :loading="tick.isPending.value"
          :label="t('lists.claim.participate')"
          data-testid="join-confirm"
          @click="onJoin"
        />
        <UButton
          block
          variant="ghost"
          color="neutral"
          class="h-11 justify-center font-semibold"
          :label="t('lists.claim.notThisTime')"
          @click="open = false"
        />
      </div>
    </template>
  </UiSheet>
</template>
