<script setup lang="ts">
import {
  useDashboardQuery,
  useEditionQuery,
} from '~/composables/queries/useGroup';
import { useCancelDrawMutation } from '~/composables/queries/useEdition';

// Cancel and redo the draw (README 6.5): what it changes, in red, then
// what stays, a reason the whole group will read in the journal, a box to
// tick, and keeping the draw offered first.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const id = computed(() => String(route.params.id));
const editionPath = computed(() => `/admin/${slug.value}/editions/${id.value}`);
const toast = useToast();
const { t, tk } = useT();
const goBack = useGoBack();
const errorMessage = useErrorMessage();
const edition = useEditionQuery(slug, id);
const dashboard = useDashboardQuery(slug);
const cancel = useCancelDrawMutation(slug, id);
const busy = useBusy(() => cancel.isPending.value);

useHead({
  title: computed(
    () => `${t('adminEdition.cancelDraw.title')} — ${t('common.appName')}`,
  ),
});
const screen = computed(() => ({ back: editionPath.value }));
const subtitle = computed(() =>
  [edition.data.value?.edition.label, dashboard.data.value?.group.name]
    .filter(Boolean)
    .join(' · '),
);

const participants = computed(() => edition.data.value?.participants ?? []);
const viewed = computed(
  () => participants.value.filter((p) => p.viewCount > 0).length,
);
const effects = computed(() => [
  {
    text: [
      t('adminEdition.cancelDraw.results', {
        count: participants.value.length,
      }),
      viewed.value > 0
        ? t('adminEdition.cancelDraw.viewed', { count: viewed.value })
        : '',
    ]
      .filter(Boolean)
      .join(' '),
  },
  { text: t('adminEdition.cancelDraw.listOpen') },
  {
    text: t('adminEdition.cancelDraw.redrawMessage', {
      message: tk('common.messageType.redraw'),
    }),
  },
]);
const kept = computed(() => [
  { icon: 'i-lucide-check', text: t('adminEdition.cancelDraw.linksKept') },
  { icon: 'i-lucide-check', text: t('adminEdition.cancelDraw.wishesKept') },
]);

/** The server's own bounds on a reason. */
const REASON_MIN = 3;
const REASON_MAX = 200;
const reason = ref('');
const understood = ref(false);
const ready = computed(
  () => reason.value.trim().length >= REASON_MIN && understood.value,
);
const journalLine = computed(() =>
  t('journal.events.draw_cancelled', {
    reason: reason.value.trim() || '…',
  }),
);
/**
 * Cancels the draw, then goes back to the edition.
 * @returns Nothing: the mutation reports by itself.
 */
const onCancel = () =>
  cancel.mutate(
    { reason: reason.value.trim() },
    {
      onSuccess: () => {
        toast.add({
          title: t('adminEdition.cancelDraw.done'),
          description: t('adminEdition.cancelDraw.doneDescription'),
          color: 'success',
        });
        goBack(editionPath.value);
      },
    },
  );
</script>

<template>
  <AdminScreen v-bind="screen">
    <AdminQueryState
      :pending="edition.isPending.value"
      :error="edition.error.value"
      :skeleton="['title', 'card']"
    >
      <div class="flex flex-col gap-1">
        <UiPageTitle>{{ t('adminEdition.cancelDraw.title') }}</UiPageTitle>
        <p class="text-[15px] text-toned">{{ subtitle }}</p>
      </div>
      <UiNotice
        variant="danger"
        icon="i-lucide-triangle-alert"
        :title="t('adminEdition.cancelDraw.dangerTitle')"
      >
        <UiPointList :points="effects" tone="error" />
      </UiNotice>
      <UiPointList :points="kept" tone="success" class="text-toned" />

      <UFormField
        :label="t('adminEdition.cancelDraw.reasonLabel')"
        :help="t('adminEdition.cancelDraw.reasonHelp')"
        :ui="{
          label: 'text-[15px] font-semibold',
          help: 'text-[13px] text-toned',
        }"
      >
        <UInput
          v-model="reason"
          size="xl"
          :maxlength="REASON_MAX"
          :placeholder="t('adminEdition.cancelDraw.reasonPlaceholder')"
          class="w-full"
          :ui="{ base: 'h-12' }"
        />
      </UFormField>
      <UiJournalPreview
        :label="t('adminEdition.general.journalPreview')"
        :text="journalLine"
      />
      <UiConfirmBox
        v-model="understood"
        :label="t('adminEdition.cancelDraw.understood')"
      />
      <UAlert
        v-if="cancel.isError.value"
        color="error"
        variant="subtle"
        :description="errorMessage(cancel.error.value)"
      />
      <div class="flex flex-col gap-2">
        <UButton
          block
          color="secondary"
          size="xl"
          class="h-13 justify-center text-[17px] font-bold"
          :disabled="cancel.isPending.value"
          :label="t('adminEdition.cancelDraw.keep')"
          @click="goBack(editionPath)"
        />
        <UButton
          block
          color="error"
          variant="outline"
          size="xl"
          class="h-12 justify-center font-bold ring-error-soft"
          :disabled="!ready || cancel.isPending.value"
          :loading="busy"
          :label="
            busy
              ? t('adminEdition.cancelDraw.cancelling')
              : t('adminEdition.cancelDraw.submit')
          "
          @click="onCancel"
        />
      </div>
    </AdminQueryState>
  </AdminScreen>
</template>
