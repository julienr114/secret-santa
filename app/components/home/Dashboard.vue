<script setup lang="ts">
import {
  currentDraws,
  groupCards,
  homeLayout,
  pickHomeAction,
  type HomeActionKind,
} from '#server/utils/home';
import { useHomeQuery } from '~/composables/queries/useAuth';
import { formatDay } from '~/utils/labels';

// The home of a logged-in account, the same for everyone (README 11): a
// greeting, the one card of what to do now (README 22.10), then the draws
// or the groups, laid out by what the account has.
const { t, locale } = useT();
const home = useHomeQuery();
useHead({
  title: () => `${t('auth.home.title')} — ${t('common.appName')}`,
});
const data = computed(() => home.data.value);
const draws = computed(() => data.value?.draws ?? []);
const groups = computed(() => data.value?.groups ?? []);
const layout = computed(() =>
  homeLayout({ draws: draws.value, groups: groups.value }),
);
const going = computed(() => currentDraws(draws.value));
const hasPast = computed(() =>
  draws.value.some((draw) => draw.status === 'closed'),
);
const cards = computed(() =>
  groupCards({ draws: draws.value, groups: groups.value }),
);
const fromHome = useDrawFromHome();
/**
 * Remembers that a draw was opened from the home, for its back button.
 * @param path - The personal page of the draw.
 * @returns Nothing.
 */
const onOpen = (path: string) => {
  fromHome.value = { path };
};

// The card on top, without those put off with "Plus tard".
const { dismissed, dismiss } = useHomeDismissed();
const today = new Date().toLocaleDateString('sv-SE');
const action = computed(() =>
  data.value ? pickHomeAction(data.value, today, dismissed.value) : null,
);
/** Cards about the one draw, which its own card already shows. */
const ABOUT_THE_DRAW: readonly HomeActionKind[] = ['discover', 'addWishes'];
const topCard = computed(() =>
  layout.value === 'singleDraw' &&
  action.value &&
  ABOUT_THE_DRAW.includes(action.value.kind)
    ? null
    : action.value,
);
/** The draw the top card is about, if any: its journal news goes there. */
const topDraw = computed(() => {
  const to = topCard.value?.to;
  return to
    ? (draws.value.find(
        (draw) => to === draw.path || to.startsWith(`${draw.path}/`),
      ) ?? null)
    : null;
});
/** The account has several groups: the top card names its own. */
const named = computed(
  () =>
    new Set([
      ...groups.value.map((group) => group.id),
      ...going.value.map((draw) => draw.groupId),
    ]).size > 1,
);
/** Draws going on, the one waiting for an action first. */
const STEP_ORDER = ['discover', 'addWishes', 'seeAgain', 'wait', 'closed'];
const sortedDraws = computed(() =>
  going.value.toSorted(
    (a, b) => STEP_ORDER.indexOf(a.step) - STEP_ORDER.indexOf(b.step),
  ),
);
const single = computed(() => going.value[0] ?? null);

const avatar = computed(() => data.value?.avatar);
const avatarOpen = ref(false);
const greeting = computed(() =>
  data.value?.firstName
    ? t('auth.home.hello', { name: data.value.firstName })
    : t('auth.home.helloNobody'),
);

// Creating a group, or asking for one while the app is in beta.
const canCreate = computed(() => data.value?.canCreateGroup ?? false);
const groupsLeft = computed(() => data.value?.groupsLeft ?? null);
const request = computed(() => data.value?.request ?? null);
const isPending = computed(() => request.value?.status === 'pending');
const requestNote = computed(() => {
  if (!request.value || request.value.status === 'approved') return null;
  const date = formatDay(request.value.createdAt, locale.value);
  return isPending.value
    ? t('auth.home.requestPending', { date })
    : t('auth.home.requestRefused', { date });
});
const requestOpen = ref(false);
/** A super-admin finds the administration at the bottom of the home. */
const isSuper = computed(() => data.value?.role === 'super_admin');
const pendingRequests = computed(() => data.value?.pendingRequests ?? 0);
</script>

<template>
  <AdminScreen>
    <AdminQueryState
      :pending="home.isPending.value"
      :error="home.error.value"
      :skeleton="['header', 'card', 'groups']"
    >
      <div class="flex items-center gap-4">
        <button
          v-if="avatar"
          type="button"
          class="relative shrink-0 rounded-full focus-visible:ring-2 focus-visible:ring-primary"
          :aria-label="t('auth.home.editAvatar')"
          @click="avatarOpen = true"
        >
          <UiAvatar :avatar="avatar" size="lg" />
          <span
            class="absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-full bg-default shadow ring-1 ring-default"
            aria-hidden="true"
          >
            <UIcon name="i-lucide-pencil" class="size-3 text-muted" />
          </span>
        </button>
        <UiPageTitle class="min-w-0 truncate">{{ greeting }}</UiPageTitle>
      </div>

      <HomeTopCard
        v-if="topCard"
        :action="topCard"
        :named="named"
        :oldest-request="data?.oldestRequest"
        :signal-draw="topDraw"
        @later="dismiss"
      />

      <template v-if="layout === 'singleDraw' && single">
        <HomeDrawCard :draw="single" @open="onOpen(single.path)" />
        <UiList v-if="single.wishlist || hasPast">
          <UiListItem
            v-if="single.wishlist"
            :to="`${single.path}/souhaits`"
            icon="i-lucide-list-checks"
            :title="t('auth.home.myWishes')"
            @click="onOpen(single.path)"
          />
          <UiListItem
            v-if="hasPast"
            to="/tirages-passes"
            icon="i-lucide-archive"
            :title="t('auth.home.pastDraws')"
          />
        </UiList>
      </template>

      <template v-else-if="layout === 'draws'">
        <UiList
          :title="t('auth.home.myDraws')"
          title-size="lg"
          data-testid="home-draws"
        >
          <HomeDrawRow
            v-for="draw in sortedDraws"
            :key="draw.id"
            :draw="draw"
            :quiet-journal="draw.id === topDraw?.id"
            @open="onOpen(draw.path)"
          />
        </UiList>
        <UiList v-if="hasPast">
          <UiListItem
            to="/tirages-passes"
            icon="i-lucide-archive"
            :title="t('auth.home.pastDraws')"
          />
        </UiList>
      </template>

      <template v-else-if="layout === 'groups'">
        <section class="flex flex-col gap-3" data-testid="home-groups">
          <UiSectionTitle>{{ t('auth.home.myGroups') }}</UiSectionTitle>
          <HomeGroupCard
            v-for="card in cards"
            :key="card.groupId"
            :card="card"
            :quiet-draw-id="topDraw?.id"
            @open="onOpen"
          />
        </section>
        <UiList>
          <UiListItem
            v-if="canCreate"
            to="/admin/groupes/nouveau"
            icon="i-lucide-plus"
            :title="t('auth.home.createGroup')"
            :subtitle="
              groupsLeft === null
                ? undefined
                : t('auth.home.groupsLeft', { count: groupsLeft })
            "
          />
          <li v-else-if="requestNote" class="px-4 py-3 text-sm" role="status">
            {{ requestNote }}
          </li>
          <UiListItem
            v-if="!canCreate && !isPending"
            icon="i-lucide-send"
            :title="t('auth.home.organizeOwn')"
            :subtitle="t('auth.home.organizeOwnHint')"
            :on-click="() => (requestOpen = true)"
          />
          <UiListItem
            v-if="hasPast"
            to="/tirages-passes"
            icon="i-lucide-archive"
            :title="t('auth.home.pastDraws')"
          />
        </UiList>
      </template>

      <template v-else>
        <UiCard
          padding="none"
          class="flex flex-col gap-2.5 px-5 py-6"
          data-testid="home-empty"
        >
          <h2 class="font-display text-[22px] leading-[1.2] font-semibold">
            {{ t('auth.home.empty.title') }}
          </h2>
          <p class="text-[15px] leading-[1.45] text-toned">
            {{ t('auth.home.empty.body') }}
          </p>
          <p class="text-sm leading-[1.45] text-toned">
            {{ t('auth.home.empty.link') }}
          </p>
        </UiCard>
        <UiList v-if="hasPast">
          <UiListItem
            to="/tirages-passes"
            icon="i-lucide-archive"
            :title="t('auth.home.pastDraws')"
          />
        </UiList>
        <HomeRequestCard
          v-if="!canCreate && requestNote && request"
          :request="request"
          @again="requestOpen = true"
        />
        <UiCard
          v-else
          padding="lg"
          class="flex flex-col gap-3"
          data-testid="home-organize"
        >
          <h2 class="font-display text-xl font-bold">
            {{ t('auth.home.organize.title') }}
          </h2>
          <p class="text-sm text-muted">{{ t('auth.home.requestWhy') }}</p>
          <UButton
            v-if="canCreate"
            to="/admin/groupes/nouveau"
            block
            variant="outline"
            icon="i-lucide-plus"
            class="min-h-11 justify-center"
            :label="t('auth.home.createGroup')"
          />
          <UButton
            v-else-if="!isPending"
            block
            variant="outline"
            icon="i-lucide-send"
            class="min-h-11 justify-center"
            :label="t('auth.home.organize.button')"
            @click="requestOpen = true"
          />
        </UiCard>
      </template>

      <UiList v-if="layout === 'singleDraw' || layout === 'draws'">
        <UiListItem
          v-if="canCreate"
          to="/admin/groupes/nouveau"
          icon="i-lucide-plus"
          :title="t('auth.home.createGroup')"
          :subtitle="
            groupsLeft === null
              ? undefined
              : t('auth.home.groupsLeft', { count: groupsLeft })
          "
        />
        <li v-else-if="requestNote" class="px-4 py-3 text-sm" role="status">
          {{ requestNote }}
        </li>
        <UiListItem
          v-if="!canCreate && !isPending"
          icon="i-lucide-send"
          :title="t('auth.home.organizeOwn')"
          :subtitle="t('auth.home.organizeOwnHint')"
          :on-click="() => (requestOpen = true)"
        />
      </UiList>
      <UiList
        v-if="isSuper"
        :title="t('auth.account.superAdmin')"
        data-testid="home-admin"
      >
        <UiListItem
          to="/admin"
          icon="i-lucide-shield"
          icon-tone="neutral"
          :title="t('auth.admin.title')"
          :subtitle="t('auth.home.adminHint')"
        >
          <template v-if="pendingRequests > 0" #trailing>
            <UiCountBadge
              :count="pendingRequests"
              :label="
                t('auth.home.requestsToHandle', { count: pendingRequests })
              "
            />
          </template>
        </UiListItem>
      </UiList>
    </AdminQueryState>

    <HomeProfileSheet
      v-if="avatar"
      v-model:open="avatarOpen"
      :initial="avatar"
    />
    <HomeRequestSheet v-model:open="requestOpen" />
  </AdminScreen>
</template>
