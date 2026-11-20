<script setup lang="ts">
import {
  useListModeMutation,
  type ListMode,
} from '~/composables/queries/useLists';

// « Mode anonyme », the bar on top of a list opened by its link (lot 27
// ter, README 22.20, maquettes ListeVisiteurMes, ListeVisiteurPrenom,
// ListeVisiteurAnonyme, ListeVisiteurTirage): it says the mode before
// one ticks, as a private window does. One line, stuck under the top bar
// while the list scrolls. Off: light, an eye. On: dark aubergine, white
// text, a mask. « ? » unfolds what it means, over the whole width. No
// first name in it: one does not always know who holds the list.
// When the server turned it on because of a draw, a note hangs under the
// bar, over the list and without pushing it, with a plum halo: it names
// nobody, and « Compris » takes it away for good on this list. The
// switch stays free.
const props = defineProps<{ token: string; mode: NonNullable<ListMode> }>();
const { t } = useT();
const toast = useMessages();
const errorMessage = useErrorMessage();
const change = useListModeMutation(() => props.token);
/** What the switch was just asked, until the list says so itself. */
const asked = ref<boolean | null>(null);
const on = computed(() => asked.value ?? props.mode.anonymous);
const open = ref(false);
const onSwitch = (anonymous: boolean) => {
  asked.value = anonymous;
  change.mutate(
    { anonymous },
    {
      onError: (error) => toast.failed(errorMessage(error)),
      onSettled: () => {
        asked.value = null;
      },
    },
  );
};
/** « Compris »: gone at once, and for good. */
const dismissed = ref(false);
const notice = computed(
  () => props.mode.notice && on.value && !dismissed.value,
);
const onUnderstood = () => {
  dismissed.value = true;
  change.mutate({ noticeSeen: true });
};
</script>

<template>
  <div
    class="sticky top-[calc(3.5rem+env(safe-area-inset-top)+0.5rem)] z-10 -mt-1 rounded-[24px] motion-safe:transition-colors motion-safe:duration-200"
    :class="
      on
        ? 'bg-incognito text-white shadow-[0_4px_14px_color-mix(in_srgb,var(--color-incognito)_30%,transparent)]'
        : 'bg-default ring-1 ring-default'
    "
    :data-mode="on ? 'anonymous' : 'named'"
    data-testid="mode-bar"
  >
    <div class="flex min-h-12 items-center gap-2 pr-2 pl-3.5">
      <UIcon
        :name="on ? 'i-lucide-venetian-mask' : 'i-lucide-eye'"
        class="size-5 shrink-0"
        :class="on ? '' : 'text-toned'"
      />
      <span class="min-w-0 grow text-sm font-bold">{{
        t('lists.mode.title')
      }}</span>
      <button
        type="button"
        class="flex size-9 shrink-0 items-center justify-center rounded-full"
        :class="on ? 'text-incognito-soft' : 'text-toned'"
        :aria-expanded="open"
        aria-controls="mode-why"
        :aria-label="t('lists.mode.why')"
        data-testid="mode-why"
        @click="open = !open"
      >
        <UIcon name="i-lucide-circle-help" class="size-5" />
      </button>
      <USwitch
        :model-value="on"
        size="lg"
        :disabled="change.isPending.value"
        :aria-label="t('lists.mode.title')"
        :ui="
          on
            ? {
                base: 'data-[state=checked]:bg-white',
                thumb: 'data-[state=checked]:bg-incognito',
              }
            : {}
        "
        data-testid="mode-switch"
        @update:model-value="onSwitch"
      />
    </div>
    <p
      v-if="open"
      id="mode-why"
      class="px-4 pb-3.5 text-[13px] leading-[1.45]"
      :class="on ? 'text-incognito-soft' : 'text-toned'"
      data-testid="mode-explained"
    >
      {{ on ? t('lists.mode.on') : t('lists.mode.off') }}
    </p>
    <div
      v-if="notice"
      class="absolute inset-x-0 top-full z-10 pt-2.5"
      data-testid="mode-notice"
    >
      <!-- The halo: a plum veil over the list, which goes with the note
           and lets every touch through. -->
      <span
        class="pointer-events-none absolute -inset-x-4 top-1 -z-10 h-[480px] bg-linear-to-b from-incognito/30 via-incognito/20 via-55% to-incognito/0"
        aria-hidden="true"
      />
      <div
        class="relative flex flex-col gap-1.5 rounded-[28px] bg-default px-4 pt-3.5 pb-1.5 text-default shadow-[0_0_0_1.5px_var(--color-incognito),0_14px_44px_6px_color-mix(in_srgb,var(--color-incognito)_45%,transparent)]"
        role="status"
      >
        <!-- The tip, towards the switch. -->
        <span
          class="absolute -top-[7px] right-[26px] size-3 rotate-45 border-t-[1.5px] border-l-[1.5px] border-incognito bg-default"
          aria-hidden="true"
        />
        <p class="text-[15px] leading-[1.35] font-bold">
          {{ t('lists.mode.noticeTitle') }}
        </p>
        <p class="text-sm leading-[1.45] text-toned">
          {{ t('lists.mode.noticeBody') }}
        </p>
        <button
          type="button"
          class="min-h-10 self-end px-1 text-[15px] font-bold text-incognito"
          data-testid="mode-understood"
          @click="onUnderstood"
        >
          {{ t('lists.mode.understood') }}
        </button>
      </div>
    </div>
  </div>
</template>
