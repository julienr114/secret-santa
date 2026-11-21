<script setup lang="ts">
import { useRequestLinkMutation } from '~/composables/queries/useAuth';
import { api } from '~/composables/queries/useApi';
import { usePersonalQuery } from '~/composables/queries/usePersonal';

// « Ma liste de cadeaux », from my Secret Santa (ticket 107): logged in
// with my address, my list for the event opens at once, kept for the one
// who drew me (V3ListeQuiSecret). With the address the organiser gave and
// no account yet, the first idea makes the account, opens its session and
// the list (Q-018, V3ListeCompteCree). Otherwise the address first
// (V3ListeAdresse): one to type, or the known one when it already has an
// account, confirmed by the link it receives, which brings back here.
const route = useRoute();
const token = computed(() => String(route.params.token));
const { t } = useT();
const errorMessage = useErrorMessage();
const { loggedIn } = useUserSession();
const query = usePersonalQuery(token);
const me = computed(() => query.data.value);
const failure = ref<unknown>(null);
const opening = ref(false);
const back = computed(() => `/p/${token.value}`);

/**
 * Opens my list for the event, made if needed.
 * @returns Once on it.
 */
const openMine = async () => {
  opening.value = true;
  try {
    const { id } = await api<{ id: string }>(`/api/p/${token.value}/list`, {
      method: 'POST',
    });
    await navigateTo(`/listes/${id}`, { replace: true });
  } catch (error) {
    failure.value = error;
    opening.value = false;
  }
};
onMounted(() => {
  if (loggedIn.value) void openMine();
});

const email = ref('');
watch(
  () => me.value?.email,
  (known) => {
    if (known && !email.value) email.value = known;
  },
  { immediate: true },
);
const ask = useRequestLinkMutation();
/** The first idea makes the account: an address known, no account yet. */
const firstIdea = computed(
  () => Boolean(me.value?.email) && !me.value?.emailHasAccount,
);
const idea = ref('');
const { fetch: refreshSession } = useUserSession();
/**
 * Writes the first idea: the account, its session and the list are made,
 * and the list opens with the message of the account made.
 * @returns Once on the list.
 */
const onFirstIdea = async () => {
  opening.value = true;
  try {
    const { id } = await api<{ id: string }>(
      `/api/p/${token.value}/first-idea`,
      { method: 'POST', body: { text: idea.value.trim() } },
    );
    await refreshSession();
    await navigateTo(`/listes/${id}?compte=1`, { replace: true });
  } catch (error) {
    failure.value = error;
    opening.value = false;
  }
};
const onSend = () =>
  ask.mutate({
    email: email.value.trim(),
    firstName: me.value?.firstName,
    next: `/p/${token.value}/liste`,
  });
</script>

<template>
  <ParticipantScreen
    :token="token"
    :back="back"
    :pending="query.isPending.value || opening"
    :error="query.error.value"
    :skeleton="['title', 'card']"
  >
    <UAlert
      v-if="failure"
      color="error"
      variant="subtle"
      :description="errorMessage(failure)"
    />
    <div
      v-else-if="me && firstIdea"
      class="flex flex-col gap-4"
      data-testid="list-first-idea"
    >
      <p class="text-sm font-semibold text-toned">
        {{ me.groupName }} · {{ me.editionLabel }}
      </p>
      <UiPageTitle>{{ t('hints.list.title') }}</UiPageTitle>
      <UiTextField
        id="list-first-idea"
        v-model="idea"
        :maxlength="200"
        :label="t('participant.myList.ideaLabel')"
      />
      <UButton
        block
        size="xl"
        class="h-13 justify-center text-[17px] font-bold"
        :disabled="!idea.trim()"
        :label="t('participant.myList.add')"
        @click="onFirstIdea"
      />
      <p class="text-sm text-toned">
        {{ t('participant.myList.accountNote', { email: me.email ?? '' }) }}
      </p>
    </div>
    <div v-else-if="me" class="flex flex-col gap-4" data-testid="list-address">
      <p class="text-sm font-semibold text-toned">
        {{ me.groupName }} · {{ me.editionLabel }}
      </p>
      <UiPageTitle>{{ t('participant.myList.title') }}</UiPageTitle>
      <p
        v-if="ask.isSuccess.value"
        class="text-[15px] leading-[1.45]"
        role="status"
        data-testid="list-address-sent"
      >
        {{ t('participant.myList.sent', { email: email.trim() }) }}
      </p>
      <template v-else>
        <UiTextField
          id="list-address"
          v-model="email"
          inputmode="email"
          :label="t('participant.myList.label')"
        />
        <UButton
          block
          size="xl"
          class="h-13 justify-center text-[17px] font-bold"
          :loading="ask.isPending.value"
          :disabled="!email.trim()"
          :label="t('participant.myList.submit')"
          @click="onSend"
        />
        <p class="text-sm text-toned">{{ t('participant.myList.confirm') }}</p>
      </template>
    </div>
  </ParticipantScreen>
</template>
