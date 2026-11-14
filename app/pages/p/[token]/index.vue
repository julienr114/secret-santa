<script setup lang="ts">
import type { Avatar } from '#server/utils/avatars';
import {
  usePersonalQuery,
  useRevealMutation,
  useSaveAvatarMutation,
  type Reveal,
} from '~/composables/queries/usePersonal';

// Personal page (README 4.3). Opening it shows nothing secret and counts
// nothing: the result only appears after the "Découvrir" button.
const route = useRoute();
const token = computed(() => String(route.params.token));
const personal = usePersonalQuery(token);
const revealMutation = useRevealMutation(token);
const me = computed(() => personal.data.value);
const { t } = useT();
const errorMessage = useErrorMessage();

// Only in this component's state: gone when leaving or reloading the page.
const reveal = ref<Reveal | null>(null);
const onReveal = () =>
  revealMutation.mutate(undefined, {
    onSuccess: (data) => {
      reveal.value = data;
    },
  });
const onHide = () => {
  reveal.value = null;
};
// The page follows the edition by itself: a result still on screen when
// the guardian cancels the draw is no longer valid.
watch(
  () => me.value?.phase,
  (phase) => {
    if (phase === 'waiting') reveal.value = null;
  },
);

// Avatar: picked in a bottom sheet on a draft, saved with "Valider";
// closing the sheet any other way gives the choice up. The new avatar
// shows at once and is dropped if the save fails.
const toast = useToast();
const saveAvatar = useSaveAvatarMutation(token);
const pickerOpen = ref(false);
const chosen = ref<Avatar | null>(null);
const avatar = computed(() => chosen.value ?? me.value?.avatar ?? null);
const draft = ref<Avatar | null>(null);
const openPicker = () => {
  draft.value = avatar.value;
  pickerOpen.value = true;
};
const confirmPicker = () => {
  const next = draft.value;
  const current = avatar.value;
  pickerOpen.value = false;
  if (!next || !current) return;
  if (next.emoji === current.emoji && next.color === current.color) return;
  chosen.value = next;
  saveAvatar.mutate(next, {
    onError: (error) => {
      chosen.value = null;
      toast.add({ title: errorMessage(error), color: 'error' });
    },
  });
};

const wishesSubtitle = computed(() => {
  const count = me.value?.wishesCount ?? 0;
  if (count > 0) return t('common.count.ideas', { count });
  return me.value?.wishesEditable
    ? t('participant.home.wishes.help')
    : t('participant.home.wishes.none');
});
</script>

<template>
  <ParticipantScreen
    :token="token"
    :pending="personal.isPending.value"
    :error="personal.error.value"
  >
    <template v-if="me">
      <div class="flex items-center gap-3">
        <button
          v-if="me.avatarEditable && avatar"
          type="button"
          class="relative shrink-0 rounded-full"
          :aria-label="t('participant.home.changeAvatar')"
          @click="openPicker"
        >
          <UiAvatar :avatar="avatar" size="lg" />
          <span
            class="absolute -right-1 -bottom-1 flex size-7 items-center justify-center rounded-full border border-default bg-default text-muted"
            aria-hidden="true"
          >
            <UIcon name="i-lucide-pencil" class="size-3.5" />
          </span>
        </button>
        <UiAvatar v-else-if="avatar" :avatar="avatar" size="lg" />
        <div class="min-w-0">
          <UiPageTitle>
            {{ t('participant.home.greeting', { firstName: me.firstName }) }}
          </UiPageTitle>
          <p class="text-sm text-muted">
            {{ me.groupName }} · {{ me.editionLabel }}
          </p>
        </div>
      </div>

      <UiCard
        v-if="me.phase === 'waiting'"
        padding="lg"
        class="flex flex-col gap-2 text-center"
      >
        <p class="text-4xl" aria-hidden="true">⏳</p>
        <h2 class="text-xl font-bold">
          {{ t('participant.home.waiting.title') }}
        </h2>
        <p class="text-sm text-muted">
          {{ t('participant.home.waiting.body') }}
        </p>
        <p v-if="me.wishesEditable" class="text-sm text-muted">
          {{ t('participant.home.waiting.wishes') }}
        </p>
      </UiCard>

      <template v-else>
        <template v-if="reveal">
          <ParticipantRevealCard :reveal="reveal" />
          <UButton
            variant="subtle"
            color="neutral"
            block
            icon="i-lucide-eye-off"
            :label="t('participant.home.ready.hide')"
            @click="onHide"
          />
        </template>
        <UiCard v-else padding="lg" class="flex flex-col gap-4 text-center">
          <p class="text-4xl" aria-hidden="true">🎁</p>
          <h2 class="text-xl font-bold">
            {{ t('participant.home.ready.title') }}
          </h2>
          <p class="text-sm text-muted">
            {{ t('participant.home.ready.body') }}
          </p>
          <p
            v-if="me.revealed && me.receiverWishesCount > 0"
            class="text-sm text-muted"
          >
            {{
              t('participant.home.ready.ideasWaiting', {
                count: me.receiverWishesCount,
              })
            }}
          </p>
          <UAlert
            v-if="revealMutation.isError.value"
            color="error"
            variant="subtle"
            :description="errorMessage(revealMutation.error.value)"
          />
          <UButton
            block
            icon="i-lucide-gift"
            :loading="revealMutation.isPending.value"
            :label="
              me.revealed
                ? t('participant.home.ready.revealAgain')
                : t('participant.home.ready.reveal')
            "
            @click="onReveal"
          />
        </UiCard>
        <p v-if="me.phase === 'closed'" class="text-center text-sm text-muted">
          {{ t('participant.home.closed') }}
        </p>
      </template>

      <UiList>
        <UiListItem
          v-if="me.wishlist"
          :to="`/p/${token}/souhaits`"
          icon="i-lucide-list-checks"
          :title="t('participant.home.wishes.title')"
          :subtitle="wishesSubtitle"
        />
        <UiListItem
          :to="`/p/${token}/journal`"
          icon="i-lucide-scroll-text"
          :title="t('participant.home.journal.title')"
          :subtitle="t('participant.home.journal.subtitle')"
        />
      </UiList>
      <UDrawer
        v-model:open="pickerOpen"
        :title="t('participant.home.avatar.title')"
        :description="t('participant.home.avatar.description')"
      >
        <template #body>
          <AdminAvatarPicker v-if="draft" v-model="draft" />
        </template>
        <template #footer>
          <UButton
            block
            :label="t('common.actions.validate')"
            @click="confirmPicker"
          />
        </template>
      </UDrawer>
    </template>
  </ParticipantScreen>
</template>
