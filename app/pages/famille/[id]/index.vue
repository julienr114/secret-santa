<script setup lang="ts">
import type { Avatar } from '#server/utils/avatars';
import { HINT_QUESTIONS, HINT_TEXTS } from '#shared/utils/hints';
import { MEMBER_FIELD_MAX, MEMBER_NAME_MAX } from '#server/utils/lists';
import {
  useMemberQuery,
  useRemovePersonMutation,
  useUpdateMemberMutation,
} from '~/composables/queries/useLists';

// A person of my family (README 22.19, maquette ListePersonne): their
// icon and first name; « Infos pratiques » (birth date, clothing size,
// shoe size), what the family always asks, shown at the top of their
// section of a list; « Ses goûts », the same questions as the gift hints
// of a draw. Each short value in its sheet, saved at once; the texts on
// their page. Opened from a list, « Retirer de la liste » at the bottom.
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
const toast = useToast();
const errorMessage = useErrorMessage();
const goBack = useGoBack();
const query = useMemberQuery(id);
const update = useUpdateMemberMutation(id);
const member = computed(() => query.data.value?.member);
const back = computed(() =>
  listId.value ? `/listes/${listId.value}` : '/listes',
);
useHead({
  title: () => `${member.value?.firstName ?? ''} — ${t('common.appName')}`,
});
const suffix = computed(() =>
  listId.value ? `?liste=${listId.value}&place=${place.value ?? ''}` : '',
);

const save = (patch: Parameters<typeof update.mutate>[0]) =>
  update.mutate(patch, {
    onError: (error) =>
      toast.add({ title: errorMessage(error), color: 'error' }),
  });
const editing = ref<null | 'icon' | 'name' | 'birth' | 'clothing' | 'shoe'>(
  null,
);
const opened = (which: NonNullable<typeof editing.value>) =>
  computed({
    get: () => editing.value === which,
    set: (open) => {
      editing.value = open ? which : null;
    },
  });
const iconOpen = opened('icon');
const nameOpen = opened('name');
const birthOpen = opened('birth');
const clothingOpen = opened('clothing');
const shoeOpen = opened('shoe');
const close = () => {
  editing.value = null;
};

const birthValue = computed(() => {
  const m = member.value;
  if (!m?.birthDate) return t('lists.person.none');
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
    onError: (error) =>
      toast.add({ title: errorMessage(error), color: 'error' }),
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
          <button
            type="button"
            class="relative shrink-0"
            :aria-label="t('lists.person.icon', { name: member.firstName })"
            @click="editing = 'icon'"
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
            <p class="text-sm text-toned">{{ t('lists.person.context') }}</p>
            <button
              type="button"
              class="text-left"
              data-testid="member-name"
              @click="editing = 'name'"
            >
              <UiPageTitle>{{ member.firstName }}</UiPageTitle>
            </button>
          </div>
        </div>

        <UiList
          :title="t('lists.person.practical')"
          :footer="t('lists.person.practicalHelp')"
        >
          <UiListItem
            :title="t('lists.person.birth')"
            :value="birthValue"
            :on-click="() => (editing = 'birth')"
            data-testid="member-birth"
          />
          <UiListItem
            :title="t('lists.person.clothing')"
            :value="member.clothingSize ?? t('lists.person.none')"
            :on-click="() => (editing = 'clothing')"
            data-testid="member-clothing"
          />
          <UiListItem
            :title="t('lists.person.shoe')"
            :value="member.shoeSize ?? t('lists.person.none')"
            :on-click="() => (editing = 'shoe')"
            data-testid="member-shoe"
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
              :to="`/famille/${id}/question?n=1${listId ? `&liste=${listId}&place=${place ?? ''}` : ''}`"
              class="flex min-h-11 items-center text-[15px] font-bold text-primary-ink"
            >
              {{ t('lists.person.answer', { name: member.firstName }) }}
            </NuxtLink>
          </UiCard>
        </section>
        <UiList :footer="t('lists.person.tastesHelp')">
          <UiListItem
            v-for="key in HINT_TEXTS"
            :key="key"
            :title="t(`lists.person.texts.${key}`)"
            :value="member.texts[key] ?? t('lists.person.none')"
            :to="`/famille/${id}/texte?texte=${key}${suffix ? `&${suffix.slice(1)}` : ''}`"
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
      </template>
    </AdminQueryState>

    <template v-if="member">
      <AdminAvatarSheet
        v-model:open="iconOpen"
        :initial="member.avatar"
        :title="t('lists.person.icon', { name: member.firstName })"
        @validate="
          (avatar: Avatar) => {
            close();
            save({ avatar });
          }
        "
      />
      <UiTextSheet
        v-model:open="nameOpen"
        :title="t('lists.person.name')"
        :label="t('lists.person.name')"
        :value="member.firstName"
        :maxlength="MEMBER_NAME_MAX"
        :validate-label="t('common.actions.validate')"
        :cancel-label="t('common.actions.cancel')"
        @validate="
          (name) => {
            close();
            if (name.trim()) save({ firstName: name.trim() });
          }
        "
      />
      <AdminDateSheet
        v-model:open="birthOpen"
        :title="t('lists.person.birth')"
        :label="t('lists.person.birth')"
        :value="member.birthDate ?? ''"
        :clear-label="t('lists.person.none')"
        @validate="
          (date) => {
            close();
            save({ birthDate: date || null });
          }
        "
      />
      <UiTextSheet
        v-model:open="clothingOpen"
        :title="t('lists.person.clothing')"
        :label="t('lists.person.clothing')"
        :value="member.clothingSize ?? ''"
        :maxlength="MEMBER_FIELD_MAX"
        :validate-label="t('common.actions.validate')"
        :cancel-label="t('common.actions.cancel')"
        @validate="
          (size) => {
            close();
            save({ clothingSize: size.trim() || null });
          }
        "
      />
      <UiTextSheet
        v-model:open="shoeOpen"
        :title="t('lists.person.shoe')"
        :label="t('lists.person.shoe')"
        :value="member.shoeSize ?? ''"
        :maxlength="MEMBER_FIELD_MAX"
        :validate-label="t('common.actions.validate')"
        :cancel-label="t('common.actions.cancel')"
        @validate="
          (size) => {
            close();
            save({ shoeSize: size.trim() || null });
          }
        "
      />
    </template>
  </AdminScreen>
</template>
