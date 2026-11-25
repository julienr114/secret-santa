<script setup lang="ts">
import { buildInviteMessage, invitePlace } from '#server/utils/invite';
import { formatEventDate } from '#server/utils/rules';
import { MAX_PARTY_MEMBERS } from '#server/utils/parties';
import { usePartyQuery } from '~/composables/queries/useParty';
import {
  useEditionQuery,
  useInviteLinkMutation,
} from '~/composables/queries/useGroup';

// The invitation link of a Secret Santa (ticket 116, V3FeteInviter),
// closed by default. Once open: the message to share, as the guests will
// read it, then the link's settings, each saved from its own sheet (places
// left, last day) or written on its own page (the organiser's word, README
// 23.3), then a new link or none. Whoever opens the link logs in and signs
// up to this Secret Santa, and so becomes a member of its event. Once the
// draw is done, the link lets nobody in.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const id = computed(() => String(route.params.id));
const party = usePartyQuery(slug);
const edition = useEditionQuery(slug, id);
const invite = computed(() => edition.data.value?.invite);
/** What the event can still take: by default, the link's places. */
const room = computed(() => Math.max(1, invite.value?.room ?? 1));
const preparing = computed(
  () => edition.data.value?.edition.status === 'preparing',
);
const { t, locale } = useT();
const parts = computed(() => [
  { label: party.data.value?.party.name ?? '', to: `/e/${slug.value}` },
  {
    label: t('party.secretSanta.context', {
      year: edition.data.value?.edition.year ?? '',
    }),
    to: `/admin/${slug.value}/editions/${id.value}`,
  },
]);
useHead({
  title: () =>
    `${t('adminEdition.screen.empty.invite')} — ${parts.value
      .map((part) => part.label)
      .join(' · ')} — ${t('common.appName')}`,
});
const screen = computed(() => ({
  back: `/admin/${slug.value}/editions/${id.value}`,
}));
const errorMessage = useErrorMessage();
const toast = useMessages();
const mutation = useInviteLinkMutation(slug, id);
const opening = useBusy(() => mutation.isPending.value);

const code = computed(() => (preparing.value ? invite.value?.code : null));
const url = computed(() =>
  code.value && import.meta.client
    ? `${window.location.origin}/rejoindre/${code.value}`
    : '',
);
const message = computed(() =>
  party.data.value && url.value
    ? buildInviteMessage(
        {
          place: invitePlace(
            party.data.value.party.name,
            edition.data.value?.santaName ?? null,
          ),
          url: url.value,
          until: invite.value?.until ?? null,
        },
        locale.value,
      )
    : '',
);

/** Settings chosen and not yet confirmed by the server, shown at once. */
const pending = ref<
  Partial<{
    until: string | null;
    places: number | null;
    message: string | null;
  }>
>({});
/** The settings as shown, sent again with the one that changes. */
const settings = computed(() => ({
  until: invite.value?.until ?? null,
  places: invite.value?.places ?? null,
  message: invite.value?.message ?? null,
  ...pending.value,
}));
const editing = ref<null | 'places'>(null);
const sheetOpen = (which: 'places') =>
  computed({
    get: () => editing.value === which,
    set: (value) => {
      editing.value = value ? which : null;
    },
  });
const placesOpen = sheetOpen('places');
/**
 * Whether a setting is being saved.
 * @param key - The setting.
 * @returns True while its change is on its way.
 */
const savingKey = (key: 'until' | 'places') => key in pending.value;
/**
 * Saves one setting of the link, shown at once, its sheet closed; an
 * error puts the old value back with a toast (README 23.3).
 * @param change - The setting that changes.
 * @returns Nothing: errors are told in a toast.
 */
const save = (change: Partial<typeof settings.value>) => {
  editing.value = null;
  const next = { ...settings.value, ...change };
  pending.value = { ...pending.value, ...change };
  mutation.mutate(
    {
      open: true,
      until: next.until,
      ...(next.places ? { places: next.places } : {}),
      message: next.message?.trim() || null,
    },
    {
      onSettled: () => {
        pending.value = {};
      },
      onError,
    },
  );
};
/**
 * Shows an error in a toast.
 * @param failure - The error of a mutation.
 * @returns Nothing.
 */
const onError = (failure: unknown) => toast.failed(errorMessage(failure));
const onOpen = () => mutation.mutate({ open: true }, { onError });
const confirming = ref<null | 'renew' | 'close'>(null);
const onRenew = () =>
  mutation.mutate(
    { open: true, renew: true },
    {
      onSuccess: () => {
        confirming.value = null;
      },
      onError,
    },
  );
const onClose = () =>
  mutation.mutate(
    { open: false },
    {
      onSuccess: () => {
        confirming.value = null;
      },
      onError,
    },
  );

/**
 * Copies the message to share.
 * @returns Once copied.
 */
const copy = async () => {
  await navigator.clipboard.writeText(message.value);
  toast.done(t('adminEdition.invite.copied'));
};
/**
 * Opens the phone's share sheet, or copies where there is none.
 * @returns Once shared or copied.
 */
const share = () =>
  typeof navigator.share === 'function'
    ? navigator.share({ text: message.value }).catch(() => null)
    : copy();
const untilValue = computed(() =>
  settings.value.until
    ? formatEventDate(settings.value.until, locale.value)
    : t('adminEdition.invite.none'),
);
const messageValue = computed(() =>
  settings.value.message
    ? `« ${settings.value.message} »`
    : t('adminEdition.invite.noWords'),
);
</script>

<template>
  <AdminScreen v-bind="screen">
    <div class="flex flex-col gap-1">
      <UiPageContext :parts="parts" :label="t('common.context')" />
      <UiPageTitle>{{ t('adminEdition.screen.empty.invite') }}</UiPageTitle>
      <p class="text-[15px] text-toned">
        {{ t('adminEdition.invite.description') }}
      </p>
    </div>
    <AdminQueryState
      :pending="edition.isPending.value"
      :error="edition.error.value"
      :skeleton="['card', 'list']"
      :rows="3"
    >
      <UiCard
        padding="md"
        class="flex flex-col gap-3"
        data-testid="invite-card"
      >
        <template v-if="code">
          <UiMessageBubble
            :text="message"
            :link="url"
            class="max-w-[96%]"
            data-testid="invite-message"
          />
          <UButton
            block
            size="xl"
            icon="i-lucide-share-2"
            class="h-12 justify-center font-bold"
            :ui="{ leadingIcon: 'size-5' }"
            :label="t('adminEdition.invite.shareLink')"
            @click="share"
          />
          <UButton
            block
            variant="ghost"
            icon="i-lucide-copy"
            class="h-11 justify-center text-[15px] font-semibold text-primary-ink"
            :label="t('adminEdition.invite.copyMessage')"
            @click="copy"
          />
        </template>
        <p v-else-if="!preparing" class="text-sm text-toned">
          {{ t('adminEdition.invite.afterDraw') }}
        </p>
        <template v-else>
          <p class="text-sm text-toned">
            {{ t('adminEdition.invite.closed') }}
          </p>
          <UButton
            block
            size="xl"
            icon="i-lucide-link"
            class="h-12 justify-center font-bold"
            :disabled="mutation.isPending.value"
            :loading="opening"
            :label="t('adminEdition.invite.create')"
            @click="onOpen"
          />
        </template>
      </UiCard>

      <template v-if="code">
        <UiList :title="t('adminEdition.invite.settings')">
          <UiListItem
            :title="t('adminEdition.invite.places')"
            :value="
              invite?.room === 0
                ? t('party.full.paused')
                : String(settings.places ?? room)
            "
            :busy="savingKey('places')"
            :busy-label="t('common.actions.saving')"
            :on-click="() => (editing = 'places')"
          />
          <UiListItem
            :title="t('adminEdition.invite.until')"
            :value="untilValue"
            :busy="savingKey('until')"
            :busy-label="t('common.actions.saving')"
            :to="`/admin/${slug}/editions/${id}/invitation/date`"
          />
          <UiListItem
            :title="t('adminEdition.invite.messageRow')"
            :value="messageValue"
            :to="`/admin/${slug}/editions/${id}/invitation/mot`"
            data-testid="invite-word"
          />
        </UiList>

        <UiList>
          <UiListItem
            v-if="confirming !== 'renew'"
            icon="i-lucide-rotate-ccw"
            icon-tone="neutral"
            :title="t('adminEdition.invite.renew')"
            :subtitle="t('adminEdition.invite.renewHint')"
            :on-click="() => (confirming = 'renew')"
          />
          <li v-else class="flex flex-col gap-2 px-4 py-3">
            <p class="text-sm">{{ t('adminEdition.invite.renewConfirm') }}</p>
            <div class="flex gap-2">
              <UButton
                class="min-h-11"
                :loading="mutation.isPending.value"
                :label="t('adminEdition.invite.renew')"
                @click="onRenew"
              />
              <UButton
                variant="ghost"
                color="neutral"
                class="min-h-11"
                :label="t('common.actions.cancel')"
                @click="confirming = null"
              />
            </div>
          </li>
          <UiListItem
            v-if="confirming !== 'close'"
            icon="i-lucide-x"
            tone="danger"
            :title="t('adminEdition.invite.close')"
            :subtitle="t('adminEdition.invite.closeHint')"
            :on-click="() => (confirming = 'close')"
          />
          <li v-else class="flex flex-col gap-2 px-4 py-3">
            <p class="text-sm">{{ t('adminEdition.invite.closeConfirm') }}</p>
            <div class="flex gap-2">
              <UButton
                color="error"
                class="min-h-11"
                :loading="mutation.isPending.value"
                :label="t('adminEdition.invite.close')"
                @click="onClose"
              />
              <UButton
                variant="ghost"
                color="neutral"
                class="min-h-11"
                :label="t('common.actions.cancel')"
                @click="confirming = null"
              />
            </div>
          </li>
        </UiList>
      </template>
    </AdminQueryState>

    <UiNumberSheet
      v-model:open="placesOpen"
      :title="t('adminEdition.invite.places')"
      :description="t('adminEdition.invite.placesHelp')"
      :value="settings.places ?? room"
      :hint="t('adminEdition.invite.capacity', { count: room })"
      :min="1"
      :max="MAX_PARTY_MEMBERS"
      :decrease-label="t('adminEdition.invite.fewer')"
      :increase-label="t('adminEdition.invite.more')"
      :validate-label="t('common.actions.validate')"
      :cancel-label="t('common.actions.cancel')"
      @validate="(places) => save({ places })"
    />
  </AdminScreen>
</template>
