<script setup lang="ts">
import { fullName } from '#server/utils/people';
import { answerCounters, sortByAnswer } from '#server/utils/answers';
import { listView } from '#shared/utils/lists';
import type {
  AnswersSummary,
  EditionParticipant,
} from '~/composables/queries/useGroup';

// Step « Réponses » of a draw already made elsewhere (README 22.12): what
// to do now (ask everyone, ask the two whose answers clash to check, the
// last answer follows from the others, or validate), the participants
// with where each stands, never what they answered, then what can be done
// later or if something goes wrong. Maquettes ManuelCollecte,
// ManuelConflit, ManuelUneManque, ManuelPret.
const props = defineProps<{
  slug: string;
  editionId: string;
  participants: EditionParticipant[];
  answers: AnswersSummary;
  abandoning: boolean;
}>();
const emit = defineEmits<{
  send: [participationId: string];
  validate: [];
  abandon: [];
}>();
const { t, locale } = useT();
const { answerLook } = useAnswerLook();

const base = computed(() => `/admin/${props.slug}/editions/${props.editionId}`);
const people = computed(() =>
  props.participants.map((p) => ({
    ...p,
    answerStatus: p.answerStatus ?? ('toNotify' as const),
  })),
);
const sorted = computed(() => sortByAnswer(people.value, fullName));
const counts = computed(() => answerCounters(people.value));
const counters = computed(() => [
  {
    value: counts.value.toNotify,
    label: t('adminEdition.answers.card.toNotify'),
    tone: 'primary' as const,
  },
  {
    value: counts.value.asked,
    label: t('adminEdition.answers.card.asked'),
    tone: 'warning' as const,
  },
  {
    value: counts.value.answered,
    label: t('adminEdition.answers.card.answered', {
      count: counts.value.answered,
    }),
    tone: 'success' as const,
  },
]);
const names = (list: { firstName: string }[]) =>
  new Intl.ListFormat(locale.value, { type: 'conjunction' }).format(
    list.map((p) => p.firstName),
  );
/** Those whose answers clash. */
const clashing = computed(() =>
  sorted.value.filter((p) => props.answers.conflicts.includes(p.id)),
);
/** The one left, when their answer follows from the others. */
const last = computed(
  () => people.value.find((p) => p.id === props.answers.deducedFor) ?? null,
);
const card = computed(() => props.answers.card);
const title = computed(() => {
  if (card.value === 'conflict') {
    // « Deux réponses… » for one clash, « Des réponses… » past it.
    return clashing.value.length > 2
      ? t('adminEdition.answers.card.conflictTitleMany')
      : t('adminEdition.answers.card.conflictTitle');
  }
  if (card.value === 'oneMissing') {
    return t('adminEdition.answers.card.oneMissingTitle', {
      name: last.value?.firstName ?? '',
    });
  }
  if (card.value === 'ready') return t('adminEdition.answers.card.readyTitle');
  return t('adminEdition.answers.card.collectTitle');
});
/** Under the list: who comes first, and that no answer is ever shown. */
const listFooter = computed(() => {
  if (card.value === 'conflict') {
    return t('adminEdition.answers.listFooter.conflict', {
      names: names(clashing.value),
    });
  }
  return card.value === 'collect' && counts.value.toNotify > 0
    ? t('adminEdition.answers.listFooter.collect')
    : t('adminEdition.answers.listFooter.other');
});

// Past ten people, a search; past twelve, the list folds after six rows.
const SEARCH_FROM = 10;
const SHOWN = 6;
const query = ref('');
const expanded = ref(false);
const searchable = computed(() => props.participants.length > SEARCH_FROM);
const view = computed(() =>
  listView(sorted.value, {
    query: query.value,
    expanded: expanded.value,
    shown: SHOWN,
    nameOf: fullName,
  }),
);
// Abandoning asks for a second tap.
const confirming = ref(false);
const abandonShown = useBusy(() => props.abandoning);
</script>

<template>
  <UiActionCard
    :eyebrow="
      card === 'conflict'
        ? t('adminEdition.answers.card.conflictEyebrow')
        : t('adminEdition.screen.now')
    "
    :title="title"
    :help="
      card === 'conflict'
        ? t('adminEdition.answers.card.conflictHelp')
        : card === 'oneMissing'
          ? t('adminEdition.answers.card.oneMissingHelp')
          : card === 'ready'
            ? t('adminEdition.answers.card.readyHelp')
            : t('adminEdition.answers.card.askHelp')
    "
    data-testid="action-card"
  >
    <UiCounters :items="counters" />
    <div
      v-if="card === 'conflict'"
      class="flex items-start gap-3 rounded-xl bg-primary-tint p-3 text-sm leading-[1.45] ring-1 ring-primary-soft"
      data-testid="answers-conflict"
    >
      <UiAvatarStack
        :avatars="clashing.map((p) => p.avatar)"
        :label="names(clashing)"
        class="shrink-0"
      />
      <p>
        <strong class="font-bold">{{ names(clashing) }}</strong>
        {{ t('adminEdition.answers.card.conflictBody') }}
      </p>
    </div>
    <p
      v-else-if="card === 'oneMissing' || card === 'ready'"
      class="flex items-start gap-2 text-sm leading-[1.45] text-muted"
    >
      <UIcon
        name="i-lucide-check"
        class="mt-0.5 size-4 shrink-0 text-success"
      />
      {{
        card === 'ready'
          ? t('adminEdition.answers.card.readyBody', {
              count: participants.length,
            })
          : t('adminEdition.answers.card.oneMissingBody', {
              count: participants.length - 1,
              name: last?.firstName ?? '',
            })
      }}
    </p>
    <template #action>
      <UButton
        v-if="card === 'conflict'"
        :to="`${base}/emails?type=answerCheck`"
        block
        size="xl"
        icon="i-lucide-mail"
        class="h-12 justify-center font-bold"
        :ui="{ leadingIcon: 'size-5' }"
        :label="t('adminEdition.answers.card.conflictAction')"
      />
      <template v-else-if="card === 'oneMissing' && last">
        <UButton
          block
          size="xl"
          icon="i-lucide-mail"
          class="h-12 justify-center font-bold"
          :ui="{ leadingIcon: 'size-5' }"
          :label="
            t('adminEdition.answers.card.remind', { name: last.firstName })
          "
          @click="emit('send', last.participationId)"
        />
        <UButton
          block
          size="xl"
          variant="outline"
          color="neutral"
          class="mt-1.5 h-12 justify-center font-semibold"
          :label="
            t('adminEdition.answers.card.validateWithout', {
              name: last.firstName,
            })
          "
          data-testid="validate-without"
          @click="emit('validate')"
        />
      </template>
      <UButton
        v-else-if="card === 'ready'"
        block
        size="xl"
        icon="i-lucide-sparkle"
        class="h-12 justify-center font-bold"
        :ui="{ leadingIcon: 'size-5' }"
        :label="t('adminEdition.answers.card.validate')"
        @click="emit('validate')"
      />
      <UButton
        v-else
        :to="`${base}/emails?type=${counts.toNotify > 0 ? 'answerRequest' : 'answerReminder'}`"
        block
        size="xl"
        icon="i-lucide-mail"
        class="h-12 justify-center font-bold"
        :ui="{ leadingIcon: 'size-5' }"
        :label="
          counts.toNotify > 0
            ? t('adminEdition.answers.card.ask')
            : t('adminEdition.answers.card.remindAll')
        "
      />
    </template>
  </UiActionCard>

  <section class="flex flex-col gap-1.5" data-testid="participants">
    <UiSectionTitle>{{
      t('common.count.participants', { count: participants.length })
    }}</UiSectionTitle>
    <UiSearchField
      v-if="searchable"
      v-model="query"
      class="mb-1.5"
      :label="t('adminEdition.screen.lists.search')"
      :clear-label="t('adminEdition.screen.lists.clear')"
    />
    <UiList>
      <li v-if="view.shown.length === 0" class="px-4 py-3 text-sm text-muted">
        {{ t('adminEdition.screen.lists.noMatch') }}
      </li>
      <UiFoldedRows
        :fold="view"
        :key-of="(p) => p.participationId"
        :avatar-of="(p) => p.avatar"
        :more-label="(count) => t('adminEdition.screen.lists.more', { count })"
        :collapse-label="t('adminEdition.screen.lists.collapse')"
        @more="expanded = true"
        @collapse="expanded = false"
      >
        <template #row="{ item: p }">
          <UiListItem
            :avatar="p.avatar"
            :on-click="() => emit('send', p.participationId)"
            :label="t('adminEdition.cockpit.sendLinkOf', { name: fullName(p) })"
            :title="fullName(p)"
            :chevron="false"
          >
            <template #subtitle>
              <UIcon
                :name="answerLook(p.answerStatus).icon"
                class="size-3.5 shrink-0"
                :class="answerLook(p.answerStatus).iconTone"
              />
              <span
                class="truncate"
                :class="answerLook(p.answerStatus).tone"
                data-testid="answer-status"
                >{{ answerLook(p.answerStatus).text }}</span
              >
            </template>
            <template #trailing>
              <span
                class="flex size-11 shrink-0 items-center justify-center rounded-full"
                :class="
                  p.answerStatus === 'answered'
                    ? 'text-muted ring-1 ring-default'
                    : 'bg-primary-soft text-primary'
                "
                aria-hidden="true"
              >
                <UIcon name="i-lucide-send" class="size-5" />
              </span>
            </template>
          </UiListItem>
        </template>
      </UiFoldedRows>
    </UiList>
    <p class="px-1 text-[13px] leading-[1.4] text-toned">{{ listFooter }}</p>
  </section>

  <div class="flex flex-col gap-1.5">
    <UiList :title="t('adminEdition.answers.later')">
      <UiListItem
        :to="`${base}/ajouter`"
        icon="i-lucide-user-plus"
        icon-tone="neutral"
        :title="t('adminEdition.answers.participants')"
        :subtitle="t('adminEdition.answers.participantsHint')"
      />
      <UiListItem
        v-if="!confirming"
        icon="i-lucide-rotate-ccw"
        tone="danger"
        :title="t('adminEdition.answers.abandon')"
        :subtitle="t('adminEdition.answers.abandonHint')"
        :on-click="() => (confirming = true)"
        chevron
        data-testid="abandon-row"
      />
      <li v-else class="flex flex-col gap-2 px-4 py-3">
        <p class="text-sm">{{ t('adminEdition.answers.abandonConfirm') }}</p>
        <div class="flex gap-2">
          <UButton
            color="error"
            :disabled="abandoning"
            :loading="abandonShown"
            :label="t('adminEdition.answers.abandonYes')"
            @click="emit('abandon')"
          />
          <UButton
            variant="ghost"
            color="neutral"
            :disabled="abandoning"
            :label="t('common.actions.cancel')"
            @click="confirming = false"
          />
        </div>
      </li>
    </UiList>
    <p class="px-1 text-[13px] leading-[1.4] text-toned">
      {{ t('adminEdition.answers.secret') }}
    </p>
  </div>
</template>
