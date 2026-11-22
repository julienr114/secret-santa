<script setup lang="ts">
import type { Avatar } from '#server/utils/avatars';
import { HINT_QUESTIONS, HINT_TEXTS } from '#shared/utils/hints';
import { MEMBER_NAME_MAX } from '#server/utils/lists';
import { shoeSizesShown } from '#shared/utils/memberFields';
import {
  useMemberQuery,
  useRemovePersonMutation,
  useUpdateMemberMutation,
} from '~/composables/queries/useLists';

// A person of my family (README 22.19, 22.20, Correction 27, maquette
// ListePersonne): their icon and first name; « Infos pratiques » (birth
// date, clothing size, shoe size), what the family always asks, shown at
// the top of their section of a list; « Son compte » (lot 25), the
// address that links one of my people to their own account; « Ses
// goûts », the same questions as the gift hints of a draw. Each line
// shows its value and opens a page of its own: no sheet to write in, and
// no sentence of help. The icon is chosen in its sheet; the first name
// is written in place, in the title, as in a list. Opened from a list,
// « Retirer de la liste » at the bottom; always, « Supprimer de mes
// proches », the red line of what cannot be taken back, which leads to
// its confirmation (Correction 24).
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const id = computed(() => String(route.params.id));
const listId = computed(() =>
  route.query.liste ? String(route.query.liste) : null,
);
const place = computed(() =>
  route.query.place ? String(route.query.place) : null,
);
const { t, tk, locale } = useT();
const toast = useMessages();
const errorMessage = useErrorMessage();
const goBack = useGoBack();
const query = useMemberQuery(id);
const update = useUpdateMemberMutation(id);
const member = computed(() => query.data.value?.member);
// « Retour »: the list, my page of a Secret Santa or « Mes proches » it
// was opened from; else the list named in the address, else « Mes proches ».
const back = useParent('person', () =>
  listId.value ? `/listes/${listId.value}` : '/famille',
);
useHead({
  title: () => `${member.value?.firstName ?? ''} — ${t('common.appName')}`,
});
/** What a page of this person keeps of the list it was opened from. */
const from = computed(() =>
  listId.value ? `liste=${listId.value}&place=${place.value ?? ''}` : '',
);
const page = (name: string, more = '') =>
  `/famille/${id.value}/${name}${[more, from.value].some(Boolean) ? `?${[more, from.value].filter(Boolean).join('&')}` : ''}`;

const save = (patch: Parameters<typeof update.mutate>[0]) =>
  update.mutate(patch, {
    onError: (error) => toast.failed(errorMessage(error)),
  });
const iconOpen = ref(false);
// The first name, written in place: saved as it is left, kept as it was
// when emptied or given up.
const naming = ref(false);
const nameDraft = ref('');
const nameField = ref<HTMLInputElement | null>(null);
const startName = async () => {
  nameDraft.value = member.value?.firstName ?? '';
  naming.value = true;
  await nextTick();
  nameField.value?.focus();
};
const saveName = () => {
  if (!naming.value) return;
  naming.value = false;
  const name = nameDraft.value.replace(/\s+/g, ' ').trim();
  if (name && name !== member.value?.firstName) save({ firstName: name });
};
/** Among my own people, and not « Moi »: I may link them to their account. */
const linkable = computed(
  () => Boolean(query.data.value?.mine) && !member.value?.isSelf,
);
/** Has an account of their own: their name and icon are theirs. */
const theirs = computed(
  () => Boolean(member.value?.linked) && !member.value?.isSelf,
);

const birthValue = computed(() => {
  const m = member.value;
  if (!m?.birthDate) return t('lists.person.noValue');
  const date = new Intl.DateTimeFormat(locale.value, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${m.birthDate}T12:00:00Z`));
  return t('lists.person.birthValue', {
    date,
    age: t('lists.doc.age', { count: m.age ?? 0 }),
  });
});
/** The tags of the answers given, as on the gift hints. */
const tags = computed(() =>
  HINT_QUESTIONS.flatMap((question) => {
    const answer = member.value?.answers[question];
    return answer ? [tk(`hints.tags.${question}.${answer}`)] : [];
  }),
);

const remove = useRemovePersonMutation(() => listId.value ?? '');
const confirmRemove = ref(false);
const onRemove = () =>
  place.value &&
  remove.mutate(place.value, {
    onSuccess: () => goBack(back.value),
    onError: (error) => toast.failed(errorMessage(error)),
  });
</script>

<template>
  <AdminScreen :back="back">
    <AdminQueryState
      :pending="query.isPending.value"
      :error="query.error.value"
      :skeleton="['title', 'list', 'card']"
    >
      <template v-if="member">
        <div class="flex items-center gap-3.5">
          <!-- Someone with an account of their own chooses their icon and
               their name. -->
          <UiAvatar
            v-if="theirs"
            :avatar="member.avatar"
            :px="64"
            class="shrink-0"
          />
          <button
            v-else
            type="button"
            class="relative shrink-0"
            :aria-label="t('lists.person.icon', { name: member.firstName })"
            @click="iconOpen = true"
          >
            <UiAvatar :avatar="member.avatar" :px="64" />
            <!-- The pencil of the list's tile: the icon changes by touching it. -->
            <span
              class="absolute -right-1.5 -bottom-1.5 flex size-7 items-center justify-center rounded-full bg-default ring-1 ring-default"
              aria-hidden="true"
            >
              <UIcon name="i-lucide-pencil" class="size-3.5" />
            </span>
          </button>
          <div class="flex min-w-0 flex-col">
            <NuxtLink to="/famille" class="text-sm text-toned">{{
              t('lists.person.context')
            }}</NuxtLink>
            <UiPageTitle v-if="theirs">{{ member.firstName }}</UiPageTitle>
            <UiPageTitle v-else-if="naming">
              <input
                ref="nameField"
                v-model="nameDraft"
                type="text"
                enterkeyhint="done"
                :maxlength="MEMBER_NAME_MAX"
                class="w-full bg-transparent outline-none"
                :aria-label="t('lists.person.name')"
                data-testid="member-name-field"
                @keydown.enter.prevent="saveName"
                @keydown.esc.prevent="naming = false"
                @blur="saveName"
              />
            </UiPageTitle>
            <button
              v-else
              type="button"
              class="text-left"
              data-testid="member-name"
              @click="startName"
            >
              <UiPageTitle>{{ member.firstName }}</UiPageTitle>
            </button>
          </div>
        </div>

        <UiList :title="t('lists.person.practical')">
          <UiListItem
            :title="t('lists.person.birth')"
            :value="birthValue"
            :to="page('naissance')"
            data-testid="member-birth"
          />
          <UiListItem
            :title="t('lists.person.clothing')"
            :value="member.clothingSize ?? t('lists.person.noValue')"
            :to="page('taille')"
            data-testid="member-clothing"
          />
          <UiListItem
            :title="t('lists.person.shoe')"
            :value="
              shoeSizesShown(member.shoeSize, t('lists.person.field.or')) ??
              t('lists.person.noValue')
            "
            :to="page('pointure')"
            data-testid="member-shoe"
          />
        </UiList>

        <UiList
          v-if="linkable"
          :title="t('lists.person.account.title')"
          data-testid="member-account"
        >
          <UiListItem
            :title="t('lists.person.field.emailField')"
            :value="member.email ?? t('lists.person.noValue')"
            :to="page('adresse')"
            data-testid="member-email"
          />
        </UiList>

        <section class="flex flex-col gap-1.5">
          <UiSectionTitle>{{ t('lists.person.tastes') }}</UiSectionTitle>
          <UiCard padding="md" class="flex flex-col gap-3">
            <h2 class="font-display text-xl leading-[1.2] font-bold">
              {{ t('lists.person.prefers', { name: member.firstName }) }}
            </h2>
            <div v-if="tags.length > 0" class="flex flex-wrap gap-2">
              <span
                v-for="tag in tags"
                :key="tag"
                class="rounded-full bg-muted px-3 py-1.5 text-sm font-semibold ring-1 ring-default"
                >{{ tag }}</span
              >
            </div>
            <p v-else class="text-sm text-toned">
              {{ t('lists.person.noAnswer') }}
            </p>
            <NuxtLink
              :to="page('question', 'n=1')"
              class="flex min-h-11 items-center text-[15px] font-bold text-primary-ink"
            >
              {{ t('lists.person.answer', { name: member.firstName }) }}
            </NuxtLink>
          </UiCard>
        </section>
        <UiList>
          <UiListItem
            v-for="key in HINT_TEXTS"
            :key="key"
            :title="t(`lists.person.texts.${key}`)"
            :value="member.texts[key] ?? t('lists.person.none')"
            :to="page('texte', `texte=${key}`)"
          />
        </UiList>

        <UiList v-if="listId && place">
          <UiListItem
            v-if="!confirmRemove"
            icon="i-lucide-user-minus"
            tone="danger"
            :title="t('lists.doc.removePerson', { name: member.firstName })"
            :on-click="() => (confirmRemove = true)"
          />
          <li v-else class="flex flex-col gap-2 px-4 py-3">
            <p class="text-sm">
              {{
                t('lists.doc.removePersonConfirm', { name: member.firstName })
              }}
            </p>
            <div class="flex gap-2">
              <UButton
                color="error"
                class="min-h-11"
                :loading="remove.isPending.value"
                :label="t('lists.doc.remove')"
                @click="onRemove"
              />
              <UButton
                variant="ghost"
                color="neutral"
                class="min-h-11"
                :label="t('common.actions.cancel')"
                @click="confirmRemove = false"
              />
            </div>
          </li>
        </UiList>
        <!-- « Moi » stays among my people. -->
        <UiList v-if="!member.isSelf">
          <UiListItem
            icon="i-lucide-trash-2"
            tone="danger"
            :title="t('lists.person.delete')"
            :to="`/famille/${id}/supprimer${listId ? `?liste=${listId}` : ''}`"
            data-testid="member-remove"
          />
        </UiList>
      </template>
    </AdminQueryState>

    <AdminAvatarSheet
      v-if="member"
      v-model:open="iconOpen"
      :initial="member.avatar"
      :title="t('lists.person.icon', { name: member.firstName })"
      @validate="
        (avatar: Avatar) => {
          iconOpen = false;
          save({ avatar });
        }
      "
    />
  </AdminScreen>
</template>
