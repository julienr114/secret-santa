<script setup lang="ts">
import type { ListDocument } from '#server/http/lists';
import type { Avatar } from '#server/utils/avatars';
import { MEMBER_NAME_MAX } from '#server/utils/lists';
import { useUpdateMemberMutation } from '~/composables/queries/useLists';
import type IdeaLine from './IdeaLine.vue';

// A person on a list, as its holder writes it (README 22.19, maquette
// ListeTeneur): the round icon of 52 px left of the first name and the
// line of practical details, then their ideas, set 20 px in from the
// icon, and the empty line at the end, « Une autre idée… ». The icon and
// the first name change here, by touching them, without going to the
// person's page (asked by Julien, 19 November 2026): the icon in its
// sheet (a small round pencil says so), the name written in place. The
// icon of « Moi » is the one of my account: changed here, it changes
// there. The name of a person linked to an account is not written here:
// « Moi » today. At the end
// of the first name, « ⋯ » (maquette ListePersonneMenu): « Sa fiche et
// ses goûts », « Retirer de cette liste », at once when nobody ticked
// any of their ideas, otherwise after a second tap that says how many
// gifts already planned would be lost, and « Supprimer de mes proches »,
// in red, which leads to its confirmation (Correction 24).
const props = defineProps<{
  listId: string;
  person: ListDocument['people'][number];
}>();
const { t } = useT();
const editing = useListEditing();
const toast = useToast();
const errorMessage = useErrorMessage();
const update = useUpdateMemberMutation(() => props.person.member.id);
const save = (patch: { firstName?: string; avatar?: Avatar }) =>
  update.mutate(patch, {
    onError: (error) =>
      toast.add({ title: errorMessage(error), color: 'error' }),
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
const startName = async () => {
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
    m.shoeSize ? t('lists.doc.shoe', { size: m.shoeSize }) : null,
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
          // Not « Moi »: they stay among my people.
          ...(member.value.isSelf
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
const lines = ref<InstanceType<typeof IdeaLine>[]>([]);
const last = ref<InstanceType<typeof IdeaLine> | null>(null);
/**
 * The return key on a line: on to the next one, the empty line last.
 * @param index - The line left.
 */
const onNext = (index: number) =>
  (index + 1 < props.person.ideas.length
    ? lines.value[index + 1]
    : last.value
  )?.start();
</script>

<template>
  <section class="flex flex-col gap-1" data-testid="list-person">
    <header class="flex items-center gap-3 pb-1">
      <button
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
          <input
            v-if="naming"
            ref="nameField"
            v-model="nameDraft"
            type="text"
            enterkeyhint="done"
            :maxlength="MEMBER_NAME_MAX"
            class="w-full bg-transparent outline-none"
            :aria-label="t('lists.person.name')"
            data-testid="person-name-field"
            @keydown.enter.prevent="saveName"
            @keydown.esc.prevent="cancelName"
            @blur="saveName"
          />
          <template v-else-if="member.isSelf">{{ member.firstName }}</template>
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
        />
      </UDropdownMenu>
    </header>
    <ul class="flex flex-col pl-5">
      <ListsIdeaLine
        v-for="(idea, index) in person.ideas"
        :key="idea.id"
        ref="lines"
        :list-id="listId"
        :list-person-id="person.id"
        :for-name="member.firstName"
        :idea="idea"
        :line="`${person.id}:${index}`"
        @next="onNext(index)"
      />
      <li
        v-for="gift in person.offList"
        :key="gift.id"
        class="flex items-start gap-3 py-2"
        data-testid="holder-off-list"
      >
        <span
          class="mt-0.5 flex size-[22px] shrink-0 items-center justify-center rounded-sm bg-line-strong text-highlighted"
          aria-hidden="true"
        >
          <UIcon name="i-lucide-check" class="size-3.5" />
        </span>
        <p class="flex flex-wrap items-center gap-x-2 gap-y-1 text-base">
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
        </p>
      </li>
      <ListsIdeaLine
        ref="last"
        :list-id="listId"
        :list-person-id="person.id"
        :for-name="member.firstName"
        :idea="null"
        :after="null"
        :placeholder="
          person.ideas.length === 0
            ? t('lists.doc.ideaFor', { name: member.firstName })
            : t('lists.doc.anotherIdea')
        "
        :line="`${person.id}:new`"
      />
    </ul>
    <AdminAvatarSheet
      v-model:open="iconOpen"
      :initial="member.avatar"
      :title="t('lists.person.icon', { name: member.firstName })"
      @validate="onIcon"
    />
  </section>
</template>
