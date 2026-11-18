<script setup lang="ts">
// « À quoi sert le journal ? », short enough to fit a phone without
// scrolling: one sentence of why, then what it records, what it never
// says and who sees it, each a short title and one sentence, and what to
// do about a line one did not expect.
const open = defineModel<boolean>('open', { required: true });
const { t } = useT();
const organizers = useOrganizers();

/** The three parts of the sheet, each with its icon and its sentence. */
const sections = computed(() => [
  {
    key: 'notes',
    icon: 'i-lucide-list-checks',
    tone: 'bg-primary-soft text-primary-ink',
    title: t('journal.help.notes'),
    body: t('journal.help.notesBody'),
  },
  {
    key: 'never',
    icon: 'i-lucide-lock',
    tone: 'bg-success-soft text-success-ink',
    title: t('journal.help.never'),
    body: t('journal.help.neverBody'),
  },
  {
    key: 'who',
    icon: 'i-lucide-users',
    tone: 'bg-muted text-toned',
    title: t('journal.help.who'),
    body: t('journal.help.whoBody'),
  },
]);
</script>

<template>
  <UiSheet
    v-model:open="open"
    :title="t('journal.help.title')"
    :description="t('journal.help.intro')"
    :ui="{
      container: 'gap-3.5',
      title: 'text-2xl',
      description: 'text-[15px] leading-[1.4]',
    }"
  >
    <div class="flex flex-col gap-3.5" data-testid="journal-help">
      <section
        v-for="section in sections"
        :key="section.key"
        class="flex items-start gap-3"
      >
        <span
          class="flex size-8 shrink-0 items-center justify-center rounded-full"
          :class="section.tone"
          aria-hidden="true"
        >
          <UIcon :name="section.icon" class="size-4" />
        </span>
        <div class="flex min-w-0 flex-col gap-px">
          <h3 class="font-sans text-[15px] leading-[1.4] font-bold">
            {{ section.title }}
          </h3>
          <p class="text-sm leading-[1.4] text-toned">{{ section.body }}</p>
        </div>
      </section>
      <p
        class="rounded-xl bg-warning-tint px-3 py-2.5 text-sm leading-[1.4] text-alert-link ring-1 ring-warning-ring"
      >
        {{ t('journal.help.warning', { count: organizers }) }}
      </p>
    </div>
    <template #footer>
      <UButton
        block
        size="xl"
        class="h-13 justify-center text-[17px] font-bold"
        :label="t('journal.screen.understood')"
        @click="open = false"
      />
    </template>
  </UiSheet>
</template>
