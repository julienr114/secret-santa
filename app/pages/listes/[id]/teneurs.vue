<script setup lang="ts">
import {
  useCancelInviteMutation,
  useHoldersQuery,
  useInviteHolderMutation,
  useListQuery,
  useRemoveHolderMutation,
} from '~/composables/queries/useLists';

// « Ceux qui tiennent la liste » (lot 25, README 22.20, maquette
// ListeTeneurs): the accounts that hold a list, all equal, each of whom
// may take another off, or leave, but the last one; the invitations
// waiting, each cancelled by « Annuler »; and an address to invite, who
// gets an email and has the list among theirs once logged in.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const id = computed(() => String(route.params.id));
const { t, locale } = useT();
const toast = useToast();
const errorMessage = useErrorMessage();
const list = useListQuery(id);
const query = useHoldersQuery(id);
const invite = useInviteHolderMutation(id);
const remove = useRemoveHolderMutation(id);
const cancel = useCancelInviteMutation(id);
const holders = computed(() => query.data.value?.holders ?? []);
const invites = computed(() => query.data.value?.invites ?? []);
useHead({
  title: () => `${t('lists.holders.title')} — ${t('common.appName')}`,
});
const context = computed(() => [
  { label: t('lists.home.title'), to: '/listes' },
  ...(list.data.value?.list.title
    ? [{ label: list.data.value.list.title, to: `/listes/${id.value}` }]
    : []),
]);
const day = (iso: string) =>
  new Intl.DateTimeFormat(locale.value, {
    day: 'numeric',
    month: 'long',
  }).format(new Date(iso));
const onError = (error: unknown) => {
  const why = (error as { statusMessage?: string }).statusMessage;
  toast.add({
    title:
      why === 'already_holder'
        ? t('lists.holders.alreadyHolder')
        : why === 'already_invited'
          ? t('lists.holders.alreadyInvited')
          : errorMessage(error),
    color: 'error',
  });
};

const email = ref('');
const onInvite = () => {
  const address = email.value.trim();
  if (!address) return;
  invite.mutate(address, {
    onSuccess: () => {
      email.value = '';
      toast.add({ title: t('lists.holders.invitedDone'), color: 'success' });
    },
    onError,
  });
};
const onRemove = (holder: { accountId: string; name: string; me: boolean }) =>
  remove.mutate(holder.accountId, {
    onSuccess: () => {
      toast.add({
        title: holder.me
          ? t('lists.holders.left')
          : t('lists.holders.removed', { name: holder.name }),
      });
      // The list I left is no longer mine to open.
      if (holder.me) return navigateTo('/listes', { replace: true });
    },
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
        <p class="text-[15px] text-toned">{{ t('lists.holders.intro') }}</p>
      </div>

      <UiList data-testid="holders">
        <UiListItem
          v-for="holder in holders"
          :key="holder.accountId"
          :title="holder.name"
          :subtitle="holder.me ? t('lists.holders.you') : undefined"
          :avatar="holder.avatar"
          data-testid="holder"
        >
          <template v-if="holders.length > 1" #trailing>
            <UButton
              variant="outline"
              color="neutral"
              class="min-h-11 font-semibold"
              :loading="remove.isPending.value"
              :label="
                holder.me ? t('lists.holders.leave') : t('lists.holders.remove')
              "
              @click="onRemove(holder)"
            />
          </template>
        </UiListItem>
        <UiListItem
          v-for="waiting in invites"
          :key="waiting.id"
          :title="waiting.email"
          :subtitle="
            t('lists.holders.invited', { date: day(waiting.createdAt) })
          "
          icon="i-lucide-mail"
          icon-tone="neutral"
          data-testid="holder-invite"
        >
          <template #trailing>
            <UButton
              variant="outline"
              color="neutral"
              class="min-h-11 font-semibold"
              :loading="cancel.isPending.value"
              :label="t('common.actions.cancel')"
              @click="cancel.mutate(waiting.id, { onError })"
            />
          </template>
        </UiListItem>
      </UiList>

      <form class="flex flex-col gap-2" @submit.prevent="onInvite">
        <label for="holder-email" class="text-[15px] font-semibold">{{
          t('lists.holders.inviteLabel')
        }}</label>
        <div class="flex gap-2">
          <UInput
            id="holder-email"
            v-model="email"
            type="email"
            inputmode="email"
            autocomplete="off"
            autocapitalize="none"
            size="xl"
            class="min-w-0 grow"
            :placeholder="t('lists.holders.emailPlaceholder')"
            :ui="{ base: 'h-12 text-base' }"
          />
          <UButton
            type="submit"
            class="h-12 shrink-0 px-5 font-bold"
            :disabled="!email.trim()"
            :loading="invite.isPending.value"
            :label="t('lists.holders.invite')"
          />
        </div>
        <p class="text-sm text-toned">{{ t('lists.holders.inviteHelp') }}</p>
      </form>
      <p class="text-sm text-toned">{{ t('lists.holders.seesAll') }}</p>
    </AdminQueryState>
  </AdminScreen>
</template>
