<script setup lang="ts">
import { APP_GROUPS_COMFORT, remainingSecretSantas } from '#server/utils/quota';
import {
  useAdminAccountsQuery,
  useSwitchMutation,
  type AppSwitches,
} from '~/composables/queries/useAdmin';

// The administration, for super-admins only (docs/spec/v3/administration.md,
// V3Admin): how full the app is, the accounts, the parties and the style
// guide; then what to watch, numbers and not badges since nothing waits
// (the accounts at their limit of Secret Santa, the parties at 30
// members), and what to watch today (ticket 129: requests refused for
// their rate, failed logins, emails rejected, server errors); the caps
// of the emails with their gauges; then the three emergency switches.
// No request to answer any more. The rest of V3Admin comes with ticket
// 127.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t, locale } = useT();
useHead({ title: () => `${t('auth.admin.title')} — ${t('common.appName')}` });
const screen = computed(() => ({ back: '/' }));

const query = useAdminAccountsQuery();
const accounts = computed(() => query.data.value?.accounts ?? []);
const stats = computed(
  () =>
    query.data.value?.stats ?? {
      groups: 0,
      active: 0,
      fullParties: 0,
      load: 'ok' as const,
    },
);
const atLimit = computed(
  () =>
    accounts.value.filter(
      (account) => !account.disabled && remainingSecretSantas(account) === 0,
    ).length,
);
const errorMessage = useErrorMessage();
const toast = useMessages();
const switches = useSwitchMutation();
/** The switches as just tapped, until the server has them. */
const tapped = ref<Partial<AppSwitches>>({});
/**
 * Whether a switch is on, as tapped or as the server has it.
 * @param name - The switch.
 * @returns True when on.
 */
const isOn = (name: keyof AppSwitches) =>
  tapped.value[name] ?? query.data.value?.switches[name] ?? false;
/**
 * Turns an emergency switch on or off (tickets 109 and 129).
 * @param name - The switch.
 * @param on - Its new state.
 * @returns Nothing: errors are told in a toast.
 */
const onSwitch = (name: keyof AppSwitches, on: boolean) => {
  tapped.value = { ...tapped.value, [name]: on };
  switches.mutate(
    { [name]: on },
    {
      onSettled: () => {
        const { [name]: _done, ...rest } = tapped.value;
        tapped.value = rest;
      },
      onError: (error) => toast.failed(errorMessage(error)),
    },
  );
};
const EMERGENCY = [
  {
    name: 'emails',
    title: 'pauseEmails',
    help: 'pauseEmailsHelp',
    testid: 'pause-emails',
  },
  {
    name: 'signups',
    title: 'pauseSignups',
    help: 'pauseSignupsHelp',
    testid: 'pause-signups',
  },
  {
    name: 'newSecretSantas',
    title: 'pauseSecretSantas',
    help: 'pauseSecretSantasHelp',
    testid: 'pause-secret-santas',
  },
] as const;
/** What to watch today (ticket 129): numbers, nothing waits. */
const today = computed(() => {
  const counts = query.data.value?.today;
  return [
    { key: 'rateLimited', count: counts?.rateLimited ?? 0 },
    { key: 'loginFailed', count: counts?.loginFailed ?? 0 },
    { key: 'emailsRejected', count: counts?.emailsRejected ?? 0 },
    { key: 'serverErrors', count: counts?.serverErrors ?? 0 },
  ] as const;
});
const number = (value: number) =>
  new Intl.NumberFormat(locale.value).format(value);
/** The caps of the emails, with their gauges. */
const caps = computed(() => {
  const data = query.data.value?.caps;
  return data
    ? ([
        { key: 'emailsDay', gauge: data.emailsDay },
        { key: 'emailsMonth', gauge: data.emailsMonth },
      ] as const)
    : [];
});
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
        <AdminCapacityBar
          :groups="stats.groups"
          :caption="t('auth.admin.capacityHint')"
        />
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

      <UiList :title="t('auth.admin.watch')" data-testid="watch">
        <UiListItem
          to="/admin/comptes"
          :title="t('auth.admin.atLimitCount')"
          :value="String(atLimit)"
          data-testid="watch-at-limit"
        />
        <UiListItem
          to="/admin/groupes"
          :title="t('auth.admin.fullParties')"
          :value="String(stats.fullParties)"
          data-testid="watch-full-parties"
        />
        <UiListItem
          v-for="line in today"
          :key="line.key"
          :title="t(`auth.admin.${line.key}`)"
          :value="number(line.count)"
          :data-testid="`watch-${line.key}`"
        />
      </UiList>

      <UiList
        :title="t('auth.admin.caps')"
        :footer="t('auth.admin.capsHint')"
        data-testid="caps"
      >
        <li
          v-for="cap in caps"
          :key="cap.key"
          class="flex flex-col gap-2 px-4 py-3"
          :data-testid="`cap-${cap.key}`"
        >
          <div class="flex items-baseline justify-between gap-3">
            <span class="font-semibold">{{ t(`auth.admin.${cap.key}`) }}</span>
            <span
              class="text-sm font-bold"
              :class="cap.gauge.warn ? 'text-warning-ink' : 'text-toned'"
              >{{
                t('auth.admin.capValue', {
                  used: number(cap.gauge.used),
                  cap: number(cap.gauge.cap),
                })
              }}</span
            >
          </div>
          <UProgress
            :model-value="Math.min(cap.gauge.used, cap.gauge.cap)"
            :max="cap.gauge.cap"
            size="sm"
            :color="cap.gauge.warn ? 'warning' : 'primary'"
          />
        </li>
      </UiList>

      <UiList
        :title="t('auth.admin.emergency')"
        :footer="t('auth.admin.emergencyHint')"
      >
        <UiListItem
          v-for="one in EMERGENCY"
          :key="one.name"
          :checked="isOn(one.name)"
          :title="t(`auth.admin.${one.title}`)"
          :subtitle="t(`auth.admin.${one.help}`)"
          :busy="switches.isPending.value && one.name in tapped"
          :data-testid="one.testid"
          @update:checked="(on) => onSwitch(one.name, Boolean(on))"
        />
      </UiList>
    </AdminQueryState>
  </AdminScreen>
</template>
