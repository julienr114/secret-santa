<script setup lang="ts">
import { z } from 'zod';
import { LOCALES, type Locale } from '#shared/i18n';
import type { Avatar } from '#server/utils/avatars';
import { byName, fullName } from '#server/utils/people';
import { notDrawnBy } from '#shared/utils/exclusions';
import {
  useDashboardQuery,
  useDeleteExclusionMutation,
  useDeletePersonMutation,
  useEditionQuery,
  usePeopleQuery,
  useUpdatePersonMutation,
  type PersonPatch,
} from '~/composables/queries/useGroup';

// A person of the group: their icon; one card of rows, their first name,
// address and last name written on their rows (ticket 162, GroupePersonne)
// and the language of their messages in its sheet, each saved on its own
// (no « Enregistrer »); who they never draw; then taking them out of the
// group, which keeps their history.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t, tk } = useT();
const goBack = useGoBack();
const errorMessage = useErrorMessage();
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const id = computed(() => String(route.params.id));
const toast = useMessages();
/**
 * Shows an error in a toast.
 * @param error - The error of a mutation.
 * @returns Nothing.
 */
const onError = (error: unknown) => toast.failed(errorMessage(error));
const membersPath = computed(() => `/e/${slug.value}/membres`);

const people = usePeopleQuery(slug);
const dashboard = useDashboardQuery(slug);
const currentId = computed(() => dashboard.data.value?.currentEditionId ?? '');
const current = useEditionQuery(slug, currentId, () =>
  Boolean(currentId.value),
);
const update = useUpdatePersonMutation(slug);
const removeExclusion = useDeleteExclusionMutation(slug);
const remove = useDeletePersonMutation(slug);
const context = useScreenContext(slug);

const persons = computed(() => people.data.value?.persons ?? []);
const person = computed(
  () => persons.value.find((p) => p.id === id.value) ?? null,
);
useHead({
  title: () =>
    context.titleOf(
      person.value
        ? fullName(person.value)
        : t('adminGroup.person.fallbackTitle'),
    ),
});
const screen = computed(() => ({ back: membersPath.value }));

/** Whether the person takes part in the edition going on, and which. */
const subtitle = computed(() => {
  if (!person.value) return undefined;
  if (!person.value.active) return t('adminGroup.people.inactive');
  const edition = current.data.value;
  if (!edition) return undefined;
  const label = edition.edition.label;
  return edition.participants.some((p) => p.id === id.value)
    ? t('adminGroup.person.takesPart', { label })
    : t('adminGroup.person.notTakingPart', { label });
});

const notDrawn = computed(() =>
  notDrawnBy(id.value, people.data.value?.exclusions ?? [])
    .map((n) => ({
      ...n,
      person: persons.value.find((p) => p.id === n.personId),
    }))
    .filter((n) => n.person)
    .toSorted((a, b) => byName(a.person!, b.person!)),
);
const exclusionOpen = ref(false);

/**
 * Saves one field of the person, written on its row or chosen.
 * @param patch - What changes.
 * @returns Once saved; a failure is the row's to say.
 */
const saveField = (patch: Omit<PersonPatch, 'id'>) =>
  update.mutateAsync({ id: id.value, ...patch });
/**
 * An address, if any, must be one (ticket 162: said under its row).
 * @param email - The address written.
 * @returns The words of the error, or null.
 */
const checkEmail = (email: string) =>
  email === '' || z.email().safeParse(email).success
    ? null
    : t('adminGroup.personForm.emailInvalid');
/**
 * A new icon, saved at once.
 * @param avatar - The icon chosen.
 * @returns Nothing: a failure is told in a toast.
 */
const onAvatar = (avatar: Avatar) =>
  saveField({ avatarEmoji: avatar.emoji, avatarColor: avatar.color }).catch(
    onError,
  );
const languageOpen = ref(false);
const languages = computed(() =>
  LOCALES.map((value) => ({ value, label: tk(`common.language.${value}`) })),
);
/**
 * The language of their messages, saved at once.
 * @param language - The language chosen.
 * @returns Nothing: « Enregistré », or a failure in a toast.
 */
const onLanguage = (language: Locale) => {
  languageOpen.value = false;
  saveField({ language })
    .then(() => toast.done(t('common.saved')))
    .catch(onError);
};

// Taking out of the group (and back), or deleting someone who never
// took part, each with a second tap.
const confirming = ref<null | 'leave' | 'delete'>(null);
/**
 * Takes the person out of the group, or back in.
 * @param active - True to bring them back.
 * @returns Nothing: the mutation reports by itself.
 */
const setActive = (active: boolean) =>
  update.mutate(
    { id: id.value, active },
    {
      onSuccess: () => {
        confirming.value = null;
      },
      onError,
    },
  );
/**
 * Deletes the person for good, then goes back to the members.
 * @returns Nothing: the mutation reports by itself.
 */
const onDelete = () =>
  remove.mutate(id.value, {
    onSuccess: () => goBack(membersPath.value),
    onError: (error) => {
      confirming.value = null;
      onError(error);
    },
  });
</script>

<template>
  <AdminScreen v-bind="screen">
    <AdminQueryState
      :pending="people.isPending.value"
      :error="people.error.value"
      :skeleton="['header', 'settings', 'list']"
      :rows="2"
    >
      <p v-if="!person" class="text-muted">
        {{ t('adminGroup.person.notFound') }}
      </p>
      <template v-else>
        <AdminPersonHeader
          :avatar="person.avatar"
          :title="fullName(person)"
          :subtitle="subtitle"
          :context="context.parts.value"
          @update:avatar="onAvatar"
        />
        <UiList data-testid="person-fields">
          <UiInlineTextRow
            :label="t('adminGroup.personForm.firstNameLabel')"
            :value="person.firstName"
            required
            :maxlength="60"
            :save="(firstName) => saveField({ firstName })"
            data-testid="person-first-name"
          />
          <UiInlineTextRow
            :label="t('adminGroup.personForm.emailLabel')"
            :value="person.email"
            type="email"
            :maxlength="254"
            :check="checkEmail"
            :save="(email) => saveField({ email: email.toLowerCase() || null })"
            data-testid="person-email"
          >
            <template #writing>
              {{ t('adminGroup.personForm.emailWriting') }}
            </template>
          </UiInlineTextRow>
          <UiInlineTextRow
            :label="t('adminGroup.personForm.lastNameLabel')"
            :value="person.lastName"
            :maxlength="60"
            :save="(lastName) => saveField({ lastName: lastName || null })"
            data-testid="person-last-name"
          />
          <UiListItem
            :title="t('adminGroup.personForm.languageRow')"
            :value="tk(`common.language.${person.language}`)"
            :busy="
              update.isPending.value &&
              update.variables.value?.language !== undefined
            "
            :busy-label="t('common.actions.saving')"
            :on-click="() => (languageOpen = true)"
          />
        </UiList>
        <!-- An address that receives nothing (ticket 130, StopSaisie). -->
        <UiEmailBlockNote :email="person.email" />
        <UiChoiceSheet
          v-model:open="languageOpen"
          :title="t('adminGroup.personForm.languageRow')"
          :description="t('adminGroup.personForm.languageHelp')"
          :choices="languages"
          :value="person.language"
          :validate-label="t('common.actions.validate')"
          :cancel-label="t('common.actions.cancel')"
          @validate="onLanguage"
        />

        <UiList
          :title="t('adminGroup.person.doesNotDraw')"
          data-testid="not-drawn"
        >
          <UiListItem
            v-for="n in notDrawn"
            :key="n.exclusionId"
            :avatar="n.person!.avatar"
            :title="fullName(n.person!)"
            :subtitle="
              n.reciprocal
                ? t('adminGroup.exclusions.bothWays')
                : t('adminGroup.person.oneWay')
            "
          >
            <template #trailing>
              <UButton
                variant="ghost"
                color="neutral"
                icon="i-lucide-x"
                class="-mr-3 size-11 justify-center"
                :aria-label="
                  t('adminGroup.person.removeExclusion', {
                    name: fullName(n.person!),
                  })
                "
                :loading="
                  removeExclusion.isPending.value &&
                  removeExclusion.variables.value === n.exclusionId
                "
                @click="removeExclusion.mutate(n.exclusionId, { onError })"
              />
            </template>
          </UiListItem>
          <UiListItem
            icon="i-lucide-plus"
            :title="t('adminGroup.exclusions.add')"
            :on-click="() => (exclusionOpen = true)"
          />
        </UiList>
        <AdminExclusionSheet
          v-model:open="exclusionOpen"
          :slug="slug"
          :giver-id="id"
        />

        <UiList v-if="person.active">
          <UiListItem
            v-if="confirming !== 'leave'"
            icon="i-lucide-user-minus"
            tone="danger"
            :title="t('adminGroup.person.leave')"
            :subtitle="
              t('adminGroup.person.leaveHint', { name: fullName(person) })
            "
            :on-click="() => (confirming = 'leave')"
          />
          <li v-else class="flex flex-col gap-2 px-4 py-3">
            <p class="text-sm">
              {{
                t('adminGroup.person.leaveConfirm', { name: fullName(person) })
              }}
            </p>
            <div class="flex gap-2">
              <UButton
                color="error"
                class="min-h-11"
                :loading="update.isPending.value"
                :label="t('adminGroup.person.leave')"
                @click="setActive(false)"
              />
              <UButton
                variant="ghost"
                color="neutral"
                class="min-h-11"
                :label="t('common.actions.cancel')"
                @click="confirming = null"
              />
            </div>
          </li>
        </UiList>
        <UiList v-else>
          <UiListItem
            icon="i-lucide-user-check"
            icon-tone="neutral"
            :title="t('adminGroup.person.comeBack')"
            :on-click="() => setActive(true)"
          />
          <UiListItem
            v-if="confirming !== 'delete'"
            icon="i-lucide-trash-2"
            tone="danger"
            :title="t('adminGroup.person.deleteForever')"
            :subtitle="t('adminGroup.person.deleteHint')"
            :on-click="() => (confirming = 'delete')"
          />
          <li v-else class="flex flex-col gap-2 px-4 py-3">
            <p class="text-sm">
              {{
                t('adminGroup.person.deleteConfirm', { name: fullName(person) })
              }}
            </p>
            <div class="flex gap-2">
              <UButton
                color="error"
                class="min-h-11"
                :loading="remove.isPending.value"
                :label="t('common.actions.delete')"
                @click="onDelete"
              />
              <UButton
                variant="ghost"
                color="neutral"
                class="min-h-11"
                :label="t('common.actions.cancel')"
                @click="confirming = null"
              />
            </div>
          </li>
        </UiList>
      </template>
    </AdminQueryState>
  </AdminScreen>
</template>
