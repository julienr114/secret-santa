<script setup lang="ts">
import type { ContextPart } from '~/components/ui/PageContext.vue';
import { CATEGORY_DEFAULTS } from '#shared/utils/categories';
import { peopleToTake } from '#shared/utils/take';
import { usePartyCandidatesQuery } from '~/composables/queries/useParty';

// « Qui reprendre ? » (V3FeteMembresReprendre, ticket 117): my other
// events in pills, their members to tick, then « Ajouter · 4 personnes ».
// For a Secret Santa or a list, never for an event alone: the page that
// holds it says where they go, and may add a line under the people
// (« Inviter par lien » for a Secret Santa). The event they go to is never
// offered, and neither is anyone already there by their address.
const props = defineProps<{
  /** The context above the title: the event they go to. */
  context: ContextPart[];
  /** The event they go to. */
  partyId: string;
  /** The addresses already there. */
  inAlready: readonly string[];
  /** Saving. */
  busy: boolean;
}>();
const emit = defineEmits<{ take: [personIds: string[]] }>();
const { t } = useT();
const candidates = usePartyCandidatesQuery();
const events = computed(() =>
  (candidates.data.value?.parties ?? []).filter(
    (party) => party.id !== props.partyId,
  ),
);
const from = ref<string[]>([]);
const chosen = ref<string[]>([]);
/** Those of the events ticked, once each address, none already there. */
const shown = computed(() =>
  peopleToTake(
    candidates.data.value?.people ?? [],
    from.value,
    props.inAlready,
  ),
);
const picked = computed(() =>
  shown.value.filter((person) => chosen.value.includes(person.id)),
);
/**
 * Takes an event's people in, ticked, or out.
 * @param partyId - The event.
 * @returns Nothing.
 */
const toggleFrom = (partyId: string) => {
  const on = !from.value.includes(partyId);
  const ofParty = (candidates.data.value?.people ?? [])
    .filter((person) => person.partyId === partyId)
    .map((person) => person.id);
  from.value = on
    ? [...from.value, partyId]
    : from.value.filter((id) => id !== partyId);
  chosen.value = on
    ? [...new Set([...chosen.value, ...ofParty])]
    : chosen.value.filter((id) => !ofParty.includes(id));
};
/**
 * Ticks or unticks someone.
 * @param id - The person.
 * @param on - True to tick.
 * @returns Nothing.
 */
const choose = (id: string, on: boolean) => {
  chosen.value = on
    ? [...chosen.value, id]
    : chosen.value.filter((one) => one !== id);
};
</script>

<template>
  <div class="flex flex-col gap-1">
    <UiPageContext :parts="context" :label="t('common.context')" />
    <UiPageTitle>{{ t('party.take.title') }}</UiPageTitle>
  </div>
  <UiSkeleton
    v-if="candidates.isPending.value"
    :parts="['chips', 'list']"
    :rows="3"
    :label="t('common.loading')"
  />
  <section v-if="events.length > 0" class="flex flex-col gap-2">
    <UiSectionTitle>{{ t('party.take.from') }}</UiSectionTitle>
    <div class="flex flex-wrap gap-2">
      <button
        v-for="party in events"
        :key="party.id"
        type="button"
        class="flex h-10 items-center gap-1.5 rounded-full bg-default px-3 text-sm font-semibold ring-1 ring-default"
        :class="from.includes(party.id) ? 'ring-2 ring-primary' : ''"
        :aria-pressed="from.includes(party.id)"
        :data-testid="`take-from-${party.id}`"
        @click="toggleFrom(party.id)"
      >
        <UiEmoji
          :emoji="
            party.iconEmoji ?? CATEGORY_DEFAULTS[party.category].emoji ?? '✨'
          "
        />
        {{ party.name }}
      </button>
    </div>
  </section>
  <UiList v-if="shown.length > 0" data-testid="take-people">
    <UiCheckRow
      v-for="person in shown"
      :key="person.id"
      :avatar="person.avatar"
      :title="person.firstName"
      :subtitle="person.email ?? t('party.take.noEmail')"
      :label="t('party.take.choose', { name: person.firstName })"
      :checked="chosen.includes(person.id)"
      @update:checked="(on) => choose(person.id, on)"
    />
  </UiList>
  <p
    v-else-if="from.length > 0"
    class="px-1 text-[15px] text-toned"
    data-testid="take-none"
  >
    {{ t('party.take.none') }}
  </p>
  <slot />
  <UiStickyFooter>
    <UButton
      block
      size="xl"
      class="h-13 justify-center text-[17px] font-bold"
      :disabled="picked.length === 0 || busy"
      :loading="busy"
      :label="t('party.take.submit', { count: picked.length })"
      data-testid="take-submit"
      @click="
        emit(
          'take',
          picked.map((person) => person.id),
        )
      "
    />
  </UiStickyFooter>
</template>
