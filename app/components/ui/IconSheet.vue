<script setup lang="ts">
import type { IconChoice, IconColor, IconFamily } from './IconPicker.vue';

// Choosing an icon, the same sheet everywhere (lot 20, maquettes
// PanneauAvatarGrand and ListeIcone): the icon as it will be, the title,
// and « Au hasard » (a symbol and a colour drawn), then the picker, then
// « Annuler » and « Valider » side by side. The choice is kept only with
// « Valider »; the parent saves it.
const props = withDefaults(
  defineProps<{
    initial: IconChoice;
    title: string;
    families: readonly IconFamily[];
    colors: readonly IconColor[];
    shape?: 'round' | 'square';
    loading?: boolean;
    /** Why the last save failed, if it did. */
    error?: string | null;
  }>(),
  { shape: 'round', loading: false, error: null },
);
const open = defineModel<boolean>('open', { required: true });
const emit = defineEmits<{ validate: [icon: IconChoice] }>();
const { t } = useT();
const busy = useBusy(() => props.loading);
const draft = ref<IconChoice>(props.initial);
watch(
  open,
  (opened) => {
    if (opened) draft.value = props.initial;
  },
  { immediate: true },
);
const shade = computed(
  () =>
    props.colors.find((c) => c.key === draft.value.color) ?? props.colors[0],
);
const every = computed(() => props.families.flatMap((f) => f.emojis));
/** Draws a symbol and a colour, other than the ones shown. */
const onRandom = () => {
  const draw = <T,>(items: readonly T[], not: T) => {
    const others = items.filter((item) => item !== not);
    const pool = others.length > 0 ? others : items;
    return pool[Math.floor(Math.random() * pool.length)]!;
  };
  draft.value = {
    emoji: draw(every.value, draft.value.emoji),
    color: draw(
      props.colors.map((c) => c.key),
      draft.value.color,
    ),
  };
};
</script>

<template>
  <UiSheet v-model:open="open" :title="title" :busy="loading">
    <template #header>
      <div class="flex w-full items-center gap-3">
        <span
          class="flex size-14 shrink-0 items-center justify-center text-[28px] ring-1"
          :class="shape === 'round' ? 'rounded-full' : 'rounded-xl'"
          :style="{
            backgroundColor: shade?.bg,
            '--tw-ring-color': shade?.ring,
          }"
          aria-hidden="true"
          data-testid="icon-preview"
        >
          <UiEmoji :emoji="draft.emoji" />
        </span>
        <h2 class="grow font-display text-[22px] leading-[1.15] font-bold">
          {{ title }}
        </h2>
        <UButton
          variant="outline"
          color="neutral"
          icon="i-lucide-shuffle"
          class="size-11 shrink-0 justify-center rounded-full"
          :aria-label="t('adminGroup.avatar.random')"
          data-testid="icon-random"
          @click="onRandom"
        />
      </div>
    </template>
    <div class="flex flex-col gap-3" data-testid="avatar-sheet">
      <UiIconPicker
        v-model="draft"
        :families="families"
        :colors="colors"
        :shape="shape"
        :symbol-label="t('adminGroup.avatar.emoji')"
        :color-label="t('adminGroup.avatar.color')"
      />
      <p v-if="error" class="text-sm font-medium text-error" role="alert">
        {{ error }}
      </p>
    </div>
    <template #footer>
      <div class="grid grid-cols-[1fr_2fr] gap-2.5">
        <UButton
          variant="outline"
          color="neutral"
          class="h-12 justify-center text-base font-semibold"
          :disabled="loading"
          :label="t('common.actions.cancel')"
          @click="open = false"
        />
        <UButton
          class="h-12 justify-center text-base font-bold"
          :disabled="loading"
          :loading="busy"
          :label="
            busy ? t('common.actions.saving') : t('common.actions.validate')
          "
          @click="emit('validate', draft)"
        />
      </div>
    </template>
  </UiSheet>
</template>
