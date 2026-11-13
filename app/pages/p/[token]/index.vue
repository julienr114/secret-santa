<script setup lang="ts">
import type { Avatar } from '#server/utils/avatars';
import {
  usePersonalQuery,
  useRevealMutation,
  useSaveAvatarMutation,
  type Reveal,
} from '~/composables/queries/usePersonal';
import { errorMessage } from '~/utils/errors';
import { plural } from '~/utils/labels';

// Personal page (README 4.3). Opening it shows nothing secret and counts
// nothing: the result only appears after the "Découvrir" button.
const route = useRoute();
const token = computed(() => String(route.params.token));
const personal = usePersonalQuery(token);
const revealMutation = useRevealMutation(token);
const me = computed(() => personal.data.value);

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
  if (count > 0) return plural(count, 'idée');
  return me.value?.wishesEditable
    ? 'Aide la personne qui t’a tiré·e au sort'
    : 'Aucune idée';
});
</script>

<template>
  <ParticipantScreen
    :pending="personal.isPending.value"
    :error="personal.error.value"
  >
    <template v-if="me">
      <div class="flex items-center gap-3">
        <button
          v-if="me.avatarEditable && avatar"
          type="button"
          class="relative shrink-0 rounded-full"
          aria-label="Changer mon icône"
          @click="openPicker"
        >
          <AdminAvatar :avatar="avatar" size="lg" />
          <span
            class="absolute -right-1 -bottom-1 flex size-7 items-center justify-center rounded-full border border-default bg-default text-muted"
            aria-hidden="true"
          >
            <UIcon name="i-lucide-pencil" class="size-3.5" />
          </span>
        </button>
        <AdminAvatar v-else-if="avatar" :avatar="avatar" size="lg" />
        <div class="min-w-0">
          <h1 class="font-display text-3xl font-bold break-words">
            Salut {{ me.firstName }} !
          </h1>
          <p class="text-sm text-muted">
            {{ me.groupName }} · {{ me.editionLabel }}
          </p>
        </div>
      </div>

      <section
        v-if="me.phase === 'waiting'"
        class="flex flex-col gap-2 rounded-xl border border-default bg-default p-6 text-center"
      >
        <p class="text-4xl" aria-hidden="true">⏳</p>
        <h2 class="text-xl font-bold">Le tirage n'a pas encore eu lieu</h2>
        <p class="text-sm text-muted">
          Ton gardien te préviendra. Garde ce lien : c'est ici que tu
          découvriras à qui tu offres un cadeau.
        </p>
        <p v-if="me.wishesEditable" class="text-sm text-muted">
          En attendant, note quelques idées de cadeaux pour la personne qui te
          tirera au sort.
        </p>
      </section>

      <template v-else>
        <template v-if="reveal">
          <ParticipantRevealCard :reveal="reveal" />
          <UButton
            variant="subtle"
            color="neutral"
            block
            icon="i-lucide-eye-off"
            label="Cacher mon résultat"
            @click="onHide"
          />
        </template>
        <section
          v-else
          class="flex flex-col gap-4 rounded-xl border border-default bg-default p-6 text-center"
        >
          <p class="text-4xl" aria-hidden="true">🎁</p>
          <h2 class="text-xl font-bold">Le tirage est fait !</h2>
          <p class="text-sm text-muted">
            Assure-toi que personne ne regarde ton écran. Chaque consultation
            est inscrite au journal du groupe.
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
            label="Découvrir à qui j'offre un cadeau"
            @click="onReveal"
          />
        </section>
        <p v-if="me.phase === 'closed'" class="text-center text-sm text-muted">
          Cette édition est clôturée.
        </p>
      </template>

      <MobileList>
        <MobileListItem
          v-if="me.wishlist"
          :to="`/p/${token}/souhaits`"
          icon="i-lucide-list-checks"
          title="Ma liste de souhaits"
          :subtitle="wishesSubtitle"
        />
        <MobileListItem
          :to="`/p/${token}/journal`"
          icon="i-lucide-scroll-text"
          title="Journal du groupe"
          subtitle="Tout ce qui s'est passé, à la vue de tous"
        />
      </MobileList>
      <UDrawer
        v-model:open="pickerOpen"
        title="Mon icône"
        description="Choisis ton emoji et ta couleur."
      >
        <template #body>
          <AdminAvatarPicker v-if="draft" v-model="draft" />
        </template>
        <template #footer>
          <UButton block label="Valider" @click="confirmPicker" />
        </template>
      </UDrawer>
    </template>
  </ParticipantScreen>
</template>
