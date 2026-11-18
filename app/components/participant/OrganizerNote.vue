<script setup lang="ts">
// « Le mot de l'organisateur », under the main card of the draw page, in
// every state but a closed edition (lot 16 bis): cut at three lines, with
// « Lire la suite » when it is longer.
defineProps<{ text: string }>();
const { t } = useT();
const organizers = useOrganizers();
const paragraph = ref<HTMLElement | null>(null);
const open = ref(false);
/** Whether the three lines hide some of it; measured once shown. */
const cut = ref(false);
onMounted(() => {
  const element = paragraph.value;
  cut.value = Boolean(element && element.scrollHeight > element.clientHeight);
});
</script>

<template>
  <section
    class="flex flex-col gap-1 rounded-xl bg-muted px-4 py-3"
    data-testid="organizer-note"
  >
    <h2
      class="font-sans text-xs font-bold tracking-[0.04em] text-toned uppercase"
    >
      {{ t('participant.home.note.title', { count: organizers }) }}
    </h2>
    <p
      ref="paragraph"
      class="text-[15px] leading-[1.45] break-words whitespace-pre-line italic"
      :class="{ 'line-clamp-3': !open }"
    >
      {{ text }}
    </p>
    <button
      v-if="cut && !open"
      type="button"
      class="-my-2 flex min-h-11 items-center self-start text-sm font-semibold text-primary-ink underline"
      @click="open = true"
    >
      {{ t('participant.home.note.more') }}
    </button>
  </section>
</template>
