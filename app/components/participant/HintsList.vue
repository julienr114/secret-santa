<script setup lang="ts">
import {
  useLinkListMutation,
  useLinkableListsQuery,
  type HintsPayload,
} from '~/composables/queries/usePersonal';

// « Ma liste de cadeaux », among my hints (lot 27 ter, README 22.20,
// maquettes PistesListe, PistesListeChoisir): the gift list the one who
// gives to me will be shown a link to. A whole list, chosen by its name
// in a sheet among those I hold and those I figure on; a list not
// published is greyed, « publie-la d'abord »; « Aucune liste ». An
// account is needed: without one, the block says to log in. Nothing of
// the list is copied into the draw.
const props = defineProps<{
  token: string;
  list: NonNullable<HintsPayload['list']>;
  editable: boolean;
}>();
const { t } = useT();
const toast = useMessages();
const errorMessage = useErrorMessage();
const open = ref(false);
const choices = useLinkableListsQuery(
  () => props.token,
  () => open.value && props.list.loggedIn,
);
const link = useLinkListMutation(() => props.token);
/** The lists that can be linked first, the drafts after. */
const rows = computed(() =>
  (choices.data.value ?? []).toSorted(
    (one, other) => Number(other.shared) - Number(one.shared),
  ),
);
const linked = computed(() => props.list.linked);
/** The list ticked in the sheet; empty for « Aucune liste ». */
const picked = ref('');
watch(open, (now) => {
  if (now) picked.value = linked.value?.id ?? '';
});
const subtitle = computed(() => {
  const list = linked.value;
  if (!list) return '';
  if (!list.shared) return t('hints.list.unshared');
  if (list.holds === null) return t('hints.list.published');
  return list.holds ? t('hints.list.mine') : t('hints.list.figuring');
});
const rowLine = (list: { shared: boolean; holds: boolean; holder: string }) => {
  if (!list.shared) return t('hints.list.rowDraft');
  return list.holds
    ? t('hints.list.rowMine')
    : t('hints.list.rowFiguring', { name: list.holder });
};
const onValidate = () =>
  link.mutate(picked.value || null, {
    onSuccess: () => {
      open.value = false;
      toast.done(picked.value ? t('hints.list.done') : t('hints.list.removed'));
    },
    onError: (error) => toast.failed(errorMessage(error)),
  });
</script>

<template>
  <UiCard
    v-if="linked || editable"
    padding="none"
    class="flex flex-col gap-2.5 p-4"
    data-testid="hints-list"
  >
    <h2 class="font-display text-xl font-bold">{{ t('hints.list.title') }}</h2>
    <template v-if="linked">
      <component
        :is="editable && list.loggedIn ? 'button' : 'div'"
        :type="editable && list.loggedIn ? 'button' : undefined"
        class="flex min-h-14 items-center gap-3 text-left"
        data-testid="hints-list-linked"
        @click="editable && list.loggedIn ? (open = true) : undefined"
      >
        <ListsTile :icon="linked.icon" size="sm" />
        <span class="flex min-w-0 grow flex-col">
          <span class="truncate font-bold">{{
            linked.title || t('hints.list.untitled')
          }}</span>
          <span class="text-sm text-toned">{{ subtitle }}</span>
        </span>
        <span
          v-if="editable && list.loggedIn"
          class="shrink-0 text-sm font-bold text-primary-ink"
          >{{ t('hints.list.change') }}</span
        >
      </component>
      <p class="text-sm leading-[1.45] text-toned">
        {{ t('hints.list.help') }}
      </p>
    </template>
    <template v-else-if="list.loggedIn">
      <button
        type="button"
        class="flex min-h-14 items-center gap-3 text-left"
        data-testid="hints-list-add"
        @click="open = true"
      >
        <span
          class="flex size-11 shrink-0 items-center justify-center rounded-lg border border-dashed border-accented text-primary-ink"
          aria-hidden="true"
        >
          <UIcon name="i-lucide-plus" class="size-5" />
        </span>
        <span class="flex min-w-0 grow flex-col">
          <span class="font-bold text-primary-ink">{{
            t('hints.list.add')
          }}</span>
          <span class="text-sm text-toned">{{ t('hints.list.addHint') }}</span>
        </span>
      </button>
    </template>
    <template v-else>
      <p class="text-[15px] leading-[1.45] text-toned">
        {{ t('hints.list.login') }}
      </p>
      <UButton
        :to="`/login?next=${encodeURIComponent(`/p/${token}/pistes`)}`"
        variant="outline"
        color="neutral"
        class="h-11 justify-center self-start px-4 font-bold"
        :label="t('hints.list.loginAction')"
        data-testid="hints-list-login"
      />
    </template>

    <UiSheet
      v-model:open="open"
      :title="t('hints.list.sheetTitle')"
      :description="t('hints.list.sheetHelp')"
      :busy="link.isPending.value"
    >
      <div
        class="flex flex-col divide-y divide-default border-t border-default"
        role="radiogroup"
        :aria-label="t('hints.list.sheetTitle')"
        data-testid="hints-list-choices"
      >
        <label
          v-for="one in rows"
          :key="one.id"
          class="flex min-h-16 items-center gap-3 py-2"
          :class="one.shared ? '' : 'opacity-55'"
          data-testid="hints-list-choice"
        >
          <ListsTile :icon="one.icon" size="sm" />
          <span class="flex min-w-0 grow flex-col">
            <span class="truncate font-bold">{{
              one.title || t('hints.list.untitled')
            }}</span>
            <span class="text-sm text-toned">{{ rowLine(one) }}</span>
          </span>
          <input
            v-model="picked"
            type="radio"
            name="hints-list"
            :value="one.id"
            :disabled="!one.shared"
            class="size-[22px] shrink-0 accent-primary"
          />
        </label>
        <label class="flex min-h-14 items-center gap-3">
          <span class="grow font-semibold">{{ t('hints.list.none') }}</span>
          <input
            v-model="picked"
            type="radio"
            name="hints-list"
            value=""
            class="size-[22px] shrink-0 accent-primary"
          />
        </label>
      </div>
      <template #footer>
        <UButton
          block
          size="xl"
          class="h-13 justify-center text-[17px] font-bold"
          :loading="link.isPending.value"
          :disabled="choices.isPending.value"
          :label="t('hints.list.validate')"
          data-testid="hints-list-validate"
          @click="onValidate"
        />
      </template>
    </UiSheet>
  </UiCard>
</template>
