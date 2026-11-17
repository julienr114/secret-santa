<script setup lang="ts">
import { formatEventDate } from '#server/utils/rules';
import { useEditionQuery } from '~/composables/queries/useGroup';

// « Réglages de l'édition » (README 22.16, maquette EditionReglages): what
// the participants of this edition see, the date of the party, the budget
// and the word, each changed in the sheet that already exists. Once the
// edition is closed, read only.
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
      <UiList data-testid="edition-settings">
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
    </AdminQueryState>
    <AdminPartyDateSheet
      v-if="!closed"
      v-model:open="dateOpen"
      :slug="slug"
      :edition-id="id"
      :value="eventDate"
    />
  </AdminScreen>
</template>
