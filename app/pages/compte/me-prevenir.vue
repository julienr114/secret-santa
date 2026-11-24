<script setup lang="ts">
import { EMAIL_NEWS, type EmailNews } from '#shared/utils/news';
import type { Choice } from '~/components/ui/ChoiceList.vue';
import { useQueryClient } from '@tanstack/vue-query';
import { api } from '~/composables/queries/useApi';
import { keys } from '~/composables/queries/keys';
import {
  useFollowsQuery,
  useUnfollowMutation,
} from '~/composables/queries/useLists';

// « Me prévenir » (ticket 121, NotifReglage, README 22.22), from « Mon
// compte » and from the foot of « Quoi de neuf »: « Par email », three
// choices, saved as soon as one is chosen. With the summary, what
// presses goes at once anyway: said under the choices. Then the lists I
// follow (ticket 122), each with « Ne plus suivre », where the emails of
// a list I follow lead (`#suivis`). The phone comes with ticket 124.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t, locale } = useT();
useHead({
  title: () => `${t('news.settings.title')} — ${t('common.appName')}`,
});
const screen = computed(() => ({ back: '/compte' }));

const { account, shown, save } = useProfileSaver();
const choices = computed<Choice<EmailNews>[]>(() =>
  EMAIL_NEWS.map((value) => ({
    value,
    label: t(`news.settings.${value}`),
    hint: t(`news.settings.${value}Hint`),
  })),
);
const follows = useFollowsQuery();
const unfollow = useUnfollowMutation();
const toast = useMessages();
const errorMessage = useErrorMessage();
/**
 * Whom I follow on a list: its people, or all of it.
 * @param people - The first names; none for the whole list.
 * @returns The words.
 */
const whom = (people: string[]) =>
  people.length === 0
    ? t('news.settings.wholeList')
    : new Intl.ListFormat(locale.value, { type: 'conjunction' }).format(people);
const queryClient = useQueryClient();
const unblocking = ref(false);
/** Lifts the block of my address (ticket 130). */
const onUnblock = async () => {
  unblocking.value = true;
  try {
    await api('/api/auth/email-block', { method: 'DELETE' });
    await queryClient.invalidateQueries({ queryKey: keys.account() });
  } catch (error) {
    toast.failed(errorMessage(error));
  } finally {
    unblocking.value = false;
  }
};
const mode = computed({
  get: () => shown.value.emailNews ?? 'summary',
  set: (emailNews: EmailNews) => save({ emailNews }),
});
</script>

<template>
  <AdminScreen v-bind="screen">
    <AdminQueryState
      :pending="account.isPending.value"
      :error="account.error.value"
      :skeleton="['title', 'card']"
    >
      <div class="flex flex-col gap-1">
        <UiPageContext
          :parts="[{ label: t('auth.account.title'), to: '/compte' }]"
          :label="t('common.context')"
        />
        <UiPageTitle>{{ t('news.settings.title') }}</UiPageTitle>
      </div>
      <UiChoiceList
        v-model="mode"
        :choices="choices"
        :label="t('news.settings.byEmail')"
        titled
        data-testid="notify-email"
      />
      <!-- Ticket 130: refused by the link; only the person lifts it. -->
      <div
        v-if="account.data.value?.emailBlocked"
        class="flex flex-col gap-3 rounded-2xl bg-lilac-100 p-3.5 text-[15px] leading-[1.45] text-lilac-700"
        data-testid="email-blocked"
      >
        <p>{{ t('news.settings.blocked') }}</p>
        <UButton
          color="neutral"
          variant="outline"
          class="self-start"
          :loading="unblocking"
          :label="t('news.settings.unblock')"
          data-testid="email-unblock"
          @click="onUnblock"
        />
      </div>
      <p
        v-else-if="mode === 'none'"
        class="px-1 text-sm text-toned"
        data-testid="none-differs"
      >
        {{ t('news.settings.noneDiffers') }}
      </p>
      <section v-if="mode === 'summary'" class="flex flex-col gap-1.5">
        <UiSectionTitle>{{ t('news.settings.urgent') }}</UiSectionTitle>
        <p class="px-1 text-sm text-toned">
          {{ t('news.settings.urgentText') }}
        </p>
      </section>
      <UiList
        v-if="(follows.data.value?.lists.length ?? 0) > 0"
        id="suivis"
        :title="t('news.settings.following')"
        class="scroll-mt-20"
        data-testid="following"
      >
        <UiListItem
          v-for="list in follows.data.value?.lists ?? []"
          :key="list.listId"
          icon="i-lucide-bell-ring"
          :title="list.title"
          :subtitle="whom(list.people)"
        >
          <template #trailing>
            <UButton
              size="sm"
              color="neutral"
              variant="outline"
              :label="t('news.settings.unfollow')"
              :aria-label="
                t('news.settings.unfollowList', { title: list.title })
              "
              :loading="
                unfollow.isPending.value &&
                unfollow.variables.value === list.listId
              "
              data-testid="unfollow"
              @click="
                unfollow.mutate(list.listId, {
                  onError: (error) => toast.failed(errorMessage(error)),
                })
              "
            />
          </template>
        </UiListItem>
      </UiList>
    </AdminQueryState>
  </AdminScreen>
</template>
