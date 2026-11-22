<script setup lang="ts">
import {
  useListMembersQuery,
  useListQuery,
} from '~/composables/queries/useLists';

// « Inviter quelqu'un » to see a list (docs/spec/v3/listes.md, « Inviter
// quelqu'un », V3ListeInviter, ticket 117): whoever comes in by it sees
// the list and becomes a member of its event. Three lines: « Copier le
// lien » (« Copié », for a moment), « Par son adresse email », « Reprendre
// ceux d'un autre événement ». A list not shared with all the members of
// its event, or an event at 30, says so instead.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const id = computed(() => String(route.params.id));
const { t } = useT();
const toast = useMessages();
const list = useListQuery(id);
const members = useListMembersQuery(id);
useHead({
  title: () => `${t('lists.inviteMembers.title')} — ${t('common.appName')}`,
});
const doc = computed(() => list.data.value);
const context = computed(() =>
  doc.value?.list.title
    ? [{ label: doc.value.list.title, to: `/listes/${id.value}` }]
    : [],
);
const url = computed(() =>
  doc.value?.list.shareToken && import.meta.client
    ? `${window.location.origin}/l/${doc.value.list.shareToken}`
    : '',
);
const open = computed(() => members.data.value?.open ?? false);
const full = computed(() => (members.data.value?.placesLeft ?? 0) <= 0);

const copied = ref(false);
/**
 * Copies the link, and says so where it was touched.
 * @returns Once copied.
 */
const onCopy = async () => {
  if (!(await copyText(url.value))) {
    toast.failed(t('lists.share.copyFailed'));
    return;
  }
  copied.value = true;
  window.setTimeout(() => {
    copied.value = false;
  }, 2000);
};
</script>

<template>
  <AdminScreen :back="`/listes/${id}`">
    <AdminQueryState
      :pending="list.isPending.value || members.isPending.value"
      :error="list.error.value ?? members.error.value"
      :skeleton="['title', 'list']"
      :rows="3"
    >
      <div class="flex flex-col gap-1">
        <UiPageContext :parts="context" :label="t('common.context')" />
        <UiPageTitle>{{ t('lists.inviteMembers.title') }}</UiPageTitle>
        <p v-if="open && !full" class="text-[15px] text-toned">
          {{ t('lists.inviteMembers.subtitle') }}
        </p>
      </div>
      <UiList v-if="!open" data-testid="invite-closed">
        <UiListItem
          icon="i-lucide-lock"
          icon-tone="neutral"
          :title="t('lists.inviteMembers.closed')"
        />
      </UiList>
      <UiList v-else-if="full" data-testid="invite-full">
        <UiListItem
          icon="i-lucide-users"
          icon-tone="neutral"
          :title="t('party.full.title')"
          :subtitle="t('party.full.text', { max: 30 })"
        />
      </UiList>
      <UiList v-else data-testid="invite-ways">
        <UiListItem
          icon="i-lucide-link"
          :title="
            copied ? t('lists.share.copied') : t('lists.inviteMembers.copy')
          "
          :subtitle="url.replace(/^https?:\/\//, '')"
          :on-click="onCopy"
          data-testid="invite-copy"
        />
        <UiListItem
          :to="`/listes/${id}/inviter/email`"
          icon="i-lucide-mail"
          :title="t('lists.inviteMembers.byEmail')"
          :subtitle="t('lists.inviteMembers.byEmailHint')"
          data-testid="invite-email"
        />
        <UiListItem
          :to="`/listes/${id}/inviter/reprendre`"
          icon="i-lucide-users"
          :title="t('party.take.row')"
          data-testid="invite-take"
        />
      </UiList>
    </AdminQueryState>
  </AdminScreen>
</template>
