<script setup lang="ts">
import type { Avatar } from '#server/utils/avatars';
import type { Award } from '#server/utils/awards';
import {
  STORY_SECONDS,
  storyLooks,
  storyScreens,
  storyStep,
  type StoryScreen,
} from '#shared/utils/palmares';
import { numberWord } from '#shared/utils/words';

// The palmarès of « Devine qui » in images (README 22.17, maquettes
// DevineStory1 to 7): full screens, a bar of progress on top. They start
// at once (asked by Julien on 18 November 2026): each screen stays 7
// seconds then the next one comes; a tap on
// the right goes on, on the left goes back; holding the screen pauses;
// the cross closes. When the device asks for less motion, nothing moves
// by itself. The last screen offers every result and starting again.
type Person = { id: string; name: string; avatar: Avatar };
const props = defineProps<{
  editionLabel: string;
  people: Person[];
  players: number;
  guesses: number;
  awards: Award[];
  /** The reader's own Santa: who it was, and who they had said. */
  santa: { actualId: string; guessedId: string | null } | null;
  /** How many guessed their own Santa. */
  unmasked: number;
  /** The small palmarès (Correction 12): one's own Santa, no award. */
  small?: boolean;
  /** « Si près du but », for the reader only: the line, or null. */
  closeCall?: string | null;
  /** The reader, when they take part. */
  me?: string | null;
  /** The reader's first name, for « Joyeux Noël » ; none for an organiser. */
  firstName: string | null;
  /** Where « Voir tous les résultats » and the cross lead. */
  answersPath: string;
}>();
const emit = defineEmits<{ seen: [] }>();
const { t, tk, locale } = useT();

const screens = computed<StoryScreen[]>(() =>
  storyScreens({
    awards: props.awards,
    hasSanta: Boolean(props.santa),
    closeCall: Boolean(props.closeCall),
  }),
);
const looks = computed(() => storyLooks(screens.value));
const at = ref(0);
const started = ref(false);
const paused = ref(false);
const elapsed = ref(0);
const screen = computed(() => screens.value[at.value]!);
const personOf = (id: string | null | undefined) =>
  props.people.find((p) => p.id === id) ?? null;
const reduced = ref(false);
onMounted(() => {
  reduced.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // The images start by themselves, unless less motion is asked for.
  started.value = true;
  run();
});

// The clock of the stories: 7 seconds per screen once started.
const TICK = 100;
const clock: { timer: ReturnType<typeof setInterval> | null } = {
  timer: null,
};
const stop = () => {
  if (clock.timer) clearInterval(clock.timer);
  clock.timer = null;
};
const run = () => {
  stop();
  if (reduced.value) return;
  clock.timer = setInterval(() => {
    if (paused.value || !started.value) return;
    elapsed.value += TICK;
    if (elapsed.value >= STORY_SECONDS * 1000) go('right');
  }, TICK);
};
onBeforeUnmount(stop);
/**
 * Shows another screen, its clock from zero.
 * @param side - Right goes on, left goes back.
 * @returns Nothing.
 */
const go = (side: 'left' | 'right') => {
  started.value = true;
  at.value = storyStep(at.value, screens.value.length, side);
  elapsed.value = 0;
  if (at.value === screens.value.length - 1) {
    stop();
    emit('seen');
  } else if (!clock.timer) run();
};
/** Starts again from the first screen, the clock running. */
const restart = () => {
  at.value = 0;
  elapsed.value = 0;
  run();
};

// A tap goes on or back; holding pauses.
const press = { at: 0 };
const onDown = () => {
  press.at = Date.now();
  paused.value = true;
};
const onUp = (event: PointerEvent) => {
  paused.value = false;
  if (Date.now() - press.at > 400) return;
  const target = event.currentTarget as HTMLElement;
  const { left, width } = target.getBoundingClientRect();
  go(event.clientX - left < width / 3 ? 'left' : 'right');
};

/** How full each segment of the bar is, from 0 to 1. */
const fill = (index: number) =>
  index < at.value
    ? 1
    : index > at.value
      ? 0
      : reduced.value || !started.value || at.value === screens.value.length - 1
        ? index === at.value && at.value === screens.value.length - 1
          ? 1
          : 0
        : Math.min(1, elapsed.value / (STORY_SECONDS * 1000));

/** The colours of a screen, by its place (README 22.17). */
const LOOKS = {
  pine: 'bg-story-mint text-white',
  brick: 'bg-story-coral text-white',
  mustard: 'bg-story-violet text-white',
  plum: 'bg-story-plum text-white',
  cream: 'bg-story-cream text-highlighted',
} as const;
const lookName = computed(() => looks.value[at.value] ?? 'pine');
const look = computed(() => LOOKS[lookName.value]);
const dark = computed(() => lookName.value === 'cream');

const list = (names: string[]) =>
  new Intl.ListFormat(locale.value, { type: 'conjunction' }).format(names);
const word = (n: number, capital = false) =>
  numberWord(n, locale.value, capital);
/** How an award screen is laid out. */
type AwardView = {
  eyebrow: string;
  /** Big avatars, a grid of names, a number alone, or the group's score. */
  layout: 'avatars' | 'grid' | 'number' | 'score';
  people: Person[];
  /** The big words: the names, a share, a number, a claim. */
  big: string;
  /** Under the big words, smaller. */
  sub: string;
  body: string;
};
/**
 * What an award screen says (README 22.17, maquettes DevineStory*): one
 * winner, several by name, or a crowd past three.
 * @param award - The award.
 * @returns Its words and layout.
 */
const awardWords = (award: Award): AwardView => {
  const key = `participant.game.awards.${award.kind}`;
  const people = award.winners
    .map(personOf)
    .filter((p): p is Person => Boolean(p));
  const many = award.count > 1;
  const crowd =
    people.length === 0 && award.count > 0
      ? t('participant.game.awards.crowd', { count: award.count })
      : '';
  const base = {
    eyebrow: tk(`${key}.${many ? 'titleMany' : 'title'}`),
    layout: 'avatars' as const,
    people,
    big: crowd || list(people.map((p) => p.name)),
    sub: '',
  };
  const n = award.value;
  const total = award.total ?? 0;
  switch (award.kind) {
    case 'unmasked': {
      const tone =
        n === total
          ? tk(`${key}.all`)
          : n * 2 >= total
            ? tk(`${key}.most`)
            : '';
      if (award.count <= 3) {
        return {
          ...base,
          body: tk(`${key}.${many ? 'bodyMany' : 'body'}`),
        };
      }
      const shareBody = [tk(`${key}.shareBody`), tone]
        .filter(Boolean)
        .join(' ');
      return award.count <= 9
        ? {
            ...base,
            layout: 'grid',
            big: tk(`${key}.share`, { n: word(n, true), m: word(total) }),
            body: shareBody,
          }
        : {
            ...base,
            layout: 'number',
            big: String(n),
            sub: tk(`${key}.crowdOf`, { total }),
            body: shareBody,
          };
    }
    case 'detective':
      return {
        ...base,
        body: many
          ? tk(`${key}.bodyMany`, { right: n, made: total })
          : award.extra
            ? tk(`${key}.bodyAlone`, {
                count: award.extra,
                n: word(award.extra),
                right: n,
                made: total,
              })
            : tk(`${key}.body`, { right: n, made: total }),
      };
    case 'flawless':
      return {
        ...base,
        body: tk(`${key}.${many ? 'bodyMany' : 'body'}`, {
          N: word(n, true),
          n: word(n),
        }),
      };
    case 'transparent':
      return {
        ...base,
        body: tk(`${key}.${many ? 'bodyMany' : 'body'}`, {
          N: word(n, true),
          m: word(total),
        }),
      };
    case 'hidden': {
      const params = { N: word(total, true), f: word(n) };
      const which = many
        ? n === 0
          ? 'manyNone'
          : 'manySome'
        : n === 0
          ? 'none'
          : n === 1
            ? 'one'
            : 'some';
      return { ...base, body: tk(`${key}.${which}`, params) };
    }
    case 'rumour': {
      const recipient = personOf(award.recipientId);
      return {
        ...base,
        people: recipient ? [...people, recipient] : people,
        big: tk(`${key}.claim`, {
          giver: people[0]?.name ?? '',
          recipient: recipient?.name ?? '',
        }),
        body: tk(`${key}.body`, { N: word(n, true) }),
      };
    }
    case 'suspect':
      return {
        ...base,
        body: many
          ? tk(`${key}.bodyMany`, { count: n })
          : tk(`${key}.${award.extra ? 'never' : 'body'}`, { count: n }),
      };
    case 'twins': {
      const errors = award.extra ?? 0;
      return {
        ...base,
        body: tk(
          `${key}.${errors === 0 ? 'noError' : errors === 1 ? 'oneError' : 'errors'}`,
          { N: word(n, true), m: word(total), e: word(errors) },
        ),
      };
    }
    case 'lastMinute':
      return {
        ...base,
        body:
          n === 0
            ? tk(`${key}.last`)
            : tk(`${key}.body`, { count: n, n: word(n) }),
      };
    case 'weathervane':
      return {
        ...base,
        body: tk(`${key}.${many ? 'bodyMany' : 'body'}`, { n: word(n) }),
      };
    case 'group':
      return {
        ...base,
        layout: 'score',
        big: tk(`${key}.score`, { right: n, total }),
        sub: tk(`${key}.scoreLabel`),
        body: tk(`${key}.${award.tone ?? 'same'}`, {
          chance: award.extra ?? 0,
        }),
      };
    default:
      return { ...base, body: tk(`${key}.body`) };
  }
};
/** The award of the screen shown, in words. */
const awardView = computed(() => {
  const current = screen.value;
  if (current.kind !== 'award') return null;
  const award = props.awards.find((a) => a.kind === current.award);
  return award ? awardWords(award) : null;
});
/** « Si près du but »: the line, its person. */
const closeCallView = computed(() => {
  if (!props.closeCall) return null;
  const person = personOf(props.closeCall);
  const mine = props.closeCall === props.me;
  return {
    person,
    body: mine
      ? t('participant.game.awards.closeCall.bodyMe')
      : t('participant.game.awards.closeCall.body', {
          name: person?.name ?? '',
        }),
  };
});
/** How many played, in the words of the small palmarès. */
const smallKey = (players: number) =>
  players <= 1 ? 'alone' : players === 2 ? 'two' : 'three';
const santaWords = computed(() => {
  const santa = props.santa;
  if (!santa) return null;
  const actual = personOf(santa.actualId);
  const guessed = personOf(santa.guessedId);
  const right = santa.guessedId === santa.actualId;
  return {
    actual,
    guessed,
    right,
    suspense: guessed
      ? t('participant.game.story.youSaid', { name: guessed.name })
      : t('participant.game.story.noGuess'),
    title: right
      ? t('participant.game.story.right', { name: actual?.name ?? '' })
      : t('participant.game.story.was', { name: actual?.name ?? '' }),
    body: right
      ? props.small
        ? t(`participant.game.story.rightSmall.${smallKey(props.players)}`)
        : t('participant.game.story.rightBody', {
            count: props.unmasked,
            total: props.players,
          })
      : guessed
        ? t('participant.game.story.wrongBody', { name: guessed.name })
        : t('participant.game.story.noGuessBody'),
  };
});
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex flex-col px-4 pt-[calc(0.875rem+env(safe-area-inset-top))] pb-[calc(1.75rem+env(safe-area-inset-bottom))] select-none"
    :class="look"
    data-testid="stories"
    :data-screen="screen.kind === 'award' ? screen.award : screen.kind"
    :data-look="lookName"
  >
    <div
      role="img"
      :aria-label="
        t('participant.game.story.progress', {
          index: at + 1,
          count: screens.length,
        })
      "
      class="flex gap-1"
    >
      <span
        v-for="(_, index) in screens"
        :key="index"
        class="h-[3px] flex-1 overflow-hidden rounded-full"
        :class="dark ? 'bg-shade/30' : 'bg-white/30'"
      >
        <span
          class="block h-full rounded-full"
          :class="dark ? 'bg-shade' : 'bg-white'"
          :style="{ width: `${fill(index) * 100}%` }"
        />
      </span>
    </div>
    <div class="mt-2.5 flex items-center justify-between">
      <span class="flex items-center gap-1.5 font-display text-base font-bold">
        <UIcon name="i-lucide-sparkle" class="size-4.5" aria-hidden="true" />
        {{ t('participant.game.story.header', { label: editionLabel }) }}
      </span>
      <NuxtLink
        :to="answersPath"
        class="-mr-2.5 flex size-11 items-center justify-center"
        :aria-label="t('participant.game.story.close')"
        data-testid="stories-close"
      >
        <UIcon name="i-lucide-x" class="size-5.5" />
      </NuxtLink>
    </div>

    <div
      class="flex grow touch-none flex-col items-center justify-center gap-5.5 text-center"
      :class="screen.kind === 'end' ? '' : 'cursor-pointer'"
      data-testid="stories-stage"
      @pointerdown="screen.kind === 'end' ? undefined : onDown()"
      @pointerup="(e) => (screen.kind === 'end' ? undefined : onUp(e))"
      @pointerleave="paused = false"
    >
      <template v-if="screen.kind === 'opening'">
        <p class="text-sm font-bold tracking-[0.08em] uppercase opacity-90">
          {{ t('participant.game.story.openingEyebrow') }}
        </p>
        <p
          class="font-display text-[56px] leading-[1.05] font-bold whitespace-pre-line"
        >
          {{ t('participant.game.story.openingTitle') }}
        </p>
        <p class="max-w-75 text-lg leading-[1.4] opacity-90">
          {{
            t('participant.game.story.openingBody', {
              players,
              guesses,
            })
          }}
        </p>
      </template>

      <template v-else-if="screen.kind === 'suspense' && santaWords">
        <p class="text-sm font-bold tracking-[0.08em] uppercase opacity-90">
          {{ t('participant.game.story.mySanta') }}
        </p>
        <span
          class="flex size-32 items-center justify-center rounded-full border-2 border-dashed border-white/80 font-display text-6xl font-bold"
          aria-hidden="true"
          >?</span
        >
        <p
          class="font-display text-[44px] leading-[1.1] font-bold whitespace-pre-line"
        >
          {{ santaWords.suspense }}
        </p>
        <p class="text-lg opacity-90">
          {{ t('participant.game.story.soWell') }}
        </p>
      </template>

      <template v-else-if="screen.kind === 'santa' && santaWords">
        <p class="text-sm font-bold tracking-[0.08em] uppercase opacity-90">
          {{ t('participant.game.story.mySanta') }}
        </p>
        <UiAvatar
          v-if="santaWords.actual"
          :avatar="santaWords.actual.avatar"
          size="xl"
          class="size-32! text-6xl! shadow-[0_0_0_4px_rgba(255,253,249,0.9),0_12px_30px_rgba(0,0,0,0.25)]"
        />
        <p
          class="font-display text-[48px] leading-[1.08] font-bold whitespace-pre-line"
        >
          {{ santaWords.title }}
        </p>
        <p class="max-w-75 text-lg leading-[1.4] opacity-90">
          {{ santaWords.body }}
        </p>
      </template>

      <template v-else-if="screen.kind === 'closeCall' && closeCallView">
        <p class="text-sm font-bold tracking-[0.08em] uppercase opacity-90">
          {{ t('participant.game.awards.closeCall.title') }}
        </p>
        <UiAvatar
          v-if="closeCallView.person"
          :avatar="closeCallView.person.avatar"
          size="xl"
          class="size-32! text-6xl! shadow-[0_0_0_4px_rgba(255,253,249,0.9),0_12px_30px_rgba(0,0,0,0.25)]"
        />
        <p class="font-display text-[52px] leading-[1.08] font-bold">
          {{ t('participant.game.awards.closeCall.big') }}
        </p>
        <p class="max-w-75 text-lg leading-[1.4] opacity-90">
          {{ closeCallView.body }}
        </p>
      </template>

      <template v-else-if="awardView">
        <p class="text-sm font-bold tracking-[0.08em] uppercase opacity-90">
          {{ awardView.eyebrow }}
        </p>
        <span
          v-if="awardView.layout === 'avatars' && awardView.people.length > 0"
          class="flex"
        >
          <UiAvatar
            v-for="(person, index) in awardView.people"
            :key="person.id"
            :avatar="person.avatar"
            size="xl"
            class="shadow-[0_0_0_4px_rgba(255,253,249,0.9),0_12px_30px_rgba(0,0,0,0.25)]"
            :class="[
              awardView.people.length > 1
                ? 'size-24! text-5xl!'
                : 'size-32! text-6xl!',
              index > 0 ? '-ml-4' : '',
            ]"
          />
        </span>
        <ul
          v-else-if="awardView.layout === 'grid'"
          class="grid w-full max-w-80 grid-cols-3 gap-x-2 gap-y-3"
          data-testid="award-grid"
        >
          <li
            v-for="person in awardView.people"
            :key="person.id"
            class="flex min-w-0 flex-col items-center gap-1"
          >
            <UiAvatar
              :avatar="person.avatar"
              size="lg"
              class="shadow-[0_0_0_3px_rgba(255,253,249,0.9)]"
            />
            <span class="w-full truncate text-[15px] font-bold">{{
              person.name
            }}</span>
          </li>
        </ul>
        <p
          v-if="awardView.layout === 'number' || awardView.layout === 'score'"
          class="font-display text-[88px] leading-none font-bold"
        >
          {{ awardView.big }}
        </p>
        <p
          v-else
          class="font-display leading-[1.08] font-bold whitespace-pre-line"
          :class="awardView.layout === 'grid' ? 'text-[44px]' : 'text-[48px]'"
        >
          {{ awardView.big }}
        </p>
        <p v-if="awardView.sub" class="-mt-3 text-xl font-bold">
          {{ awardView.sub }}
        </p>
        <p class="max-w-75 text-lg leading-[1.4] opacity-90">
          {{ awardView.body }}
        </p>
      </template>

      <template v-else-if="screen.kind === 'end'">
        <p class="text-sm font-bold tracking-[0.08em] uppercase opacity-80">
          {{ t('participant.game.story.endEyebrow') }}
        </p>
        <p
          class="font-display text-[48px] leading-[1.08] font-bold whitespace-pre-line"
        >
          {{
            firstName
              ? t('participant.game.story.endTitle', { name: firstName })
              : t('participant.game.story.endTitleAlone')
          }}
        </p>
        <UButton
          :to="answersPath"
          block
          size="xl"
          class="mt-2 max-w-80 justify-center font-bold"
          :label="t('participant.game.story.allResults')"
          data-testid="stories-all"
        />
        <button
          type="button"
          class="flex min-h-11 items-center text-[17px] underline opacity-80"
          @click="restart"
        >
          {{ t('participant.game.story.again') }}
        </button>
      </template>
    </div>
    <p
      v-if="screen.kind !== 'end'"
      class="text-center text-sm opacity-80"
      aria-live="polite"
    >
      {{ t('participant.game.story.tapNext') }}
    </p>
  </div>
</template>
