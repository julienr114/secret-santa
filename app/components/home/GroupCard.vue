<script setup lang="ts">
import type { GroupCard } from '#server/utils/home';
import type { HomeDraw } from '~/composables/queries/useAuth';

// One group on the home of an account that organises: its name (with
// "Organisateur" when the account organises it), the edition and the
// party, then the account's own draw and the way to manage the edition.
const props = defineProps<{
  card: GroupCard<HomeDraw>;
  /** The draw whose journal news the card on top already says. */
  quietDrawId?: string | null;
}>();
const emit = defineEmits<{ open: [path: string] }>();
const { t } = useT();
const party = usePartyText();

const subtitle = computed(() =>
  [
    props.card.edition?.label ?? props.card.draw?.editionLabel,
    party.short(props.card.eventDate),
  ]
    .filter(Boolean)
    .join(' · '),
);
/** Where the organised edition stands, in a few words. */
const editionState = computed(() => {
  const edition = props.card.edition;
  if (!edition) return t('auth.home.editionState.idle');
  if (edition.status === 'preparing') {
    return t('auth.home.editionState.preparing', {
      count: edition.participants,
    });
  }
  if (edition.status === 'closed') return t('auth.home.editionState.closed');
  return edition.toNotify > 0
    ? t('auth.home.editionState.toNotify', { count: edition.toNotify })
    : t('auth.home.editionState.drawn', {
        viewed: edition.viewed,
        count: edition.participants,
      });
});
// A string in <component :is> does not resolve global components.
const NuxtLink = resolveComponent('NuxtLink');
const manageTo = computed(() =>
  props.card.edition
    ? `/admin/${props.card.slug}/editions/${props.card.edition.id}`
    : `/admin/${props.card.slug}`,
);
</script>

<template>
  <UiCard padding="none" class="overflow-hidden" data-testid="group-card">
    <component
      :is="card.slug ? NuxtLink : 'div'"
      :to="card.slug ? `/admin/${card.slug}` : undefined"
      class="flex min-h-16 items-center gap-3 px-4 py-3"
    >
      <span class="min-w-0 grow">
        <span class="flex items-center gap-2">
          <span class="truncate font-display text-lg font-bold">{{
            card.name
          }}</span>
          <UBadge
            v-if="card.slug"
            color="primary"
            variant="subtle"
            size="sm"
            :label="t('auth.home.organizer')"
          />
        </span>
        <span v-if="subtitle" class="block truncate text-sm text-muted">{{
          subtitle
        }}</span>
      </span>
      <UIcon
        v-if="card.slug"
        name="i-lucide-chevron-right"
        class="size-5 shrink-0 text-dimmed"
      />
    </component>
    <ul class="divide-y divide-divider border-t border-divider">
      <HomeDrawRow
        v-if="card.draw"
        :draw="card.draw"
        :title="t('auth.home.myDraw')"
        no-party
        :quiet-journal="card.draw.id === quietDrawId"
        @open="emit('open', card.draw.path)"
      />
      <UiListItem
        v-if="card.slug"
        :to="manageTo"
        icon="i-lucide-settings-2"
        :title="t('auth.home.manage')"
        :subtitle="editionState"
      />
    </ul>
  </UiCard>
</template>
