<script setup lang="ts">
import {
  useInviteToListMutation,
  useListQuery,
} from '~/composables/queries/useLists';

// « Par son adresse email » (docs/spec/v3/listes.md, « Inviter
// quelqu'un », ticket 117): a first name and an address. The person is a
// member of the list's event at once, and gets an email in my name
// (V3ListePartageEmail); then back to « Inviter quelqu'un ».
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const id = computed(() => String(route.params.id));
const back = computed(() => `/listes/${id.value}/inviter`);
const { t } = useT();
const toast = useMessages();
const errorMessage = useErrorMessage();
const goBack = useGoBack();
const list = useListQuery(id);
const invite = useInviteToListMutation(id);
useHead({
  title: () => `${t('lists.inviteMembers.byEmail')} — ${t('common.appName')}`,
});
const context = computed(() =>
  list.data.value?.list.title
    ? [{ label: list.data.value.list.title, to: `/listes/${id.value}` }]
    : [],
);
const firstName = ref('');
const email = ref('');
const ready = computed(
  () => firstName.value.trim() !== '' && /.+@.+\..+/.test(email.value.trim()),
);
const failure = ref<unknown>(null);
/**
 * Invites them, then goes back.
 * @returns Nothing.
 */
const onInvite = () => {
  if (!ready.value) return;
  failure.value = null;
  const name = firstName.value.trim();
  invite.mutate(
    { firstName: name, email: email.value.trim() },
    {
      onSuccess: () => {
        toast.done(t('lists.inviteMembers.sent', { name }));
        goBack(back.value);
      },
      onError: (error) => {
        failure.value = error;
      },
    },
  );
};
</script>

<template>
  <AdminScreen :back="back">
    <div class="flex flex-col gap-1">
      <UiPageContext :parts="context" :label="t('common.context')" />
      <UiPageTitle>{{ t('lists.inviteMembers.byEmail') }}</UiPageTitle>
    </div>
    <form class="flex flex-col gap-4" @submit.prevent="onInvite">
      <UFormField :label="t('lists.inviteMembers.firstName')">
        <UInput
          v-model="firstName"
          size="xl"
          class="w-full"
          :maxlength="50"
          autocomplete="off"
          data-testid="invite-first-name"
        />
      </UFormField>
      <UFormField :label="t('lists.inviteMembers.email')">
        <UInput
          v-model="email"
          type="email"
          size="xl"
          class="w-full"
          inputmode="email"
          autocomplete="off"
          :placeholder="t('adminGroup.personForm.emailPlaceholder')"
          data-testid="invite-address"
        />
      </UFormField>
      <UAlert
        v-if="failure"
        color="error"
        variant="subtle"
        :description="errorMessage(failure)"
      />
      <UButton
        type="submit"
        block
        size="xl"
        class="h-13 justify-center text-[17px] font-bold"
        :disabled="!ready || invite.isPending.value"
        :loading="invite.isPending.value"
        :label="t('lists.inviteMembers.submit')"
        data-testid="invite-submit"
      />
    </form>
  </AdminScreen>
</template>
