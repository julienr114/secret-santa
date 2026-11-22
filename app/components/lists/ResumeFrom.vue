<script setup lang="ts">
import {
  useResumableQuery,
  useResumeMutation,
} from '~/composables/queries/useLists';

// « Repartir d'une liste » (lot 27, README 22.20, ticket 119, maquette
// ListeNouvelleReprendre), in the empty document of a new list: the
// other lists I hold that look like it, three at most, each with the
// first names of its people and what it would bring, « Léo, Zoé et moi ·
// 6 idées pas encore offertes ». Touching one takes its icon, its word,
// its people and the ideas nobody ticked; the old list does not change.
// Nothing shows while none looks like it.
const props = defineProps<{ listId: string }>();
const { t } = useT();
const { part } = useLineText();
const toast = useMessages();
const errorMessage = useErrorMessage();
const query = useResumableQuery(() => props.listId);
const resume = useResumeMutation(() => props.listId);
const lists = computed(() => query.data.value ?? []);
const taking = ref<string | null>(null);
const onResume = (from: string) => {
  taking.value = from;
  resume.mutate(from, {
    onError: (error) => toast.failed(errorMessage(error)),
    onSettled: () => {
      taking.value = null;
    },
  });
};
</script>

<template>
  <section
    v-if="lists.length > 0"
    class="flex flex-col gap-2.5 border-t border-default pt-4"
    data-testid="resume-from"
  >
    <h2 class="font-display text-[22px] leading-[1.2] font-bold">
      {{ t('lists.resume.title') }}
    </h2>
    <button
      v-for="list in lists"
      :key="list.id"
      type="button"
      class="flex min-h-14 items-center gap-2.5 rounded-[18px] bg-default py-2 pr-3.5 pl-2 text-left ring-1 ring-default"
      :disabled="taking !== null"
      data-testid="resume-list"
      @click="onResume(list.id)"
    >
      <ListsTile :icon="list.icon" size="sm" />
      <span class="flex min-w-0 grow flex-col">
        <span class="truncate text-[15px] font-bold">{{
          list.title || t('lists.resume.untitled')
        }}</span>
        <span class="text-[13px] text-toned"
          >{{
            list.single || !list.names
              ? t('lists.single.resume')
              : part(list.names)
          }}
          ·
          {{
            list.ideas === 0
              ? t('lists.resume.noIdeas')
              : t('lists.resume.ideas', { count: list.ideas })
          }}</span
        >
      </span>
      <UiSpinner v-if="taking === list.id" :label="t('common.loading')" />
      <UIcon
        v-else
        name="i-lucide-chevron-right"
        class="size-5 shrink-0 text-muted"
      />
    </button>
    <p class="text-sm leading-[1.45] text-toned">
      {{ t('lists.resume.help') }}
    </p>
  </section>
</template>
