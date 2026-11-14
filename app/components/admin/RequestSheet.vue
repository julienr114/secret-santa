<script setup lang="ts">
import {
  useDecideRequestMutation,
  type AdminAccountRow,
  type AppStats,
  type PendingRequest,
} from '~/composables/queries/useAdmin';
import { APP_GROUPS_COMFORT } from '#server/utils/quota';
import { fullName } from '#server/utils/people';
import { formatDay } from '~/utils/labels';

// A request for a group, answered like a decision: the asker's words, then
// what accepting changes (their quota, the load of the app against what
// the free plans carry), then two buttons of equal weight.
const props = defineProps<{
  account: AdminAccountRow;
  request: PendingRequest;
  stats: AppStats;
}>();
const open = defineModel<boolean>('open', { required: true });
const { t, locale } = useT();
const errorMessage = useErrorMessage();
const toast = useToast();

const who = computed(() => fullName(props.account) || props.account.email);
const LOAD_COLOR = { ok: 'success', near: 'warning', over: 'error' } as const;
const changes = computed(() => [
  {
    icon: 'i-lucide-trees',
    label: t('auth.admin.changeQuota'),
    before: props.account.groupQuota,
    after: Math.max(props.account.groupQuota, props.account.createdCount) + 1,
  },
  {
    icon: 'i-lucide-server',
    label: t('auth.admin.changeApp'),
    before: props.stats.groups,
    after: props.stats.groups + 1,
  },
]);

const decide = useDecideRequestMutation();
const onDecide = (approve: boolean) =>
  decide.mutate(
    { id: props.request.id, approve },
    {
      onSuccess: () => {
        open.value = false;
        toast.add({
          title: approve ? t('auth.admin.approved') : t('auth.admin.refused'),
          color: 'success',
          icon: 'i-lucide-check',
        });
      },
      onError: (error) =>
        toast.add({ title: errorMessage(error), color: 'error' }),
    },
  );
</script>

<template>
  <UDrawer
    v-model:open="open"
    :title="t('auth.admin.requestFrom', { name: who })"
    :description="
      t('auth.admin.requestSent', {
        date: formatDay(request.createdAt, locale),
      })
    "
  >
    <template #body>
      <div class="flex flex-col gap-6 py-2" data-testid="group-request">
        <p
          class="rounded-lg bg-muted/60 px-4 py-3 leading-relaxed break-words whitespace-pre-line"
        >
          {{ request.message }}
        </p>

        <section class="flex flex-col gap-3">
          <UiSectionTitle>{{ t('auth.admin.ifAccepted') }}</UiSectionTitle>
          <ul class="flex flex-col gap-2">
            <li
              v-for="change in changes"
              :key="change.label"
              class="flex items-center gap-3 text-sm"
            >
              <UIcon :name="change.icon" class="size-4 shrink-0 text-dimmed" />
              <span class="grow text-muted">{{ change.label }}</span>
              <span class="tabular-nums text-dimmed">{{ change.before }}</span>
              <UIcon
                name="i-lucide-arrow-right"
                class="size-3.5 shrink-0 text-dimmed"
              />
              <span class="font-semibold tabular-nums">{{ change.after }}</span>
            </li>
          </ul>
          <div class="flex flex-col gap-1.5" data-testid="app-load">
            <UProgress
              :model-value="Math.min(stats.groups + 1, APP_GROUPS_COMFORT)"
              :max="APP_GROUPS_COMFORT"
              :color="LOAD_COLOR[stats.load]"
              size="sm"
            />
            <p class="text-xs text-muted">
              {{
                stats.load === 'ok'
                  ? t('auth.admin.loadOk', {
                      count: stats.groups + 1,
                      max: APP_GROUPS_COMFORT,
                    })
                  : t(`auth.admin.load.${stats.load}`)
              }}
            </p>
          </div>
        </section>
      </div>
    </template>
    <template #footer>
      <div class="grid grid-cols-2 gap-2">
        <UButton
          block
          variant="outline"
          color="neutral"
          icon="i-lucide-x"
          :disabled="decide.isPending.value"
          :label="t('auth.admin.refuse')"
          @click="onDecide(false)"
        />
        <UButton
          block
          icon="i-lucide-check"
          :loading="decide.isPending.value"
          :label="t('auth.admin.approve')"
          @click="onDecide(true)"
        />
      </div>
      <p class="text-center text-xs text-dimmed">
        {{ t('auth.admin.notified') }}
      </p>
    </template>
  </UDrawer>
</template>
