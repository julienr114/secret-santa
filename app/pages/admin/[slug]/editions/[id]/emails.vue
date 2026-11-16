<script setup lang="ts">
import { fullName } from '#server/utils/people';
import type { Participant } from '#server/database/editions';
import {
  followState,
  preselectedForEmail,
  sortParticipants,
} from '#server/utils/editions';
import { listView, stackOf } from '#shared/utils/lists';
import {
  NOTE_MAX,
  addNote,
  messageTypesFor,
  type MessageType,
} from '#server/utils/messages';
import { useEditionQuery } from '~/composables/queries/useGroup';
import {
  useMessagesQuery,
  useSendEmailsMutation,
} from '~/composables/queries/useEdition';

// Sending one message by email to several participants: the message,
// who gets it (those still to notify start ticked; a whole row ticks;
// people without an address can only get one), what it will look like,
// then send.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const id = computed(() => String(route.params.id));
const editionPath = computed(() => `/admin/${slug.value}/editions/${id.value}`);
const { t, tk, locale } = useT();
const toast = useToast();
const errorMessage = useErrorMessage();
const goBack = useGoBack();
useHead({
  title: () =>
    `${t('adminEdition.screen.emails.title')} — ${t('common.appName')}`,
});
const screen = computed(() => ({ back: editionPath.value }));

const edition = useEditionQuery(slug, id);
const status = computed(
  () => edition.data.value?.edition.status ?? 'preparing',
);
const participants = computed(() =>
  sortParticipants(edition.data.value?.participants ?? [], status.value),
);

const types = computed(() => messageTypesFor(status.value));
const asked = computed(() => String(route.query.type ?? ''));
const type = ref<MessageType>('invitation');
watch(
  types,
  (list) => {
    type.value = list.find((v) => v === asked.value) ?? list[0] ?? type.value;
  },
  { immediate: true },
);
const tabs = computed(() =>
  types.value.map((value) => ({
    value,
    label: tk(`common.messageType.${value}`),
  })),
);

const withEmail = computed(() => participants.value.filter((p) => p.email));
const { lookOf } = useFollowLook();
/**
 * What a row says under the name: no address, or where the person stands.
 * @param p - The participant.
 * @returns The icon, the tone classes of the icon and the words, the words.
 */
const rowLook = (p: Participant) =>
  p.email
    ? lookOf(p)
    : {
        icon: 'i-lucide-circle-dashed',
        iconTone: 'text-toned',
        tone: 'text-toned',
        text: t('adminEdition.screen.emails.noEmail'),
      };
const selected = ref<string[]>([]);
watch(
  () => edition.data.value !== undefined,
  (loaded) => {
    if (!loaded) return;
    selected.value = participants.value
      .filter(preselectedForEmail)
      .map((p) => p.participationId);
  },
  { immediate: true },
);
/**
 * Whether a participation is ticked.
 * @param pid - The participation.
 * @returns True when ticked.
 */
const isSelected = (pid: string) => selected.value.includes(pid);
/**
 * Ticks or unticks a participation.
 * @param pid - The participation.
 * @param on - True to tick it.
 * @returns Nothing.
 */
const toggle = (pid: string, on: boolean) => {
  selected.value = on
    ? [...selected.value, pid]
    : selected.value.filter((v) => v !== pid);
};
const allSelected = computed(
  () => selected.value.length === withEmail.value.length,
);
/**
 * Ticks everyone with an address, or nobody when all are ticked.
 * @returns Nothing.
 */
const toggleAll = () => {
  selected.value = allSelected.value
    ? []
    : withEmail.value.map((p) => p.participationId);
};

// Past ten people, a search; past twelve, five rows then a fold row. The
// selection always covers the whole list, shown or not.
const SEARCH_FROM = 10;
const SHOWN = 5;
const query = ref('');
const expanded = ref(false);
const searchable = computed(() => participants.value.length > SEARCH_FROM);
const view = computed(() =>
  listView(participants.value, {
    query: query.value,
    expanded: expanded.value,
    shown: SHOWN,
    nameOf: fullName,
  }),
);

// The preview shows the message of the first one ticked.
const messages = useMessagesQuery(slug, id, type);
const first = computed(() =>
  participants.value.find((p) => isSelected(p.participationId)),
);
const note = ref('');
const writing = ref(false);
const firstMessage = computed(
  () =>
    first.value && messages.data.value?.messages[first.value.participationId],
);
const preview = computed(() =>
  firstMessage.value
    ? addNote(firstMessage.value.text, note.value, 'after')
    : undefined,
);

const sendEmails = useSendEmailsMutation(slug, id);
const sending = useBusy(() => sendEmails.isPending.value);
/**
 * Says who was just sent the message: up to three first names, then how
 * many others.
 * @param names - The first names of those sent to.
 * @returns "Inès, Louis et Rose sont prévenus."
 */
const sentTo = (names: string[]) => {
  const { shown, more } = stackOf(names, 3);
  const list =
    more > 0
      ? t('adminEdition.screen.drawSheet.andOthers', {
          names: shown.join(', '),
          count: more,
        })
      : new Intl.ListFormat(locale.value, { type: 'conjunction' }).format(
          shown,
        );
  return t('adminEdition.screen.sentTo', { names: list, count: names.length });
};
/**
 * Sends the message to those ticked, then goes back to the edition.
 * @returns Nothing: the mutation reports by itself.
 */
const onSend = () =>
  sendEmails.mutate(
    {
      type: type.value,
      audience: 'all',
      participationIds: selected.value,
      note: note.value,
      notePosition: 'after',
    },
    {
      onSuccess: ({ sent, left }) => {
        const names = participants.value
          .filter((p) => isSelected(p.participationId))
          .map(fullName);
        toast.add({
          title: t('adminEdition.cockpit.email.sent', { count: sent }),
          description: left === 0 && sent > 0 ? sentTo(names) : undefined,
          color: 'success',
          icon: 'i-lucide-mail-check',
        });
        goBack(editionPath.value);
      },
      onError: (error: unknown) =>
        toast.add({ title: errorMessage(error), color: 'error' }),
    },
  );
</script>

<template>
  <AdminScreen v-bind="screen">
    <AdminQueryState
      :pending="edition.isPending.value"
      :error="edition.error.value"
    >
      <UiPageTitle>{{ t('adminEdition.screen.emails.title') }}</UiPageTitle>
      <section class="flex flex-col gap-2">
        <UiSectionTitle>{{
          t('adminEdition.screen.emails.message')
        }}</UiSectionTitle>
        <UiSegmented
          v-model="type"
          :items="tabs"
          :label="t('adminEdition.screen.emails.message')"
        />
      </section>

      <section
        class="flex flex-col gap-1.5 transition-opacity"
        :class="{
          'pointer-events-none opacity-50': sendEmails.isPending.value,
        }"
        :inert="sendEmails.isPending.value || undefined"
        :aria-busy="sendEmails.isPending.value || undefined"
        data-testid="email-people"
      >
        <div class="flex items-center justify-between gap-2">
          <UiSectionTitle aria-live="polite" data-testid="email-count">{{
            t('adminEdition.screen.emails.selected', {
              count: selected.length,
              total: participants.length,
            })
          }}</UiSectionTitle>
          <button
            type="button"
            class="h-11 px-1 text-sm font-bold text-primary-ink underline disabled:opacity-50"
            :disabled="!withEmail.length"
            @click="toggleAll"
          >
            {{
              allSelected
                ? t('adminEdition.screen.emails.selectNone')
                : t('adminEdition.screen.emails.selectAll')
            }}
          </button>
        </div>
        <UiSearchField
          v-if="searchable"
          v-model="query"
          class="mb-1.5"
          :label="t('adminEdition.screen.lists.search')"
          :clear-label="t('adminEdition.screen.lists.clear')"
        />
        <UiList>
          <li
            v-if="view.shown.length === 0"
            class="px-4 py-3 text-sm text-muted"
          >
            {{ t('adminEdition.screen.lists.noMatch') }}
          </li>
          <UiFoldedRows
            :fold="view"
            :key-of="(p) => p.participationId"
            :avatar-of="(p) => p.avatar"
            :more-label="
              (count) => t('adminEdition.screen.lists.more', { count })
            "
            :collapse-label="t('adminEdition.screen.lists.collapse')"
            @more="expanded = true"
            @collapse="expanded = false"
          >
            <template #row="{ item: p }">
              <li>
                <component
                  :is="p.email ? 'label' : 'div'"
                  class="flex min-h-15 items-center gap-3 px-4 py-2"
                  :class="{ 'cursor-pointer': p.email }"
                >
                  <UiAvatar :avatar="p.avatar" />
                  <span class="flex min-w-0 grow flex-col">
                    <span class="truncate font-semibold">{{
                      fullName(p)
                    }}</span>
                    <span
                      v-if="p.email && followState(p) === 'toNotify'"
                      class="truncate text-[13px] text-toned"
                      >{{ t('adminEdition.screen.lists.series.toNotify') }} ·
                      {{ p.email }}</span
                    >
                    <span
                      v-else
                      class="flex min-w-0 items-center gap-1.25 text-[13px]"
                      :class="rowLook(p).tone"
                    >
                      <UIcon
                        :name="rowLook(p).icon"
                        class="size-3.5 shrink-0"
                        :class="rowLook(p).iconTone"
                      />
                      <span class="truncate">{{ rowLook(p).text }}</span>
                    </span>
                  </span>
                  <input
                    v-if="p.email"
                    type="checkbox"
                    class="size-6 shrink-0 accent-primary"
                    :checked="isSelected(p.participationId)"
                    :aria-label="
                      t('adminEdition.screen.emails.select', {
                        name: fullName(p),
                      })
                    "
                    @change="
                      toggle(
                        p.participationId,
                        ($event.target as HTMLInputElement).checked,
                      )
                    "
                  />
                  <NuxtLink
                    v-else
                    :to="`/admin/${slug}/personnes/${p.id}`"
                    class="flex min-h-11 shrink-0 items-center px-1 text-sm font-bold text-primary underline"
                    :aria-label="
                      t('adminEdition.screen.emails.addEmailLabel', {
                        name: fullName(p),
                      })
                    "
                    >{{ t('adminEdition.screen.emails.addEmail') }}</NuxtLink
                  >
                </component>
              </li>
            </template>
          </UiFoldedRows>
        </UiList>
      </section>

      <section v-if="first" class="flex flex-col gap-2">
        <UiSectionTitle>{{
          t('adminEdition.screen.emails.previewFor', { name: fullName(first) })
        }}</UiSectionTitle>
        <UiMessageBubble
          v-if="preview"
          :text="preview"
          :link="firstMessage?.link"
          data-testid="email-preview"
        />
        <USkeleton v-else class="h-28 w-[92%] rounded-2xl bg-skeleton" />
        <UButton
          variant="outline"
          color="neutral"
          icon="i-lucide-pencil"
          class="min-h-11 self-start rounded-full"
          :label="t('adminEdition.screen.emails.addNote')"
          @click="writing = !writing"
        />
        <UTextarea
          v-if="writing"
          v-model="note"
          :rows="2"
          :maxlength="NOTE_MAX"
          autoresize
          :aria-label="t('adminEdition.screen.emails.addNote')"
          class="w-full"
        />
        <p class="text-[13px] text-muted">
          {{ t('adminEdition.screen.emails.each') }}
        </p>
      </section>

      <div
        class="sticky bottom-0 -mx-4 flex flex-col gap-2 border-t border-divider bg-page/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur"
      >
        <UButton
          block
          size="xl"
          icon="i-lucide-mail"
          class="h-13 justify-center text-[17px] font-bold"
          :disabled="!selected.length || !preview || sendEmails.isPending.value"
          :loading="sending"
          :label="
            sending
              ? t('adminEdition.screen.emails.sending', {
                  count: selected.length,
                })
              : t('adminEdition.screen.emails.send', { count: selected.length })
          "
          @click="onSend"
        />
        <p class="text-center text-xs text-muted">
          {{ t('adminEdition.screen.emails.spam') }}
        </p>
      </div>
    </AdminQueryState>
  </AdminScreen>
</template>
