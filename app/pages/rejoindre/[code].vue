<script setup lang="ts">
import { z } from 'zod';
import { partyEmoji } from '#shared/utils/categories';
import { invitePlace } from '#server/utils/invite';
import { dayAfter } from '#shared/utils/dates';
import { formatDay } from '~/utils/labels';
import { useInviteQuery, useJoinMutation } from '~/composables/queries/useAuth';
import { HOME, useLogoutMutation } from '~/composables/queries/useSession';

// The invitation link of a Secret Santa (ticket 116, V3FeteRejoindre,
// RejoindreConnecte, RejoindreFait, RejoindreFerme), in four states: the
// invitation with the login form; logged in, a first name and
// « Participer »; signed up (a participant of this Secret Santa, and so a
// member of its event); and the link that no longer lets anyone in (the
// draw has taken place, no place left, past its last day, turned off or
// unknown).
const route = useRoute();
const code = computed(() => String(route.params.code));
const { t, tk, locale } = useT();
const organizers = useOrganizers();
const errorMessage = useErrorMessage();
const invite = useInviteQuery(code);
useOrganizersOf(() => invite.data.value?.organizers);
const join = useJoinMutation(code);
const { loggedIn } = useUserSession();

const data = computed(() => invite.data.value);
const edition = computed(() => data.value?.edition ?? null);
/** The event, and the Secret Santa between brackets when it has several. */
const place = computed(() =>
  data.value ? invitePlace(data.value.groupName, data.value.santaName) : '',
);
/** « 🎄 Noël · le 25 décembre 2026 · 5 inscrits » (V3FeteRejoindre). */
const partyLine = computed(() => {
  const party = data.value?.party;
  if (!party) return null;
  const emoji = partyEmoji(party);
  return [
    [emoji, tk(`party.category.${party.category}`)].filter(Boolean).join(' '),
    party.date &&
      t('auth.invite.party', {
        date: new Intl.DateTimeFormat(locale.value, {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          timeZone: 'UTC',
        }).format(new Date(`${party.date}T12:00:00Z`)),
      }),
    t('auth.invite.signedUp', { count: edition.value?.participants ?? 0 }),
  ]
    .filter(Boolean)
    .join(' · ');
});

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
const onJoin = () => join.mutate({ firstName: firstName.value.trim() });
// Logged in with the wrong address: out, and back to the same invitation.
const logout = useLogoutMutation();
/** « Connecté avec », before the address shown in full on its own line. */
const signedAs = computed(
  () => t('auth.invite.signedAs', { email: '\u0000' }).split('\u0000')[0],
);
const onSwitch = () =>
  logout.mutate(undefined, { onSuccess: () => invite.refetch() });

/** Signed up: just now, or already a participant. */
const joined = computed(
  () => join.isSuccess.value || Boolean(data.value?.account?.joined),
);
/** The way to their page of the Secret Santa. */
const path = computed(
  () => join.data.value?.path ?? data.value?.account?.path ?? null,
);
/** What the welcome says under its title. */
const welcomeText = computed(() => {
  const label = edition.value?.label ?? '';
  return edition.value?.status === 'preparing'
    ? `${t('auth.invite.inDraw', { label })} ${t('auth.invite.notDrawnYet', { count: organizers.value })}`
    : t('auth.invite.inDraw', { label });
});

/** Why nobody can come in by this link, as a title and a line. */
const closed = computed(() => {
  const group = data.value?.groupName ?? '';
  if (invite.error.value) {
    return {
      title: t('auth.invite.invalid.title'),
      body: t('auth.invite.invalid.body'),
    };
  }
  if (data.value?.closed === 'invite_drawn') {
    return {
      title: t('auth.invite.drawn.title'),
      body: t('auth.invite.drawn.body', { group, count: organizers.value }),
    };
  }
  if (data.value?.closed === 'invite_full') {
    return {
      title: t('auth.invite.full.title'),
      body: t('auth.invite.full.body', { group, count: organizers.value }),
    };
  }
  if (data.value?.closed === 'invite_expired') {
    const after = data.value.expiredAfter;
    return {
      title: after
        ? t('auth.invite.expired.titleSince', {
            date: formatDay(dayAfter(after), locale.value),
          })
        : t('auth.invite.expired.title'),
      body: t('auth.invite.expired.body', { group, count: organizers.value }),
    };
  }
  return null;
});
</script>

<template>
  <AuthScreen>
    <!-- Its shape while it loads (regles-d-ecran.md), not a grey block. -->
    <UiSkeleton
      v-if="invite.isPending.value"
      :parts="['title', 'card']"
      :rows="2"
      :label="t('common.loading')"
      class="pt-6"
    />

    <div
      v-else-if="joined && data"
      class="flex flex-col gap-5 pt-6"
      data-testid="invite-joined"
    >
      <div class="flex flex-col items-center gap-2 text-center">
        <UiIllusParcels />
        <h1 class="font-display text-[30px] leading-[1.1] font-bold">
          {{ t('auth.invite.welcome', { group: data.groupName }) }}
        </h1>
        <p class="text-[15px] leading-[1.45] text-toned" role="status">
          {{ welcomeText }}
        </p>
      </div>
      <UiCard v-if="path" padding="lg" class="flex flex-col gap-3">
        <h2
          v-if="edition?.status === 'preparing'"
          class="font-display text-[22px] leading-[1.2] font-semibold"
        >
          {{ t('auth.invite.meanwhile') }}
        </h2>
        <UButton
          v-if="edition?.status === 'preparing'"
          :to="`${path}/liste`"
          block
          size="xl"
          class="h-12 justify-center font-bold"
          :label="t('auth.invite.hints')"
        />
        <UButton
          :to="path"
          block
          size="xl"
          :variant="edition?.status === 'preparing' ? 'link' : 'solid'"
          class="h-12 justify-center font-bold"
          :label="t('auth.invite.seeDraw')"
        />
      </UiCard>
      <UButton
        v-else
        :to="HOME"
        block
        size="xl"
        variant="outline"
        color="neutral"
        class="h-12 justify-center font-bold"
        :label="t('auth.invite.goHome')"
      />
      <p
        v-if="data.account"
        class="text-center text-[13px] leading-[1.4] text-toned"
      >
        {{ t('auth.invite.findIt', { email: data.account.email }) }}
      </p>
    </div>

    <div
      v-else-if="closed"
      class="flex flex-col items-center gap-3 pt-20 text-center"
      data-testid="invite-closed"
    >
      <UiEnvelope state="locked" />
      <h1 class="font-display text-[28px] leading-[1.15] font-bold">
        {{ closed.title }}
      </h1>
      <p class="text-[15px] leading-[1.5] text-toned" role="alert">
        {{ closed.body }}
      </p>
    </div>

    <template v-else-if="data">
      <div class="flex flex-col items-center gap-2 text-center">
        <UiIllusWreath :label="t('common.appName')" />
        <p class="text-[15px] text-toned">{{ t('auth.invite.intro') }}</p>
        <h1
          class="font-display text-[34px] leading-[1.05] font-bold text-primary-ink"
        >
          {{ place }}
        </h1>
        <p v-if="partyLine" class="text-[15px] text-toned">
          {{ partyLine }}
        </p>
      </div>

      <figure v-if="data.message" class="flex flex-col gap-1.5">
        <blockquote
          class="rounded-bubble rounded-bl-[6px] bg-muted px-3.5 py-3 leading-[1.45]"
          data-testid="invite-words"
        >
          {{ data.message }}
        </blockquote>
        <figcaption class="px-1 text-[13px] text-toned">
          {{ t('auth.invite.organiserWord', { count: organizers }) }}
        </figcaption>
      </figure>

      <UiCard v-if="loggedIn" padding="lg">
        <form class="flex flex-col gap-4" novalidate @submit.prevent="onJoin">
          <div
            v-if="data.account"
            class="flex items-center justify-between gap-3 text-sm"
            data-testid="invite-account"
          >
            <p class="min-w-0 text-toned">
              {{ signedAs
              }}<strong
                class="block font-semibold break-all text-highlighted"
                >{{ data.account.email }}</strong
              >
            </p>
            <UButton
              variant="link"
              class="-mr-2.5 min-h-11 shrink-0 font-bold text-primary-ink underline underline-offset-2"
              :loading="logout.isPending.value"
              :label="t('auth.invite.notMe')"
              @click="onSwitch"
            />
          </div>
          <UFormField
            :label="t('adminGroup.personForm.firstNameLabel')"
            :help="t('auth.invite.nameHelp')"
            :ui="{
              label: 'text-[15px] font-semibold',
              help: 'text-[13px] text-toned',
            }"
          >
            <UInput
              v-model="firstName"
              autocomplete="given-name"
              size="xl"
              class="w-full"
              :ui="{ base: 'h-12' }"
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
            size="xl"
            class="h-12 justify-center font-bold"
            :disabled="!canJoin || join.isPending.value"
            :loading="join.isPending.value"
            :label="
              join.isPending.value
                ? t('auth.invite.joining')
                : t('auth.invite.joinGroup')
            "
          />
        </form>
      </UiCard>
      <UiCard v-else padding="lg">
        <AuthEmailLogin
          :next="`/rejoindre/${code}`"
          :intro="t('auth.invite.loginFirst')"
          :tabs="false"
        />
      </UiCard>
    </template>
  </AuthScreen>
</template>
