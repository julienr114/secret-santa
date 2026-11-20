<script setup lang="ts">
import { buildInviteMessage } from '#server/utils/invite';
import { MAX_PARTICIPANTS } from '#server/utils/editions';
import { formatEventDate } from '#server/utils/rules';
import {
  useDashboardQuery,
  useInviteLinkMutation,
  usePeopleQuery,
} from '~/composables/queries/useGroup';

// The invitation link of a group, closed by default. Once open: the
// message to share, as the guests will read it, then the link's settings,
// each saved from its own sheet (places left, last day) or written on its
// own page (the organiser's word, README 23.3), then a new link or none. Whoever opens the link
// logs in and joins the group.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const dashboard = useDashboardQuery(slug);
const group = computed(() => dashboard.data.value?.group);
const people = usePeopleQuery(slug);
/** What a draw can still take: by default, the link's places. */
const room = computed(() =>
  Math.max(
    1,
    MAX_PARTICIPANTS -
      (people.data.value?.persons ?? []).filter((p) => p.active).length,
  ),
);
const { t, locale } = useT();
const context = useScreenContext(slug);
useHead({
  title: () => context.titleOf(t('adminEdition.screen.empty.invite')),
});
const screen = computed(() => ({ back: `/f/${slug.value}/membres` }));
const errorMessage = useErrorMessage();
const toast = useMessages();
const mutation = useInviteLinkMutation(slug);
const opening = useBusy(() => mutation.isPending.value);

const code = computed(() => group.value?.inviteCode ?? null);
const url = computed(() =>
  code.value && import.meta.client
    ? `${window.location.origin}/rejoindre/${code.value}`
    : '',
);
const message = computed(() =>
  group.value && url.value
    ? buildInviteMessage(
        {
          groupName: group.value.name,
          url: url.value,
          until: group.value.inviteUntil,
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
  until: group.value?.inviteUntil ?? null,
  places: group.value?.invitePlaces ?? null,
  message: group.value?.inviteMessage ?? null,
  ...pending.value,
}));
const editing = ref<null | 'places' | 'until'>(null);
const sheetOpen = (which: 'places' | 'until') =>
  computed({
    get: () => editing.value === which,
    set: (value) => {
      editing.value = value ? which : null;
    },
  });
const placesOpen = sheetOpen('places');
const untilOpen = sheetOpen('until');
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
      <UiPageContext
        :parts="context.parts.value"
        :label="t('common.context')"
      />
      <UiPageTitle>{{ t('adminEdition.screen.empty.invite') }}</UiPageTitle>
      <p class="text-[15px] text-toned">
        {{ t('adminEdition.invite.description') }}
      </p>
    </div>
    <AdminQueryState
      :pending="dashboard.isPending.value"
      :error="dashboard.error.value"
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
            :value="String(settings.places ?? room)"
            :busy="savingKey('places')"
            :busy-label="t('common.actions.saving')"
            :on-click="() => (editing = 'places')"
          />
          <UiListItem
            :title="t('adminEdition.invite.until')"
            :value="untilValue"
            :busy="savingKey('until')"
            :busy-label="t('common.actions.saving')"
            :on-click="() => (editing = 'until')"
          />
          <UiListItem
            :title="t('adminEdition.invite.messageRow')"
            :value="messageValue"
            :to="`/f/${slug}/invitation/mot`"
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
      :max="MAX_PARTICIPANTS"
      :decrease-label="t('adminEdition.invite.fewer')"
      :increase-label="t('adminEdition.invite.more')"
      :validate-label="t('common.actions.validate')"
      :cancel-label="t('common.actions.cancel')"
      @validate="(places) => save({ places })"
    />
    <AdminDateSheet
      v-model:open="untilOpen"
      :title="t('adminEdition.invite.until')"
      :description="t('adminEdition.invite.untilHelp')"
      :label="t('adminEdition.invite.dateLabel')"
      :value="settings.until ?? ''"
      :clear-label="t('adminEdition.invite.noUntil')"
      @validate="(until) => save({ until: until || null })"
    />
  </AdminScreen>
</template>
