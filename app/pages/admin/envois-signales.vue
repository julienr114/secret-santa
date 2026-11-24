<script setup lang="ts">
import { useQueryClient } from '@tanstack/vue-query';
import { api, useApiQuery } from '~/composables/queries/useApi';
import type { ReportedParty } from '#server/database/emailBlocks';
import { formatDay } from '~/utils/labels';

// « Envois signalés » (ticket 130), for super-admins only: the emails an
// organiser sent that their readers reported, by event, the latest
// first, with who sent them; « Couper ses emails » stops what the
// organisers of the event send. Disabling an account is on its page.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t, locale } = useT();
const toast = useMessages();
const errorMessage = useErrorMessage();
useHead({
  title: () => `${t('auth.admin.reportedTitle')} — ${t('common.appName')}`,
});
const screen = computed(() => ({ back: '/admin' }));
const query = useApiQuery<{ parties: ReportedParty[] }>(
  () => ['admin', 'reported-sends'],
  () => '/api/admin/reported-sends',
);
const queryClient = useQueryClient();
const cutting = ref<string | null>(null);
/**
 * Cuts the emails of an event, or lets them go again.
 * @param party - The event.
 * @param off - True to cut them.
 */
const onCut = async (party: ReportedParty, off: boolean) => {
  cutting.value = party.partyId;
  try {
    await api(`/api/admin/reported-sends/${party.partyId}`, {
      method: 'PATCH',
      body: { emailsOff: off },
    });
    await queryClient.invalidateQueries({
      queryKey: ['admin', 'reported-sends'],
    });
  } catch (error) {
    toast.failed(errorMessage(error));
  } finally {
    cutting.value = null;
  }
};
/** Who sent the emails of an event. */
const senders = (party: ReportedParty) =>
  party.senders
    .map((sender) => sender.email ?? t('auth.admin.reportedUnknown'))
    .join(', ');
</script>

<template>
  <AdminScreen v-bind="screen">
    <UiPageTitle>{{ t('auth.admin.reportedTitle') }}</UiPageTitle>
    <AdminQueryState
      :pending="query.isPending.value"
      :error="query.error.value"
      :skeleton="['list']"
    >
      <p
        v-if="(query.data.value?.parties.length ?? 0) === 0"
        class="px-1 text-[15px] text-toned"
      >
        {{ t('auth.admin.reportedNone') }}
      </p>
      <UiList
        v-for="party in query.data.value?.parties ?? []"
        :key="party.partyId"
        :title="party.name"
        :footer="t('auth.admin.reportedBy', { who: senders(party) })"
        data-testid="reported-party"
      >
        <UiListItem
          :to="`/e/${party.slug}`"
          :title="
            t('auth.admin.reportedCount', {
              count: party.reports,
              date: formatDay(party.last, locale),
            })
          "
        />
        <UiListItem
          :checked="party.emailsOff"
          :title="t('auth.admin.cutEmails')"
          :subtitle="t('auth.admin.cutEmailsHelp')"
          :busy="cutting === party.partyId"
          data-testid="cut-emails"
          @update:checked="(on) => onCut(party, Boolean(on))"
        />
      </UiList>
    </AdminQueryState>
  </AdminScreen>
</template>
