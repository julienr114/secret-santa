<script setup lang="ts">
import { partyEmoji } from '#shared/utils/categories';
import { clockTime } from '#shared/utils/dates';
import { NEWS_SHAPE, newsWhen } from '#shared/utils/news';
import type { NewsLine, NewsSection } from '#server/database/newsPage';
import { api } from '~/composables/queries/useApi';
import { keys } from '~/composables/queries/keys';
import { useNewsQuery } from '~/composables/queries/useNews';
import { useQueryClient } from '@tanstack/vue-query';

// « Quoi de neuf », the tab of the bar at the bottom (ticket 120,
// docs/spec/v3/accueil-et-creation.md, V3QuoiDeNeuf): a section per
// event, the one with the latest news on top; a public list where I
// ticked has its own. A news not seen yet is in bold with a red dot; it
// goes when I open the thing, never by opening this page. At the top,
// the word of the app, until closed; at the bottom, that everything goes
// after thirty days. Read again on coming back to the page.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t, tk, locale } = useT();
useHead({
  title: () => `${t('common.tabs.news')} — ${t('common.appName')}`,
});
const page = useNewsQuery();
const sections = computed(() => page.data.value?.sections ?? []);
const note = computed(() => page.data.value?.note ?? null);

// The time is read where the reader is: in the browser only.
const mounted = ref(false);
onMounted(() => {
  mounted.value = true;
});
/**
 * When a news happened: « Aujourd'hui, 9 h 12 », « Hier, 18 h 02 », a
 * day of the week, a date.
 * @param at - When (ISO).
 * @returns The words, empty before the page is in the browser.
 */
const when = (at: string): string => {
  if (!mounted.value) return '';
  const said = newsWhen(at, new Date().toISOString());
  if (said.day === 'today' || said.day === 'yesterday') {
    return t(`news.${said.day}`, { time: clockTime(at, locale.value) });
  }
  const words = new Intl.DateTimeFormat(
    locale.value,
    said.day === 'weekday'
      ? { weekday: 'long' }
      : { day: 'numeric', month: 'short' },
  ).format(new Date(at));
  return words.charAt(0).toUpperCase() + words.slice(1);
};
/**
 * What a news says.
 * @param line - The news.
 * @returns Its words.
 */
const text = (line: NewsLine): string => {
  const params = {
    count: line.count,
    name: line.name ?? '',
    detail: line.detail ?? '',
  };
  if (line.kind === 'new_ideas' && !line.name) {
    return t('news.kind.new_ideasCount', params);
  }
  // « Hugo s'inscrit par le lien (Les adultes) », when the event has
  // several Secret Santa that year (ticket 116).
  if (line.kind === 'joined' && line.detail) {
    return t('news.kind.joinedIn', params);
  }
  return tk(`news.kind.${line.kind}`, params);
};
/** A list's news show a list; the others an envelope, or people. */
const iconOf = (line: NewsLine) => {
  const target = NEWS_SHAPE[line.kind].target;
  if (target === 'list') {
    return { icon: 'i-lucide-list-checks', tone: 'lilac' as const };
  }
  if (target === 'party') {
    return { icon: 'i-lucide-users', tone: 'neutral' as const };
  }
  return { icon: 'i-lucide-mail', tone: 'neutral' as const };
};

/**
 * The emoji of a section: its event's, or its list's.
 * @param section - The section.
 * @returns The emoji, or null.
 */
const emojiOf = (section: NewsSection): string | null =>
  section.category
    ? partyEmoji({ category: section.category, iconEmoji: section.emoji })
    : section.emoji;

const queryClient = useQueryClient();
const closing = ref(false);
/** Closes the word of the app, for good. */
const closeNote = async () => {
  if (!note.value) return;
  closing.value = true;
  await api('/api/news/note', {
    method: 'POST',
    body: { noteId: note.value.id },
  }).catch(() => undefined);
  await queryClient.invalidateQueries({ queryKey: keys.news() });
  closing.value = false;
};
</script>

<template>
  <AdminScreen>
    <AdminQueryState
      :pending="page.isPending.value"
      :error="page.error.value"
      :skeleton="['title', 'news']"
      skeleton-gap="md"
    >
      <div class="px-1 pt-1">
        <UiPageTitle>{{ t('common.tabs.news') }}</UiPageTitle>
      </div>

      <div
        v-if="note"
        class="flex items-start gap-3 rounded-2xl bg-lilac-100 py-3 pr-1.5 pl-4 text-[15px] text-lilac-800"
        data-testid="news-note"
      >
        <p class="grow pt-1.5">{{ tk(note.key) }}</p>
        <UButton
          icon="i-lucide-x"
          color="neutral"
          variant="ghost"
          class="size-11 shrink-0 justify-center"
          :aria-label="t('news.close')"
          :loading="closing"
          @click="closeNote"
        />
      </div>

      <p v-if="sections.length === 0" class="px-1 text-[15px] text-toned">
        {{ t('news.empty') }}
      </p>

      <section
        v-for="section in sections"
        :key="section.key"
        class="flex flex-col gap-1.5"
        data-testid="news-section"
      >
        <h2 class="flex items-center gap-2 px-1 font-display text-lg font-bold">
          <!-- A list of its own, out of my events: the tile of « Autre ». -->
          <UiEventTile
            :emoji="emojiOf(section)"
            :category="section.category ?? 'other'"
            :size="30"
          />
          {{ section.title }}
        </h2>
        <ul
          class="-mx-4 divide-y divide-default border-y border-default bg-default sm:mx-0 sm:overflow-hidden sm:rounded-lg sm:border"
        >
          <UiListItem
            v-for="line in section.news"
            :key="line.id"
            :icon="iconOf(line).icon"
            :icon-tone="iconOf(line).tone"
            :title="text(line)"
            :subtitle="when(line.at) || undefined"
            :strong="!line.seen"
            :dot="line.seen ? undefined : t('lines.dot')"
            :to="line.to ?? undefined"
            data-testid="news-line"
          />
        </ul>
      </section>

      <p class="px-1 text-[13px] text-toned">{{ t('news.forget') }}</p>
    </AdminQueryState>
  </AdminScreen>
</template>
