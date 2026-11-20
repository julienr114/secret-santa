<script setup lang="ts">
import { keys } from '~/composables/queries/keys';
import type { HolderLevel } from '#server/utils/listAccess';
import {
  useCancelInviteMutation,
  useHolderLevelMutation,
  useHoldersQuery,
  useInviteHolderMutation,
  useListQuery,
  useRemoveHolderMutation,
  useResendInviteMutation,
  type ListHolders,
} from '~/composables/queries/useLists';

// « Ceux qui tiennent la liste » (lots 25 and 25 bis, README 22.20,
// maquettes ListeTeneurs, ListeTeneursAdresse, ListeTeneursNiveau). Each
// line carries its level, « Gère la liste » or « Aide à écrire »: those
// who manage touch it to change it or to take the person off; the others
// read it, and may only leave. Then the invitations: waiting (until
// when), expired (« Renvoyer »), refused (« Effacer »). Under the list,
// for those who manage, « Inviter quelqu'un »: one row of pills, my
// people linked to an account then « Quelqu'un d'autre », which alone
// shows the address field; once someone is chosen, the level (« Aider à
// écrire » first) and the button, which names the action.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const id = computed(() => String(route.params.id));
const { t, tk, locale } = useT();
const toast = useMessages();
const errorMessage = useErrorMessage();
const list = useListQuery(id);
const query = useHoldersQuery(id);
// Live (lot 26): who else holds the list and has it open now, and the
// page follows what the others change.
const live = useListLive(
  () => `/api/lists/${id.value}/live`,
  () => [keys.holders(id.value)],
);
const isHere = (accountId: string) =>
  (live.presence.value?.holders ?? []).some(
    (holder) => holder.accountId === accountId,
  );
const invite = useInviteHolderMutation(id);
const remove = useRemoveHolderMutation(id);
const setLevel = useHolderLevelMutation(id);
const cancel = useCancelInviteMutation(id);
const resend = useResendInviteMutation(id);
const manages = computed(() => query.data.value?.manages ?? false);
const holders = computed(() => query.data.value?.holders ?? []);
const invites = computed(() => query.data.value?.invites ?? []);
const suggestions = computed(() => query.data.value?.suggestions ?? []);
type Holder = ListHolders['holders'][number];
type Invite = ListHolders['invites'][number];
useHead({
  title: () => `${t('lists.holders.title')} — ${t('common.appName')}`,
});
const context = computed(() => [
  { label: t('lists.home.title'), to: '/listes' },
  ...(list.data.value?.list.title
    ? [{ label: list.data.value.list.title, to: `/listes/${id.value}` }]
    : []),
]);
const day = (iso: string, month = true) =>
  new Intl.DateTimeFormat(locale.value, {
    day: 'numeric',
    ...(month ? { month: 'long' as const } : {}),
  }).format(new Date(iso));
/** « Invitée le 18 novembre · valable jusqu'au 25 », the month said once. */
const waitingLine = (waiting: Invite) => {
  const sameMonth =
    waiting.sentAt.slice(0, 7) === waiting.expiresAt.slice(0, 7);
  return t('lists.holders.invited', {
    date: day(waiting.sentAt),
    until: day(waiting.expiresAt, !sameMonth),
  });
};
/** « Invitation expirée · le 12 novembre », cut after its first words. */
const endedLine = (one: Invite) => {
  const [state = '', ...rest] = (
    one.state === 'expired'
      ? t('lists.holders.expired', { date: day(one.expiresAt) })
      : t('lists.holders.declined', {
          date: day(one.declinedAt ?? one.expiresAt),
        })
  ).split(' · ');
  return { state, rest: rest.join(' · ') };
};
const WHY: Record<string, string> = {
  already_holder: 'lists.holders.alreadyHolder',
  already_invited: 'lists.holders.alreadyInvited',
  holder_last: 'lists.holders.lastManager',
  holder_last_manager: 'lists.holders.lastManager',
  not_manager: 'lists.holders.notManager',
};
const onError = (error: unknown) => {
  const why = (error as { statusMessage?: string }).statusMessage ?? '';
  toast.failed(WHY[why] ? tk(WHY[why]) : errorMessage(error));
};

const onRemove = (holder: Holder) =>
  remove.mutate(holder.accountId, {
    onSuccess: () => {
      toast.done(
        holder.me
          ? t('lists.holders.left')
          : t('lists.holders.removed', { name: holder.name }),
      );
      // The list I left is no longer mine to open.
      if (holder.me) return navigateTo('/listes', { replace: true });
    },
    onError,
  });
/**
 * The only one who manages can neither leave nor be brought down: their
 * level is read, there is nothing to touch.
 */
const isLastManager = (holder: Holder) =>
  holder.level === 'manage' &&
  holders.value.filter((one) => one.level === 'manage').length === 1;
/** What touching the level of a line offers. */
const menuOf = (holder: Holder) => [
  // Each on its own, a thin line between them, as in the mockup.
  ...(manages.value
    ? (['write', 'manage'] as const).map((level) => [
        {
          label: t(`lists.holders.level.${level}`),
          description: t(`lists.holders.levelHelp.${level}`),
          // The check leads the level they have; the other keeps its place.
          icon: 'i-lucide-check',
          ui: holder.level === level ? {} : { itemLeadingIcon: 'invisible' },
          onSelect: () => {
            if (holder.level === level) return;
            setLevel.mutate(
              { accountId: holder.accountId, level },
              { onError },
            );
          },
        },
      ])
    : []),
  [
    {
      label: holder.me
        ? t('lists.holders.leave')
        : t('lists.holders.remove', { name: holder.name }),
      icon: 'i-lucide-check',
      ui: {
        itemLeadingIcon: 'invisible',
        itemLabel: 'text-primary-ink',
      },
      onSelect: () => onRemove(holder),
    },
  ],
];
const inviteMenu = (waiting: Invite) => [
  [
    {
      label: t('lists.holders.cancelInvite'),
      ui: { itemLabel: 'text-primary-ink' },
      onSelect: () => cancel.mutate(waiting.id, { onError }),
    },
  ],
];
const menuUi = {
  content:
    'w-[300px] rounded-[28px] shadow-[0_12px_28px_rgba(41,37,36,0.18)] ring-1 ring-default',
  group: 'p-0',
  item: 'items-start gap-2.5 px-3.5 py-3',
  itemLabel: 'text-base font-bold',
  itemDescription: 'text-[13px] leading-[1.4] text-toned whitespace-normal',
  itemLeadingIcon: 'size-[18px] text-primary-ink',
};
/** The level of a line, as a pill to touch. */
const LEVEL_BUTTON =
  'flex h-9 shrink-0 items-center gap-1 rounded-full bg-default pr-2 pl-3 text-sm font-bold ring-1 ring-default';
/** « Renvoyer », « Effacer ». */
const LINE_BUTTON =
  'flex h-9 shrink-0 items-center rounded-full bg-default px-3 text-sm font-bold ring-1 ring-default disabled:opacity-50';
/** The level read, not touched. */
const LEVEL_BADGE =
  'shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-bold whitespace-nowrap text-toned';

// « Inviter quelqu'un »: one of my people, by their pill, or an address.
const chosen = ref<string | 'other' | null>(null);
const email = ref('');
const level = ref<HolderLevel>('write');
const chosenMember = computed(() =>
  suggestions.value.find((member) => member.memberId === chosen.value),
);
// Someone invited meanwhile is no longer among the pills.
watch(suggestions, () => {
  if (chosen.value !== 'other' && !chosenMember.value) chosen.value = null;
});
const levelChoices = computed(() =>
  (['write', 'manage'] as const).map((value) => ({
    value,
    label: t(`lists.holders.choice.${value}.title`),
    hint: t(`lists.holders.choice.${value}.text`),
  })),
);
const ready = computed(() =>
  chosen.value === 'other' ? email.value.trim() !== '' : chosen.value !== null,
);
const onInvite = () => {
  if (!ready.value || !chosen.value) return;
  invite.mutate(
    chosen.value === 'other'
      ? { email: email.value.trim(), level: level.value }
      : { memberId: chosen.value, level: level.value },
    {
      onSuccess: () => {
        chosen.value = null;
        email.value = '';
        level.value = 'write';
        toast.done(t('lists.holders.invitedDone'));
      },
      onError,
    },
  );
};
const onResend = (expired: Invite) =>
  resend.mutate(expired.id, {
    onSuccess: () => toast.done(t('lists.holders.resent')),
    onError,
  });
</script>

<template>
  <AdminScreen :back="`/listes/${id}`">
    <AdminQueryState
      :pending="query.isPending.value"
      :error="query.error.value"
      :skeleton="['title', 'list', 'card']"
    >
      <div class="flex flex-col gap-1">
        <UiPageContext :parts="context" :label="t('common.context')" />
        <UiPageTitle>{{ t('lists.holders.title') }}</UiPageTitle>
      </div>

      <UiList data-testid="holders">
        <UiListItem
          v-for="holder in holders"
          :key="holder.accountId"
          :title="holder.name"
          :subtitle="
            holder.me
              ? t('lists.holders.you')
              : isHere(holder.accountId)
                ? t('lists.holders.here')
                : undefined
          "
          :avatar="holder.avatar"
          one-line
          data-testid="holder"
        >
          <template #trailing>
            <UDropdownMenu
              v-if="(manages || holder.me) && !isLastManager(holder)"
              :items="menuOf(holder)"
              :content="{ align: 'end' }"
              :ui="menuUi"
            >
              <button
                type="button"
                :class="LEVEL_BUTTON"
                :aria-label="t('lists.holders.levelOf', { name: holder.name })"
                data-testid="holder-level"
              >
                {{ t(`lists.holders.level.${holder.level}`) }}
                <UIcon name="i-lucide-chevron-down" class="size-4 text-muted" />
              </button>
            </UDropdownMenu>
            <span v-else :class="LEVEL_BADGE" data-testid="holder-level">{{
              t(`lists.holders.level.${holder.level}`)
            }}</span>
          </template>
        </UiListItem>
        <UiListItem
          v-for="one in invites"
          :key="one.id"
          :title="one.name ?? one.email"
          :subtitle="one.state === 'waiting' ? waitingLine(one) : undefined"
          :avatar="one.avatar ?? undefined"
          :icon="one.avatar ? undefined : 'i-lucide-mail'"
          icon-tone="neutral"
          :muted="one.state !== 'waiting'"
          one-line
          data-testid="holder-invite"
          :data-state="one.state"
        >
          <template v-if="one.state !== 'waiting'" #subtitle>
            <span class="font-bold text-primary-ink">{{
              endedLine(one).state
            }}</span>
            · {{ endedLine(one).rest }}
          </template>
          <template #trailing>
            <template v-if="one.state === 'waiting'">
              <UDropdownMenu
                v-if="manages"
                :items="inviteMenu(one)"
                :content="{ align: 'end' }"
                :ui="menuUi"
              >
                <button
                  type="button"
                  :class="LEVEL_BUTTON"
                  :aria-label="
                    t('lists.holders.levelOf', { name: one.name ?? one.email })
                  "
                  data-testid="invite-level"
                >
                  {{ t(`lists.holders.level.${one.level}`) }}
                  <UIcon
                    name="i-lucide-chevron-down"
                    class="size-4 text-muted"
                  />
                </button>
              </UDropdownMenu>
              <span v-else :class="LEVEL_BADGE">{{
                t(`lists.holders.level.${one.level}`)
              }}</span>
            </template>
            <button
              v-else-if="manages && one.state === 'expired'"
              type="button"
              :class="LINE_BUTTON"
              :disabled="resend.isPending.value"
              data-testid="invite-resend"
              @click="onResend(one)"
            >
              {{ t('lists.holders.resend') }}
            </button>
            <button
              v-else-if="manages"
              type="button"
              :class="LINE_BUTTON"
              :disabled="cancel.isPending.value"
              data-testid="invite-erase"
              @click="cancel.mutate(one.id, { onError })"
            >
              {{ t('lists.holders.erase') }}
            </button>
          </template>
        </UiListItem>
      </UiList>

      <form
        v-if="manages"
        class="flex flex-col gap-3 border-t border-default pt-4"
        data-testid="invite-form"
        @submit.prevent="onInvite"
      >
        <h2 class="font-display text-[22px] leading-[1.2] font-bold">
          {{ t('lists.holders.inviteTitle') }}
        </h2>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="member in suggestions"
            :key="member.memberId"
            type="button"
            class="flex h-11 items-center gap-2 rounded-full pr-3.5 pl-1.5 text-[15px] font-bold"
            :class="
              chosen === member.memberId
                ? 'bg-primary-tint ring-2 ring-primary ring-inset'
                : 'bg-default ring-1 ring-default ring-inset'
            "
            :aria-pressed="chosen === member.memberId"
            data-testid="invite-pill"
            @click="chosen = member.memberId"
          >
            <UiAvatar :avatar="member.avatar" size="sm" />
            {{ member.name }}
          </button>
          <button
            type="button"
            class="flex h-11 items-center gap-1.5 rounded-full px-3.5 text-[15px] font-bold text-primary-ink"
            :class="
              chosen === 'other'
                ? 'bg-primary-tint ring-2 ring-primary ring-inset'
                : 'border border-dashed border-accented'
            "
            :aria-pressed="chosen === 'other'"
            data-testid="invite-other"
            @click="chosen = 'other'"
          >
            <UIcon name="i-lucide-plus" class="size-4" />
            {{ t('lists.holders.someoneElse') }}
          </button>
        </div>
        <template v-if="chosen">
          <div v-if="chosen === 'other'" class="flex flex-col gap-1.5">
            <label for="holder-email" class="text-[15px] font-semibold">{{
              t('lists.holders.emailLabel')
            }}</label>
            <UInput
              id="holder-email"
              v-model="email"
              type="email"
              inputmode="email"
              autocomplete="off"
              autocapitalize="none"
              autofocus
              size="xl"
              :ui="{ base: 'h-12 text-base' }"
            />
            <p class="text-sm leading-[1.45] text-toned">
              {{ t('lists.holders.emailHelp') }}
            </p>
          </div>
          <UiChoiceList
            v-model="level"
            :choices="levelChoices"
            :label="t('lists.holders.can')"
            titled
            plain
          />
          <UButton
            type="submit"
            block
            size="xl"
            class="h-13 justify-center text-[17px] font-bold"
            :disabled="!ready"
            :loading="invite.isPending.value"
            :label="
              chosenMember
                ? t('lists.holders.inviteName', { name: chosenMember.name })
                : t('lists.holders.send')
            "
            data-testid="invite-send"
          />
          <p class="text-sm leading-[1.45] text-toned">
            {{ t('lists.holders.inviteHelp') }}
          </p>
        </template>
      </form>
      <p class="text-sm text-toned">{{ t('lists.holders.seesAll') }}</p>
    </AdminQueryState>
  </AdminScreen>
</template>
