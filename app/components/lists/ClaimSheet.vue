<script setup lang="ts">
import type { IdeaLine } from '#server/http/lists';
import { LIST_NOTE_MAX } from '#server/utils/lists';
import {
  type ClaimRoute,
  useChangeClaimMutation,
  useUntickMutation,
} from '~/composables/queries/useLists';
import { ideaShort } from '~/utils/ideaShort';

// The sheet of what I give (README 22.19, Correction 30, maquettes
// ListeReserverSimple, ListeReserverAnonyme, ListeReserverPlusieurs,
// ListePlusieursOuvreur): one question, three choices, each saying who
// knows: « Je l'offre seul », « Je l'offre seul, en anonyme », « On l'offre
// à plusieurs », while nobody else is on it. With others, the word for
// them, who is in, and « On est au complet » for the one who leads;
// « Finalement, je ne l'offre plus ». My « mode anonyme » on, « en
// anonyme » is chosen and the two others are closed, said under them. In
// the holder's own document, no anonymous choice: they read the names.
const props = defineProps<{
  /** By the link of the list, or in its holder's document. */
  via: ClaimRoute;
  idea: IdeaLine;
  /** Who receives it. */
  forName: string;
  /** Who holds the list; none in the holder's own document. */
  holderName?: string;
  /** My « mode anonyme » is on for this list (lot 27 ter). */
  anonymousMode?: boolean;
}>();
const open = defineModel<boolean>('open', { required: true });
const { t } = useT();
const toast = useMessages();
const errorMessage = useErrorMessage();
const change = useChangeClaimMutation(() => props.via);
const untick = useUntickMutation(() => props.via);
const mine = computed(() => props.idea.mine);
const others = computed(() => props.idea.notes.filter((n) => !n.me));
type How = 'alone' | 'anonymous' | 'group';
const how = ref<How>('alone');
const mode = computed<'alone' | 'group'>(() =>
  how.value === 'group' ? 'group' : 'alone',
);
const note = ref('');
const closed = ref(false);
watch(
  open,
  (opened) => {
    if (!opened || !mine.value) return;
    how.value =
      mine.value.mode === 'group'
        ? 'group'
        : mine.value.anonymous || props.anonymousMode
          ? 'anonymous'
          : 'alone';
    note.value = mine.value.note ?? '';
    closed.value = mine.value.closed;
  },
  { immediate: true },
);
const short = computed(() => ideaShort(ideaName(props.idea)));
const proposing = computed(
  () => mode.value === 'group' && mine.value?.mode === 'alone',
);
/** For whom, and how: a list without people names nobody. */
const subtitle = computed(() => {
  const name = props.forName;
  if (how.value === 'anonymous') {
    return name
      ? t('lists.claim.forGivingAnonymous', { name })
      : t('lists.single.forGivingAnonymous');
  }
  if (mode.value === 'alone') {
    return name
      ? t('lists.claim.forGiving', { name })
      : t('lists.single.forGiving');
  }
  if (proposing.value) {
    return name
      ? t('lists.claim.forProposing', { name })
      : t('lists.single.forProposing');
  }
  if (mine.value?.leads) {
    return name
      ? t('lists.claim.forLeading', { name })
      : t('lists.single.forLeading');
  }
  return name
    ? t('lists.claim.forJoining', { name })
    : t('lists.single.forJoining');
});
const choices = computed(() => {
  const holder = props.holderName;
  const shut = Boolean(props.anonymousMode);
  return [
    {
      value: 'alone' as const,
      label: t('lists.claim.alone'),
      hint: holder
        ? t('lists.claim.aloneHelp', { name: holder })
        : t('lists.claim.aloneHelpHolder'),
      disabled: shut,
    },
    // Only where someone else reads the names.
    ...(holder
      ? [
          {
            value: 'anonymous' as const,
            label: t('lists.claim.anonymous'),
            hint: t('lists.claim.anonymousHelp', { name: holder }),
            icon: 'i-lucide-venetian-mask',
            incognito: true,
          },
        ]
      : []),
    {
      value: 'group' as const,
      label: t('lists.claim.group'),
      hint: t('lists.claim.groupHelp'),
      disabled: shut,
    },
  ];
});
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
    (how.value === 'anonymous') !== was.anonymous
      ? { anonymous: how.value === 'anonymous' }
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
        v-model="how"
        :choices="choices"
        :label="t('lists.claim.howLabel')"
        data-testid="claim-how"
      />
      <p
        v-if="anonymousMode && others.length === 0"
        class="flex items-center gap-2 text-sm leading-[1.4] text-incognito"
        data-testid="claim-anonymous-mode"
      >
        <UIcon
          name="i-lucide-venetian-mask"
          class="size-4 shrink-0"
          aria-hidden="true"
        />
        {{ t('lists.claim.anonymousMode') }}
      </p>
      <template v-if="mode === 'group'">
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
