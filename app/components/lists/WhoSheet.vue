<script setup lang="ts">
import type { IdeaLine } from '#server/http/lists';
import { formatEventDate } from '#server/utils/rules';
import { MEMBER_NAME_MAX, type ClaimMode } from '#server/utils/lists';
import { emailSchema } from '#server/utils/people';
import { sameWritten, type Candidate } from '#server/utils/claims';
import { useSetGiversMutation } from '~/composables/queries/useLists';
import { firstChosen, sheetPeople, touchGiver, traceDay } from '~/utils/givers';
import { ideaShort } from '~/utils/ideaShort';

// « Qui l'offre ? » (21 November 2026, maquettes ListeCocherPourDepart,
// ListeCocherPourChoix, ListeCocherPour, ListeCocherPourAutre), for those
// who hold the list, in place of the sheet of what I give: who gives an
// idea, said in their place. Its title, the idea and for whom, the trace
// (who ticked or noted it, and when); « Une personne » or « Plusieurs »;
// the people, « Moi » first, then who gives it now, those who hold the
// list with me, those who ticked on it, the first names written on it:
// a round button for one person, a box for several; « Quelqu'un
// d'autre… », which writes a first name, with an address or without;
// « On est au complet » for several; « Enregistrer ». Nobody chosen: the
// idea is unticked, by the page, with « Annuler ». Nobody is told.
const props = defineProps<{
  listId: string;
  idea: IdeaLine;
  /** Who receives it; empty on a list without people. */
  forName: string;
  /** Who the list offers, « Moi » first. */
  candidates: Candidate[];
}>();
const emit = defineEmits<{
  /** Nobody chosen: the page unticks the idea, with « Annuler ». */
  nobody: [idea: IdeaLine];
}>();
const open = defineModel<boolean>('open', { required: true });
const { t, locale } = useT();
const toast = useMessages();
const errorMessage = useErrorMessage();
const save = useSetGiversMutation(() => props.listId);

const mode = ref<ClaimMode>('alone');
const chosen = ref<string[]>([]);
const closed = ref(false);
/** The first names written in the sheet, not saved yet. */
const written = ref<Candidate[]>([]);
/** The keys of who gives it now, when the sheet opened. */
const from = computed(() => props.idea.who?.keys ?? []);
watch(
  open,
  (opened) => {
    if (!opened) return;
    mode.value = props.idea.who?.mode ?? 'alone';
    chosen.value = [...from.value];
    closed.value = props.idea.who?.closed ?? false;
    written.value = [];
  },
  { immediate: true },
);
const rows = computed(() =>
  sheetPeople(props.candidates, from.value, written.value),
);
const subtitle = computed(() => {
  const idea = ideaShort(ideaName(props.idea));
  return props.forName
    ? t('lists.who.forName', { idea, name: props.forName })
    : idea;
});
/** « Coché par Mamie, le 12 novembre »: who, and when. */
const trace = computed(() => {
  const at = props.idea.who?.trace;
  if (!at) return '';
  const day = traceDay(at.at, new Date().toISOString().slice(0, 10));
  const when =
    day === 'today'
      ? t('lists.who.today')
      : t('lists.who.on', { date: formatEventDate(day, locale.value) });
  const kind = at.kind;
  if (at.by === null) {
    return kind === 'noted'
      ? t('lists.who.trace.notedMe', { when })
      : kind === 'proposed'
        ? t('lists.who.trace.proposedMe', { when })
        : t('lists.who.trace.tickedMe', { when });
  }
  return t(`lists.who.trace.${kind}`, { name: at.by, when });
});
const modes = computed(() => [
  { value: 'alone' as const, label: t('lists.who.one') },
  { value: 'group' as const, label: t('lists.who.several') },
]);
/** « Une personne » or « Plusieurs »: back to one, the first chosen stays. */
const howMany = computed({
  get: () => mode.value,
  set: (now: ClaimMode) => {
    mode.value = now;
    if (now === 'alone') {
      chosen.value = firstChosen(
        chosen.value,
        rows.value.map((row) => row.key),
      );
    }
  },
});
const subtitleOf = (row: Candidate) =>
  row.kind === 'holder'
    ? t('lists.who.holdsWithYou')
    : row.kind === 'written'
      ? (row.email ?? t('lists.who.noEmail'))
      : undefined;
const isChosen = (key: string) => chosen.value.includes(key);
const touch = (key: string) => {
  chosen.value = touchGiver(chosen.value, key, mode.value);
};
const radios = useId();

// « Quelqu'un d'autre » (maquette ListeCocherPourAutre): a first name,
// with an address or without. Added to the rows, chosen.
const otherOpen = ref(false);
const otherName = ref('');
const otherEmail = ref('');
const emailWrong = ref(false);
const openOther = () => {
  otherName.value = '';
  otherEmail.value = '';
  emailWrong.value = false;
  otherOpen.value = true;
};
const onAdd = () => {
  const name = otherName.value.replace(/\s+/g, ' ').trim();
  if (!name) return;
  const typed = otherEmail.value.trim();
  const parsed = typed ? emailSchema.safeParse(typed) : null;
  if (parsed && !parsed.success) {
    emailWrong.value = true;
    return;
  }
  const email = parsed?.data ?? null;
  // Already written on the list, or in this sheet: the same one.
  const known = sameWritten(
    [
      ...props.candidates.filter((row) => row.kind === 'written'),
      ...written.value,
    ],
    { name, email },
  );
  const key = known?.key ?? `g:new-${written.value.length}`;
  if (!known) {
    written.value = [
      ...written.value,
      { key, name, email, kind: 'written', avatar: null },
    ];
  }
  if (!isChosen(key)) touch(key);
  otherOpen.value = false;
};

const onSave = () => {
  if (chosen.value.length === 0) {
    emit('nobody', props.idea);
    open.value = false;
    return;
  }
  save.mutate(
    {
      ideaId: props.idea.id,
      from: from.value,
      givers: chosen.value.map((key) => {
        const fresh = written.value.find((row) => row.key === key);
        return fresh ? { name: fresh.name, email: fresh.email } : { key };
      }),
      mode: mode.value,
      closed: mode.value === 'group' && closed.value,
    },
    {
      onSuccess: () => {
        open.value = false;
      },
      onError: (error) =>
        toast.failed(
          (error as { statusMessage?: string }).statusMessage === 'list_changed'
            ? t('lists.doc.drag.changed')
            : errorMessage(error),
        ),
    },
  );
};
</script>

<template>
  <UiSheet
    v-model:open="open"
    :title="t('lists.who.title')"
    :busy="save.isPending.value"
  >
    <template #header>
      <div class="flex flex-col gap-0.5">
        <h2 class="font-display text-[22px] leading-[1.15] font-bold">
          {{ t('lists.who.title') }}
        </h2>
        <p class="text-sm text-toned">{{ subtitle }}</p>
        <p v-if="trace" class="text-[13px] text-toned" data-testid="who-trace">
          {{ trace }}
        </p>
      </div>
    </template>
    <div class="-mx-4 flex flex-col gap-3 py-1" data-testid="who-sheet">
      <UiSegmented
        v-model="howMany"
        class="mx-4"
        :items="modes"
        :label="t('lists.who.howMany')"
        data-testid="who-mode"
      />
      <ul
        class="divide-y divide-divider border-y border-divider"
        :aria-label="t('lists.who.people')"
        data-testid="who-people"
      >
        <UiCheckRow
          v-for="row in rows"
          :key="row.key"
          :avatar="row.avatar"
          :title="row.kind === 'me' ? t('lists.who.me') : row.name"
          :subtitle="subtitleOf(row)"
          :label="row.kind === 'me' ? t('lists.who.me') : row.name"
          :radio="mode === 'alone'"
          :name="radios"
          :checked="isChosen(row.key)"
          data-testid="who-person"
          @update:checked="touch(row.key)"
        />
        <li>
          <button
            type="button"
            class="flex min-h-15 w-full items-center gap-3 px-4 py-2 text-left text-toned"
            data-testid="who-someone-else"
            @click="openOther"
          >
            <span
              class="flex size-10 shrink-0 items-center justify-center rounded-full border-[1.5px] border-dashed border-accented text-primary-ink"
              aria-hidden="true"
            >
              <UIcon name="i-lucide-plus" class="size-4" />
            </span>
            {{ t('lists.who.someoneElse') }}
          </button>
        </li>
      </ul>
      <div
        v-if="mode === 'group'"
        class="flex min-h-13 items-center gap-3 px-5"
        data-testid="who-full"
      >
        <div class="flex grow flex-col">
          <p class="font-semibold">{{ t('lists.claim.full') }}</p>
          <p class="text-[13px] text-toned">
            {{ closed ? t('lists.who.closed') : t('lists.who.open') }}
          </p>
        </div>
        <USwitch v-model="closed" :aria-label="t('lists.claim.full')" />
      </div>
      <!-- « Quelqu'un d'autre », over this one: a nested sheet sits inside. -->
      <UiSheet
        v-model:open="otherOpen"
        nested
        :title="t('lists.who.other.title')"
        :description="subtitle"
      >
        <form
          class="flex flex-col gap-4 py-1"
          data-testid="who-other"
          @submit.prevent="onAdd"
        >
          <div class="flex flex-col gap-1.5">
            <label for="who-other-name" class="text-[15px] font-semibold">{{
              t('lists.who.other.name')
            }}</label>
            <UInput
              id="who-other-name"
              v-model="otherName"
              size="xl"
              autocomplete="off"
              :maxlength="MEMBER_NAME_MAX"
              class="w-full"
              :ui="{ base: 'h-12 text-base' }"
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <label for="who-other-email" class="text-[15px] font-semibold"
              >{{ t('lists.who.other.email') }}
              <span class="font-normal text-toned">{{
                t('lists.claim.optional')
              }}</span></label
            >
            <UInput
              id="who-other-email"
              v-model="otherEmail"
              type="email"
              inputmode="email"
              autocapitalize="none"
              autocomplete="off"
              size="xl"
              :color="emailWrong ? 'error' : undefined"
              :highlight="emailWrong"
              :aria-invalid="emailWrong ? true : undefined"
              :placeholder="t('lists.who.other.emailPlaceholder')"
              class="w-full"
              :ui="{ base: 'h-12 text-base' }"
              @input="emailWrong = false"
            />
            <p class="text-[13px] leading-[1.4] text-toned">
              {{ t('lists.who.other.emailHelp') }}
            </p>
          </div>
          <UButton
            type="submit"
            block
            size="xl"
            class="h-12 justify-center font-bold"
            :disabled="!otherName.trim()"
            :label="t('lists.who.other.add')"
            data-testid="who-other-add"
          />
        </form>
      </UiSheet>
    </div>
    <template #footer>
      <UButton
        block
        size="xl"
        class="h-12 justify-center font-bold"
        :loading="save.isPending.value"
        :label="t('lists.who.save')"
        data-testid="who-save"
        @click="onSave"
      />
    </template>
  </UiSheet>
</template>
