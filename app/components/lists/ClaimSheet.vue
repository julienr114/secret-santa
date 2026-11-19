<script setup lang="ts">
import type { IdeaLine } from '#server/http/lists';
import { LIST_NOTE_MAX } from '#server/utils/lists';
import {
  type ClaimRoute,
  useChangeClaimMutation,
  useUntickMutation,
} from '~/composables/queries/useLists';
import { ideaShort } from '~/utils/ideaShort';

// « Changer » (README 22.19, maquettes ListeReserver,
// ListeReserverPlusieurs, ListePlusieursOuvreur): alone or with others
// while nobody else is on it; alone, telling the holder it is me; with
// others, the word for them, who is in, and « On est au complet » for the
// one who leads; « Finalement, je ne l'offre plus ». In the holder's own
// document, no choice of staying anonymous: they read the names.
const props = defineProps<{
  /** By the link of the list, or in its holder's document. */
  via: ClaimRoute;
  idea: IdeaLine;
  /** Who receives it. */
  forName: string;
  /** Who holds the list; none in the holder's own document. */
  holderName?: string;
}>();
const open = defineModel<boolean>('open', { required: true });
const { t } = useT();
const toast = useMessages();
const errorMessage = useErrorMessage();
const change = useChangeClaimMutation(() => props.via);
const untick = useUntickMutation(() => props.via);
const mine = computed(() => props.idea.mine);
const others = computed(() => props.idea.notes.filter((n) => !n.me));
const mode = ref<'alone' | 'group'>('alone');
const tell = ref(true);
const note = ref('');
const closed = ref(false);
watch(
  open,
  (opened) => {
    if (!opened || !mine.value) return;
    mode.value = mine.value.mode;
    tell.value = !mine.value.anonymous;
    note.value = mine.value.note ?? '';
    closed.value = mine.value.closed;
  },
  { immediate: true },
);
const short = computed(() => ideaShort(props.idea.text));
const proposing = computed(
  () => mode.value === 'group' && mine.value?.mode === 'alone',
);
const subtitle = computed(() => {
  if (mode.value === 'alone') {
    return t('lists.claim.forGiving', { name: props.forName });
  }
  if (proposing.value) {
    return t('lists.claim.forProposing', { name: props.forName });
  }
  return mine.value?.leads
    ? t('lists.claim.forLeading', { name: props.forName })
    : t('lists.claim.forJoining', { name: props.forName });
});
const modes = computed(() => [
  {
    value: 'alone' as const,
    label: t('lists.claim.alone'),
    hint: t('lists.claim.aloneHelp'),
  },
  {
    value: 'group' as const,
    label: t('lists.claim.group'),
    hint: t('lists.claim.groupHelp'),
  },
]);
/** Who takes the gift over when I leave a group I lead. */
const passes = computed(() => {
  if (!mine.value?.leads || others.value.length === 0) return '';
  const names = others.value.map((o) => o.name);
  const list =
    names.length > 1
      ? `${names.slice(0, -1).join(', ')} ${t('lists.visitor.and')} ${names.at(-1)}`
      : names[0]!;
  return t(
    names.length > 1 ? 'lists.claim.passesTo' : 'lists.claim.passesToOne',
    { names: list, next: names[0]! },
  );
});
const onError = (error: unknown) => toast.failed(errorMessage(error));
const onDone = () => {
  const was = mine.value;
  if (!was) return;
  const body = {
    ideaId: props.idea.id,
    ...(mode.value === was.mode ? {} : { mode: mode.value }),
    ...(props.holderName &&
    mode.value === 'alone' &&
    tell.value === was.anonymous
      ? { anonymous: !tell.value }
      : {}),
    ...(mode.value === 'group' && note.value.trim() !== (was.note ?? '')
      ? { note: note.value.trim() || null }
      : {}),
    ...(was.leads && mode.value === 'group' && closed.value !== was.closed
      ? { closed: closed.value }
      : {}),
  };
  if (Object.keys(body).length === 1) {
    open.value = false;
    return;
  }
  change.mutate(body, {
    onSuccess: () => {
      open.value = false;
    },
    onError,
  });
};
const onGiveUp = () =>
  untick.mutate(props.idea.id, {
    onSuccess: () => {
      open.value = false;
    },
    onError,
  });
</script>

<template>
  <UiSheet
    v-model:open="open"
    :title="
      mode === 'alone'
        ? t('lists.claim.noted', { idea: short })
        : t('lists.claim.together', { idea: short })
    "
    :description="subtitle"
    :busy="change.isPending.value || untick.isPending.value"
  >
    <div class="flex flex-col gap-4 py-1" data-testid="claim-sheet">
      <UiChoiceList
        v-if="others.length === 0"
        v-model="mode"
        :choices="modes"
        :label="t('lists.claim.howLabel')"
      />
      <template v-if="mode === 'alone'">
        <div
          v-if="holderName"
          class="flex items-start gap-3 rounded-xl bg-default p-3.5 ring-1 ring-default"
        >
          <div class="flex grow flex-col gap-0.5">
            <p class="font-semibold">
              {{ t('lists.claim.tellHolder', { name: holderName }) }}
            </p>
            <p class="text-[13px] text-toned">
              {{ t('lists.claim.tellHolderHelp') }}
            </p>
          </div>
          <USwitch
            v-model="tell"
            :aria-label="t('lists.claim.tellHolder', { name: holderName })"
          />
        </div>
        <p class="text-sm text-toned">{{ t('lists.claim.nobodyElse') }}</p>
      </template>
      <template v-else>
        <ul
          v-if="others.length > 0"
          class="divide-y divide-default rounded-xl bg-default ring-1 ring-default"
        >
          <li
            v-for="(person, index) in idea.notes"
            :key="index"
            class="flex items-center gap-3 px-3.5 py-2.5"
          >
            <UiAvatar :avatar="person.avatar" />
            <div class="flex min-w-0 grow flex-col">
              <span class="font-semibold">{{
                person.me ? t('lists.claim.me') : person.name
              }}</span>
              <span v-if="person.note" class="text-[13px] text-toned"
                >« {{ person.note }} »</span
              >
            </div>
          </li>
        </ul>
        <UiNotice v-else variant="caution" icon="i-lucide-users">
          <strong>{{ t('lists.claim.visible') }}</strong>
          {{ t('lists.claim.visibleHelp') }}
        </UiNotice>
        <div class="flex flex-col gap-1.5">
          <label for="claim-note" class="text-[15px] font-semibold"
            >{{ t('lists.claim.noteLabel') }}
            <span class="font-normal text-toned">{{
              t('lists.claim.optional')
            }}</span></label
          >
          <UInput
            id="claim-note"
            v-model="note"
            size="xl"
            :maxlength="LIST_NOTE_MAX"
            :placeholder="t('lists.claim.notePlaceholder')"
            class="w-full"
            :ui="{ base: 'h-12 text-base' }"
          />
        </div>
        <template v-if="mine?.leads && !proposing">
          <div
            class="flex items-start gap-3 rounded-xl bg-default p-3.5 ring-1 ring-default"
          >
            <div class="flex grow flex-col gap-0.5">
              <p class="font-semibold">{{ t('lists.claim.full') }}</p>
              <p class="text-[13px] text-toned">
                {{ t('lists.claim.fullHelp') }}
              </p>
            </div>
            <USwitch v-model="closed" :aria-label="t('lists.claim.full')" />
          </div>
          <p class="text-sm text-toned">{{ t('lists.claim.staysYours') }}</p>
        </template>
      </template>
    </div>
    <template #footer>
      <div class="flex flex-col gap-1">
        <UButton
          block
          size="xl"
          class="h-12 justify-center font-bold"
          :loading="change.isPending.value"
          :label="proposing ? t('lists.claim.propose') : t('lists.claim.done')"
          data-testid="claim-done"
          @click="onDone"
        />
        <UButton
          block
          variant="ghost"
          class="h-11 justify-center font-semibold text-primary-ink"
          :loading="untick.isPending.value"
          :label="t('lists.claim.giveUp')"
          data-testid="claim-give-up"
          @click="onGiveUp"
        />
        <p v-if="passes" class="text-center text-[13px] text-toned">
          {{ passes }}
        </p>
      </div>
    </template>
  </UiSheet>
</template>
