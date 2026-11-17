<script setup lang="ts">
import {
  useCopyHintsMutation,
  useHintsQuery,
  usePersonalQuery,
  useSaveHintsMutation,
} from '~/composables/queries/usePersonal';
import {
  HINT_TEXTS,
  HINT_TEXT_MAX,
  answeredCount,
  portraitTags,
  type HintText,
} from '#shared/utils/hints';

// « Mes pistes de cadeaux » (README 22.11), in place of the wish list:
// the six questions of « Moi et les cadeaux », three texts, then the
// precise ideas when the group keeps them. Everything is optional; each
// part is saved on its own.
const route = useRoute();
const token = computed(() => String(route.params.token));
const query = useHintsQuery(token);
const personal = usePersonalQuery(token);
const save = useSaveHintsMutation(token);
const copy = useCopyHintsMutation(token);
const { t, tk } = useT();
const errorMessage = useErrorMessage();
const toast = useToast();

const hints = computed(() => query.data.value);
const editable = computed(() => hints.value?.editable ?? false);
const context = computed(() =>
  personal.data.value
    ? [
        { label: personal.data.value.groupName, to: `/p/${token.value}` },
        { label: personal.data.value.editionLabel, to: `/p/${token.value}` },
      ]
    : [],
);
const tags = computed(() =>
  hints.value
    ? portraitTags(hints.value.portrait.answers).map(({ question, answer }) =>
        tk(`hints.tags.${question}.${answer}`),
      )
    : [],
);
const answered = computed(() =>
  hints.value ? answeredCount(hints.value.portrait.answers) > 0 : false,
);
const questionsPath = computed(() => `/p/${token.value}/pistes/question`);

// The text being written, in its sheet: kept only with « Valider ».
const editing = ref<HintText | null>(null);
const sheetOpen = computed({
  get: () => editing.value !== null,
  set: (open) => {
    if (!open) editing.value = null;
  },
});
const onText = (value: string) => {
  const key = editing.value;
  if (!key) return;
  save.mutate(
    { texts: { [key]: value || null } },
    {
      onSuccess: () => {
        editing.value = null;
      },
    },
  );
};
const onCopy = () =>
  copy.mutate(undefined, {
    onSuccess: (data) =>
      toast.add({
        title: t('hints.copy.done', { edition: data.previousEdition ?? '' }),
        color: 'success',
      }),
    onError: (error) =>
      toast.add({ title: errorMessage(error), color: 'error' }),
  });
/** The icon of each text while it is empty. */
const TEXT_ICONS: Record<HintText, string> = {
  lately: 'i-lucide-sparkles',
  wouldHelp: 'i-lucide-wrench',
  avoid: 'i-lucide-ban',
};
const textOf = (key: HintText) => hints.value?.portrait.texts[key] ?? null;
</script>

<template>
  <ParticipantScreen
    :token="token"
    :back="`/p/${token}`"
    :pending="query.isPending.value"
    :error="query.error.value"
    :skeleton="['title', 'card', 'list']"
  >
    <div v-if="hints" class="flex flex-col gap-5">
      <div class="flex flex-col gap-1">
        <UiPageContext
          v-if="context.length > 0"
          :parts="context"
          :label="t('common.context')"
        />
        <UiPageTitle>{{ t('hints.title') }}</UiPageTitle>
        <p class="mt-1 text-[15px] leading-[1.45] text-toned">
          {{ editable ? t('hints.intro') : t('hints.readOnly') }}
        </p>
      </div>

      <UiNotice
        v-if="editable && hints.requested"
        variant="caution"
        icon="i-lucide-lightbulb"
        data-testid="hints-requested"
      >
        <strong>{{ t('hints.requested.title') }}</strong>
        {{ t('hints.requested.body') }}
      </UiNotice>
      <UiNotice v-else-if="editable" variant="positive" icon="i-lucide-lock">
        {{ t('hints.whoSees') }}
      </UiNotice>

      <UiCard v-if="answered" class="flex flex-col gap-3 px-5 pt-4 pb-5">
        <div class="flex items-center justify-between gap-3">
          <h2 class="font-display text-xl font-bold">
            {{ t('hints.me.title') }}
          </h2>
          <NuxtLink
            v-if="editable"
            :to="questionsPath"
            class="flex min-h-11 items-center text-[15px] font-bold text-primary-ink underline"
          >
            {{ t('hints.me.edit') }}
          </NuxtLink>
        </div>
        <UiTagList :tags="tags" />
      </UiCard>
      <UiCard
        v-else-if="editable"
        padding="none"
        class="flex flex-col gap-3.5 p-5"
        data-testid="hints-start"
      >
        <div class="flex flex-col gap-1">
          <p
            class="text-xs font-bold tracking-[0.04em] text-primary-ink uppercase"
          >
            {{ t('hints.start.label') }}
          </p>
          <h2 class="font-display text-[22px] leading-[1.2] font-semibold">
            {{ t('hints.start.title') }}
          </h2>
          <p class="text-[15px] leading-[1.45] text-toned">
            {{ t('hints.start.examples') }} {{ t('hints.start.body') }}
          </p>
        </div>
        <UButton
          :to="questionsPath"
          block
          size="xl"
          class="min-h-12 justify-center font-bold"
          :label="t('hints.start.action')"
        />
      </UiCard>

      <ul
        v-if="editable && hints.previousEdition"
        class="-mx-4 border-y border-default bg-default sm:mx-0 sm:rounded-lg sm:border"
      >
        <UiListItem
          icon="i-lucide-copy"
          icon-tone="neutral"
          :title="t('hints.copy.action', { edition: hints.previousEdition })"
          :subtitle="t('hints.copy.hint')"
          :chevron="true"
          :busy="copy.isPending.value"
          :on-click="onCopy"
        />
      </ul>

      <template v-for="key in HINT_TEXTS" :key="key">
        <section
          v-if="editable || textOf(key)"
          class="flex flex-col gap-1.5"
          :data-testid="`hints-text-${key}`"
        >
          <UiSectionTitle>{{ tk(`hints.texts.${key}.title`) }}</UiSectionTitle>
          <ul
            class="-mx-4 border-y border-default bg-default sm:mx-0 sm:rounded-lg sm:border"
          >
            <li v-if="textOf(key)">
              <component
                :is="editable ? 'button' : 'div'"
                :type="editable ? 'button' : undefined"
                class="flex min-h-15 w-full items-center gap-3 px-4 py-3 text-left"
                :class="{ 'transition-colors active:bg-muted': editable }"
                @click="editable && (editing = key)"
              >
                <span class="min-w-0 grow leading-[1.45] break-words">{{
                  textOf(key)
                }}</span>
                <UIcon
                  v-if="editable"
                  name="i-lucide-chevron-right"
                  class="size-5 shrink-0 text-dimmed"
                />
              </component>
            </li>
            <UiListItem
              v-else
              :icon="TEXT_ICONS[key]"
              :title="tk(`hints.texts.${key}.empty`)"
              :subtitle="tk(`hints.texts.${key}.placeholder`)"
              :chevron="true"
              :on-click="() => (editing = key)"
            />
          </ul>
        </section>
      </template>

      <ParticipantIdeasSection
        v-if="hints.mode === 'full'"
        :token="token"
        :ideas="hints.ideas"
        :max="hints.maxIdeas"
        :editable="hints.ideasEditable"
      />

      <p v-if="editable" class="px-1 text-[13px] leading-[1.4] text-toned">
        {{ t('hints.until') }}
      </p>

      <UiTextSheet
        v-model:open="sheetOpen"
        :title="editing ? tk(`hints.texts.${editing}.title`) : ''"
        :description="editing ? tk(`hints.texts.${editing}.help`) : ''"
        :label="editing ? tk(`hints.texts.${editing}.title`) : ''"
        hide-label
        :value="editing ? (textOf(editing) ?? '') : ''"
        :maxlength="HINT_TEXT_MAX"
        :hint="editing ? tk(`hints.texts.${editing}.placeholder`) : ''"
        :validate-label="t('common.actions.validate')"
        :cancel-label="t('common.actions.cancel')"
        :error="save.error.value ? errorMessage(save.error.value) : null"
        :loading="save.isPending.value"
        @validate="onText"
      />
    </div>
  </ParticipantScreen>
</template>
