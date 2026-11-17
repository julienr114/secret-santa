<script setup lang="ts">
import { fullName } from '#server/utils/people';
import { sortParticipants } from '#server/utils/editions';
import {
  NOTE_MAX,
  addNote,
  defaultMessageType,
  messageTypesFor,
  type MessageType,
} from '#server/utils/messages';
import { LOCALES, type Locale } from '#shared/i18n';
import {
  useEditionQuery,
  useUpdatePersonMutation,
} from '~/composables/queries/useGroup';
import { useMessagesQuery } from '~/composables/queries/useEdition';

// « Personnaliser le message », for one person (`?pour=` a participation)
// or for those ticked on the email screen (`?pour=plusieurs`): which
// message, what it will look like, a word to add, and the language for
// one person (saved on them, as before). « Valider » keeps the choice and
// goes back; going back without it drops the choice. Nothing is sent here.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const { t, tk } = useT();
const goBack = useGoBack();
const slug = computed(() => String(route.params.slug));
const id = computed(() => String(route.params.id));
const editionPath = computed(() => `/admin/${slug.value}/editions/${id.value}`);
const who = computed(() => String(route.query.pour ?? ''));
const many = computed(() => who.value === 'plusieurs');
/** Where the choice is used: the send sheet, or the email screen. */
const backTo = computed(() =>
  many.value
    ? `${editionPath.value}/emails`
    : `${editionPath.value}?envoyer=${who.value}`,
);
const context = useScreenContext(slug, id);
useHead({ title: () => context.titleOf(t('adminEdition.customize.title')) });
const screen = computed(() => ({ back: backTo.value }));

const edition = useEditionQuery(slug, id);
const status = computed(
  () => edition.data.value?.edition.status ?? 'preparing',
);
const position = computed(
  () => edition.data.value?.rules.messageNotePosition ?? 'after',
);
const participants = computed(() =>
  sortParticipants(edition.data.value?.participants ?? [], status.value),
);
const selection = useEmailSelection(id);
/**
 * The person the preview is for: the one, or the first ticked; with
 * nobody ticked (or the page reloaded), the first with an address, or the
 * first of all, as on the email screen, so that it never waits for nobody.
 */
const person = computed(() =>
  many.value
    ? (participants.value.find((p) =>
        (selection.value ?? []).includes(p.participationId),
      ) ??
      participants.value.find((p) => p.email) ??
      participants.value[0])
    : participants.value.find((p) => p.participationId === who.value),
);
const count = computed(() => selection.value?.length ?? 0);

// The draft starts from what was chosen before, or the message for them.
const choice = useMessageChoice(id);
const types = computed(() => messageTypesFor(status.value));
const asked = computed(() => String(route.query.type ?? ''));
/**
 * The message the draft starts from.
 * @returns What was chosen before for the same people, or the default.
 */
const startType = (): MessageType => {
  if (choice.value?.who === who.value) return choice.value.type;
  const fromList = types.value.find((v) => v === asked.value);
  if (fromList) return fromList;
  return (
    defaultMessageType(
      status.value,
      Boolean(person.value?.messageSentAt),
      edition.data.value?.redrawn ?? false,
    ) ??
    types.value[0] ??
    'invitation'
  );
};
const type = ref<MessageType>('invitation');
const note = ref('');
watch(
  () => edition.data.value !== undefined,
  (loaded) => {
    if (!loaded) return;
    type.value = startType();
    note.value = choice.value?.who === who.value ? choice.value.note : '';
  },
  { immediate: true },
);
const tabs = computed(() =>
  types.value.map((value) => ({
    value,
    label: tk(`common.messageType.${value}`),
  })),
);

const messages = useMessagesQuery(slug, id, type);
const message = computed(() =>
  person.value
    ? messages.data.value?.messages[person.value.participationId]
    : undefined,
);
const text = computed(() =>
  message.value
    ? addNote(message.value.text, note.value, position.value)
    : undefined,
);

// The language of one person's messages, saved on them.
const updatePerson = useUpdatePersonMutation(slug);
const languageOpen = ref(false);
const languages = computed(() =>
  LOCALES.map((value) => ({ value, label: tk(`common.language.${value}`) })),
);
/**
 * Saves the language picked as the person's own.
 * @param language - The language.
 * @returns Nothing: the mutation reports by itself.
 */
const onLanguage = (language: Locale) =>
  person.value &&
  updatePerson.mutate(
    { id: person.value.id, language },
    {
      onSuccess: () => {
        languageOpen.value = false;
      },
    },
  );

/**
 * Keeps the choice, then goes back to where it is used.
 * @returns Nothing.
 */
const onValidate = () => {
  choice.value = { who: who.value, type: type.value, note: note.value };
  goBack(backTo.value);
};
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
        <UiPageTitle>{{ t('adminEdition.customize.title') }}</UiPageTitle>
        <p class="text-[15px] text-toned">
          {{
            many
              ? t('adminEdition.customize.forMany', { count })
              : t('adminEdition.customize.forOne', {
                  name: person ? fullName(person) : '',
                })
          }}
        </p>
      </div>

      <section v-if="tabs.length > 1" class="flex flex-col gap-1.5">
        <UiSectionTitle>{{ t('adminEdition.customize.which') }}</UiSectionTitle>
        <UiSegmented
          v-model="type"
          :items="tabs"
          :label="t('adminEdition.customize.which')"
        />
      </section>

      <section class="flex flex-col gap-1.5">
        <UiSectionTitle>{{
          many
            ? t('adminEdition.screen.emails.previewFor', {
                name: person ? fullName(person) : '',
              })
            : t('adminEdition.customize.receives', {
                name: person ? fullName(person) : '',
              })
        }}</UiSectionTitle>
        <UiMessageBubble
          :text="text"
          :link="message?.link"
          class="max-w-full"
          :loading-label="t('adminEdition.screen.sheet.loadingMessage')"
          data-testid="customize-preview"
        />
      </section>

      <section class="flex flex-col gap-1.5">
        <label for="customize-word" class="px-1"
          ><span
            class="text-xs font-bold tracking-[0.04em] text-toned uppercase"
            >{{ t('adminEdition.customize.word') }}</span
          >
          <span class="ml-1 text-xs font-semibold text-toned">
            {{ t('adminEdition.newEdition.optional') }}</span
          ></label
        >
        <UTextarea
          id="customize-word"
          v-model="note"
          :rows="3"
          :maxlength="NOTE_MAX"
          autoresize
          :maxrows="0"
          size="xl"
          :placeholder="t('adminEdition.customize.wordPlaceholder')"
          class="w-full"
          :ui="{ base: 'text-base leading-[1.45]' }"
        />
        <div class="flex justify-between gap-2 text-[13px] text-toned">
          <span>{{
            position === 'before'
              ? t('adminEdition.customize.before')
              : t('adminEdition.customize.after')
          }}</span>
          <span class="tabular-nums">{{ note.length }} / {{ NOTE_MAX }}</span>
        </div>
      </section>

      <UiList v-if="!many && person">
        <UiListItem
          :title="t('adminEdition.customize.language')"
          :value="tk(`common.language.${person.language}`)"
          :busy="updatePerson.isPending.value"
          :busy-label="t('common.actions.saving')"
          :on-click="() => (languageOpen = true)"
        />
      </UiList>
      <p v-else class="text-sm leading-[1.45] text-toned">
        {{ t('adminEdition.customize.eachLanguage') }}
      </p>

      <UiStickyFooter>
        <UButton
          block
          size="xl"
          class="h-13 justify-center text-[17px] font-bold"
          :label="t('common.actions.validate')"
          @click="onValidate"
        />
      </UiStickyFooter>
    </AdminQueryState>

    <UiChoiceSheet
      v-if="person"
      v-model:open="languageOpen"
      :title="t('adminEdition.customize.language')"
      :description="t('adminGroup.personForm.languageHelp')"
      :choices="languages"
      :value="person.language"
      :validate-label="t('common.actions.validate')"
      :cancel-label="t('common.actions.cancel')"
      :loading="updatePerson.isPending.value"
      @validate="onLanguage"
    />
  </AdminScreen>
</template>
