<script setup lang="ts">
import type { ListDocument } from '#server/http/lists';
import type { Avatar } from '#server/utils/avatars';
import { MEMBER_NAME_MAX } from '#server/utils/lists';
import { shoeSizesShown } from '#shared/utils/memberFields';
import { AVATAR_SHADES } from '~/utils/avatars';
import { useUpdateMemberMutation } from '~/composables/queries/useLists';

// A person on a list, as its holder writes it (README 22.19, maquette
// ListeTeneur): the round icon of 52 px left of the first name and the
// line of practical details, then their ideas, set 20 px in from the
// icon, and the empty line at the end, « Une autre idée… ». The icon and
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
type Row =
  | {
      kind: 'idea';
      idea: ListDocument['people'][number]['ideas'][number];
      index: number;
    }
  | { kind: 'drop' };
/**
 * The ideas, with the red line where the idea lifted would fall: its
 * place is counted among the others, the one lifted left out.
 */
const rows = computed<Row[]>(() => {
  const place = drag?.drop.value;
  const lifted = drag?.lifted.value;
  const at =
    place?.kind === 'idea' && place.personId === props.person.id
      ? place.index
      : -1;
  const laid = props.person.ideas.reduce<{ rows: Row[]; others: number }>(
    (acc, idea, index) => {
      const isLifted = lifted?.kind === 'idea' && lifted.id === idea.id;
      return {
        rows: [
          ...acc.rows,
          ...(!isLifted && acc.others === at
            ? [{ kind: 'drop' as const }]
            : []),
          { kind: 'idea' as const, idea, index },
        ],
        others: acc.others + (isLifted ? 0 : 1),
      };
    },
    { rows: [], others: 0 },
  );
  return at === laid.others ? [...laid.rows, { kind: 'drop' }] : laid.rows;
});
const toast = useMessages();
const errorMessage = useErrorMessage();
const update = useUpdateMemberMutation(() => props.person.member.id);
const save = (patch: { firstName?: string; avatar?: Avatar }) =>
  update.mutate(patch, {
    onError: (error) => toast.failed(errorMessage(error)),
  });
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
  nameDraft.value = props.person.member.firstName;
  naming.value = true;
  await nextTick();
  nameField.value?.focus();
};
const saveName = () => {
  if (!naming.value) return;
  naming.value = false;
  const name = nameDraft.value.replace(/\s+/g, ' ').trim();
  if (name && name !== props.person.member.firstName) {
    save({ firstName: name });
  }
};
const cancelName = () => {
  naming.value = false;
};
const member = computed(() => props.person.member);
/** « 6 ans · taille 6 ans, pointure 30 », or « Moi ». */
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
    m.isSelf ? t('lists.doc.me') : null,
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
    class="flex flex-col gap-1"
    :class="liftedHere ? 'opacity-30' : ''"
    data-testid="list-person"
    data-drag-section
    :data-drag-id="person.id"
  >
    <header
      v-if="!single"
      class="flex items-center gap-3 pb-1"
      :data-drag="drag ? 'person' : undefined"
      :data-drag-id="drag ? person.id : undefined"
    >
      <!-- Someone with an account of their own chooses their icon; « Moi »
           changes mine from here. -->
      <UiAvatar
        v-if="member.linked && !member.isSelf"
        :avatar="member.avatar"
        :px="52"
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
        <UiAvatar :avatar="member.avatar" :px="52" />
        <!-- The pencil of the list's tile: this icon changes by touching it. -->
        <span
          class="absolute -right-1.5 -bottom-1.5 flex size-6 items-center justify-center rounded-full bg-default ring-1 ring-default"
          aria-hidden="true"
        >
          <UIcon name="i-lucide-pencil" class="size-3" />
        </span>
      </button>
      <div class="flex min-w-0 grow flex-col">
        <h2 class="font-display text-[28px] leading-[1.1] font-bold">
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
          <template v-else-if="member.linked">{{ member.firstName }}</template>
          <button
            v-else
            type="button"
            class="text-left"
            data-testid="person-name"
            @click="startName"
          >
            {{ member.firstName }}
          </button>
        </h2>
        <p v-if="details" class="text-sm text-toned">{{ details }}</p>
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
    <!-- A person lifted is folded: their ideas wait, out of the way. -->
    <!-- A line that appears, moves or goes shows it by its movement (lot
         26), unless motion is to be reduced; not while one is dragged. -->
    <TransitionGroup
      v-show="!liftedHere"
      tag="ul"
      :name="drag?.lifted.value ? 'none' : 'line'"
      class="flex flex-col"
      :class="single ? '' : 'pl-5'"
    >
      <template
        v-for="row in rows"
        :key="row.kind === 'idea' ? row.idea.id : 'drop'"
      >
        <li
          v-if="row.kind === 'drop'"
          class="my-0.5 h-1 rounded-full bg-primary"
          aria-hidden="true"
          data-testid="drop-line"
        />
        <ListsIdeaLine
          v-else
          :via="via"
          :list-person-id="person.id"
          :for-name="single ? '' : member.firstName"
          :idea="row.idea"
          :line="`${person.id}:${row.index}`"
        />
      </template>
      <li
        v-for="gift in person.offList"
        :key="gift.id"
        class="flex flex-col py-2"
        data-testid="holder-off-list"
      >
        <button
          type="button"
          class="flex items-start gap-3 text-left"
          :aria-expanded="explained === gift.id"
          @click="explained = explained === gift.id ? null : gift.id"
        >
          <span
            class="mt-0.5 flex size-[22px] shrink-0 items-center justify-center rounded-sm bg-line-strong text-highlighted"
            aria-hidden="true"
          >
            <UIcon name="i-lucide-check" class="size-3.5" />
          </span>
          <span class="flex flex-wrap items-center gap-x-2 gap-y-1 text-base">
            <span class="text-toned line-through">{{
              t('lists.doc.offList', {
                text: gift.kind === 'surprise' ? '' : gift.text,
              })
            }}</span>
            <span
              v-if="gift.kind === 'holder'"
              class="rounded-full bg-muted px-2 py-0.5 text-xs font-bold text-default"
              >{{ gift.by ?? t('lists.doc.anonymous') }}</span
            >
          </span>
        </button>
        <p
          v-if="explained === gift.id"
          class="mt-1.5 ml-[34px] rounded-[18px] bg-muted px-3 py-2 text-sm leading-[1.35] text-toned"
          role="status"
          data-testid="off-list-notice"
        >
          {{
            gift.kind === 'holder' && gift.by
              ? t('lists.doc.offListNotice', { name: gift.by })
              : t('lists.doc.offListNoticeAnonymous')
          }}
        </p>
      </li>
      <li
        v-if="ghost"
        key="ghost"
        class="-mx-2 flex items-start gap-3 rounded-xl px-2 py-2"
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
          class="mt-0.5 size-[22px] shrink-0 rounded-sm border-[1.5px] border-accented bg-default opacity-50"
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
        :via="via"
        :list-person-id="person.id"
        :for-name="single ? '' : member.firstName"
        :idea="null"
        :after="null"
        :placeholder="
          person.ideas.length > 0
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
