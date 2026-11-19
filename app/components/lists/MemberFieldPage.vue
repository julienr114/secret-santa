<script setup lang="ts">
import type { MemberView } from '#server/http/lists';
import {
  useMemberQuery,
  useUpdateMemberMutation,
  type MemberPatch,
} from '~/composables/queries/useLists';

// The page of one practical detail of one of my people (Correction 27,
// README 22.20, 23.3, maquettes ProcheNaissance, ProchePointure,
// ProcheTaille, ProcheAdresse): above the title, « Mes proches · Léo »;
// the title; the field, given by the page; « Valider » in the page,
// under the field, never stuck to the keyboard; under it, when the page
// has one, a way to erase. No sentence of help: the title and the field
// say it. « Retour » gives up; « Valider » saves and goes back to the
// person's page, which shows the new value.
const props = defineProps<{
  /** The title, for someone else and for « Moi ». */
  title: string;
  titleMine: string;
  /** What « Valider » saves; null while there is nothing valid to save. */
  patch: MemberPatch | null;
  /** The link under « Valider » (« Effacer la date »), and what it saves. */
  clearLabel?: string;
  clearPatch?: MemberPatch;
  /** No « Valider »: the page only shows a state and its own action. */
  noValidate?: boolean;
}>();
defineSlots<{ default: (props: { member: MemberView }) => unknown }>();
const route = useRoute();
const id = computed(() => String(route.params.id));
const { t } = useT();
const errorMessage = useErrorMessage();
const goBack = useGoBack();
const query = useMemberQuery(id);
const update = useUpdateMemberMutation(id);
const member = computed(() => query.data.value?.member);
/** The person's page, back in the list it was opened from. */
const parent = computed(() => {
  const params = new URLSearchParams();
  if (route.query.liste) params.set('liste', String(route.query.liste));
  if (route.query.place) params.set('place', String(route.query.place));
  const search = params.toString();
  return `/famille/${id.value}${search ? `?${search}` : ''}`;
});
const shown = computed(() =>
  member.value?.isSelf ? props.titleMine : props.title,
);
useHead({ title: () => `${shown.value} — ${t('common.appName')}` });
const context = computed(() =>
  member.value
    ? [
        { label: t('lists.person.context'), to: '/famille' },
        { label: member.value.firstName, to: parent.value },
      ]
    : [],
);
const failure = computed(() =>
  update.isError.value ? errorMessage(update.error.value) : null,
);
const save = (patch: MemberPatch) =>
  update.mutate(patch, { onSuccess: () => goBack(parent.value) });
defineExpose({ save, pending: update.isPending });
</script>

<template>
  <AdminScreen :back="parent">
    <AdminQueryState
      :pending="query.isPending.value"
      :error="query.error.value"
      :skeleton="['title', 'card']"
    >
      <template v-if="member">
        <div class="flex flex-col gap-1">
          <UiPageContext :parts="context" :label="t('common.context')" />
          <UiPageTitle>{{ shown }}</UiPageTitle>
        </div>
        <form
          class="flex flex-col gap-5"
          novalidate
          @submit.prevent="patch && save(patch)"
        >
          <slot :member="member" />
          <p v-if="failure" class="text-sm font-medium text-error" role="alert">
            {{ failure }}
          </p>
          <UButton
            v-if="!noValidate"
            type="submit"
            block
            size="xl"
            class="h-13 justify-center text-[17px] font-bold"
            :disabled="!patch"
            :loading="update.isPending.value"
            :label="t('common.actions.validate')"
            data-testid="member-field-validate"
          />
          <p v-if="clearLabel && clearPatch" class="-mt-2 text-center">
            <button
              type="button"
              class="inline-flex min-h-11 items-center text-[15px] font-bold text-toned underline underline-offset-2"
              :disabled="update.isPending.value"
              data-testid="member-field-clear"
              @click="save(clearPatch)"
            >
              {{ clearLabel }}
            </button>
          </p>
        </form>
      </template>
    </AdminQueryState>
  </AdminScreen>
</template>
