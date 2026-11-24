<script setup lang="ts">
import { randomAvatar } from '#server/utils/avatars';
import { fullName } from '#server/utils/people';
import { useCreateSantaPersonMutation } from '~/composables/queries/useGroup';

// « Créer une personne », from « Choisir les participants »
// (AjouterParticipants): an icon given at random, first name, address, the
// language of their messages; then « Ajouter », or « Ajouter, puis en
// créer une autre » to stay here. The person joins the event and this
// Secret Santa together, never the event alone (ticket 117), and comes
// back ticked.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t } = useT();
const goBack = useGoBack();
const errorMessage = useErrorMessage();
const route = useRoute();
const toast = useMessages();
const slug = computed(() => String(route.params.slug));
const id = computed(() => String(route.params.id));
const choosing = computed(
  () => `/admin/${slug.value}/editions/${id.value}/ajouter`,
);
const create = useCreateSantaPersonMutation(slug, id);
const context = useScreenContext(slug, id);
useHead({ title: () => context.titleOf(t('adminGroup.newPerson.title')) });
const screen = computed(() => ({ back: choosing.value }));

/**
 * A Christmas icon at random; Math.random is fine for a cosmetic default
 * (the draw itself never uses it).
 * @returns The icon.
 */
const anyAvatar = () => randomAvatar((n) => Math.floor(Math.random() * n));
const { draft, errors, check, value, reset } = usePersonDraft({
  avatar: anyAvatar(),
});
const ticked = useChosenParticipants(id);

const saving = ref(false);
const busy = useBusy(() => saving.value);
const failure = ref<unknown>(null);
/**
 * Creates the person in this Secret Santa, ticks them on « Choisir les
 * participants », then goes back or starts a new one.
 * @param again - True to stay and create another person.
 * @returns Once done.
 */
const onAdd = async (again: boolean) => {
  if (!check()) return;
  saving.value = true;
  failure.value = null;
  try {
    const { person } = await create.mutateAsync(value.value);
    if (ticked.value) ticked.value = [...ticked.value, person.id];
    toast.done(t('adminGroup.newPerson.added', { name: fullName(person) }));
    if (again) reset(anyAvatar());
    else goBack(choosing.value);
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
    />
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
