<script setup lang="ts">
import { INVITE_MESSAGE_MAX } from '#server/utils/invite';
import { usePartyQuery } from '~/composables/queries/useParty';
import {
  useEditionQuery,
  useInviteLinkMutation,
} from '~/composables/queries/useGroup';

// The organiser's word on the page of a Secret Santa's link, on a page of
// its own (README 23.3, Correction 18, maquette GroupeInvitationMot):
// « Valider » fixed at the bottom, « Retour » gives the change up. The
// link's other settings are sent again unchanged.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const id = computed(() => String(route.params.id));
const { t } = useT();
const errorMessage = useErrorMessage();
const goBack = useGoBack();
const party = usePartyQuery(slug);
const edition = useEditionQuery(slug, id);
const invite = computed(() => edition.data.value?.invite);
const parts = computed(() => [
  { label: party.data.value?.party.name ?? '', to: `/e/${slug.value}` },
  {
    label: t('party.secretSanta.context', {
      year: edition.data.value?.edition.year ?? '',
    }),
    to: `/admin/${slug.value}/editions/${id.value}`,
  },
]);
useHead({
  title: () =>
    `${t('adminEdition.invite.messageRow')} — ${parts.value
      .map((part) => part.label)
      .join(' · ')} — ${t('common.appName')}`,
});
const parent = computed(
  () => `/admin/${slug.value}/editions/${id.value}/invitation`,
);
const screen = computed(() => ({ back: parent.value }));

const mutation = useInviteLinkMutation(slug, id);
const word = ref('');
watch(
  () => invite.value?.message,
  (message) => {
    word.value = message ?? '';
  },
  { immediate: true },
);
const saving = computed(() => mutation.isPending.value);
const failure = computed(() =>
  mutation.isError.value ? errorMessage(mutation.error.value) : null,
);
/**
 * Saves the word with the link's other settings as they are, then goes
 * back.
 * @returns Nothing: the mutation reports by itself.
 */
const onValidate = () =>
  mutation.mutate(
    {
      open: true,
      until: invite.value?.until ?? null,
      ...(invite.value?.places ? { places: invite.value.places } : {}),
      message: word.value.trim() || null,
    },
    { onSuccess: () => goBack(parent.value) },
  );
</script>

<template>
  <AdminScreen v-bind="screen">
    <AdminQueryState
      :pending="edition.isPending.value"
      :error="edition.error.value"
      :skeleton="['title', 'card']"
    >
      <div class="flex flex-col gap-1">
        <UiPageContext :parts="parts" :label="t('common.context')" />
        <UiPageTitle>{{ t('adminEdition.invite.messageRow') }}</UiPageTitle>
        <p class="mt-1 text-[15px] leading-[1.45] text-toned">
          {{ t('adminEdition.invite.messageHelp') }}
        </p>
      </div>
      <UiTextField
        id="invite-word"
        v-model="word"
        :label="t('adminGroup.rules.yourWord')"
        :maxlength="INVITE_MESSAGE_MAX"
      />
      <p v-if="failure" class="text-sm font-medium text-error" role="alert">
        {{ failure }}
      </p>
      <UiStickyFooter inline>
        <UButton
          block
          size="xl"
          class="h-13 justify-center text-[17px] font-bold"
          :loading="saving"
          :disabled="saving || !invite?.code"
          :label="t('common.actions.validate')"
          data-testid="invite-word-validate"
          @click="onValidate"
        />
      </UiStickyFooter>
    </AdminQueryState>
  </AdminScreen>
</template>
