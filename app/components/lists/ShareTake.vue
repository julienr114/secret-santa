<script setup lang="ts">
import { partyEmoji } from '#shared/utils/categories';
import { peopleToTake } from '#shared/utils/take';
import { usePartyCandidatesQuery } from '~/composables/queries/useParty';
import {
  useListMembersQuery,
  useTakeToListMutation,
} from '~/composables/queries/useLists';

// « Reprendre ceux d'un autre événement », a level of the bar of a list
// past « Quelqu'un d'autre » (docs/spec/v3/listes.md, ticket 139;
// V3ListeInviterReprendre): my other events in pills, one chosen; its
// members to tick, those already in the list's event left out, those
// without an address unticked for good; « Inviter · 3 personnes ». They
// become members of the list's event; then back to the first level
// (`sent`).
const props = defineProps<{ listId: string }>();
const emit = defineEmits<{ back: []; sent: [] }>();
const { t } = useT();
const toast = useMessages();
const errorMessage = useErrorMessage();
const candidates = usePartyCandidatesQuery();
const members = useListMembersQuery(() => props.listId);
const take = useTakeToListMutation(() => props.listId);
const partyId = computed(() => members.data.value?.partyId ?? '');
const events = computed(() =>
  (candidates.data.value?.parties ?? []).filter(
    (party) => party.id !== partyId.value,
  ),
);
/** The addresses already in the list's event, when I organise it. */
const inAlready = computed(() =>
  (candidates.data.value?.people ?? []).flatMap((person) =>
    person.partyId === partyId.value && person.email ? [person.email] : [],
  ),
);
const from = ref<string | null>(null);
const chosen = ref<string[]>([]);
const shown = computed(() =>
  from.value
    ? peopleToTake(
        candidates.data.value?.people ?? [],
        [from.value],
        inAlready.value,
      )
    : [],
);
const picked = computed(() =>
  shown.value.filter(
    (person) => person.email !== null && chosen.value.includes(person.id),
  ),
);
/**
 * Chooses an event: its members with an address come ticked.
 * @param id - The event.
 * @returns Nothing.
 */
const choose = (id: string) => {
  from.value = id;
  chosen.value = peopleToTake(
    candidates.data.value?.people ?? [],
    [id],
    inAlready.value,
  ).flatMap((person) => (person.email ? [person.id] : []));
};
/**
 * Ticks or unticks someone.
 * @param id - The person.
 * @param on - True to tick.
 * @returns Nothing.
 */
const tick = (id: string, on: boolean) => {
  chosen.value = on
    ? [...chosen.value, id]
    : chosen.value.filter((one) => one !== id);
};
const onTake = () =>
  take.mutate(
    picked.value.map((person) => person.id),
    {
      onSuccess: ({ count }) => {
        toast.done(t('lists.inviteMembers.taken', { count }));
        emit('sent');
      },
      onError: (error) => toast.failed(errorMessage(error)),
    },
  );
</script>

<template>
  <div class="flex flex-col gap-2" data-testid="share-take">
    <ListsShareLevelTitle
      :title="t('lists.inviteMembers.takeTitle')"
      @back="emit('back')"
    />
    <UiSkeleton
      v-if="candidates.isPending.value"
      :parts="['chips', 'list']"
      :rows="3"
      :label="t('common.loading')"
    />
    <template v-else>
      <div v-if="events.length > 0" class="flex flex-wrap gap-2 px-3">
        <button
          v-for="party in events"
          :key="party.id"
          type="button"
          class="relative flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-bold after:absolute after:inset-x-0 after:-inset-y-1"
          :class="
            from === party.id
              ? 'bg-primary-soft ring-2 ring-primary'
              : 'bg-default ring-1 ring-default'
          "
          :aria-pressed="from === party.id"
          :data-testid="`take-from-${party.id}`"
          @click="choose(party.id)"
        >
          <UiEmoji :emoji="partyEmoji(party)" />
          {{ party.name }}
        </button>
      </div>
      <ul
        v-if="shown.length > 0"
        class="border-t border-default"
        data-testid="take-people"
      >
        <UiCheckRow
          v-for="person in shown"
          :key="person.id"
          class="border-b border-default last:border-b-0"
          :avatar="person.avatar"
          :title="person.firstName"
          :subtitle="person.email ?? t('party.take.noEmail')"
          :label="t('party.take.choose', { name: person.firstName })"
          :disabled="person.email === null"
          small
          :checked="person.email !== null && chosen.includes(person.id)"
          @update:checked="(on) => tick(person.id, on)"
        />
      </ul>
      <p
        v-else-if="from"
        class="px-3.5 text-[15px] text-toned"
        data-testid="take-none"
      >
        {{ t('party.take.none') }}
      </p>
      <div class="px-2">
        <UButton
          block
          class="h-11 justify-center rounded-md text-[15px] font-bold"
          :disabled="picked.length === 0 || take.isPending.value"
          :loading="take.isPending.value"
          :label="t('lists.inviteMembers.takeSubmit', { count: picked.length })"
          data-testid="take-submit"
          @click="onTake"
        />
      </div>
    </template>
  </div>
</template>
