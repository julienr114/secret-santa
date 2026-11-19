<script setup lang="ts">
import type { IdeaLine, PersonLine } from '#server/http/lists';
import { formatEventDate } from '#server/utils/rules';
import {
  useLinkQuery,
  useRemoveOffListMutation,
  useTickMutation,
  useUntickMutation,
} from '~/composables/queries/useLists';
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
const token = computed(() => String(route.params.token));
const { t, locale } = useT();
const toast = useToast();
const errorMessage = useErrorMessage();
const { loggedIn } = useUserSession();
const query = useLinkQuery(token);
const via = computed(() => ({ token: token.value }));
const tick = useTickMutation(via);
const untick = useUntickMutation(via);
const removeOffList = useRemoveOffListMutation(token);
const doc = computed(() => query.data.value);
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
    m.shoeSize ? t('lists.doc.shoe', { size: m.shoeSize }) : null,
  ].filter(Boolean);
  return [
    m.age === null ? null : t('lists.doc.age', { count: m.age }),
    sizes.length > 0 ? sizes.join(', ') : null,
  ]
    .filter(Boolean)
    .join(' · ');
};

const onError = (error: unknown) =>
  toast.add({
    title:
      (error as { statusMessage?: string }).statusMessage === 'taken'
        ? t('lists.visitor.takenNow')
        : errorMessage(error),
    color: 'error',
  });
/**
 * Ticks an idea: at once when logged in, after an address otherwise.
 * @param idea - The idea.
 * @returns Nothing.
 */
const onTick = (idea: IdeaLine) => {
  if (!loggedIn.value) {
    return navigateTo(
      `/l/${token.value}/connexion?cocher=${encodeURIComponent(idea.id)}`,
    );
  }
  tick.mutate({ ideaId: idea.id }, { onError });
};
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
    tick.mutate({ ideaId: idea.id }, { onError });
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
/** My own section, where I write. */
const writes = (person: PersonLine) =>
  Boolean(doc.value?.figures) && person.mine;
</script>

<template>
  <ListsScreen
    :back="loggedIn ? '/listes' : undefined"
    :pending="query.isPending.value"
    :error="query.error.value"
    :skeleton="['title', 'card', 'list']"
  >
    <template v-if="doc">
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
        v-for="person in doc.people"
        :key="person.id"
        class="flex flex-col gap-1"
        data-testid="visitor-person"
      >
        <header class="flex items-center gap-3 pb-1">
          <UiAvatar
            :avatar="person.member.avatar"
            class="size-[52px]! text-[26px]!"
          />
          <div class="flex min-w-0 flex-col">
            <h2 class="font-display text-[28px] leading-[1.1] font-bold">
              {{ person.member.firstName }}
            </h2>
            <p
              v-if="writes(person)"
              class="text-sm font-semibold text-primary-ink"
              data-testid="its-you"
            >
              {{ t('lists.visitor.itsYou') }}
            </p>
            <p v-else class="text-sm text-toned">
              {{ details(person)
              }}<template v-if="details(person)"> · </template>
              <NuxtLink
                :to="`/l/${token}/gouts/${person.id}`"
                class="text-primary-ink underline"
                >{{ t('lists.doc.tastes') }}</NuxtLink
              >
            </p>
          </div>
        </header>
        <ul v-if="writes(person)" class="flex flex-col pl-5">
          <ListsIdeaLine
            v-for="(idea, index) in person.ideas"
            :key="idea.id"
            :via="via"
            :list-person-id="person.id"
            :for-name="person.member.firstName"
            :idea="idea"
            :line="`${person.id}:${index}`"
          />
          <ListsIdeaLine
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
        </ul>
        <ul v-else class="flex flex-col pl-5">
          <ListsVisitorLine
            v-for="idea in person.ideas"
            :key="idea.id"
            :idea="idea"
            @tick="onTick(idea)"
            @untick="onUntick(idea)"
            @change="changing = { idea, forName: person.member.firstName }"
            @join="onJoin(idea, person.member.firstName)"
          />
          <li
            v-for="gift in person.offList"
            :key="gift.id"
            class="flex items-start gap-3 py-2"
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
            :token="token"
            :list-person-id="person.id"
            :for-name="person.member.firstName"
            :holder-name="holder"
          />
        </ul>
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
    />
    <ListsJoinSheet
      v-if="joining"
      v-model:open="joinOpen"
      :via="via"
      :idea="joining.idea"
      :for-name="joining.forName"
    />
  </ListsScreen>
</template>
