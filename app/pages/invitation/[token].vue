<script setup lang="ts">
import { MEMBER_NAME_MAX } from '#server/utils/lists';
import {
  useAcceptInvitationMutation,
  useDeclineInvitationMutation,
  useInvitationQuery,
} from '~/composables/queries/useLists';
import { LOGIN } from '~/composables/queries/useSession';

// The page of an invitation to hold a list, opened by the link of its
// email (lot 25 bis, README 22.20, maquettes ListeInvitation,
// ListeInvitationCompte): who invites, to which list, what the level lets
// one do and not do. Without an account: a first name, the address the
// account will be created at, « Accepter, et créer mon compte », and a
// word on what the app is. With an account: the page speaks to the
// person, by the icon and first name of their account, and « Accepter
// l'invitation » logs in. Both open the list. « Non merci » refuses. The
// link acts once, by a button only: opening the page changes nothing.
// The sentence on the rules of use and the links « Signaler » and « Ne
// plus recevoir d'emails » come with lots 39 and 35.
const route = useRoute();
const token = computed(() => String(route.params.token));
const { t, locale } = useT();
const errorMessage = useErrorMessage();
const query = useInvitationQuery(token);
const accept = useAcceptInvitationMutation(token);
const decline = useDeclineInvitationMutation(token);
const { fetch: refreshSession } = useUserSession();
const data = computed(() => query.data.value);
useHead({
  title: () => `${t('lists.invitation.pageTitle')} — ${t('common.appName')}`,
});

/** The link leads nowhere: unknown, cancelled or replaced. */
const unknown = computed(
  () =>
    (query.error.value as { statusCode?: number } | null)?.statusCode === 404,
);
const firstName = ref('');
const name = computed(() => firstName.value.replace(/\s+/g, ' ').trim());
const needsName = computed(() => data.value?.account === null);
/** The sentence around the address, cut where the address goes in bold. */
const address = computed(() => {
  const [before = '', after = ''] = t('lists.invitation.address', {
    email: '\u0000',
  }).split('\u0000');
  return { before, after };
});
const failure = computed(() => accept.error.value ?? decline.error.value);
const onAccept = () => {
  if (needsName.value && !name.value) return;
  accept.mutate(
    needsName.value ? { firstName: name.value, language: locale.value } : {},
    {
      onSuccess: async ({ listId }) => {
        await refreshSession();
        await navigateTo(`/listes/${listId}`, { replace: true });
      },
      // Answered or expired meanwhile: the page says where it stands.
      onError: () => query.refetch(),
    },
  );
};
const onDecline = () =>
  decline.mutate(undefined, { onError: () => query.refetch() });
</script>

<template>
  <AuthScreen>
    <div
      v-if="query.isPending.value"
      class="flex justify-center pt-10"
      data-testid="invitation-loading"
    >
      <UiSpinner :label="t('common.loading')" />
    </div>
    <UiCard
      v-else-if="unknown || !data"
      class="flex flex-col gap-2 text-center"
      data-testid="invitation-unknown"
    >
      <h1 class="font-display text-[22px] leading-[1.2] font-semibold">
        {{
          unknown
            ? t('lists.invitation.unknown')
            : errorMessage(query.error.value)
        }}
      </h1>
      <p v-if="unknown" class="text-[15px] text-toned">
        {{ t('lists.invitation.unknownHelp') }}
      </p>
    </UiCard>
    <UiCard
      v-else-if="data.state === 'expired'"
      class="text-center"
      data-testid="invitation-expired"
    >
      <h1 class="font-display text-[22px] leading-[1.2] font-semibold">
        {{ t('lists.invitation.expired', { by: data.by }) }}
      </h1>
    </UiCard>
    <UiCard
      v-else-if="data.state === 'declined'"
      class="flex flex-col gap-2 text-center"
      data-testid="invitation-declined"
    >
      <h1 class="font-display text-[22px] leading-[1.2] font-semibold">
        {{ t('lists.invitation.declined') }}
      </h1>
      <p class="text-[15px] text-toned">
        {{ t('lists.invitation.declinedHelp', { by: data.by }) }}
      </p>
    </UiCard>
    <UiCard
      v-else-if="data.state === 'accepted'"
      class="flex flex-col gap-4 text-center"
      data-testid="invitation-accepted"
    >
      <div class="flex flex-col gap-2">
        <h1 class="font-display text-[22px] leading-[1.2] font-semibold">
          {{ t('lists.invitation.accepted') }}
        </h1>
        <p class="text-[15px] text-toned">
          {{ t('lists.invitation.acceptedHelp', { title: data.title }) }}
        </p>
      </div>
      <UButton
        block
        size="xl"
        icon="i-lucide-log-in"
        class="h-12 justify-center text-base font-bold"
        :to="`${LOGIN}?next=${encodeURIComponent(`/listes/${data.listId}`)}`"
        :label="t('lists.invitation.login')"
      />
    </UiCard>
    <template v-else>
      <div class="flex flex-col items-center gap-3 pt-2 text-center">
        <UiAvatar v-if="data.account" :avatar="data.account.avatar" :px="64" />
        <UiIllusTree v-else :label="t('common.appName')" />
        <h1
          class="font-display text-[28px] leading-[1.1] font-bold"
          data-testid="invitation-title"
        >
          {{
            data.account
              ? t('lists.invitation.titleNamed', {
                  name: data.account.name,
                  by: data.by,
                })
              : t('lists.invitation.title', { by: data.by })
          }}
        </h1>
        <p class="text-[17px] font-semibold">
          {{ t('lists.invitation.list', { title: data.title, by: data.by }) }}
        </p>
      </div>
      <UiCard class="flex flex-col gap-4">
        <ul class="flex flex-col gap-2 text-[15px] leading-[1.45]">
          <li class="flex gap-2.5">
            <UIcon
              name="i-lucide-check"
              class="mt-0.5 size-5 shrink-0 text-success"
            />
            {{ t('lists.invitation.writes') }}
          </li>
          <li class="flex gap-2.5">
            <UIcon
              name="i-lucide-check"
              class="mt-0.5 size-5 shrink-0 text-success"
            />
            {{ t('lists.invitation.sees') }}
          </li>
          <li
            class="flex gap-2.5"
            :class="data.level === 'manage' ? '' : 'text-toned'"
            data-testid="invitation-managing"
          >
            <UIcon
              :name="
                data.level === 'manage' ? 'i-lucide-check' : 'i-lucide-minus'
              "
              class="mt-0.5 size-5 shrink-0"
              :class="data.level === 'manage' ? 'text-success' : ''"
            />
            {{
              data.level === 'manage'
                ? t('lists.invitation.managing', { by: data.by })
                : t('lists.invitation.notManaging', { by: data.by })
            }}
          </li>
        </ul>
        <form class="flex flex-col gap-3" @submit.prevent="onAccept">
          <template v-if="needsName">
            <div class="flex flex-col gap-1.5">
              <label for="invitation-name" class="text-[15px] font-semibold">{{
                t('lists.invitation.firstName')
              }}</label>
              <UInput
                id="invitation-name"
                v-model="firstName"
                type="text"
                autocomplete="given-name"
                enterkeyhint="done"
                size="xl"
                :maxlength="MEMBER_NAME_MAX"
                :ui="{ base: 'h-12 text-base' }"
                data-testid="invitation-name"
              />
              <p class="text-[13px] text-toned">
                {{ t('lists.invitation.firstNameHelp') }}
              </p>
            </div>
            <p
              class="text-[15px] leading-[1.45] break-words text-toned"
              data-testid="invitation-address"
            >
              {{ address.before
              }}<strong class="font-bold text-highlighted">{{
                data.email
              }}</strong
              >{{ address.after }}
            </p>
          </template>
          <UButton
            type="submit"
            block
            size="xl"
            class="h-13 justify-center text-[17px] font-bold"
            :disabled="(needsName && !name) || decline.isPending.value"
            :loading="accept.isPending.value"
            :label="
              needsName
                ? t('lists.invitation.acceptCreate')
                : t('lists.invitation.accept')
            "
            data-testid="invitation-accept"
          />
          <UButton
            block
            variant="ghost"
            color="neutral"
            class="h-12 justify-center text-base font-bold"
            :disabled="accept.isPending.value"
            :loading="decline.isPending.value"
            :label="t('lists.invitation.decline')"
            data-testid="invitation-decline"
            @click="onDecline"
          />
          <p v-if="failure" class="text-sm text-error" role="alert">
            {{ errorMessage(failure) }}
          </p>
        </form>
        <p
          v-if="data.account"
          class="text-[13px] leading-[1.4] text-toned"
          data-testid="invitation-not-you"
        >
          {{ t('lists.invitation.notYou', { name: data.account.name }) }}
        </p>
      </UiCard>
      <p
        v-if="!data.account"
        class="rounded-xl bg-muted px-4 py-3 text-[13px] leading-[1.45] text-toned"
        data-testid="invitation-about"
      >
        {{ t('lists.invitation.about') }}
      </p>
    </template>
  </AuthScreen>
</template>
