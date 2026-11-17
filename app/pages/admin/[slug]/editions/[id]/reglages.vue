<script setup lang="ts">
import { formatEventDate } from '#server/utils/rules';
import { useEditionQuery } from '~/composables/queries/useGroup';

// « Réglages de l'édition » (README 22.16, maquettes EditionReglages and
// PropEditionReglages): what the participants of this edition see, the
// party (date, budget, word) and the game « Devine qui » (22.17), each
// changed in its sheet. Once the edition is closed, read only; the game
// no longer changes once the draw is revealed.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const id = computed(() => String(route.params.id));
const { t, locale } = useT();
const context = useScreenContext(slug, id);
useHead({
  title: () => context.titleOf(t('adminEdition.settings.title')),
});
const screen = computed(() => ({
  back: `/admin/${slug.value}/editions/${id.value}`,
}));

const edition = useEditionQuery(slug, id);
const closed = computed(() => edition.data.value?.edition.status === 'closed');
const eventDate = computed(() => edition.data.value?.rules.eventDate ?? '');
const label = computed(() => edition.data.value?.edition.label ?? '');
const dateOpen = ref(false);
const guess = computed(() => edition.data.value?.guess);
const gameFixed = computed(
  () => closed.value || Boolean(edition.data.value?.edition.revealedAt),
);
const guessOpen = ref(false);
</script>

<template>
  <AdminScreen v-bind="screen">
    <AdminQueryState
      :pending="edition.isPending.value"
      :error="edition.error.value"
      :skeleton="['title', 'list']"
    >
      <div class="flex flex-col gap-1">
        <UiPageContext
          :parts="context.parts.value"
          :label="t('common.context')"
        />
        <UiPageTitle>{{ t('adminEdition.settings.title') }}</UiPageTitle>
        <p class="text-[15px] text-toned">
          {{ t('adminEdition.settings.intro', { label }) }}
        </p>
      </div>
      <UiList
        :title="t('adminEdition.settings.party')"
        data-testid="edition-settings"
      >
        <UiListItem
          icon="i-lucide-calendar"
          icon-tone="neutral"
          :title="t('adminEdition.settings.dateTitle')"
          :value="
            eventDate
              ? formatEventDate(eventDate, locale)
              : t('adminEdition.screen.rules.none')
          "
          :chevron="!closed"
          :on-click="closed ? undefined : () => (dateOpen = true)"
          data-testid="setting-date"
        />
        <AdminEditionRuleRows
          :slug="slug"
          :edition-id="id"
          :readonly="closed"
          values
        />
      </UiList>
      <UiList v-if="guess" :title="t('adminEdition.settings.game')">
        <UiListItem
          icon="i-lucide-search"
          icon-tone="neutral"
          :title="t('adminEdition.guess.title')"
          :value="t(`adminEdition.guess.mode.${guess.mode}`)"
          :chevron="!gameFixed"
          :on-click="gameFixed ? undefined : () => (guessOpen = true)"
          data-testid="setting-guess"
        />
      </UiList>
    </AdminQueryState>
    <AdminPartyDateSheet
      v-if="!closed"
      v-model:open="dateOpen"
      :slug="slug"
      :edition-id="id"
      :value="eventDate"
    />
    <AdminGuessSheet
      v-if="guess && !gameFixed && eventDate"
      v-model:open="guessOpen"
      :slug="slug"
      :edition-id="id"
      :guess="guess"
      :event-date="eventDate"
    />
  </AdminScreen>
</template>
