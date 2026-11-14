<script setup lang="ts">
import { z } from 'zod';
import { formatEventDate } from '#server/utils/rules';
import { useInviteQuery, useJoinMutation } from '~/composables/queries/useAuth';
import { useLogoutMutation } from '~/composables/queries/useSession';

// An invitation link to a group (README 22.2). It says which group, its
// draw in progress and the organiser's words; someone without an account
// logs in or signs up with their address and comes back here; then one
// button joins the group. The organiser adds them to the draw.
const route = useRoute();
const code = computed(() => String(route.params.code));
const { t, locale, setLocale } = useT();
const errorMessage = useErrorMessage();
const invite = useInviteQuery(code);
const join = useJoinMutation(code);
const { loggedIn } = useUserSession();
useHead({ title: () => t('common.appName') });

const data = computed(() => invite.data.value);
const edition = computed(() => data.value?.edition ?? null);
const party = computed(() =>
  edition.value?.eventDate
    ? t('auth.invite.party', {
        date: formatEventDate(edition.value.eventDate, locale.value),
      })
    : null,
);
const joined = ref(false);
// The first name the group will see, from the profile when it has one.
const firstName = ref('');
watch(
  () => data.value?.account?.firstName,
  (name) => {
    if (name && !firstName.value) firstName.value = name;
  },
  { immediate: true },
);
const canJoin = computed(
  () => z.string().trim().min(1).safeParse(firstName.value).success,
);
const onJoin = () =>
  join.mutate(
    { firstName: firstName.value.trim() },
    {
      onSuccess: () => {
        joined.value = true;
      },
    },
  );
// Logged in with the wrong address: out, and back to the same invitation.
const logout = useLogoutMutation();
const onSwitch = () =>
  logout.mutate(undefined, { onSuccess: () => invite.refetch() });
</script>

<template>
  <div class="flex min-h-dvh flex-col">
    <header class="flex justify-end px-4 pt-[env(safe-area-inset-top)]">
      <LanguageSwitch class="mt-2" @change="setLocale" />
    </header>
    <UContainer
      as="main"
      class="flex max-w-sm grow flex-col justify-center gap-6 py-8"
    >
      <p class="text-center font-display text-lg font-bold text-primary">
        ✦ {{ t('common.appName') }}
      </p>
      <div
        v-if="invite.error.value"
        class="flex flex-col items-center gap-3 text-center"
      >
        <p class="text-4xl" aria-hidden="true">🔒</p>
        <p role="alert">{{ errorMessage(invite.error.value) }}</p>
      </div>
      <USkeleton
        v-else-if="!data"
        class="h-48 rounded-lg bg-skeleton"
        aria-busy="true"
      />
      <template v-else>
        <div class="flex flex-col items-center gap-2 text-center">
          <p class="text-5xl" aria-hidden="true">🎁</p>
          <p class="text-muted">{{ t('auth.invite.intro') }}</p>
          <h1 class="font-display text-3xl font-bold">
            {{ data.groupName }}
          </h1>
          <template v-if="edition">
            <p class="text-muted">
              {{ edition.label
              }}<template v-if="party"> · {{ party }}</template>
            </p>
            <p class="text-sm text-dimmed">
              {{ t('auth.invite.count', { count: edition.participants }) }}
            </p>
          </template>
        </div>

        <UiTextPreview v-if="data.message" data-testid="invite-words">{{
          data.message
        }}</UiTextPreview>

        <UiCard
          v-if="data.account?.path"
          padding="lg"
          class="flex flex-col gap-3"
        >
          <p class="text-center">{{ t('auth.invite.already') }}</p>
          <UButton
            :to="data.account.path"
            block
            icon="i-lucide-gift"
            :label="t('auth.invite.open')"
          />
        </UiCard>
        <UiCard v-else-if="joined || data.account?.member" padding="lg">
          <p class="text-center" role="status">
            {{ t('auth.invite.member') }}
          </p>
        </UiCard>
        <UiCard v-else-if="data.closed" padding="lg">
          <p class="text-center" role="alert">
            {{ t(`errors.${data.closed}`) }}
          </p>
        </UiCard>
        <UiCard v-else-if="loggedIn" padding="lg">
          <form class="flex flex-col gap-4" novalidate @submit.prevent="onJoin">
            <div
              v-if="data.account"
              class="flex flex-wrap items-center justify-between gap-x-2 text-sm"
              data-testid="invite-account"
            >
              <span class="min-w-0 truncate text-muted">
                {{ t('auth.invite.signedAs', { email: data.account.email }) }}
              </span>
              <UButton
                variant="link"
                color="neutral"
                size="sm"
                class="-mr-2.5"
                :loading="logout.isPending.value"
                :label="t('auth.invite.notMe')"
                @click="onSwitch"
              />
            </div>
            <UFormField
              :label="t('adminGroup.personForm.firstNameLabel')"
              :help="t('auth.invite.nameHelp')"
              required
            >
              <UInput
                v-model="firstName"
                autocomplete="given-name"
                class="w-full"
              />
            </UFormField>
            <UAlert
              v-if="join.isError.value"
              color="error"
              variant="subtle"
              :description="errorMessage(join.error.value)"
            />
            <UButton
              type="submit"
              block
              icon="i-lucide-user-plus"
              :disabled="!canJoin"
              :loading="join.isPending.value"
              :label="t('auth.invite.joinGroup')"
            />
          </form>
        </UiCard>
        <UiCard v-else padding="lg" class="flex flex-col gap-4">
          <p class="text-center text-sm text-muted">
            {{ t('auth.invite.loginFirst') }}
          </p>
          <AuthEmailLogin :next="`/rejoindre/${code}`" />
        </UiCard>
      </template>
    </UContainer>
  </div>
</template>
