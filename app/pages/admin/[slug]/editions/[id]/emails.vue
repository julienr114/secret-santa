<script setup lang="ts">
import { preselectedForEmail, sortParticipants } from '#server/utils/editions';
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
// who gets it (those still to notify start ticked; people without an
// address can only get one), what it will look like, then send.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const id = computed(() => String(route.params.id));
const editionPath = computed(() => `/admin/${slug.value}/editions/${id.value}`);
const { t, tk } = useT();
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
const isSelected = (pid: string) => selected.value.includes(pid);
const toggle = (pid: string, on: boolean) => {
  selected.value = on
    ? [...selected.value, pid]
    : selected.value.filter((v) => v !== pid);
};
const allSelected = computed(
  () => selected.value.length === withEmail.value.length,
);
const toggleAll = () => {
  selected.value = allSelected.value
    ? []
    : withEmail.value.map((p) => p.participationId);
};

// The preview shows the message of the first one ticked.
const messages = useMessagesQuery(slug, id, type);
const first = computed(() =>
  participants.value.find((p) => isSelected(p.participationId)),
);
const note = ref('');
const writing = ref(false);
const preview = computed(() => {
  const message =
    first.value && messages.data.value?.messages[first.value.participationId];
  return message ? addNote(message.text, note.value, 'after') : undefined;
});

const sendEmails = useSendEmailsMutation(slug, id);
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
      onSuccess: () => {
        toast.add({
          title: t('adminEdition.cockpit.email.sent', {
            count: selected.value.length,
          }),
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
        <h2 class="text-xs font-bold tracking-wide text-muted uppercase">
          {{ t('adminEdition.screen.emails.message') }}
        </h2>
        <UTabs v-model="type" :items="tabs" :content="false" class="w-full" />
      </section>

      <section class="flex flex-col gap-2" data-testid="email-people">
        <div class="flex items-center justify-between gap-2">
          <p class="text-sm font-bold" data-testid="email-count">
            {{
              t('adminEdition.screen.emails.selected', {
                count: selected.length,
                total: participants.length,
              })
            }}
          </p>
          <UButton
            variant="link"
            class="min-h-11"
            :disabled="!withEmail.length"
            :label="
              allSelected
                ? t('adminEdition.screen.emails.selectNone')
                : t('adminEdition.screen.emails.selectAll')
            "
            @click="toggleAll"
          />
        </div>
        <ul
          class="divide-y divide-divider overflow-hidden rounded-lg bg-default ring-1 ring-default"
        >
          <li
            v-for="p in participants"
            :key="p.participationId"
            class="flex min-h-14 items-center gap-3 px-4 py-2"
          >
            <UiAvatar :avatar="p.avatar" size="sm" />
            <div class="min-w-0 grow">
              <p class="truncate font-semibold">{{ p.firstName }}</p>
              <p class="truncate text-xs text-muted">
                {{ p.email ?? t('adminEdition.screen.emails.noEmail') }}
              </p>
            </div>
            <UCheckbox
              v-if="p.email"
              :model-value="isSelected(p.participationId)"
              size="xl"
              :aria-label="
                t('adminEdition.screen.emails.select', { name: p.firstName })
              "
              class="flex size-11 items-center justify-center"
              @update:model-value="
                (on) => toggle(p.participationId, on === true)
              "
            />
            <UButton
              v-else
              variant="soft"
              size="sm"
              class="min-h-11"
              :to="`/admin/${slug}/personnes/${p.id}`"
              :label="t('adminEdition.screen.emails.addEmail')"
              :aria-label="
                t('adminEdition.screen.emails.addEmailLabel', {
                  name: p.firstName,
                })
              "
            />
          </li>
        </ul>
      </section>

      <section v-if="first" class="flex flex-col gap-2">
        <h2 class="text-xs font-bold tracking-wide text-muted uppercase">
          {{
            t('adminEdition.screen.emails.previewFor', {
              name: first.firstName,
            })
          }}
        </h2>
        <UiTextPreview v-if="preview" data-testid="email-preview">{{
          preview
        }}</UiTextPreview>
        <USkeleton v-else class="h-28 w-full rounded-lg bg-skeleton" />
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
          :disabled="!selected.length || !preview"
          :loading="sendEmails.isPending.value"
          :label="
            t('adminEdition.screen.emails.send', { count: selected.length })
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
