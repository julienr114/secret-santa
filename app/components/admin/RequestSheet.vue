<script setup lang="ts">
import type {
  AdminAccountRow,
  AppStats,
  PendingRequest,
} from '~/composables/queries/useAdmin';
import { fullName } from '#server/utils/people';
import { formatDay } from '~/utils/labels';

// A request for a group, answered like a decision: who asks and when,
// their words, what accepting changes (the groups they may create, the
// groups of the app against what the free plans carry), then « Refuser »
// and « Accepter », of the same weight.
const props = defineProps<{
  account: AdminAccountRow;
  request: PendingRequest;
  stats: AppStats;
}>();
const open = defineModel<boolean>('open', { required: true });
const { t, locale } = useT();
const { decide, deciding } = useDecideRequest();

const who = computed(() => fullName(props.account) || props.account.email);
const changes = computed(() => [
  {
    label: t('auth.admin.changeQuota'),
    before: props.account.groupQuota,
    after: Math.max(props.account.groupQuota, props.account.createdCount) + 1,
  },
  {
    label: t('auth.admin.changeApp'),
    before: props.stats.groups,
    after: props.stats.groups + 1,
  },
]);
const busy = computed(() => deciding(props.request.id));
/**
 * Answers the request, then closes the sheet.
 * @param approve - True to accept it.
 * @returns Nothing.
 */
const onDecide = (approve: boolean) =>
  decide(props.request.id, approve, () => {
    open.value = false;
  });
</script>

<template>
  <UiSheet
    v-model:open="open"
    :title="t('auth.admin.requestFrom', { name: who })"
    :busy="busy"
    :ui="{ container: 'gap-4' }"
  >
    <template #header>
      <div class="flex w-full items-center gap-3">
        <UiAvatar :avatar="account.avatar" class="size-12 text-[22px]" />
        <div class="flex min-w-0 flex-col gap-0.5">
          <h2
            class="font-display text-[22px] leading-[1.15] font-bold break-words"
          >
            {{ t('auth.admin.requestFrom', { name: who }) }}
          </h2>
          <p class="text-sm text-toned">
            {{
              t('auth.admin.requestSent', {
                date: formatDay(request.createdAt, locale),
              })
            }}
          </p>
        </div>
      </div>
    </template>
    <div class="flex flex-col gap-4" data-testid="group-request">
      <p
        class="rounded-[10px] bg-muted px-3 py-2.5 text-[15px] leading-[1.45] break-words whitespace-pre-line"
      >
        {{ request.message }}
      </p>
      <section class="flex flex-col gap-2">
        <h3
          class="font-sans text-xs font-bold tracking-[0.04em] text-toned uppercase"
        >
          {{ t('auth.admin.ifAccepted') }}
        </h3>
        <ul class="flex flex-col gap-1.5">
          <li
            v-for="change in changes"
            :key="change.label"
            class="flex items-center gap-2.5 text-sm"
          >
            <span class="grow text-toned">{{ change.label }}</span>
            <span class="text-toned tabular-nums">{{ change.before }}</span>
            <UIcon
              name="i-lucide-arrow-right"
              class="size-3.5 shrink-0 text-dimmed"
            />
            <strong class="text-[15px] tabular-nums">{{ change.after }}</strong>
          </li>
        </ul>
        <AdminCapacityBar
          :groups="stats.groups + 1"
          :caption="
            stats.load === 'ok' ? undefined : t(`auth.admin.load.${stats.load}`)
          "
        />
      </section>
    </div>
    <template #footer>
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
    </template>
  </UiSheet>
</template>
