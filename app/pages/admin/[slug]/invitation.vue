<script setup lang="ts">
import { INVITE_MESSAGE_MAX, buildInviteMessage } from '#server/utils/invite';
import { MAX_PARTICIPANTS } from '#server/utils/editions';
import {
  useDashboardQuery,
  useInviteLinkMutation,
} from '~/composables/queries/useGroup';

// The invitation link of a group, closed by default: its settings (an
// optional last day, places, the organiser's words on its page), and once
// open, the message to copy or share, like the messages of a draw.
// Whoever opens the link logs in and joins the group.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const dashboard = useDashboardQuery(slug);
const group = computed(() => dashboard.data.value?.group);
const { t, locale } = useT();
useHead({
  title: () => `${t('adminEdition.invite.title')} — ${t('common.appName')}`,
});
const screen = computed(() => ({ back: `/admin/${slug.value}/personnes` }));
const errorMessage = useErrorMessage();
const toast = useToast();
const mutation = useInviteLinkMutation(slug);

const code = computed(() => group.value?.inviteCode ?? null);
const url = computed(() =>
  code.value && import.meta.client
    ? `${window.location.origin}/rejoindre/${code.value}`
    : '',
);
const message = computed(() =>
  group.value && url.value
    ? buildInviteMessage(
        {
          groupName: group.value.name,
          url: url.value,
          until: group.value.inviteUntil,
        },
        locale.value,
      )
    : '',
);

// The settings edit a draft; places left empty take the default.
const draft = reactive<{
  until: string;
  places: number | undefined;
  message: string;
}>({ until: '', places: undefined, message: '' });
watch(
  group,
  (g) => {
    if (!g) return;
    Object.assign(draft, {
      until: g.inviteUntil ?? '',
      places: g.invitePlaces ?? undefined,
      message: g.inviteMessage ?? '',
    });
  },
  { immediate: true },
);
const onError = (error: unknown) =>
  toast.add({ title: errorMessage(error), color: 'error' });
const onSave = () =>
  mutation.mutate(
    {
      open: true,
      until: draft.until || null,
      ...(draft.places ? { places: draft.places } : {}),
      message: draft.message.trim() || null,
    },
    {
      onSuccess: () =>
        toast.add({
          title: t('adminEdition.invite.saved'),
          color: 'success',
          icon: 'i-lucide-check',
        }),
      onError,
    },
  );
const onRenew = () => mutation.mutate({ open: true, renew: true }, { onError });
const onClose = () => mutation.mutate({ open: false }, { onError });

const copy = async () => {
  await navigator.clipboard.writeText(message.value);
  toast.add({
    title: t('adminEdition.invite.copied'),
    color: 'success',
    icon: 'i-lucide-clipboard-check',
  });
};
const share = () =>
  typeof navigator.share === 'function'
    ? navigator.share({ text: message.value }).catch(() => null)
    : copy();
</script>

<template>
  <AdminScreen v-bind="screen">
    <UiPageTitle>{{ t('adminEdition.invite.title') }}</UiPageTitle>
    <p class="text-sm text-muted">{{ t('adminEdition.invite.description') }}</p>
    <AdminQueryState
      :pending="dashboard.isPending.value"
      :error="dashboard.error.value"
    >
      <div class="flex flex-col gap-6">
        <section v-if="code" class="flex flex-col gap-2">
          <UiSectionTitle>{{
            t('adminEdition.invite.shareTitle')
          }}</UiSectionTitle>
          <UiTextPreview data-testid="invite-message">{{
            message
          }}</UiTextPreview>
          <div class="grid grid-cols-2 gap-2">
            <UButton
              block
              variant="soft"
              color="neutral"
              icon="i-lucide-copy"
              :label="t('adminEdition.invite.copyMessage')"
              @click="copy"
            />
            <UButton
              block
              icon="i-lucide-share-2"
              :label="t('adminEdition.invite.share')"
              @click="share"
            />
          </div>
        </section>

        <form
          id="invite-form"
          class="flex flex-col gap-4"
          novalidate
          @submit.prevent="onSave"
        >
          <UFormField
            :label="t('adminEdition.invite.until')"
            :help="t('adminEdition.invite.untilHelp')"
          >
            <UInput v-model="draft.until" type="date" class="w-full" />
          </UFormField>
          <UFormField
            :label="t('adminEdition.invite.places')"
            :help="t('adminEdition.invite.placesHelp')"
          >
            <UInputNumber
              v-model="draft.places"
              :min="1"
              :max="MAX_PARTICIPANTS"
              class="w-full"
            />
          </UFormField>
          <UFormField
            :label="t('adminEdition.invite.messageLabel')"
            :help="t('adminEdition.invite.messageHelp')"
          >
            <UTextarea
              v-model="draft.message"
              :maxlength="INVITE_MESSAGE_MAX"
              :rows="3"
              autoresize
              class="w-full"
            />
          </UFormField>
        </form>

        <div v-if="code" class="flex flex-col items-start">
          <UButton
            variant="link"
            color="neutral"
            size="sm"
            class="-ml-2.5"
            icon="i-lucide-refresh-cw"
            :loading="mutation.isPending.value"
            :label="t('adminEdition.invite.renew')"
            @click="onRenew"
          />
          <UButton
            variant="link"
            color="error"
            size="sm"
            class="-ml-2.5"
            icon="i-lucide-link-2-off"
            :label="t('adminEdition.invite.close')"
            @click="onClose"
          />
        </div>
      </div>
      <UButton
        type="submit"
        form="invite-form"
        block
        :loading="mutation.isPending.value"
        :label="
          code ? t('adminEdition.invite.save') : t('adminEdition.invite.create')
        "
      />
    </AdminQueryState>
  </AdminScreen>
</template>
