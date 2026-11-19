<script setup lang="ts">
import { randomAvatar } from '#server/utils/avatars';
import { fullName } from '#server/utils/people';
import {
  useCreatePersonMutation,
  useDashboardQuery,
} from '~/composables/queries/useGroup';
import { useAddParticipantMutation } from '~/composables/queries/useEdition';

// A new person: an icon given at random, first name, address, the
// language of their messages, and whether they take part in the edition
// being prepared; then « Ajouter », or « Ajouter, puis en créer une
// autre » to stay here. Opened from « Choisir les participants », the
// person joins that edition and comes back ticked.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t } = useT();
const goBack = useGoBack();
const errorMessage = useErrorMessage();
const route = useRoute();
const toast = useMessages();
const slug = computed(() => String(route.params.slug));
const create = useCreatePersonMutation(slug);
const dashboard = useDashboardQuery(slug);
const context = useScreenContext(slug);
useHead({ title: () => context.titleOf(t('adminGroup.newPerson.title')) });
const screen = computed(() => ({ back: `/admin/${slug.value}/personnes` }));

/**
 * A Christmas icon at random; Math.random is fine for a cosmetic default
 * (the draw itself never uses it).
 * @returns The icon.
 */
const anyAvatar = () => randomAvatar((n) => Math.floor(Math.random() * n));
const { draft, errors, check, value, reset } = usePersonDraft({
  avatar: anyAvatar(),
});

// The edition the person may join: the one being prepared, or the one
// « Choisir les participants » was opened from.
const asked = computed(() => String(route.query.edition ?? ''));
const preparing = computed(() => {
  const data = dashboard.data.value;
  const edition = data?.editions.find(
    (e) =>
      e.id === (asked.value || data.currentEditionId) &&
      e.status === 'preparing',
  );
  return edition ?? null;
});
const takesPart = ref(true);
const join = useAddParticipantMutation(slug, () => preparing.value?.id ?? '');
const ticked = useChosenParticipants(asked);

const saving = ref(false);
const busy = useBusy(() => saving.value);
const failure = ref<unknown>(null);
/**
 * Creates the person, adds them to the edition being prepared when they
 * take part, then goes back or starts a new one.
 * @param again - True to stay and create another person.
 * @returns Once done.
 */
const onAdd = async (again: boolean) => {
  if (!check()) return;
  saving.value = true;
  failure.value = null;
  try {
    const { person } = await create.mutateAsync(value.value);
    if (preparing.value && takesPart.value) {
      await join.mutateAsync(person.id);
      if (asked.value && ticked.value) {
        ticked.value = [...ticked.value, person.id];
      }
    }
    toast.done(t('adminGroup.newPerson.added', { name: fullName(person) }));
    if (again) reset(anyAvatar());
    else
      goBack(
        asked.value
          ? `/admin/${slug.value}/editions/${asked.value}/ajouter`
          : `/admin/${slug.value}/personnes`,
      );
  } catch (error) {
    failure.value = error;
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <AdminScreen v-bind="screen">
    <AdminPersonHeader
      v-model:avatar="draft.avatar"
      size="md"
      :title="t('adminGroup.newPerson.title')"
      :context="context.parts.value"
    />
    <AdminPersonFields
      v-model:draft="draft"
      :errors="errors"
      :email-help="t('adminGroup.personForm.emailHelpNew')"
      :email-placeholder="t('adminGroup.personForm.emailPlaceholder')"
    >
      <template v-if="preparing" #rows>
        <UiListItem
          v-model:checked="takesPart"
          :title="
            t('adminGroup.newPerson.takesPart', { label: preparing.label })
          "
          :subtitle="t('adminGroup.newPerson.notDrawnYet')"
        />
      </template>
    </AdminPersonFields>
    <UAlert
      v-if="failure"
      color="error"
      variant="subtle"
      :description="errorMessage(failure)"
    />
    <div class="flex flex-col gap-1.5">
      <UButton
        block
        size="xl"
        class="h-12 justify-center font-bold"
        :disabled="saving"
        :loading="busy"
        :label="busy ? t('common.actions.saving') : t('common.actions.add')"
        @click="onAdd(false)"
      />
      <UButton
        block
        variant="ghost"
        class="h-[46px] justify-center text-[15px] font-semibold text-primary-ink"
        :disabled="saving"
        :label="t('adminGroup.newPerson.addAnother')"
        @click="onAdd(true)"
      />
    </div>
    <p class="text-center text-[13px] leading-[1.4] text-toned">
      {{ t('adminGroup.newPerson.randomIcon') }}
    </p>
  </AdminScreen>
</template>
