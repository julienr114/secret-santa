<script setup lang="ts">
import { useSeen } from '~/composables/queries/useNews';
import { shoeSizesShown } from '#shared/utils/memberFields';
import type { IdeaLine, PersonLine } from '#server/http/lists';
import { formatEventDate } from '#server/utils/rules';
import {
  useJoinByLinkMutation,
  useLinkQuery,
  useRemoveOffListMutation,
  useTickMutation,
  useUntickMutation,
} from '~/composables/queries/useLists';
import { keys } from '~/composables/queries/keys';
import { usePartyQuery } from '~/composables/queries/useParty';
import { partyEmoji } from '#shared/utils/categories';
import { LIST_EDITING } from '~/composables/useListEditing';

// A list by its link (README 22.19, maquettes ListeVisiteur,
// ListeVisiteurMes, ListePlusieursLigne): readable without an account.
// Its tile, name, day and word; who holds it and who sees what; then each
// person, their ideas to tick, the gifts not on the list, and « J'offre
// autre chose à Léo ». Touching a box without an account asks for an
// address first (`/connexion`), and the gift is ticked on coming back
// (`?cocher=`). Whoever figures on the list, linked to their account,
// reads their own section first, « C'est toi », and writes their ideas
// there.
const route = useRoute();
const router = useRouter();
// Opened from an event (V3ListeMembre): a pill with its emoji and its
// name leads back to it.
const depuis = computed(() =>
  typeof route.query.depuis === 'string' ? route.query.depuis : '',
);
const fromParty = usePartyQuery(depuis, () => depuis.value !== '');
const fromChip = computed(() => {
  const party = fromParty.data.value?.party;
  return party
    ? { name: party.name, emoji: partyEmoji(party), to: `/e/${depuis.value}` }
    : null;
});
const token = computed(() => String(route.params.token));
const { t, locale } = useT();
const toast = useMessages();
const errorMessage = useErrorMessage();
const { loggedIn } = useUserSession();
// « Retour », for someone logged in: where the list was opened from, or the
// home (docs/spec/v3/navigation.md). Without a session, none.
const back = useParent('list', '/');
// What the address carries from a draw (lot 27 ter): `anonyme` asks for
// the anonymous mode, `p` is the participation of the one who gives,
// signed. Sent along as they are: the server alone decides. Kept on
// this phone while one logs in, since the login comes back without them.
const FROM_KEY = computed(() => `list-from:${token.value}`);
const fromAddress = () => {
  const { anonyme, p } = route.query;
  const params = new URLSearchParams({
    ...(anonyme === undefined ? {} : { anonyme: '1' }),
    ...(typeof p === 'string' ? { p } : {}),
  }).toString();
  return params ? `?${params}` : '';
};
const from = ref(fromAddress());
const query = useLinkQuery(token, from);
onMounted(() => {
  try {
    if (from.value && !loggedIn.value) {
      window.sessionStorage.setItem(FROM_KEY.value, from.value);
      return;
    }
    const kept = window.sessionStorage.getItem(FROM_KEY.value);
    if (!kept || !loggedIn.value) return;
    window.sessionStorage.removeItem(FROM_KEY.value);
    if (from.value) return;
    from.value = kept;
    void nextTick(() => query.refetch());
  } catch {
    // No storage (a private window): the address alone counts.
  }
});
// Its link lets me into its event (ticket 117, « Arriver par le lien »):
// I become a member, by a POST, and the list opens. Once per visit.
const join = useJoinByLinkMutation(token);
const joinTried = ref(false);
watch(
  () => (query.error.value as { statusMessage?: string } | null)?.statusMessage,
  (reason) => {
    if (import.meta.server || reason !== 'list_join' || joinTried.value) {
      return;
    }
    joinTried.value = true;
    join.mutate(undefined, { onError: () => void query.refetch() });
  },
  { immediate: true },
);
const via = computed(() => ({ token: token.value }));
const tick = useTickMutation(via);
const untick = useUntickMutation(via);
const removeOffList = useRemoveOffListMutation(token);
const doc = computed(() => query.data.value);
// The list opened: its news are seen (ticket 120). What was written
// since my visit before this one has a dot (NotifListe), kept from the
// first reading: the page reads the list again while open.
useSeen(() =>
  doc.value ? { target: 'list', targetId: doc.value.list.id } : null,
);
const since = ref<string | null | undefined>(undefined);
watch(
  () => doc.value?.since,
  (value) => {
    if (since.value === undefined && doc.value) since.value = value ?? null;
  },
  { immediate: true },
);
/**
 * Whether an idea came since my last visit.
 * @param idea - The idea.
 * @returns True for a dot.
 */
const isFresh = (idea: IdeaLine) =>
  Boolean(since.value) && idea.createdAt > (since.value ?? '');
// From a result (ticket 107, V3ListeSurligne): the page opens on the part
// of the person drawn, just under the bar of the anonymous mode, once.
const scrolledTo = ref(false);
watch(
  () => Boolean(doc.value),
  async (ready) => {
    const who = route.query.personne;
    if (!ready || scrolledTo.value || typeof who !== 'string') return;
    scrolledTo.value = true;
    await nextTick();
    document
      .getElementById(`personne-${who}`)
      ?.scrollIntoView({ block: 'start' });
  },
  { immediate: true },
);
const holder = computed(() => doc.value?.holder.name ?? '');

const noteText = computed(() => {
  const note = doc.value?.list.note;
  if (!note || note.kind === 'none') return '';
  return note.kind === 'text' ? note.text : t('lists.doc.noteDefault');
});
const dateLine = computed(() =>
  doc.value?.list.eventDate
    ? t('lists.home.on', {
        date: formatEventDate(doc.value.list.eventDate, locale.value),
      })
    : '',
);
const sentence = computed(() => {
  const d = doc.value;
  if (!d) return '';
  if (d.holds) return t('lists.visitor.youHold');
  if (d.figures) return t('lists.visitor.figures', { name: holder.value });
  const head = t('lists.visitor.holder', { name: holder.value });
  return d.mine > 0
    ? `${head} ${t('lists.visitor.mine', { count: d.mine, name: holder.value })}`
    : `${head} ${t('lists.visitor.whoSees', { name: holder.value })}`;
});
/** « 6 ans · taille 6 ans, pointure 30 ». */
const details = (person: PersonLine) => {
  const m = person.member;
  const sizes = [
    m.clothingSize ? t('lists.doc.size', { size: m.clothingSize }) : null,
    m.shoeSize
      ? t('lists.doc.shoe', {
          size: shoeSizesShown(m.shoeSize, t('lists.person.field.or')) ?? '',
        })
      : null,
  ].filter(Boolean);
  return [
    m.age === null ? null : t('lists.doc.age', { count: m.age }),
    sizes.length > 0 ? sizes.join(', ') : null,
  ]
    .filter(Boolean)
    .join(' · ');
};

// Live (lot 26): what the others tick or write arrives by itself. A
// visitor is never shown as there, nor told who is.
useListLive(
  () => `/api/l/${token.value}/live`,
  () => [keys.link(token.value)],
);
const onError = (error: unknown) =>
  // Ticked by someone else in the same instant: the first wins, and the
  // box turns to « pris » by itself, without a message (lot 26).
  (error as { statusMessage?: string }).statusMessage === 'taken'
    ? void query.refetch()
    : toast.failed(errorMessage(error));
/**
 * Ticks an idea: at once when logged in, after an address otherwise.
 * @param idea - The idea.
 * @returns Nothing.
 */
const guide = useTickGuide();
/**
 * After a tick of mine: the note on « Tu l'offres › », the first time
 * on this device, never with the note of the anonymous mode (Correction
 * 30): that one comes first.
 * @param ideaId - The idea ticked.
 */
const onTicked = (ideaId: string) => {
  if (!doc.value?.mode?.notice) guide.offer(ideaId);
};
const onTick = (idea: IdeaLine) => {
  if (!loggedIn.value) {
    return navigateTo(
      `/l/${token.value}/connexion?cocher=${encodeURIComponent(idea.id)}`,
    );
  }
  tick.mutate(
    { ideaId: idea.id },
    { onError, onSuccess: () => onTicked(idea.id) },
  );
};

/** The green box of what I give unticks at once, without the sheet. */
const onUntick = (idea: IdeaLine) => untick.mutate(idea.id, { onError });

// Back from the login link: the gift waiting is ticked.
onMounted(async () => {
  const waiting = route.query.cocher;
  if (!waiting || !loggedIn.value) return;
  await query.suspense();
  const idea = doc.value?.people
    .flatMap((p) => p.ideas)
    .find((i) => i.id === waiting);
  if (idea?.view.kind === 'free') {
    tick.mutate(
      { ideaId: idea.id },
      { onError, onSuccess: () => onTicked(idea.id) },
    );
  }
  router.replace({ query: {} });
});

// The sheets: « Changer » and « Se joindre ».
const changing = ref<{ idea: IdeaLine; forName: string } | null>(null);
const joining = ref<{ idea: IdeaLine; forName: string } | null>(null);
const changeOpen = computed({
  get: () => changing.value !== null,
  set: (open) => {
    if (!open) changing.value = null;
  },
});
const joinOpen = computed({
  get: () => joining.value !== null,
  set: (open) => {
    if (!open) joining.value = null;
  },
});
// The sheets follow the list as it is refetched.
watch(doc, (current) => {
  const fresh = (id: string) =>
    current?.people.flatMap((p) => p.ideas).find((i) => i.id === id);
  if (changing.value) {
    const idea = fresh(changing.value.idea.id);
    changing.value = idea?.mine ? { ...changing.value, idea } : null;
  }
  if (joining.value) {
    const idea = fresh(joining.value.idea.id);
    if (idea) joining.value = { ...joining.value, idea };
  }
});
const onJoin = (idea: IdeaLine, forName: string) => {
  if (!loggedIn.value) return onTick(idea);
  joining.value = { idea, forName };
};

// Someone who figures on the list, linked to their account, writes their
// own ideas in place (lot 25, maquette ListeVueReliee): the same lines as
// in the document of those who hold the list, which ask the page for a
// confirmation and for the sheets.
const confirm = ref<((ok: boolean) => void) | null>(null);
provide(LIST_EDITING, {
  confirmRemove: () =>
    new Promise<boolean>((resolve) => {
      confirm.value = resolve;
    }),
  change: (idea, forName) => {
    changing.value = { idea, forName };
  },
  join: (idea, forName) => onJoin(idea, forName),
  // Nobody leaves a list from its link.
  removePerson: () => undefined,
});
const answerConfirm = (ok: boolean) => {
  confirm.value?.(ok);
  confirm.value = null;
};
const confirmOpen = computed({
  get: () => confirm.value !== null,
  set: (open) => {
    if (!open) answerConfirm(false);
  },
});
/** For whom a gift is: nobody on a list without people. */
const nameOf = (person: PersonLine) =>
  doc.value?.single ? '' : person.member.firstName;
/** My own section, where I write. */
const writes = (person: PersonLine) =>
  Boolean(doc.value?.figures) && person.mine;
</script>

<template>
  <ListsScreen
    :back="loggedIn ? back : undefined"
    :pending="query.isPending.value"
    :error="query.error.value"
    :skeleton="['doc', 'list']"
  >
    <template v-if="doc">
      <NuxtLink
        v-if="fromChip"
        :to="fromChip.to"
        class="flex h-9 items-center gap-1.5 self-start rounded-full bg-default px-3 text-sm font-bold ring-1 ring-default"
        data-testid="list-from-party"
        ><UiEmoji v-if="fromChip.emoji" :emoji="fromChip.emoji" />{{
          fromChip.name
        }}</NuxtLink
      >
      <!-- Logged in, and not one of those who hold the list: the mode,
           said before ticking. -->
      <ListsAnonymousBar v-if="doc.mode" :token="token" :mode="doc.mode" />
      <div class="flex flex-col gap-2">
        <ListsTile :icon="doc.list.icon" size="lg" />
        <h1 class="font-display text-[36px] leading-[1.1] font-bold">
          {{ doc.list.title }}
        </h1>
        <p v-if="dateLine" class="text-[15px] text-toned">{{ dateLine }}</p>
        <p
          v-if="noteText"
          class="text-base leading-[1.5] whitespace-pre-line"
          data-testid="visitor-note"
        >
          {{ noteText }}
        </p>
        <p class="text-sm text-toned" data-testid="visitor-sentence">
          {{ sentence }}
        </p>
        <UButton
          v-if="doc.holds"
          :to="`/listes/${doc.list.id}`"
          variant="outline"
          class="self-start"
          :label="t('lists.visitor.openDoc')"
        />
      </div>

      <section
        v-for="(person, index) in doc.people"
        :id="`personne-${person.member.id}`"
        :key="person.id"
        class="relative flex scroll-mt-32 flex-col gap-0.5"
        :class="index > 0 ? 'mt-11' : ''"
        data-testid="visitor-person"
      >
        <!-- Two columns and a thread (Correction 30, maquette
             ListeGroupeFil): the icon and the boxes on the left, all the
             text on one edge. -->
        <ListsPersonThread v-if="!doc.single" />
        <header v-if="!doc.single" class="flex items-center gap-2.5">
          <UiAvatar :avatar="person.member.avatar" :px="40" class="shrink-0" />
          <div class="flex min-w-0 flex-col gap-0.5">
            <h2 class="font-display text-2xl leading-[1.15] font-bold">
              {{ person.member.firstName }}
            </h2>
            <p
              v-if="writes(person)"
              class="text-sm font-semibold text-primary-ink"
              data-testid="its-you"
            >
              {{ t('lists.visitor.itsYou') }}
            </p>
            <p
              v-else-if="details(person)"
              class="text-sm leading-[1.4] text-toned"
            >
              {{ details(person) }}
            </p>
          </div>
        </header>
        <ListsPersonTastes v-if="!doc.single" :member="person.member" />
        <TransitionGroup
          v-if="writes(person)"
          tag="ul"
          name="line"
          class="person-lines mt-1.5 flex flex-col"
        >
          <ListsIdeaLine
            v-for="(idea, at) in person.ideas"
            :key="idea.id"
            :via="via"
            :list-person-id="person.id"
            :for-name="person.member.firstName"
            :idea="idea"
            :line="`${person.id}:${at}`"
          />
          <ListsIdeaLine
            key="new"
            :via="via"
            :list-person-id="person.id"
            :for-name="person.member.firstName"
            :idea="null"
            :after="null"
            :placeholder="
              person.ideas.length === 0
                ? t('lists.visitor.ideaForMe')
                : t('lists.visitor.anotherForMe')
            "
            :line="`${person.id}:new`"
          />
        </TransitionGroup>
        <TransitionGroup
          v-else
          tag="ul"
          name="line"
          class="flex flex-col"
          :class="doc.single ? '' : 'person-lines mt-1.5'"
        >
          <ListsVisitorLine
            v-for="idea in person.ideas"
            :key="idea.id"
            :idea="idea"
            :fresh="isFresh(idea)"
            @tick="onTick(idea)"
            @untick="onUntick(idea)"
            @change="changing = { idea, forName: nameOf(person) }"
            @join="onJoin(idea, nameOf(person))"
          />
          <li
            v-for="gift in person.offList"
            :key="gift.id"
            class="relative flex items-start gap-[var(--line-gap,12px)] py-[13px]"
            data-testid="off-list"
          >
            <span
              class="mt-0.5 flex size-[22px] shrink-0 items-center justify-center rounded-sm"
              :class="
                gift.kind === 'mine'
                  ? 'bg-success text-white'
                  : 'bg-line-strong text-highlighted'
              "
              aria-hidden="true"
            >
              <UIcon name="i-lucide-check" class="size-3.5" />
            </span>
            <div class="flex min-w-0 grow flex-col text-base leading-[1.45]">
              <template v-if="gift.kind === 'mine'">
                <span class="font-semibold">{{
                  t('lists.visitor.myOffList', { text: gift.text })
                }}</span>
                <button
                  type="button"
                  class="flex min-h-11 items-center self-start text-sm font-bold text-toned underline underline-offset-2"
                  @click="removeOffList.mutate(gift.id, { onError })"
                >
                  {{ t('lists.doc.removeLine') }}
                </button>
              </template>
              <span
                v-else-if="gift.kind === 'holder'"
                class="text-toned line-through"
                >{{ t('lists.doc.offList', { text: gift.text }) }}
                <span class="no-underline"
                  >· {{ gift.by ?? t('lists.doc.anonymous') }}</span
                ></span
              >
              <span v-else class="text-toned line-through">{{
                t('lists.visitor.surprise')
              }}</span>
            </div>
          </li>
          <ListsOffListLine
            key="off-list-new"
            :token="token"
            :list-person-id="person.id"
            :for-name="nameOf(person)"
            :holder-name="holder"
          />
        </TransitionGroup>
      </section>
    </template>

    <UiSheet
      v-model:open="confirmOpen"
      :title="t('lists.doc.confirmRemove.title')"
      :description="t('lists.doc.confirmRemove.body')"
    >
      <template #footer>
        <div class="grid grid-cols-2 gap-2.5">
          <UButton
            variant="outline"
            color="neutral"
            class="h-12 justify-center font-semibold"
            :label="t('lists.doc.confirmRemove.keep')"
            @click="answerConfirm(false)"
          />
          <UButton
            color="error"
            class="h-12 justify-center font-bold"
            :label="t('lists.doc.confirmRemove.remove')"
            @click="answerConfirm(true)"
          />
        </div>
      </template>
    </UiSheet>
    <ListsClaimSheet
      v-if="changing && doc"
      v-model:open="changeOpen"
      :via="via"
      :idea="changing.idea"
      :for-name="changing.forName"
      :holder-name="holder"
      :anonymous-mode="doc.mode?.anonymous ?? false"
    />
    <ListsJoinSheet
      v-if="joining"
      v-model:open="joinOpen"
      :via="via"
      :idea="joining.idea"
      :for-name="joining.forName"
      :anonymous-mode="doc?.mode?.anonymous ?? false"
    />
  </ListsScreen>
</template>
