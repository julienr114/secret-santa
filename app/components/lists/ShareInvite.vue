<script setup lang="ts">
import {
  useInviteToListMutation,
  useListMembersQuery,
} from '~/composables/queries/useLists';

// « Quelqu'un d'autre », a level of the bar of a list (docs/spec/v3/
// listes.md, « Inviter quelqu'un », ticket 139; V3ListeInviter,
// V3ListeInviterEmail): a first name and an address, in lines (ticket
// 141); the person becomes a
// member of the list's event at once and gets an email in my name. Then
// back to the first level (`sent`). « Reprendre ceux d'un autre
// événement » goes one level further (`take`). At 30 members, it says so
// instead.
const props = defineProps<{ listId: string }>();
const emit = defineEmits<{ back: []; sent: []; take: [] }>();
/** What is being written, kept while the bar stays unrolled. */
const draft = defineModel<{ firstName: string; email: string }>({
  required: true,
});
const { t } = useT();
const toast = useMessages();
const errorMessage = useErrorMessage();
const members = useListMembersQuery(() => props.listId);
const invite = useInviteToListMutation(() => props.listId);
const uid = useId();
const full = computed(() => (members.data.value?.placesLeft ?? 1) <= 0);
const ready = computed(
  () =>
    draft.value.firstName.trim() !== '' &&
    /.+@.+\..+/.test(draft.value.email.trim()),
);
const failure = ref<unknown>(null);
const onInvite = () => {
  if (!ready.value) return;
  failure.value = null;
  invite.mutate(
    {
      firstName: draft.value.firstName.trim(),
      email: draft.value.email.trim(),
    },
    {
      onSuccess: () => {
        // The keyboard goes: the message stays at the bottom, never under
        // the bar.
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        toast.done(t('lists.inviteMembers.sent'));
        emit('sent');
      },
      onError: (error) => {
        failure.value = error;
      },
    },
  );
};
</script>

<template>
  <div class="flex flex-col gap-2" data-testid="share-invite">
    <ListsShareLevelTitle
      :title="t('lists.sharing.someoneElse')"
      @back="emit('back')"
    />
    <UiList v-if="full" class="mx-2" data-testid="invite-full">
      <UiListItem
        icon="i-lucide-users"
        icon-tone="neutral"
        :title="t('party.full.title')"
        :subtitle="t('party.full.text', { max: 30 })"
      />
    </UiList>
    <template v-else>
      <form class="flex flex-col gap-2" @submit.prevent="onInvite">
        <div class="border-y border-default">
          <UiTextField
            :id="`${uid}-name`"
            v-model="draft.firstName"
            inline
            :multiline="false"
            :label="t('lists.inviteMembers.firstName')"
            :maxlength="50"
            data-testid="invite-first-name"
          />
          <div class="border-t border-default">
            <UiTextField
              :id="`${uid}-email`"
              v-model="draft.email"
              inline
              :multiline="false"
              inputmode="email"
              :label="t('lists.inviteMembers.email')"
              :placeholder="t('adminGroup.personForm.emailPlaceholder')"
              data-testid="invite-address"
            />
          </div>
        </div>
        <!-- Ticket 130 (StopSaisie). -->
        <UiEmailBlockNote :email="draft.email" />
        <p
          v-if="members.data.value?.partyName"
          class="px-3.5 text-[13px] leading-[1.4] text-toned"
        >
          {{
            t('lists.inviteMembers.hint', {
              name: members.data.value.partyName,
            })
          }}
        </p>
        <UAlert
          v-if="failure"
          class="mx-2"
          color="error"
          variant="subtle"
          :description="errorMessage(failure)"
        />
        <div class="px-2">
          <UButton
            type="submit"
            block
            class="h-11 justify-center rounded-md text-[15px] font-bold"
            :disabled="!ready || invite.isPending.value"
            :loading="invite.isPending.value"
            :label="t('lists.inviteMembers.submit')"
            data-testid="invite-submit"
          />
        </div>
      </form>
      <button
        type="button"
        class="flex min-h-12 items-center gap-3 border-t border-default px-3.5 text-left text-[15px] font-semibold"
        data-share-focus="take"
        data-testid="invite-take"
        @click="emit('take')"
      >
        <span class="grow">{{ t('party.take.row') }}</span>
        <UIcon
          name="i-lucide-chevron-right"
          class="size-4 shrink-0 text-dimmed"
        />
      </button>
    </template>
  </div>
</template>
