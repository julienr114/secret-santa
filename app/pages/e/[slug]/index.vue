<script setup lang="ts">
import { useSeen } from '~/composables/queries/useNews';
import { daysUntil } from '#server/utils/rules';
import { CATEGORY_DEFAULTS, partyEmoji } from '#shared/utils/categories';
import {
  useLeavePartyMutation,
  usePartyQuery,
} from '~/composables/queries/useParty';
import { categoryTint } from '~/utils/categories';

// The page of a party (docs/spec/v3/fete.md, maquettes V3Fete,
// V3FeteOrganisateur, V3FeteAnniversaire, V3FeteQuitter): its category,
// its name, the date of its year and how far it is; its members; its
// Secret Santas; the lists of its members; for a member, « Quitter cette
// fête ». A party « pour quelqu'un » shows its list first. Each row has
// its title, its text and maybe a red dot (lignes.md, tickets 112 and
// 120); « Les années passées », each opening that year (ticket 108).
definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t, tk, locale } = useT();
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const page = usePartyQuery(slug);
// « Retour »: the home, or « Quoi de neuf » when opened from there.
const back = useParent('event', '/');
const data = computed(() => page.data.value);
// The event opened: its news are seen (ticket 120).
useSeen(() =>
  data.value ? { target: 'party', targetId: data.value.party.id } : null,
);
useHead({
  title: () => `${data.value?.party.name ?? ''} — ${t('common.appName')}`,
});
const organiser = computed(() => data.value?.role === 'organiser');
const forSomeone = computed(
  () =>
    data.value &&
    CATEGORY_DEFAULTS[data.value.party.category].form === 'someone',
);
const today = new Date().toLocaleDateString('sv-SE');
const when = computed(() => {
  const date = data.value?.year?.date;
  if (!date) return null;
  const days = daysUntil(date, today);
  const full = new Intl.DateTimeFormat(locale.value, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T12:00:00Z`));
  const forWhom = data.value?.party.forWhom;
  // A birthday made for someone whose birth date is known: « ses 4 ans »
  // (ticket 118).
  const age = forWhom?.age
    ? t(forWhom.me ? 'party.age.mine' : 'party.age.theirs', {
        count: forWhom.age,
      })
    : null;
  const countdown =
    days === null
      ? null
      : days === 0
        ? t('party.today')
        : t('party.inDays', { count: days });
  return [full, countdown, age].filter(Boolean).join(' · ');
});
const { deedText, yearName } = usePastText();
const words = useLineText();

// A string in <component :is> does not resolve global components.
const NuxtLink = resolveComponent('NuxtLink');

const leaving = ref(false);
const leave = useLeavePartyMutation(slug);
const toast = useMessages();
const errorMessage = useErrorMessage();
const myLists = computed(
  () => data.value?.lists.filter((list) => list.mine).length ?? 0,
);
/**
 * What leaves with me and what stays (V3FeteQuitter, fete.md « Quitter »):
 * my list stays in my other events, or I alone will see it.
 */
const leavePoints = computed(() =>
  [
    ...(myLists.value > 0
      ? [
          t(
            data.value?.myListsAlone
              ? 'party.leave.listsAlone'
              : 'party.leave.listsElsewhere',
            { count: myLists.value },
          ),
        ]
      : []),
    t('party.leave.ticks'),
    ...((data.value?.secretSantas.length ?? 0) > 0
      ? [t('party.leave.secretSanta')]
      : []),
  ].map((text) => ({ text })),
);
const onLeave = () =>
  leave.mutate(undefined, {
    onSuccess: async () => {
      const name = data.value?.party.name ?? '';
      leaving.value = false;
      toast.done(t('party.leave.done', { name }));
      await navigateTo('/');
    },
    onError: (error) => toast.failed(errorMessage(error)),
  });
</script>

<template>
  <AdminScreen :back="back">
    <AdminQueryState
      :pending="page.isPending.value"
      :error="page.error.value"
      :skeleton="['head', 'members', 'sections']"
      skeleton-gap="md"
    >
      <template v-if="data">
        <div class="flex items-start gap-2">
          <div class="flex grow flex-col gap-2 px-1 pt-1">
            <span
              class="inline-flex h-6.5 items-center gap-1.5 self-start rounded-full pr-2.5 pl-2 text-[13px] font-bold"
              :class="categoryTint(data.party.category)"
              data-testid="party-category"
            >
              <UiEmoji
                v-if="partyEmoji(data.party)"
                :emoji="partyEmoji(data.party)!"
              />
              {{ tk(`party.category.${data.party.category}`)
              }}<template v-if="data.party.recurring">
                · {{ t('party.everyYear') }}</template
              >
            </span>
            <UiPageTitle>{{ data.party.name }}</UiPageTitle>
            <p
              v-if="when"
              class="text-[15px] font-bold text-primary"
              data-testid="party-when"
            >
              {{ when }}
            </p>
          </div>
          <NuxtLink
            v-if="organiser"
            :to="`/e/${slug}/reglages`"
            :aria-label="t('party.settings')"
            class="flex size-11 shrink-0 items-center justify-center rounded-full bg-default ring-1 ring-default"
          >
            <UIcon name="i-lucide-settings" class="size-5" />
          </NuxtLink>
        </div>

        <component
          :is="organiser ? NuxtLink : 'div'"
          :to="organiser ? `/e/${slug}/membres` : undefined"
          class="flex min-h-14 items-center gap-3 rounded-[28px] bg-default px-3.5 shadow-[0_3px_0_var(--color-peach-200),0_0_0_1.5px_var(--color-peach-200)]"
          data-testid="party-members"
        >
          <UiAvatarStack
            :avatars="data.members.avatars"
            :max="5"
            :label="t('party.members', { count: data.members.count })"
          />
          <span class="grow font-semibold">{{
            t('party.members', { count: data.members.count })
          }}</span>
          <UIcon
            v-if="organiser"
            name="i-lucide-chevron-right"
            class="size-5 shrink-0 text-dimmed"
          />
        </component>

        <div
          class="flex flex-col gap-6"
          :class="{ 'flex-col-reverse': forSomeone }"
        >
          <UiList
            v-if="data.secretSantas.length > 0 || data.canAddSecretSanta"
            :title="
              data.secretSantas.length > 0
                ? t('party.secretSantaTitle', {
                    count: organiser || data.secretSantas.length > 1 ? 2 : 1,
                  })
                : undefined
            "
            data-testid="party-secret-santas"
          >
            <template v-for="santa in data.secretSantas" :key="santa.id">
              <UiListItem
                icon="i-lucide-mail"
                icon-tone="neutral"
                :title="
                  data.secretSantas.length > 1
                    ? santa.label
                    : t('party.secretSantaTitle', { count: 1 })
                "
                :subtitle="words.line(santa.line)"
                :dot="santa.line?.dot ? t('lines.dot') : undefined"
                :to="santa.to ?? undefined"
                data-testid="party-santa"
              />
              <UiListItem
                v-if="santa.game"
                icon="i-lucide-circle-help"
                icon-tone="neutral"
                :title="t('lines.game.title')"
                :subtitle="words.line(santa.game.line)"
                :dot="santa.game.line.dot ? t('lines.dot') : undefined"
                :to="santa.game.to"
                data-testid="party-game"
              />
            </template>
            <UiAddRow
              v-if="data.canAddSecretSanta"
              :to="`/admin/${slug}/editions/nouvelle`"
              :label="
                data.secretSantas.length > 0
                  ? t('party.secretSanta.another')
                  : t('party.secretSanta.organise')
              "
            />
          </UiList>

          <section class="flex flex-col gap-1.5" data-testid="party-lists">
            <UiSectionTitle>{{
              forSomeone
                ? t('party.lists.titleSomeone')
                : t('party.lists.title')
            }}</UiSectionTitle>
            <template v-if="data.lists.length === 0">
              <p class="px-1 text-[15px] text-toned">
                {{ t('party.lists.none') }}
              </p>
              <UButton
                :to="`/listes/nouvelle?pour=${slug}`"
                color="neutral"
                variant="outline"
                icon="i-lucide-plus"
                class="self-start"
                :label="t('party.lists.new')"
              />
            </template>
            <ul
              v-else
              class="-mx-4 divide-y divide-default border-y border-default bg-default sm:mx-0 sm:rounded-lg sm:border"
            >
              <UiListItem
                v-for="list in data.lists"
                :key="list.id"
                :avatar="list.owner?.avatar"
                :icon="list.owner ? undefined : 'i-lucide-list-checks'"
                icon-tone="lilac"
                :title="words.part(list.title)"
                :subtitle="words.line(list.line)"
                :dot="list.line?.dot ? t('lines.dot') : undefined"
                :to="list.to ?? undefined"
                data-testid="party-list"
              />
              <UiAddRow
                :to="`/listes/nouvelle?pour=${slug}`"
                :label="t('party.lists.new')"
              />
            </ul>
          </section>
        </div>

        <UiList
          v-if="data.pastYears.length > 0"
          :title="t('party.past.years')"
          data-testid="party-past-years"
        >
          <UiListItem
            v-for="past in data.pastYears"
            :key="past.year"
            :title="yearName(past.category, past.year, past.forWhom)"
            :subtitle="deedText(past.deed, past.forWhom) || undefined"
            :to="`/e/${slug}/annees/${past.year}?depuis=evenement`"
          >
            <template #leading>
              <span
                class="w-9 shrink-0 text-center font-display text-[15px] font-bold text-toned"
                aria-hidden="true"
                >{{ past.year }}</span
              >
            </template>
          </UiListItem>
        </UiList>

        <UiList v-if="data.role === 'member'">
          <UiListItem
            icon="i-lucide-log-out"
            icon-tone="neutral"
            :title="t('party.leave.row')"
            :chevron="true"
            :on-click="() => (leaving = true)"
          />
        </UiList>

        <UiSheet
          v-model:open="leaving"
          :title="t('party.leave.title', { name: data.party.name })"
          :busy="leave.isPending.value"
        >
          <UiPointList :points="leavePoints" />
          <template #footer>
            <UButton
              block
              color="error"
              :loading="leave.isPending.value"
              :label="t('party.leave.confirm')"
              @click="onLeave"
            />
            <UButton
              block
              color="neutral"
              variant="ghost"
              :label="t('party.leave.stay')"
              @click="leaving = false"
            />
          </template>
        </UiSheet>
      </template>
    </AdminQueryState>
  </AdminScreen>
</template>
