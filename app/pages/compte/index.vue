<script setup lang="ts">
import { LOCALES, type Locale } from '#shared/i18n';
import { deviceIcon } from '#shared/utils/devices';
import type { Avatar } from '#server/utils/avatars';
import {
  useRevokeAllMutation,
  useRevokeSessionMutation,
} from '~/composables/queries/useAuth';
import { LOGIN, useLogoutMutation } from '~/composables/queries/useSession';
import { formatDay } from '~/utils/labels';

// « Mon compte »: the icon with its pencil and the address, the profile
// in rows saved at once, the names written on their rows (ticket 162),
// the language in its sheet, « Me prévenir » (ticket 121), the devices the
// account is logged in on (this one, and « Déconnecter » for the others),
// then « Déconnecter partout » and « Se déconnecter de cet appareil ».
definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t, tk, locale } = useT();
const errorMessage = useErrorMessage();
const toast = useMessages();
useHead({ title: () => `${t('auth.account.title')} — ${t('common.appName')}` });
const screen = computed(() => ({ back: '/' }));

const { account, shown, save, saving, commit } = useProfileSaver();
const data = computed(() => account.data.value);
/** The address, and « Super-admin » for one. */
const subtitle = computed(() =>
  [data.value?.email, data.value?.isSuperAdmin && t('auth.account.superAdmin')]
    .filter(Boolean)
    .join(' · '),
);
const avatar = computed({
  get: () => shown.value.avatar ?? { emoji: '🎁', color: 'brick' as const },
  set: (next: Avatar) => save({ avatar: next }),
});

const languageOpen = ref(false);
const languages = computed(() =>
  LOCALES.map((value) => ({ value, label: tk(`common.language.${value}`) })),
);
/**
 * Keeps the language of the emails.
 * @param language - The language.
 * @returns Nothing.
 */
const onLanguage = (language: Locale) => {
  languageOpen.value = false;
  save({ language });
};

// Another device is logged out with its own button.
const revokeOne = useRevokeSessionMutation();
/**
 * Logs another device out.
 * @param id - Its session.
 * @returns Nothing: the mutation reports by itself.
 */
const onRevokeOne = (id: string) =>
  revokeOne.mutate(id, {
    onSuccess: () => toast.done(t('auth.account.revoked')),
    onError: (error) => toast.failed(errorMessage(error)),
  });

const revokeAll = useRevokeAllMutation();
const confirming = ref(false);
/**
 * Logs every device out, this one included.
 * @returns Nothing: on success the login page opens.
 */
const onRevokeAll = () =>
  revokeAll.mutate(undefined, {
    onSuccess: () => navigateTo(LOGIN, { replace: true }),
    onError: (error) => {
      confirming.value = false;
      toast.failed(errorMessage(error));
    },
  });
const logout = useLogoutMutation();
/**
 * Logs this device out.
 * @returns Nothing: on success the login page opens.
 */
const onLogout = () =>
  logout.mutate(undefined, {
    onSuccess: () => navigateTo(LOGIN, { replace: true }),
    onError: (error) => toast.failed(errorMessage(error)),
  });
</script>

<template>
  <AdminScreen v-bind="screen">
    <AdminQueryState
      :pending="account.isPending.value"
      :error="account.error.value"
      :skeleton="['header', 'list', 'list']"
      :rows="3"
    >
      <template v-if="data">
        <AdminPersonHeader
          v-model:avatar="avatar"
          :title="t('auth.account.title')"
          :subtitle="subtitle"
          :avatar-title="t('adminGroup.avatar.title')"
        />

        <UiList
          :title="t('auth.account.profile')"
          :footer="t('auth.account.profileHint')"
          data-testid="profile"
        >
          <!-- Written on their rows (ticket 162). -->
          <UiInlineTextRow
            :label="t('adminGroup.personForm.firstNameLabel')"
            :value="shown.firstName ?? null"
            required
            :maxlength="60"
            :save="(firstName) => commit({ firstName })"
            data-testid="account-first-name"
          />
          <UiInlineTextRow
            :label="t('adminGroup.personForm.lastNameLabel')"
            :value="shown.lastName ?? null"
            :maxlength="60"
            :save="(lastName) => commit({ lastName: lastName || null })"
            data-testid="account-last-name"
          />
          <UiListItem
            :title="t('auth.account.language')"
            :value="tk(`common.language.${shown.language ?? locale}`)"
            :busy="saving('language')"
            :busy-label="t('common.actions.saving')"
            :on-click="() => (languageOpen = true)"
          />
        </UiList>

        <!-- « Me prévenir » (ticket 121): its page, its choice on the row. -->
        <UiList>
          <UiListItem
            :title="t('news.settings.title')"
            :value="t(`news.settings.${shown.emailNews ?? 'summary'}`)"
            to="/compte/me-prevenir"
            data-testid="account-notify"
          />
        </UiList>

        <UiList
          :title="t('auth.account.devices')"
          :footer="t('auth.account.devicesHint')"
          data-testid="devices"
        >
          <UiListItem
            v-for="session in data.sessions"
            :key="session.id"
            :icon="deviceIcon(session.device)"
            icon-tone="neutral"
            :title="session.device ?? t('auth.account.unknownDevice')"
            :subtitle="
              session.current
                ? t('auth.account.connectedOn', {
                    date: formatDay(session.createdAt, locale),
                  })
                : t('auth.account.lastSeen', {
                    date: formatDay(session.lastSeenAt, locale),
                  })
            "
            :chevron="false"
          >
            <template #trailing>
              <UBadge
                v-if="session.current"
                color="success"
                variant="subtle"
                size="md"
                class="shrink-0 rounded-full font-bold"
                :label="t('auth.account.current')"
              />
              <UButton
                v-else
                variant="outline"
                color="neutral"
                class="min-h-11 shrink-0 rounded-full px-3.5 font-bold"
                :loading="
                  revokeOne.isPending.value &&
                  revokeOne.variables.value === session.id
                "
                :label="t('auth.account.revokeShort')"
                :aria-label="
                  t('auth.account.revokeOne', {
                    device: session.device ?? t('auth.account.unknownDevice'),
                  })
                "
                @click="onRevokeOne(session.id)"
              />
            </template>
          </UiListItem>
        </UiList>

        <UiList>
          <UiListItem
            v-if="!confirming"
            icon="i-lucide-x"
            tone="danger"
            :title="t('auth.account.revokeAll')"
            :subtitle="t('auth.account.revokeAllHint')"
            :on-click="() => (confirming = true)"
            chevron
          />
          <li v-else class="flex flex-col gap-2 px-4 py-3">
            <p class="text-sm">{{ t('auth.account.revokeAllConfirm') }}</p>
            <div class="flex gap-2">
              <UButton
                color="error"
                class="min-h-11"
                :loading="revokeAll.isPending.value"
                :label="t('auth.account.revokeAll')"
                @click="onRevokeAll"
              />
              <UButton
                variant="ghost"
                color="neutral"
                class="min-h-11"
                :label="t('common.actions.cancel')"
                @click="confirming = false"
              />
            </div>
          </li>
        </UiList>

        <UButton
          block
          size="xl"
          variant="outline"
          color="neutral"
          class="h-12 justify-center font-bold"
          :loading="logout.isPending.value"
          :label="t('auth.account.logoutHere')"
          @click="onLogout"
        />
      </template>
    </AdminQueryState>

    <UiChoiceSheet
      v-model:open="languageOpen"
      :title="t('auth.account.language')"
      :description="t('auth.account.languageHelp')"
      :choices="languages"
      :value="shown.language ?? locale"
      :validate-label="t('common.actions.validate')"
      :cancel-label="t('common.actions.cancel')"
      @validate="onLanguage"
    />
  </AdminScreen>
</template>
