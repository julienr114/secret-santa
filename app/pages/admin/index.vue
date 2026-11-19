<script setup lang="ts">
import { APP_GROUPS_COMFORT } from '#server/utils/quota';
import { fullName } from '#server/utils/people';
import {
  useAdminAccountsQuery,
  type PendingRequest,
} from '~/composables/queries/useAdmin';
import { formatDay } from '~/utils/labels';

// The administration, for super-admins only: the oldest request for a
// group in a card (« Traiter » opens its page, where it is accepted or
// refused), laid on a stack when more wait, « À traiter · 1 sur N »; once
// answered, it leaves and the next one rises in its place. None, a line. Then how full the app is, and
// the accounts, the groups and the style guide.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t, locale } = useT();
useHead({ title: () => `${t('auth.admin.title')} — ${t('common.appName')}` });
const screen = computed(() => ({ back: '/' }));

const query = useAdminAccountsQuery();
const accounts = computed(() => query.data.value?.accounts ?? []);
const requests = computed(() => query.data.value?.requests ?? []);
const stats = computed(
  () =>
    query.data.value?.stats ?? { groups: 0, active: 0, load: 'ok' as const },
);
/** The request in the card: the oldest. */
const first = computed(() => requests.value[0] ?? null);
const kicker = computed(() =>
  requests.value.length > 1
    ? t('auth.admin.oneOf', { count: requests.value.length })
    : t('auth.admin.oneRequest'),
);
/**
 * The account that made a request.
 * @param request - The request.
 * @returns Its account, if listed.
 */
const accountOf = (request: PendingRequest) =>
  accounts.value.find((account) => account.id === request.accountId);
/**
 * How someone asking is named: their name, or their address.
 * @param request - The request.
 * @returns The name to show.
 */
const nameOf = (request: PendingRequest) => {
  const account = accountOf(request);
  return (account && fullName(account)) || request.email;
};
/**
 * The line under the name: the address, unless it is the title, and the
 * day of the request.
 * @param request - The request.
 * @returns « lea@example.com · le 14 novembre », or « le 14 novembre ».
 */
const lineOf = (request: PendingRequest) =>
  [
    nameOf(request) !== request.email && request.email,
    t('auth.admin.onDay', { date: formatDay(request.createdAt, locale.value) }),
  ]
    .filter(Boolean)
    .join(' · ');
const disabledCount = computed(
  () => accounts.value.filter((account) => account.disabled).length,
);
const accountsLine = computed(() =>
  [
    t('auth.admin.accounts', { count: accounts.value.length }),
    disabledCount.value > 0 &&
      t('auth.admin.disabledCount', { count: disabledCount.value }),
  ]
    .filter(Boolean)
    .join(' · '),
);
const groupsLine = computed(() =>
  [
    t('auth.admin.groupsCount', { count: stats.value.groups }),
    t('auth.admin.activeDraws', { count: stats.value.active }),
  ].join(' · '),
);
/** What accepting every request waiting would make of the app. */
const capacityCaption = computed(() =>
  requests.value.length > 0
    ? t('auth.admin.ifAllAccepted', {
        count: requests.value.length,
        groups: t('auth.admin.groupsCount', {
          count: stats.value.groups + requests.value.length,
        }),
      })
    : t('auth.admin.capacityHint'),
);
</script>

<template>
  <AdminScreen v-bind="screen">
    <div class="flex flex-col gap-1">
      <UiPageTitle>{{ t('auth.admin.title') }}</UiPageTitle>
      <p class="text-[15px] text-toned">{{ t('auth.admin.reserved') }}</p>
    </div>
    <AdminQueryState
      :pending="query.isPending.value"
      :error="query.error.value"
      :skeleton="['card', 'card', 'list']"
      :rows="3"
    >
      <!-- Once answered, the card leaves to the left and the next one
           rises from the stack. -->
      <Transition
        mode="out-in"
        enter-active-class="transition duration-250 ease-out motion-reduce:transition-none"
        enter-from-class="opacity-0 motion-safe:translate-y-3 motion-safe:scale-[0.97]"
        leave-active-class="transition duration-200 ease-in motion-reduce:transition-none"
        leave-to-class="opacity-0 motion-safe:-translate-x-10"
      >
        <UiStack v-if="first" :key="first.id" :behind="requests.length - 1">
          <UiCard
            padding="lg"
            class="flex flex-col gap-3.5"
            data-testid="admin-request"
          >
            <div class="flex flex-col gap-1">
              <p
                class="text-xs font-bold tracking-[0.04em] text-primary-ink uppercase"
              >
                {{ kicker }}
              </p>
              <div class="flex items-center gap-2.5">
                <UiAvatar
                  v-if="accountOf(first)"
                  :avatar="accountOf(first)!.avatar"
                  class="size-10 text-lg"
                />
                <div class="flex min-w-0 flex-col">
                  <h2
                    class="truncate font-display text-xl leading-[1.2] font-semibold"
                  >
                    {{ nameOf(first) }}
                  </h2>
                  <p class="truncate text-[13px] text-toned">
                    {{ lineOf(first) }}
                  </p>
                </div>
              </div>
            </div>
            <p
              class="rounded-md bg-muted px-3 py-2.5 text-[15px] leading-[1.45] break-words whitespace-pre-line"
            >
              {{ first.message }}
            </p>
            <UButton
              block
              class="h-12 justify-center text-base font-bold"
              :label="t('auth.admin.handle')"
              :to="`/admin/demandes/${first.id}`"
            />
          </UiCard>
        </UiStack>
        <UiCard
          v-else
          key="none"
          padding="none"
          class="flex items-center gap-3 px-4 py-3.5"
          data-testid="admin-request"
        >
          <span
            class="flex size-8 shrink-0 items-center justify-center rounded-full bg-success-soft text-success-ink"
            aria-hidden="true"
          >
            <UIcon name="i-lucide-check" class="size-4" />
          </span>
          <p class="font-semibold">{{ t('auth.admin.noRequest') }}</p>
        </UiCard>
      </Transition>

      <UiCard padding="lg" class="flex flex-col gap-3" data-testid="capacity">
        <div class="flex items-baseline justify-between gap-2">
          <h2 class="font-display text-xl font-semibold">
            {{ t('auth.admin.capacity') }}
          </h2>
          <p class="text-sm font-bold">
            {{
              t('auth.admin.capacityCount', {
                count: stats.groups,
                max: APP_GROUPS_COMFORT,
              })
            }}
          </p>
        </div>
        <AdminCapacityBar :groups="stats.groups" :caption="capacityCaption" />
      </UiCard>

      <UiList :title="t('auth.admin.seeAll')">
        <UiListItem
          to="/admin/comptes"
          icon="i-lucide-users"
          :title="t('auth.admin.accountsTitle')"
          :subtitle="accountsLine"
        />
        <UiListItem
          to="/admin/groupes"
          icon="i-lucide-file-text"
          :title="t('auth.admin.groupsShort')"
          :subtitle="groupsLine"
        />
        <UiListItem
          to="/admin/guide-de-style"
          icon="i-lucide-sliders-horizontal"
          icon-tone="neutral"
          :title="t('auth.admin.styleGuide')"
          :subtitle="t('auth.admin.styleGuideHint')"
        />
      </UiList>
    </AdminQueryState>
  </AdminScreen>
</template>
