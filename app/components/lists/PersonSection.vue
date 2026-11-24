<script setup lang="ts">
import type { ListDocument } from '#server/http/lists';
import type { Avatar } from '#server/utils/avatars';
import { MEMBER_NAME_MAX } from '#server/utils/lists';
import { shoeSizesShown } from '#shared/utils/memberFields';
import { AVATAR_SHADES } from '~/utils/avatars';
import {
  lineKey,
  useUpdateMemberMutation,
} from '~/composables/queries/useLists';

// A person on a list, as its holder writes it (README 22.19, 22.20,
// maquettes ListeTeneur, ListeGroupeFil): two columns and a thread
// (Correction 30). On the left, the round icon of 40 px and the boxes of
// their ideas, centred under it; on the right, all the text on one edge:
// the first name, the line of practical details, the paragraph of their
// tastes, their ideas, and the empty line at the end, « Une autre idée… ». The icon and
// the first name change here, by touching them, without going to the
// person's page (asked by Julien, 19 November 2026): the icon in its
// sheet (a small round pencil says so), the name written in place. The
// icon of « Moi » is the one of my account: changed here, it changes
// there. Someone linked to an account of their own (lot 25) chooses
// their name and their icon: neither changes here. At the end
// of the first name, « ⋯ » (maquette ListePersonneMenu): « Sa fiche et
// ses goûts », « Retirer de cette liste », at once when nobody ticked
// any of their ideas, otherwise after a second tap that says how many
// gifts already planned would be lost, and « Supprimer de mes proches »,
// in red, which leads to its confirmation (Correction 24).
const props = defineProps<{
  listId: string;
  person: ListDocument['people'][number];
  /** The first or the last of the list: nowhere to go up, or down. */
  first?: boolean;
  last?: boolean;
  /**
   * « Une liste sans personne » (lot 27 bis, maquette ListeSansPersonne):
   * the only part of the list, which shows no person; its ideas start
   * at the edge.
   */
  single?: boolean;
  /**
   * « Secret Santa · Famille Camille » under my own name (tickets 136,
   * 148, V3ListeSecret): a pill that opens the sheet of the link.
   */
  santas?: ListDocument['santas'];
  /** What « Lier à un Secret Santa » offers, in my menu (tickets 148, 153). */
  linkable?: ListDocument['linkable'];
  /** Whether I manage the list. */
  manages?: boolean;
  /** My name and my pill, a step of the visit (ticket 149). */
  tourMe?: boolean;
  /** What the visit puts on my empty line (ticket 149). */
  tourLine?: 'line' | 'firstLine' | null;
}>();
const { t } = useT();
const editing = useListEditing();
// Moved by dragging (lot 24 ter): the person by their header, a long
// press lifting them folded into one line; their ideas each by its line.
const drag = useListDragging();
const liftedHere = computed(
  () =>
    drag?.lifted.value?.kind === 'person' &&
    drag.lifted.value.id === props.person.id,
);
type Person = ListDocument['people'][number];
type Line =
  | {
      kind: 'idea';
      idea: Person['ideas'][number];
      /** Its place among the ideas. */
      index: number;
      /** Its place among the lines. */
      at: number;
    }
  | { kind: 'gift'; gift: Person['offList'][number]; at: number };
type Row = Line | { kind: 'drop' };
/**
 * The lines in order: the ideas, and the gifts not on the list placed
 * among them (Julien, 24 November 2026).
 */
const lines = computed<Line[]>(() => {
  const ideas = new Map(
    props.person.ideas.map((idea, index) => [idea.id, { idea, index }]),
  );
  const gifts = new Map(props.person.offList.map((gift) => [gift.id, gift]));
  // What the lines do not name yet comes after, never lost.
  const ids = [
    ...new Set([...props.person.lines, ...ideas.keys(), ...gifts.keys()]),
  ];
  return ids
    .flatMap((id): Line[] => {
      const idea = ideas.get(id);
      if (idea) return [{ kind: 'idea', ...idea, at: 0 }];
      const gift = gifts.get(id);
      return gift ? [{ kind: 'gift', gift, at: 0 }] : [];
    })
    .map((line, at) => ({ ...line, at }));
});
const lineId = (line: Line) =>
  line.kind === 'idea' ? line.idea.id : line.gift.id;
/**
 * The lines, with the red line where the one lifted would fall: its
 * place is counted among the others, the one lifted left out.
 */
const rows = computed<Row[]>(() => {
  const place = drag?.drop.value;
  const lifted = drag?.lifted.value;
  const at =
    place?.kind === 'idea' && place.personId === props.person.id
      ? place.index
      : -1;
  const laid = lines.value.reduce<{ rows: Row[]; others: number }>(
    (acc, line) => {
      const isLifted = lifted?.kind === 'idea' && lifted.id === lineId(line);
      return {
        rows: [
          ...acc.rows,
          ...(!isLifted && acc.others === at
            ? [{ kind: 'drop' as const }]
            : []),
          line,
        ],
        others: acc.others + (isLifted ? 0 : 1),
      };
    },
    { rows: [], others: 0 },
  );
  return at === laid.others ? [...laid.rows, { kind: 'drop' }] : laid.rows;
});
/**
 * The menu of a gift not on the list (Julien, 24 November 2026): its
 * handle, shown once the line is touched or under a mouse; « Monter »
 * and « Descendre » in it.
 */
const giftMenu = ref<{ id: string; above: boolean } | null>(null);
const onGiftHandle = (event: MouseEvent, id: string) => {
  if (giftMenu.value?.id === id) {
    giftMenu.value = null;
    return;
  }
  const box = (event.currentTarget as HTMLElement).getBoundingClientRect();
  giftMenu.value = {
    id,
    above: box.bottom + 160 > window.innerHeight && box.top > 160,
  };
};
const onGiftStep = (id: string, step: -1 | 1) => {
  giftMenu.value = null;
  drag?.step({ kind: 'idea', id }, step);
};
/** Moves a gift not on the list one step with `Alt` + an arrow. */
const onGiftKey = (event: KeyboardEvent, id: string) => {
  if (!drag || !event.altKey) return;
  if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
  event.preventDefault();
  drag.step({ kind: 'idea', id }, event.key === 'ArrowUp' ? -1 : 1);
};
const toast = useMessages();
const errorMessage = useErrorMessage();
const update = useUpdateMemberMutation(() => props.person.member.id);
/**
 * The first name or icon just chosen, shown at once until the list is
 * read again (ticket 166); a failure says so and puts the old one back.
 */
const chosen = ref<{ firstName?: string; avatar?: Avatar }>({});
const save = (patch: { firstName?: string; avatar?: Avatar }) => {
  chosen.value = { ...chosen.value, ...patch };
  update.mutate(patch, {
    onError: (error) => toast.failed(errorMessage(error)),
    // Only what this change set: a later one keeps showing.
    onSettled: () => {
      chosen.value = Object.fromEntries(
        Object.entries(chosen.value).filter(
          ([key, value]) => value !== patch[key as keyof typeof patch],
        ),
      );
    },
  });
};
const iconOpen = ref(false);
const onIcon = (avatar: Avatar) => {
  iconOpen.value = false;
  save({ avatar });
};
// The first name, written in place: saved as it is left, kept as it was
// when emptied or given up.
const naming = ref(false);
const nameDraft = ref('');
const nameField = ref<HTMLInputElement | null>(null);
// Live (lot 26): while someone else who holds the list writes this
// first name, it is theirs.
const { lockedBy: nameLock } = useLiveWriting(
  useListLiveLine(),
  () => `name:${props.person.id}`,
  nameDraft,
  naming,
  () => nameField.value,
);
const startName = async () => {
  if (nameLock.value) return;
  nameDraft.value = member.value.firstName;
  naming.value = true;
  await nextTick();
  nameField.value?.focus();
};
const saveName = () => {
  if (!naming.value) return;
  naming.value = false;
  const name = nameDraft.value.replace(/\s+/g, ' ').trim();
  // Against the name shown: one just chosen counts (ticket 166).
  if (name && name !== member.value.firstName) {
    save({ firstName: name });
  }
};
const cancelName = () => {
  naming.value = false;
};
const member = computed(() => ({ ...props.person.member, ...chosen.value }));
/** « 6 ans · taille 6 ans, pointure 30 ». */
const details = computed(() => {
  const m = member.value;
  const sizes = [
    m.clothingSize ? t('lists.doc.size', { size: m.clothingSize }) : null,
    m.shoeSize
      ? t('lists.doc.shoe', {
          size: shoeSizesShown(m.shoeSize, t('lists.person.field.or')) ?? '',
        })
      : null,
  ].filter(Boolean);
  return [
    m.age === null ? null : t('lists.doc.age', { count: m.age }),
    sizes.length > 0 ? sizes.join(', ') : null,
  ]
    .filter(Boolean)
    .join(' · ');
});
/** The gifts already planned for them, lost if they leave the list. */
const planned = computed(
  () =>
    props.person.ideas.filter((idea) => idea.view.kind !== 'free').length +
    props.person.offList.length,
);
/**
 * « Lier à un Secret Santa » (tickets 153, 155): in my part, while one of
 * my Secret Santa of the year, drawn, is not linked to this list (linked
 * to another, it moves here: docs/spec/v3/listes.md, « Lier et délier »);
 * it opens the sheet of ListsDrawLink.
 */
const drawLink = ref<{ ask: () => void } | null>(null);
const canLink = computed(
  () =>
    member.value.isSelf && props.manages && (props.linkable ?? []).length > 0,
);
const menuOpen = ref(false);
const confirming = ref(false);
watch(menuOpen, (open) => {
  if (!open) confirming.value = false;
});
const menu = computed(() =>
  confirming.value
    ? [
        [
          {
            type: 'label' as const,
            label: t('lists.doc.removeLoses', { count: planned.value }),
          },
          {
            label: t('lists.doc.remove'),
            icon: 'i-lucide-user-minus',
            color: 'primary' as const,
            onSelect: () => editing.removePerson(props.person),
          },
          { label: t('common.actions.cancel'), icon: 'i-lucide-x' },
        ],
      ]
    : [
        [
          {
            label: t('lists.doc.personPage'),
            icon: 'i-lucide-user',
            to: `/famille/${member.value.id}?liste=${props.listId}&place=${props.person.id}`,
          },
          ...(canLink.value
            ? [
                {
                  label: t('lists.link.action'),
                  icon: 'i-lucide-mail',
                  onSelect: () => drawLink.value?.ask(),
                },
              ]
            : []),
          // The same as dragging, without dragging.
          ...(drag && !props.first
            ? [
                {
                  label: t('lists.doc.drag.up'),
                  icon: 'i-lucide-arrow-up',
                  onSelect: () =>
                    drag.step({ kind: 'person', id: props.person.id }, -1),
                },
              ]
            : []),
          ...(drag && !props.last
            ? [
                {
                  label: t('lists.doc.drag.down'),
                  icon: 'i-lucide-arrow-down',
                  onSelect: () =>
                    drag.step({ kind: 'person', id: props.person.id }, 1),
                },
              ]
            : []),
          {
            label: t('lists.doc.removeFromList'),
            icon: 'i-lucide-user-minus',
            onSelect: (event: Event) => {
              if (planned.value === 0) {
                editing.removePerson(props.person);
                return;
              }
              // The menu stays, and asks again.
              event.preventDefault();
              confirming.value = true;
            },
          },
          // Not « Moi », who stays, nor someone else's person.
          ...(member.value.isSelf || !member.value.own
            ? []
            : [
                {
                  label: t('lists.doc.deleteFromFamily'),
                  icon: 'i-lucide-trash-2',
                  color: 'error' as const,
                  to: `/famille/${member.value.id}/supprimer?liste=${props.listId}`,
                },
              ]),
        ],
      ],
);
const via = computed(() => ({ listId: props.listId }));
// Live (lot 26, maquette ListeLiveTeneur): the new idea someone else who
// holds the list is writing for this person shows as they type it, just
// above « Une autre idée… », tinted with the light colour of their icon.
const live = useListLiveLine();
const ghost = computed(
  () => live?.writingBy(`new:${props.person.id}`, props.person.id) ?? null,
);
const ghostShade = computed(() =>
  ghost.value?.avatar ? AVATAR_SHADES[ghost.value.avatar.color] : null,
);
// A gift not on the list cannot be unticked from here (Julien, 19
// November 2026): touching it says why, under the line, instead of
// doing nothing.
const explained = ref<string | null>(null);
</script>

<template>
  <section
    class="relative flex flex-col gap-0.5"
    :class="liftedHere ? 'opacity-30' : ''"
    data-testid="list-person"
    data-drag-section
    :data-drag-id="person.id"
  >
    <ListsPersonThread v-if="!single && !liftedHere" />
    <ListsTourStop v-if="!single" :step="tourMe ? 'me' : null">
      <header
        class="flex items-center gap-2.5"
        :data-drag="drag ? 'person' : undefined"
        :data-drag-id="drag ? person.id : undefined"
      >
        <!-- Someone with an account of their own chooses their icon; « Moi »
           changes mine from here. -->
        <UiAvatar
          v-if="member.linked && !member.isSelf"
          :avatar="member.avatar"
          :px="40"
          class="shrink-0"
        />
        <button
          v-else
          type="button"
          class="relative shrink-0"
          :aria-label="t('lists.person.icon', { name: member.firstName })"
          data-testid="person-icon"
          @click="iconOpen = true"
        >
          <UiAvatar :avatar="member.avatar" :px="40" />
          <!-- The pencil of the list's tile: this icon changes by touching it. -->
          <span
            class="absolute -right-1.5 -bottom-1 flex size-5 items-center justify-center rounded-full bg-default ring-1 ring-default"
            aria-hidden="true"
          >
            <UIcon name="i-lucide-pencil" class="size-2.5" />
          </span>
        </button>
        <div class="flex min-w-0 grow flex-col gap-0.5">
          <h2 class="font-display text-2xl leading-[1.15] font-bold">
            <ListsLiveLock v-if="nameLock" :by="nameLock" />
            <input
              v-else-if="naming"
              ref="nameField"
              v-model="nameDraft"
              type="text"
              enterkeyhint="done"
              :maxlength="MEMBER_NAME_MAX"
              class="w-full bg-transparent outline-none select-text"
              :aria-label="t('lists.person.name')"
              data-testid="person-name-field"
              @keydown.enter.prevent="saveName"
              @keydown.esc.prevent="cancelName"
              @blur="saveName"
            />
            <template v-else-if="member.linked">{{
              member.firstName
            }}</template>
            <button
              v-else
              type="button"
              class="text-left"
              data-testid="person-name"
              @click="startName"
            >
              {{ member.firstName }}
            </button>
            <template v-if="member.isSelf && !naming && !nameLock">
              {{ ' ' }}<ListsMeTag />
            </template>
          </h2>
          <p v-if="details" class="text-sm leading-[1.4] text-toned">
            {{ details }}
          </p>
          <ListsDrawLink
            v-if="member.isSelf"
            ref="drawLink"
            :list-id="listId"
            :santas="santas ?? []"
            :linkable="linkable ?? []"
            :manages="manages"
          />
        </div>
        <UDropdownMenu
          v-model:open="menuOpen"
          :items="menu"
          :content="{ align: 'end' }"
          :ui="{
            content:
              'max-w-[280px] min-w-[230px] rounded-xl shadow-[0_8px_24px_rgba(60,30,10,0.14)]',
            group: 'p-0',
            label: 'px-3.5 pt-3 pb-1 text-sm font-normal text-default',
            item: 'min-h-12 items-center px-3.5 text-base',
            itemLeadingIcon: 'size-5',
          }"
        >
          <UButton
            variant="ghost"
            color="neutral"
            icon="i-lucide-ellipsis"
            class="ml-auto size-10 shrink-0 justify-center rounded-full text-toned"
            :aria-label="t('lists.doc.personMenu', { name: member.firstName })"
            data-testid="person-menu"
            data-no-drag
          />
        </UDropdownMenu>
      </header>
    </ListsTourStop>
    <!-- What the others read of their tastes, the same paragraph. -->
    <ListsPersonTastes v-if="!single && !liftedHere" :member="member" />
    <!-- A person lifted is folded: their ideas wait, out of the way. -->
    <!-- A line that appears, moves or goes shows it by its movement (lot
         26), unless motion is to be reduced; not while one is dragged. -->
    <TransitionGroup
      v-show="!liftedHere"
      tag="ul"
      :name="drag?.lifted.value ? 'none' : 'line'"
      class="flex flex-col"
      :class="single ? '' : 'person-lines mt-1.5'"
    >
      <template
        v-for="row in rows"
        :key="row.kind === 'drop' ? 'drop' : lineKey(lineId(row))"
      >
        <li
          v-if="row.kind === 'drop'"
          class="my-0.5 h-1 rounded-full bg-peach-300"
          aria-hidden="true"
          data-testid="drop-line"
        />
        <ListsIdeaLine
          v-else-if="row.kind === 'idea'"
          :via="via"
          :list-person-id="person.id"
          :for-name="single ? '' : member.firstName"
          :idea="row.idea"
          :line="`${person.id}:${row.index}`"
          :first="row.at === 0"
          :last="row.at === lines.length - 1"
        />
        <!-- A gift not on the list: lifted and dropped among the ideas of
             its person, never at another (Julien, 24 November 2026). -->
        <li
          v-else
          class="list-line group relative flex flex-col"
          :class="
            drag?.lifted.value?.kind === 'idea' &&
            drag.lifted.value.id === row.gift.id
              ? 'opacity-30'
              : ''
          "
          :data-drag="drag ? 'idea' : undefined"
          :data-drag-id="drag ? row.gift.id : undefined"
          :data-drag-stay="drag ? '' : undefined"
          data-testid="holder-off-list"
          @mousedown="drag?.grab($event, { kind: 'idea', id: row.gift.id })"
          @keydown="onGiftKey($event, row.gift.id)"
        >
          <button
            type="button"
            class="flex items-start gap-[var(--line-gap,12px)] text-left"
            :class="drag ? 'pr-9' : ''"
            :aria-expanded="explained === row.gift.id"
            @click="explained = explained === row.gift.id ? null : row.gift.id"
          >
            <span
              class="mt-0.5 flex size-[22px] shrink-0 items-center justify-center rounded-sm bg-line-strong text-highlighted"
              aria-hidden="true"
            >
              <UIcon name="i-lucide-check" class="size-3.5" />
            </span>
            <span class="flex flex-col items-start text-base/[22px]">
              <span class="text-toned line-through">{{
                t('lists.doc.offList', {
                  text: row.gift.kind === 'surprise' ? '' : row.gift.text,
                })
              }}</span>
              <UiChip v-if="row.gift.kind === 'holder'" class="mt-1.5">{{
                row.gift.by ?? t('lists.doc.anonymous')
              }}</UiChip>
            </span>
          </button>
          <div
            v-if="drag && lines.length > 1"
            class="absolute top-2 right-0"
            :class="
              explained === row.gift.id || giftMenu?.id === row.gift.id
                ? 'flex'
                : 'hidden [@media(hover:hover)]:group-hover:flex'
            "
          >
            <button
              type="button"
              class="flex size-8 cursor-grab items-center justify-center rounded-[10px] text-dimmed"
              :class="
                giftMenu?.id === row.gift.id ? 'bg-peach-100' : 'bg-default'
              "
              :aria-label="t('lists.line.handle')"
              aria-haspopup="menu"
              :aria-expanded="giftMenu?.id === row.gift.id"
              data-line-handle
              data-testid="line-handle"
              @click="onGiftHandle($event, row.gift.id)"
            >
              <UIcon name="i-lucide-grip-vertical" class="size-4" />
            </button>
            <ListsLineMenu
              v-if="giftMenu?.id === row.gift.id"
              gift
              :stars="0"
              :title="false"
              :can-title="false"
              :can-up="row.at > 0"
              :can-down="row.at < lines.length - 1"
              :can-move="false"
              :above="giftMenu.above"
              @up="onGiftStep(row.gift.id, -1)"
              @down="onGiftStep(row.gift.id, 1)"
              @close="giftMenu = null"
            />
          </div>
          <p
            v-if="explained === row.gift.id"
            class="mt-1.5 ml-[calc(22px_+_var(--line-gap,12px))] rounded-[18px] bg-muted px-3 py-2 text-sm leading-[1.35] text-toned"
            role="status"
            data-testid="off-list-notice"
          >
            {{
              row.gift.kind === 'holder' && row.gift.by
                ? t('lists.doc.offListNotice', { name: row.gift.by })
                : t('lists.doc.offListNoticeAnonymous')
            }}
          </p>
        </li>
      </template>
      <li
        v-if="ghost"
        key="ghost"
        class="relative -mx-2 flex items-start gap-[var(--line-gap,12px)] rounded-xl px-2 py-2"
        :style="
          ghostShade
            ? {
                backgroundColor: `color-mix(in srgb, ${ghostShade.bg} 55%, transparent)`,
              }
            : undefined
        "
        aria-live="polite"
        data-testid="line-ghost"
      >
        <span
          class="mt-0.5 size-[22px] shrink-0 rounded-sm border-[1.5px] border-accented bg-default"
          aria-hidden="true"
        />
        <div class="flex min-w-0 grow flex-col gap-0.5">
          <p class="text-base leading-[1.45]">
            {{ ghost.text.slice(0, ghost.caret)
            }}<span
              class="live-caret"
              :style="{ backgroundColor: ghostShade?.ring ?? 'currentColor' }"
              aria-hidden="true"
            />{{ ghost.text.slice(ghost.caret) }}
          </p>
          <p class="flex items-center gap-1.5 text-[13px] text-toned">
            <UiAvatar
              v-if="ghost.avatar"
              :avatar="ghost.avatar"
              :px="18"
              flat
            />
            {{ t('lists.live.writing', { name: ghost.name }) }}
          </p>
        </div>
      </li>
      <ListsIdeaLine
        key="new"
        :tour="tourLine ?? null"
        :via="via"
        :list-person-id="person.id"
        :for-name="single ? '' : member.firstName"
        :idea="null"
        :after="null"
        :placeholder="
          member.isSelf && !single
            ? person.ideas.length > 0
              ? t('lists.visitor.anotherForMe')
              : t('lists.visitor.ideaForMe')
            : person.ideas.length > 0
              ? t('lists.doc.anotherIdea')
              : single
                ? t('lists.single.firstIdea')
                : t('lists.doc.ideaFor', { name: member.firstName })
        "
        :line="`${person.id}:new`"
      />
    </TransitionGroup>
    <AdminAvatarSheet
      v-model:open="iconOpen"
      :initial="member.avatar"
      :title="t('lists.person.icon', { name: member.firstName })"
      @validate="onIcon"
    />
  </section>
</template>
