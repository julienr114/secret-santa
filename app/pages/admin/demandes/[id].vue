<script setup lang="ts">
import { fullName } from '#server/utils/people';
import { DECISION_NOTE_MAX } from '#server/utils/loginEmail';
import { useAdminAccountsQuery } from '~/composables/queries/useAdmin';
import { formatDay } from '~/utils/labels';

// A request for a group, answered on a page of its own (README 23.3,
// Correction 18, maquettes AdminDemandePage and AdminDemandePageMot): who
// asks and when, their words, a word for them, typed or ready-made, added
// to the email of the answer, then what accepting changes (the groups they
// may create, the groups of the app against what the free plans carry);
// « Refuser » and « Accepter », of the same weight, fixed at the bottom.
// Once answered, back to the administration, where the next one waits.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const id = computed(() => String(route.params.id));
const { t, locale } = useT();
const goBack = useGoBack();
const screen = { back: '/admin' };
const context = computed(() => [
  { label: t('auth.admin.title'), to: '/admin' },
]);

const query = useAdminAccountsQuery();
const request = computed(
  () => query.data.value?.requests.find((r) => r.id === id.value) ?? null,
);
const account = computed(() =>
  request.value
    ? query.data.value?.accounts.find((a) => a.id === request.value!.accountId)
    : undefined,
);
const stats = computed(
  () =>
    query.data.value?.stats ?? { groups: 0, active: 0, load: 'ok' as const },
);
const who = computed(
  () =>
    (account.value && fullName(account.value)) || request.value?.email || '',
);
useHead({
  title: () =>
    `${t('auth.admin.requestFrom', { name: who.value })} — ${t('common.appName')}`,
});
const changes = computed(() =>
  account.value
    ? [
        {
          label: t('auth.admin.changeQuota'),
          before: account.value.groupQuota,
          after:
            Math.max(account.value.groupQuota, account.value.createdCount) + 1,
        },
        {
          label: t('auth.admin.changeApp'),
          before: stats.value.groups,
          after: stats.value.groups + 1,
        },
      ]
    : [],
);

const { decide, deciding } = useDecideRequest();
const busy = computed(() => deciding(id.value));
const note = ref('');
/** The ready-made words, each with its button. */
const PRESETS = ['welcome', 'full', 'close'] as const;
const presets = computed(() =>
  PRESETS.map((preset) => ({
    preset,
    label: t(`auth.admin.note.${preset}`),
    text: t(`auth.admin.note.${preset}Text`),
  })),
);
/**
 * Answers the request with the word written, then goes back.
 * @param approve - True to accept it.
 * @returns Nothing.
 */
const onDecide = (approve: boolean) =>
  decide(
    id.value,
    approve,
    () => goBack('/admin'),
    note.value.trim() || undefined,
  );
</script>

<template>
  <AdminScreen v-bind="screen">
    <AdminQueryState
      :pending="query.isPending.value"
      :error="query.error.value"
      :skeleton="['title', 'card', 'list']"
    >
      <div class="flex flex-col gap-1">
        <UiPageContext :parts="context" :label="t('common.context')" />
        <template v-if="request">
          <UiPageTitle>{{
            t('auth.admin.requestFrom', { name: who })
          }}</UiPageTitle>
          <p class="text-[15px] leading-[1.45] text-toned">
            {{
              t('auth.admin.requestSent', {
                date: formatDay(request.createdAt, locale),
              })
            }}
          </p>
        </template>
        <p v-else class="text-[15px] text-toned" data-testid="request-gone">
          {{ t('auth.admin.noRequest') }}
        </p>
      </div>
      <template v-if="request">
        <blockquote
          class="rounded-[16px_16px_16px_4px] bg-muted px-3.5 py-3 text-[15px] leading-[1.45] break-words whitespace-pre-line"
          data-testid="group-request"
        >
          {{ request.message }}
        </blockquote>
        <UiTextField
          id="request-note"
          v-model="note"
          :label="t('auth.admin.note.label')"
          :optional="t('auth.admin.note.optional')"
          :maxlength="DECISION_NOTE_MAX"
          :rows="3"
          :placeholder="t('auth.admin.note.placeholder')"
          :hint="t('auth.admin.note.hint')"
        >
          <div
            role="group"
            :aria-label="t('auth.admin.note.presets')"
            class="flex flex-wrap gap-2"
          >
            <button
              v-for="item in presets"
              :key="item.preset"
              type="button"
              :aria-pressed="note === item.text"
              class="h-10 rounded-full px-3.5 text-sm"
              :class="
                note === item.text
                  ? 'bg-primary-soft font-bold text-primary-ink ring-[1.5px] ring-primary'
                  : 'bg-default font-semibold ring-1 ring-default'
              "
              @click="note = item.text"
            >
              {{ item.label }}
            </button>
          </div>
        </UiTextField>
        <UiList :title="t('auth.admin.ifAccepted')">
          <li
            v-for="change in changes"
            :key="change.label"
            class="flex min-h-12 items-center gap-2.5 px-4 py-2 text-[15px]"
          >
            <span class="grow">{{ change.label }}</span>
            <span class="text-toned tabular-nums">{{ change.before }}</span>
            <UIcon
              name="i-lucide-arrow-right"
              class="size-3.5 shrink-0 text-dimmed"
            />
            <strong class="tabular-nums">{{ change.after }}</strong>
          </li>
        </UiList>
        <AdminCapacityBar
          :groups="stats.groups + 1"
          :caption="
            stats.load === 'ok' ? undefined : t(`auth.admin.load.${stats.load}`)
          "
        />
        <UiStickyFooter>
          <div class="grid grid-cols-2 gap-2.5">
            <UButton
              block
              variant="outline"
              color="neutral"
              class="h-13 justify-center text-base font-bold"
              :disabled="busy"
              :loading="deciding(request.id, false)"
              :label="t('auth.admin.refuse')"
              @click="onDecide(false)"
            />
            <UButton
              block
              class="h-13 justify-center text-[17px] font-bold"
              :disabled="busy"
              :loading="deciding(request.id, true)"
              :label="t('auth.admin.approve')"
              @click="onDecide(true)"
            />
          </div>
        </UiStickyFooter>
      </template>
    </AdminQueryState>
  </AdminScreen>
</template>
