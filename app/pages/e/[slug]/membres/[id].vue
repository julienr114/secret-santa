<script setup lang="ts">
import { byName, fullName } from '#server/utils/people';
import { notDrawnBy } from '#shared/utils/exclusions';
import {
  useDashboardQuery,
  useDeleteExclusionMutation,
  useDeletePersonMutation,
  useEditionQuery,
  usePeopleQuery,
  useUpdatePersonMutation,
} from '~/composables/queries/useGroup';

// A person of the group: their icon, first name and address, the
// language of their messages and their last name, who they never draw,
// « Enregistrer », then taking them out of the group, which keeps their
// history.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t } = useT();
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
const saving = useBusy(() => update.isPending.value);
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

// The draft starts from the person once they are known, and is not
// reset when the group is read again (after an exclusion changes).
const { draft, errors, check, value } = usePersonDraft({
  avatar: { emoji: '🎁', color: 'brick' },
});
watch(
  () => person.value?.id,
  () => {
    const p = person.value;
    if (!p) return;
    Object.assign(draft, {
      firstName: p.firstName,
      lastName: p.lastName ?? '',
      email: p.email ?? '',
      language: p.language,
      avatar: p.avatar,
    });
  },
  { immediate: true },
);
const lastNameOpen = ref(false);
/** Longest last name the server takes. */
const LAST_NAME_MAX = 60;
/**
 * Saves the draft, then says so.
 * @returns Nothing: the mutation reports by itself.
 */
const onSave = () =>
  check() &&
  update.mutate(
    { id: id.value, ...value.value },
    {
      onSuccess: () => toast.done(t('adminGroup.person.saved')),
      onError,
    },
  );

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
          v-model:avatar="draft.avatar"
          :title="fullName(person)"
          :subtitle="subtitle"
          :context="context.parts.value"
        />
        <AdminPersonFields
          v-model:draft="draft"
          :errors="errors"
          :email-help="t('adminGroup.personForm.emailHelpPerson')"
        >
          <template #rows>
            <UiListItem
              :title="t('adminGroup.personForm.lastNameLabel')"
              :subtitle="t('adminGroup.personForm.lastNameHelp')"
              :value="draft.lastName || t('common.actions.add')"
              :on-click="() => (lastNameOpen = true)"
            />
          </template>
        </AdminPersonFields>
        <UiTextSheet
          v-model:open="lastNameOpen"
          :title="t('adminGroup.personForm.lastNameLabel')"
          :description="t('adminGroup.personForm.lastNameHelp')"
          :label="t('adminGroup.personForm.lastNameLabel')"
          :value="draft.lastName"
          :maxlength="LAST_NAME_MAX"
          :validate-label="t('common.actions.validate')"
          :cancel-label="t('common.actions.cancel')"
          @validate="
            (text) => {
              draft.lastName = text;
              lastNameOpen = false;
            }
          "
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

        <UButton
          block
          size="xl"
          class="h-12 justify-center font-bold"
          :disabled="update.isPending.value"
          :loading="saving"
          :label="
            saving ? t('common.actions.saving') : t('common.actions.save')
          "
          @click="onSave"
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
