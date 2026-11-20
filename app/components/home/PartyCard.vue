<script setup lang="ts">
import type { HomeParty } from '#server/database/homeParties';
import { partyEmoji } from '#shared/utils/categories';
import { categoryTint } from '~/utils/categories';
import { formatShortDay } from '~/utils/labels';

// A party on the home (docs/spec/v3/accueil-et-creation.md, V3Accueil):
// its header opens it; below, its Secret Santas and the lists of its
// members, at the same level, each with its title only (Q-006).
// « Nouvelle liste » while I have none in it.
const props = defineProps<{ party: HomeParty & { date: string | null } }>();
const { t, locale } = useT();
const emoji = computed(() => partyEmoji(props.party));
const hasMine = computed(() => props.party.lists.some((list) => list.mine));
const fromHome = useDrawFromHome();
/**
 * Remembers that a Secret Santa was opened from the home, for its back
 * button.
 * @param to - The page opened.
 */
const onSecretSanta = (to: string | null) => {
  if (to?.startsWith('/p/')) fromHome.value = { path: to };
};
</script>

<template>
  <section
    class="overflow-hidden rounded-[28px] bg-default shadow-[0_3px_0_var(--color-peach-200),0_0_0_1.5px_var(--color-peach-200)]"
    data-testid="home-party"
  >
    <NuxtLink
      :to="`/f/${party.slug}`"
      class="flex min-h-14 items-center gap-2.5 px-4 py-2.5 transition-colors active:bg-muted"
    >
      <span
        class="flex size-8 shrink-0 items-center justify-center rounded-[9px] text-base"
        :class="categoryTint(party.category)"
        aria-hidden="true"
      >
        <UiEmoji v-if="emoji" :emoji="emoji" />
      </span>
      <h3 class="min-w-0 grow font-display text-lg leading-tight font-bold">
        {{ party.name }}
      </h3>
      <span
        v-if="party.date"
        class="shrink-0 text-[13px] font-bold whitespace-nowrap text-toned"
        >{{ formatShortDay(party.date, locale) }}</span
      >
      <UIcon
        name="i-lucide-chevron-right"
        class="size-4.5 shrink-0 text-dimmed"
      />
    </NuxtLink>
    <ul class="divide-y divide-default border-t border-default">
      <UiListItem
        v-for="santa in party.secretSantas"
        :key="santa.id"
        icon="i-lucide-mail"
        icon-tone="neutral"
        :title="
          party.secretSantas.length > 1
            ? santa.label
            : t('party.secretSantaTitle', { count: 1 })
        "
        :to="santa.to ?? undefined"
        @click="onSecretSanta(santa.to)"
      />
      <UiListItem
        v-for="list in party.lists"
        :key="list.id"
        icon="i-lucide-list-checks"
        icon-tone="lilac"
        :title="
          list.mine
            ? t('party.lists.mine')
            : t('party.lists.of', { name: list.ownerName ?? '' })
        "
        :to="list.to ?? undefined"
      />
      <UiAddRow
        v-if="!hasMine"
        to="/listes/nouvelle"
        :label="t('party.lists.new')"
      />
    </ul>
  </section>
</template>
