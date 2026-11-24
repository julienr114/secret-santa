<script setup lang="ts">
import { EMAIL_NEWS, type EmailNews } from '#shared/utils/news';
import type { Choice } from '~/components/ui/ChoiceList.vue';

// « Me prévenir » (ticket 121, NotifReglage, README 22.22), from « Mon
// compte » and from the foot of « Quoi de neuf »: « Par email », three
// choices, saved as soon as one is chosen. With the summary, what
// presses goes at once anyway: said under the choices. The phone comes
// with ticket 124.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t } = useT();
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
      <section v-if="mode === 'summary'" class="flex flex-col gap-1.5">
        <UiSectionTitle>{{ t('news.settings.urgent') }}</UiSectionTitle>
        <p class="px-1 text-sm text-toned">
          {{ t('news.settings.urgentText') }}
        </p>
      </section>
    </AdminQueryState>
  </AdminScreen>
</template>
