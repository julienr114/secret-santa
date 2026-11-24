<script setup lang="ts">
import { api, useApiQuery } from '~/composables/queries/useApi';

// « Ne plus recevoir d'emails » (ticket 130, StopDemande, StopConfirme),
// opened by the link at the foot of any email, without a session.
// Opening it blocks nothing (mail apps open links by themselves): only
// « Oui, ne plus m'écrire » does; then « C'est noté », with « Annuler ».
const route = useRoute();
const token = computed(() => String(route.params.token));
const { t } = useT();
const toast = useMessages();
const errorMessage = useErrorMessage();
useHead({
  title: () => `${t('auth.stop.pageTitle')} — ${t('common.appName')}`,
});
const query = useApiQuery<{ email: string; blocked: boolean }>(
  () => ['stop', token.value],
  () => `/api/stop/${token.value}`,
);
const blocked = ref<boolean | null>(null);
const done = computed(
  () => blocked.value ?? query.data.value?.blocked ?? false,
);
const busy = ref(false);
/**
 * Refuses the emails, or takes them back.
 * @param refuse - True to refuse them.
 * @returns Once answered.
 */
const choose = async (refuse: boolean) => {
  busy.value = true;
  try {
    await api(`/api/stop/${token.value}`, {
      method: refuse ? 'POST' : 'DELETE',
    });
    blocked.value = refuse;
  } catch (error) {
    toast.failed(errorMessage(error));
  } finally {
    busy.value = false;
  }
};
</script>

<template>
  <AuthScreen>
    <p
      v-if="query.error.value"
      class="text-[15px] text-toned"
      data-testid="stop-unknown"
    >
      {{ t('auth.stop.unknown') }}
    </p>
    <div
      v-else-if="query.data.value && done"
      class="flex flex-col gap-5"
      data-testid="stop-done"
    >
      <UiPageTitle>{{ t('auth.stop.doneTitle') }}</UiPageTitle>
      <p class="text-base leading-[1.5]">
        {{ t('auth.stop.doneBefore') }}
        <strong>{{ query.data.value.email }}</strong>.
      </p>
      <p class="text-[15px] leading-[1.5] text-toned">
        {{ t('auth.stop.back') }}
      </p>
      <UButton
        variant="outline"
        color="neutral"
        size="xl"
        block
        class="h-13 justify-center"
        :loading="busy"
        :label="t('auth.stop.cancel')"
        data-testid="stop-cancel"
        @click="choose(false)"
      />
    </div>
    <div
      v-else-if="query.data.value"
      class="flex flex-col gap-5"
      data-testid="stop-ask"
    >
      <UiPageTitle>{{ t('auth.stop.title') }}</UiPageTitle>
      <p class="text-base leading-[1.5]">
        {{ t('auth.stop.toBefore') }}
        <strong>{{ query.data.value.email }}</strong>{{
          t('auth.stop.toAfter')
        }}
      </p>
      <ul class="flex flex-col gap-2 text-[15px] leading-[1.5] text-toned">
        <li>{{ t('auth.stop.links') }}</li>
        <li>{{ t('auth.stop.seen') }}</li>
        <li>{{ t('auth.stop.except') }}</li>
      </ul>
      <div class="flex flex-col gap-2.5">
        <UButton
          size="xl"
          block
          class="h-13 justify-center text-[17px] font-bold"
          :loading="busy"
          :label="t('auth.stop.yes')"
          data-testid="stop-yes"
          @click="choose(true)"
        />
        <UButton
          to="/"
          variant="ghost"
          color="neutral"
          size="xl"
          block
          class="h-13 justify-center"
          :label="t('auth.stop.no')"
        />
      </div>
    </div>
  </AuthScreen>
</template>
