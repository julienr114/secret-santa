<script setup lang="ts">
import { daysUntil } from '#server/utils/lists';
import { formatEventDate } from '#server/utils/rules';
import type { ListCard } from '#server/http/lists';
import { useListsQuery } from '~/composables/queries/useLists';

// The « Listes » tab (README 22.19, maquettes ListesAccueil and
// ListesVide): one run of cards by date, mine and those sent to me mixed;
// on each, who holds it, the tile, the name, the day, « Pour » and the
// icons of those who receive, then what I give there. Then « Passées ».
// Without a list, a card that says what lists are for.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t, locale } = useT();
useHead({ title: () => `${t('lists.home.title')} — ${t('common.appName')}` });
const query = useListsQuery();
const coming = computed(() => query.data.value?.coming ?? []);
const past = computed(() => query.data.value?.past ?? []);
const empty = computed(() => coming.value.length + past.value.length === 0);
const today = new Date().toISOString().slice(0, 10);

/**
 * « Le 25 décembre · dans 37 jours », or nothing without a day.
 * @param card - The list.
 * @returns The line under its name.
 */
const dateLine = (card: ListCard) => {
  if (!card.eventDate) return '';
  const on = t('lists.home.on', {
    date: formatEventDate(card.eventDate, locale.value),
  });
  const days = daysUntil(card.eventDate, today);
  return days === 0
    ? `${on} · ${t('lists.home.today')}`
    : `${on} · ${t('lists.home.inDays', { count: days })}`;
};
/**
 * What a past list's row says under its name.
 * @param card - The list.
 * @returns The line.
 */
const pastLine = (card: ListCard) => {
  if (card.holder) {
    return `${t('lists.home.listOf', { name: card.holder.name })} · ${t('lists.home.youGave', { count: card.mine })}`;
  }
  const on = card.eventDate
    ? t('lists.home.on', {
        date: formatEventDate(card.eventDate, locale.value),
      })
    : '';
  const offered =
    card.people.length === 1
      ? t('lists.home.offeredTo', {
          count: card.planned,
          name: card.people[0]!.firstName,
        })
      : t('lists.home.offered', { count: card.planned });
  return on ? `${on} · ${offered}` : offered;
};
</script>

<template>
  <AdminScreen>
    <AdminQueryState
      :pending="query.isPending.value"
      :error="query.error.value"
      :skeleton="['title', 'card', 'card']"
    >
      <div class="flex items-start justify-between gap-3">
        <div class="flex flex-col gap-1">
          <UiPageTitle>{{ t('lists.home.title') }}</UiPageTitle>
          <p class="text-[15px] text-toned">{{ t('lists.home.intro') }}</p>
        </div>
        <UButton
          v-if="!empty"
          to="/listes/nouvelle"
          icon="i-lucide-plus"
          class="h-11 shrink-0 font-bold"
          :label="t('lists.home.new')"
        />
      </div>

      <template v-if="empty">
        <UiCard
          padding="lg"
          class="flex flex-col items-center gap-3 text-center"
          data-testid="lists-empty"
        >
          <UiIllusChecklist />
          <h2 class="font-display text-[24px] leading-[1.2] font-bold">
            {{ t('lists.home.empty.title') }}
          </h2>
          <p class="text-[15px] leading-[1.5] text-toned">
            {{ t('lists.home.empty.body') }}
          </p>
          <UButton
            to="/listes/nouvelle"
            block
            size="xl"
            class="h-12 justify-center font-bold"
            :label="t('lists.home.empty.create')"
          />
        </UiCard>
        <p class="px-1 text-sm text-toned">{{ t('lists.home.empty.sent') }}</p>
      </template>

      <section v-if="coming.length > 0" class="flex flex-col gap-2.5">
        <UiSectionTitle>{{ t('lists.home.coming') }}</UiSectionTitle>
        <NuxtLink
          v-for="card in coming"
          :key="card.id"
          :to="card.holder ? `/l/${card.holder.token}` : `/listes/${card.id}`"
          class="flex flex-col gap-3 rounded-2xl bg-default p-4 shadow-card"
          data-testid="list-card"
        >
          <p
            class="flex items-center gap-2 border-b border-default pb-2.5 text-sm font-semibold"
            :class="card.holder ? '' : 'text-primary-ink'"
          >
            <UiAvatar
              v-if="card.holder"
              :avatar="card.holder.avatar"
              size="sm"
            />
            <span v-if="card.holder">{{
              t('lists.home.listOf', { name: card.holder.name })
            }}</span>
            <span v-else-if="card.status === 'draft'">{{
              t('lists.home.draft')
            }}</span>
            <span v-else>{{ t('lists.home.youHold') }}</span>
          </p>
          <div class="flex items-center gap-3">
            <ListsTile :icon="card.icon" />
            <div class="flex min-w-0 grow flex-col gap-0.5">
              <h3
                class="font-display text-[24px] leading-[1.1] font-bold break-words"
              >
                {{ card.title || t('lists.home.untitled') }}
              </h3>
              <p v-if="card.eventDate" class="text-sm text-toned">
                {{ dateLine(card) }}
              </p>
            </div>
            <UIcon
              name="i-lucide-chevron-right"
              class="size-5 shrink-0 text-dimmed"
            />
          </div>
          <div
            v-if="card.people.length > 0 || card.newIdeas > 0"
            class="flex items-center gap-2 text-sm text-toned"
          >
            <template v-if="card.people.length > 0">
              <span>{{ t('lists.home.for') }}</span>
              <UiAvatarStack
                :avatars="card.people.map((p) => p.avatar)"
                :label="card.people.map((p) => p.firstName).join(', ')"
              />
            </template>
            <span
              v-if="card.newIdeas > 0"
              class="rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-inverted"
              >{{ t('lists.home.newIdeas', { count: card.newIdeas }) }}</span
            >
          </div>
          <p class="text-sm leading-[1.45]" data-testid="list-card-sentence">
            <template v-if="card.sentence.key === 'planned'">
              <strong>{{
                t('lists.home.planned', { count: card.sentence.count })
              }}</strong>{{
                card.sentence.mine > 0
                  ? t('lists.home.plannedMine', { mine: card.sentence.mine })
                  : t('lists.home.plannedEnd')
              }}
            </template>
            <strong v-else-if="card.sentence.key === 'giving'">{{
              t('lists.home.giving', { count: card.sentence.count })
            }}</strong>
            <template v-else>{{
              t(`lists.home.${card.sentence.key}`)
            }}</template>
            <template v-if="!card.holder && card.noIdeas.length > 0">
              {{
                ' ' +
                t('lists.home.noIdeas', {
                  count: card.noIdeas.length,
                  names: card.noIdeas.join(', '),
                })
              }}
            </template>
          </p>
        </NuxtLink>
      </section>

      <UiList
        v-if="past.length > 0"
        :title="t('lists.home.past')"
        data-testid="lists-past"
      >
        <li v-for="card in past" :key="card.id">
          <NuxtLink
            :to="card.holder ? `/l/${card.holder.token}` : `/listes/${card.id}`"
            class="flex min-h-14 items-center gap-3 px-4 py-2.5"
          >
            <ListsTile :icon="card.icon" size="sm" />
            <span class="flex min-w-0 grow flex-col">
              <span class="truncate font-semibold">{{
                card.title || t('lists.home.untitled')
              }}</span>
              <span class="truncate text-[13px] text-toned">{{
                pastLine(card)
              }}</span>
            </span>
            <UIcon
              name="i-lucide-chevron-right"
              class="size-5 shrink-0 text-dimmed"
            />
          </NuxtLink>
        </li>
      </UiList>
      <p v-if="!empty" class="px-1 text-sm text-toned">
        {{ t('lists.home.sent') }}
      </p>
    </AdminQueryState>
  </AdminScreen>
</template>
