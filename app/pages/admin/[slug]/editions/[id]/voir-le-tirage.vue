<script setup lang="ts">
import { byName, displayName, fullName } from '#server/utils/people';
import { useEditionQuery } from '~/composables/queries/useGroup';
import {
  useRevealOneMutation,
  type DrawPair,
} from '~/composables/queries/useEdition';

// Last-resort access to one participant's result (decisions of
// 2026-11-13): the guardian could open the personal links anyway, so this
// official way is guarded and, above all, written to the journal every
// participant reads, with the name of the person whose result was seen.
// One person at a time: a doubt about someone does not expose the draw.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const { t } = useT();
const errorMessage = useErrorMessage();
const goBack = useGoBack();
const slug = computed(() => String(route.params.slug));
const id = computed(() => String(route.params.id));
const editionPath = computed(() => `/admin/${slug.value}/editions/${id.value}`);
const edition = useEditionQuery(slug, id);
const reveal = useRevealOneMutation(slug, id);
const busy = useBusy(() => reveal.isPending.value);

const context = useScreenContext(slug, id);
useHead({
  title: () => context.titleOf(t('adminEdition.reveal.title')),
});
const screen = computed(() => ({ back: editionPath.value }));

// Checked by the server as is: the sentence stays in French in every
// language, only the texts around it are translated.
const SENTENCE = 'JE VEUX VOIR LE TIRAGE';
const participants = computed(() =>
  (edition.data.value?.participants ?? []).toSorted(byName),
);
const pickable = computed(() =>
  participants.value.map((p) => ({
    id: p.id,
    name: fullName(p),
    avatar: p.avatar,
  })),
);
const personId = ref<string | null>(null);
const sentence = ref('');
const understood = ref(false);
const pickerOpen = ref(false);
watch(personId, () => {
  pickerOpen.value = false;
});
const person = computed(() =>
  participants.value.find((p) => p.id === personId.value),
);
const ready = computed(
  () =>
    Boolean(person.value) &&
    sentence.value.trim().toUpperCase() === SENTENCE &&
    understood.value,
);
const journalLine = computed(() =>
  t('journal.events.result_revealed', {
    name: person.value ? displayName(person.value, participants.value) : '…',
  }),
);
const points = computed(() => [
  {
    icon: 'i-lucide-circle-alert',
    text: t('adminEdition.reveal.warningLastResort'),
  },
  { icon: 'i-lucide-file-text', text: t('adminEdition.reveal.warningJournal') },
  { icon: 'i-lucide-eye-off', text: t('adminEdition.reveal.warningEphemeral') },
]);

// Shown only in this component's state: gone when leaving the screen.
const pair = ref<DrawPair | null>(null);
const personOf = (personIdOf: string | null) =>
  participants.value.find((p) => p.id === personIdOf);
const giver = computed(() => personOf(pair.value?.giverId ?? null));
const receiver = computed(() => personOf(pair.value?.receiverId ?? null));
/**
 * Hides the result and starts again with another person.
 * @returns Nothing.
 */
const onAnother = () => {
  pair.value = null;
  personId.value = null;
  sentence.value = '';
  understood.value = false;
};
/**
 * Asks for the result of the person chosen; the server journals it.
 * @returns Nothing: the mutation reports by itself.
 */
const onReveal = () =>
  person.value &&
  reveal.mutate(
    { personId: person.value.id, sentence: sentence.value },
    {
      onSuccess: (data) => {
        pair.value = data.pair;
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
        <UiPageContext
          :parts="context.parts.value"
          :label="t('common.context')"
        />
        <UiPageTitle>{{ t('adminEdition.reveal.title') }}</UiPageTitle>
      </div>

      <template v-if="pair">
        <section
          aria-live="polite"
          class="flex flex-col items-center gap-4 rounded-2xl bg-default px-5 py-6 text-center shadow-card"
          data-testid="revealed"
        >
          <div class="flex items-center gap-3.5">
            <UiAvatar
              v-if="giver"
              :avatar="giver.avatar"
              class="size-16 text-[28px]"
            />
            <UIcon
              name="i-lucide-arrow-right"
              class="size-6 text-primary"
              aria-hidden="true"
            />
            <UiAvatar
              v-if="receiver"
              :avatar="receiver.avatar"
              class="size-16 text-[28px]"
            />
          </div>
          <div class="flex flex-col gap-0.5">
            <p class="text-[15px] text-toned">
              {{
                t('adminEdition.reveal.gives', {
                  name: giver ? fullName(giver) : '?',
                })
              }}
            </p>
            <p
              class="font-display text-[40px] leading-[1.05] font-bold text-primary"
            >
              {{ receiver ? fullName(receiver) : '?' }}
            </p>
          </div>
        </section>
        <UiNotice variant="caution" icon="i-lucide-eye">
          {{ t('adminEdition.reveal.shownNotice') }}
        </UiNotice>
        <div class="flex flex-col gap-1.5">
          <UButton
            block
            size="xl"
            class="h-12 justify-center font-bold"
            :label="t('adminEdition.reveal.hide')"
            @click="goBack(editionPath)"
          />
          <UButton
            block
            variant="ghost"
            color="neutral"
            class="h-[46px] justify-center text-base font-semibold"
            :label="t('adminEdition.reveal.another')"
            @click="onAnother"
          />
        </div>
      </template>

      <template v-else>
        <UiNotice
          variant="warning"
          :title="t('adminEdition.reveal.warningTitle')"
        >
          <UiPointList :points="points" loose />
        </UiNotice>

        <UiPersonField
          :label="t('adminEdition.reveal.personLabel')"
          :person="
            person ? { name: fullName(person), avatar: person.avatar } : null
          "
          :placeholder="t('adminEdition.reveal.personPlaceholder')"
          @open="pickerOpen = true"
        />

        <UiJournalPreview
          :label="t('adminEdition.general.journalPreview')"
          icon="i-lucide-eye"
          :text="journalLine"
        />

        <UFormField
          :label="
            t('adminEdition.reveal.sentenceLabel', { sentence: SENTENCE })
          "
          :ui="{ label: 'text-[15px] font-semibold' }"
        >
          <UInput
            v-model="sentence"
            size="xl"
            autocomplete="off"
            autocapitalize="characters"
            class="w-full"
            :ui="{ base: 'h-12' }"
          />
        </UFormField>
        <UiConfirmBox
          v-model="understood"
          :label="t('adminEdition.reveal.understood')"
        />
        <UAlert
          v-if="reveal.isError.value"
          color="error"
          variant="subtle"
          :description="errorMessage(reveal.error.value)"
        />
        <div class="flex flex-col gap-1.5">
          <UButton
            block
            color="neutral"
            size="xl"
            icon="i-lucide-eye"
            class="h-12 justify-center bg-inverted font-bold hover:bg-inverted/90"
            :ui="{ leadingIcon: 'size-5' }"
            :disabled="!ready || reveal.isPending.value"
            :loading="busy"
            :label="
              busy
                ? t('adminEdition.reveal.revealing')
                : person
                  ? t('adminEdition.reveal.submit', { name: fullName(person) })
                  : t('adminEdition.reveal.submitAnyone')
            "
            @click="onReveal"
          />
          <UButton
            block
            variant="ghost"
            color="neutral"
            class="h-[46px] justify-center text-base font-semibold"
            :disabled="reveal.isPending.value"
            :label="t('adminEdition.reveal.notNow')"
            @click="goBack(editionPath)"
          />
        </div>
      </template>
    </AdminQueryState>

    <UiPersonPicker
      v-model:open="pickerOpen"
      v-model:selected="personId"
      :title="t('adminEdition.reveal.personLabel')"
      :description="
        t('common.count.participants', { count: participants.length })
      "
      :people="pickable"
      :search-label="t('adminEdition.screen.lists.search')"
      :clear-label="t('adminEdition.screen.lists.clear')"
      :results-text="
        (shown, total) =>
          t('adminEdition.reveal.results', { count: shown, total })
      "
    />
  </AdminScreen>
</template>
