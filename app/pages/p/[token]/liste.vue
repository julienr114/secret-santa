<script setup lang="ts">
import { useRequestLinkMutation } from '~/composables/queries/useAuth';
import { api } from '~/composables/queries/useApi';
import { usePersonalQuery } from '~/composables/queries/usePersonal';
import type { LinePart } from '#shared/utils/lines';

// « Ma liste de cadeaux », from my Secret Santa (ticket 107): logged in
// with my address, my list for the event opens at once, kept for the one
// who drew me (V3ListeQuiSecret), with me on it already, first
// (V3ListeSecretNouvelle, ticket 136); when I hold lists of this year where
// I figure, « Quelle liste pour ton Secret Santa ? » asks which first
// (V3TirageQuelleListe). With the address the organiser gave and
// no account yet, the first thing written, an idea or a taste (« En ce
// moment »), makes the account, opens its session and the list (Q-018,
// V3ListeCompteCree). Otherwise the address first
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
// Opening my list before anything shows, or writing the first idea from
// the screen shown: only the first goes through the skeleton.
const opening = ref(false);
const writing = ref(false);
const back = computed(() => `/p/${token.value}`);

/** A list « Quelle liste pour ton Secret Santa ? » offers (ticket 136). */
type DrawListChoice = {
  id: string;
  title: string;
  forWhom: LinePart | null;
  events: string[];
};
const NEW_LIST = 'new';
const choices = ref<DrawListChoice[]>([]);
const choosing = ref(false);
const chosen = ref<string>(NEW_LIST);
const saving = ref(false);
const { part } = useLineText();
const choiceRows = computed(() => [
  ...choices.value.map((list) => ({
    value: list.id,
    label: list.title || t('lists.resume.untitled'),
    hint:
      [list.forWhom ? part(list.forWhom) : '', list.events.join(', ')]
        .filter(Boolean)
        .join(' · ') || undefined,
  })),
  { value: NEW_LIST, label: t('participant.myList.which.new') },
]);

/**
 * Opens my list for the event: the one I have, the one I choose, or a
 * new one with me on it.
 * @param list - The list chosen, if any.
 * @returns Once on it.
 */
const openMine = async (list?: string) => {
  try {
    const { id, created } = await api<{ id: string; created: boolean }>(
      `/api/p/${token.value}/list`,
      { method: 'POST', body: list ? { list } : {} },
    );
    // Made here: its visit opens on it (ticket 149).
    await navigateTo(`/listes/${id}${created ? '?visite=secret' : ''}`, {
      replace: true,
    });
  } catch (error) {
    failure.value = error;
    opening.value = false;
    saving.value = false;
    choosing.value = false;
  }
};
/**
 * My list for the event, or the lists I could give to the one who draws
 * me: then the sheet asks which (V3TirageQuelleListe).
 * @returns Once on a list, or once the sheet is open.
 */
const findMine = async () => {
  opening.value = true;
  try {
    const found = await api<{
      list: string | null;
      choices: DrawListChoice[];
    }>(`/api/p/${token.value}/list`);
    if (found.list) {
      await navigateTo(`/listes/${found.list}`, { replace: true });
      return;
    }
    if (found.choices.length === 0) return openMine();
    choices.value = found.choices;
    chosen.value = found.choices[0]?.id ?? NEW_LIST;
    opening.value = false;
    choosing.value = true;
  } catch (error) {
    failure.value = error;
    opening.value = false;
  }
};
onMounted(() => {
  if (loggedIn.value) void findMine();
});
const onChoose = (value: string) => {
  saving.value = true;
  void openMine(value === NEW_LIST ? undefined : value);
};
/** The sheet closed without a choice: back to my Secret Santa. */
const onChoosing = (open: boolean) => {
  choosing.value = open;
  if (!open && !saving.value) void navigateTo(back.value, { replace: true });
};

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
/** « En ce moment », a taste of the « Moi » card: it counts too. */
const lately = ref('');
const written = computed(() =>
  Boolean(idea.value.trim() || lately.value.trim()),
);
const { fetch: refreshSession } = useUserSession();
/**
 * Writes the first idea: the account, its session and the list are made,
 * and the list opens with the message of the account made.
 * @returns Once on the list.
 */
const onFirstIdea = async () => {
  writing.value = true;
  try {
    const { id } = await api<{ id: string }>(
      `/api/p/${token.value}/first-idea`,
      {
        method: 'POST',
        body: { text: idea.value.trim(), lately: lately.value.trim() },
      },
    );
    await refreshSession();
    await navigateTo(`/listes/${id}?compte=1`, { replace: true });
  } catch (error) {
    failure.value = error;
    writing.value = false;
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
    <div v-else-if="me && loggedIn" class="flex flex-col gap-4">
      <p class="text-sm font-semibold text-toned">
        {{ me.groupName }} · {{ me.editionLabel }}
      </p>
      <UiPageTitle>{{ t('hints.list.title') }}</UiPageTitle>
    </div>
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
      <UiTextField
        id="list-first-taste"
        v-model="lately"
        multiline
        :maxlength="300"
        :label="t('hints.texts.lately.title')"
        :placeholder="t('hints.texts.lately.placeholder')"
      />
      <UButton
        block
        size="xl"
        class="h-13 justify-center text-[17px] font-bold"
        :disabled="!written"
        :loading="writing"
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
    <UiChoiceSheet
      :open="choosing"
      :title="t('participant.myList.which.title')"
      :choices="choiceRows"
      :value="chosen"
      :validate-label="t('participant.myList.which.continue')"
      :cancel-label="t('common.actions.cancel')"
      :loading="saving"
      data-testid="which-list"
      @update:open="onChoosing"
      @validate="onChoose"
    />
  </ParticipantScreen>
</template>
