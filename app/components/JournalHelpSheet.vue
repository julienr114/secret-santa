<script setup lang="ts">
// « À quoi sert le journal ? »: what it records, what it never says, who
// sees it, and what to do about a line one did not expect.
const open = defineModel<boolean>('open', { required: true });
const { t } = useT();

/** The three parts of the sheet, each with its icon and its points. */
const sections = computed(() => [
  {
    key: 'notes',
    icon: 'i-lucide-list-checks',
    tone: 'bg-primary-soft text-primary',
    title: t('journal.help.notes'),
    points: [
      t('journal.help.note1'),
      t('journal.help.note2'),
      t('journal.help.note3'),
      t('journal.help.note4'),
      t('journal.help.note5'),
    ],
  },
  {
    key: 'never',
    icon: 'i-lucide-lock',
    tone: 'bg-success-soft text-success-ink',
    title: t('journal.help.never'),
    points: [t('journal.help.never1'), t('journal.help.never2')],
  },
  {
    key: 'who',
    icon: 'i-lucide-users',
    tone: 'bg-muted text-toned',
    title: t('journal.help.who'),
    points: [t('journal.help.who1')],
  },
]);
</script>

<template>
  <UiSheet
    v-model:open="open"
    :title="t('journal.help.title')"
    :description="t('journal.help.intro')"
  >
    <div class="flex flex-col gap-5">
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
        <div class="flex min-w-0 flex-col gap-1">
          <h3 class="font-sans text-base font-bold">{{ section.title }}</h3>
          <ul class="list-disc pl-4.5 text-sm leading-[1.5] text-toned">
            <li v-for="point in section.points" :key="point">{{ point }}</li>
          </ul>
        </div>
      </section>
      <UiNotice variant="caution" icon="i-lucide-info">
        {{ t('journal.help.warning') }}
      </UiNotice>
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
