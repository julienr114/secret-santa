<script setup lang="ts">
// « Un souci ? » (README 22.16, maquette Souci): what to do when
// something goes wrong after the draw, each opening what already exists:
// see one result, reveal before the party, cancel and draw again. Without
// a date of the party, closing the edition is here too (second tap), since
// nothing else offers it. Every one of them is written in the journal.
const props = defineProps<{
  slug: string;
  editionId: string;
  /** Before the day of the party, with a date: revealing is forced here. */
  canRevealEarly: boolean;
  /** No date of the party: closing is offered here. */
  canCloseHere: boolean;
  closing: boolean;
}>();
const open = defineModel<boolean>('open', { required: true });
const emit = defineEmits<{ revealEarly: []; close: [] }>();
const { t } = useT();
const base = computed(() => `/admin/${props.slug}/editions/${props.editionId}`);
const confirming = ref(false);
const closingShown = useBusy(() => props.closing);
watch(open, (isOpen) => {
  if (!isOpen) confirming.value = false;
});
</script>

<template>
  <UiSheet
    v-model:open="open"
    :title="t('adminEdition.trouble.title')"
    :description="t('adminEdition.trouble.description')"
    :busy="closing"
  >
    <div class="py-2" data-testid="trouble-sheet">
      <ul class="-mx-4 divide-y divide-default border-y border-default">
        <UiListItem
          :to="`${base}/voir-le-tirage`"
          icon="i-lucide-eye"
          icon-tone="neutral"
          :title="t('adminEdition.trouble.revealOne')"
          :subtitle="t('adminEdition.trouble.revealOneHint')"
        />
        <UiListItem
          v-if="canRevealEarly"
          icon="i-lucide-sparkle"
          icon-tone="neutral"
          :title="t('adminEdition.trouble.revealEarly')"
          :subtitle="t('adminEdition.trouble.revealEarlyHint')"
          :on-click="() => emit('revealEarly')"
          chevron
        />
        <UiListItem
          :to="`${base}/annuler`"
          icon="i-lucide-rotate-ccw"
          tone="danger"
          :title="t('adminEdition.trouble.cancel')"
          :subtitle="t('adminEdition.trouble.cancelHint')"
        />
        <template v-if="canCloseHere">
          <UiListItem
            v-if="!confirming"
            icon="i-lucide-archive"
            icon-tone="neutral"
            :title="t('adminEdition.screen.follow.closeRow')"
            :subtitle="t('adminEdition.screen.follow.closeRowHint')"
            :on-click="() => (confirming = true)"
          />
          <li v-else class="flex flex-col gap-2 px-4 py-3">
            <p class="text-sm">
              {{ t('adminEdition.screen.follow.closeConfirm') }}
            </p>
            <div class="flex gap-2">
              <UButton
                :disabled="closing"
                :loading="closingShown"
                :label="
                  closingShown
                    ? t('adminEdition.screen.follow.closing')
                    : t('adminEdition.screen.follow.closeRow')
                "
                @click="emit('close')"
              />
              <UButton
                variant="ghost"
                color="neutral"
                :disabled="closing"
                :label="t('common.actions.cancel')"
                @click="confirming = false"
              />
            </div>
          </li>
        </template>
      </ul>
    </div>
    <template #footer>
      <UButton
        block
        variant="ghost"
        color="neutral"
        class="h-[46px] justify-center font-semibold"
        :disabled="closing"
        :label="t('adminEdition.trouble.close')"
        @click="open = false"
      />
    </template>
  </UiSheet>
</template>
