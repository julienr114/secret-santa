<script setup lang="ts">
import {
  useCreateExclusionMutation,
  useDeleteExclusionMutation,
  usePeopleQuery,
} from '~/composables/queries/useGroup';

// The group's exclusions as a list (remove with ×) and an "add" row that
// opens a bottom sheet. Used on the exclusions screen and on the edition
// screen, so the guardian can adjust them right before the draw.
const props = withDefaults(
  defineProps<{
    slug: string;
    editable?: boolean;
    title?: string;
    footer?: string;
    /** Archives: the exclusions applied at the draw, written in the past. */
    archived?: { giverId: string; receiverId: string; reciprocal: boolean }[];
    /** The `extra` slot has rows: the list is then not empty. */
    hasExtra?: boolean;
  }>(),
  { editable: true, title: undefined, footer: undefined, archived: undefined },
);

const { t } = useT();
const errorMessage = useErrorMessage();
const toast = useToast();
const onError = (error: unknown) =>
  toast.add({ title: errorMessage(error), color: 'error' });
const people = usePeopleQuery(() => props.slug);
const create = useCreateExclusionMutation(() => props.slug);
const remove = useDeleteExclusionMutation(() => props.slug);

const persons = computed(() => people.data.value?.persons ?? []);
const exclusions = computed(() =>
  props.archived
    ? props.archived.map((e) => ({ ...e, id: `${e.giverId}>${e.receiverId}` }))
    : (people.data.value?.exclusions ?? []),
);
const past = computed(() => Boolean(props.archived));
const personOf = (id: string) => persons.value.find((p) => p.id === id);
const nameOf = (id: string) => personOf(id)?.firstName ?? '?';
const options = (exclude?: string) =>
  persons.value
    .filter((p) => p.active)
    .map((p) => ({
      label: p.firstName,
      value: p.id,
      disabled: p.id === exclude,
    }));

// Removing asks for a second tap on the row itself.
const confirmId = ref<string | null>(null);
const subtitleOf = (ex: {
  giverId: string;
  receiverId: string;
  reciprocal: boolean;
}) => {
  const names = { giver: nameOf(ex.giverId), receiver: nameOf(ex.receiverId) };
  if (ex.reciprocal)
    return past.value
      ? t('adminGroup.exclusions.reciprocalPast')
      : t('adminGroup.exclusions.reciprocal');
  return past.value
    ? t('adminGroup.exclusions.oneWayPast', names)
    : t('adminGroup.exclusions.oneWay', names);
};
const onRemove = (exclusionId: string) =>
  remove.mutate(exclusionId, {
    onSettled: () => {
      confirmId.value = null;
    },
    onError,
  });

const open = ref(false);
const state = reactive<{
  giverId?: string;
  receiverId?: string;
  reciprocal: boolean;
}>({
  reciprocal: true,
});
const openSheet = () => {
  Object.assign(state, {
    giverId: undefined,
    receiverId: undefined,
    reciprocal: true,
  });
  open.value = true;
};
const onAdd = () =>
  state.giverId &&
  state.receiverId &&
  create.mutate(
    {
      giverId: state.giverId,
      receiverId: state.receiverId,
      reciprocal: state.reciprocal,
    },
    {
      onSuccess: () => {
        open.value = false;
      },
      onError,
    },
  );
</script>

<template>
  <MobileList :title="title" :footer="footer">
    <!-- Adding comes first, then the rules, then the extra rows. -->
    <MobileListItem
      v-if="editable"
      icon="i-lucide-plus"
      :title="t('adminGroup.exclusions.add')"
      @click="openSheet"
    />
    <li
      v-if="exclusions.length === 0 && !hasExtra"
      class="px-4 py-3 text-sm text-muted"
    >
      {{ t('adminGroup.exclusions.empty') }}
    </li>
    <MobileListItem
      v-for="ex in exclusions"
      :key="ex.id"
      :title="`${nameOf(ex.giverId)} ${ex.reciprocal ? '↔' : '→'} ${nameOf(ex.receiverId)}`"
      :subtitle="subtitleOf(ex)"
    >
      <template #leading>
        <!-- Two avatars for a pair excluded both ways, the giver alone
             when it only goes one way. -->
        <span class="flex w-[3.25rem] shrink-0 items-center" aria-hidden="true">
          <AdminAvatar
            v-if="personOf(ex.giverId)"
            :avatar="personOf(ex.giverId)!.avatar"
            size="sm"
            class="outline-2 outline-white"
          />
          <AdminAvatar
            v-if="ex.reciprocal && personOf(ex.receiverId)"
            :avatar="personOf(ex.receiverId)!.avatar"
            size="sm"
            class="-ml-3 outline-2 outline-white"
          />
        </span>
      </template>
      <template v-if="editable" #trailing>
        <div
          v-if="confirmId === ex.id"
          class="flex shrink-0 items-center gap-1"
        >
          <UButton
            size="sm"
            color="primary"
            :label="t('adminGroup.exclusions.remove')"
            :loading="
              remove.isPending.value && remove.variables.value === ex.id
            "
            @click.stop="onRemove(ex.id)"
          />
          <UButton
            size="sm"
            variant="ghost"
            color="neutral"
            :label="t('common.actions.cancel')"
            @click.stop="confirmId = null"
          />
        </div>
        <UButton
          v-else
          variant="ghost"
          color="neutral"
          icon="i-lucide-x"
          :aria-label="
            t('adminGroup.exclusions.removeLabel', {
              giver: nameOf(ex.giverId),
              receiver: nameOf(ex.receiverId),
            })
          "
          @click.stop="confirmId = ex.id"
        />
      </template>
    </MobileListItem>
    <!-- Other pairs that cannot draw each other, e.g. from previous draws. -->
    <slot name="extra" />
  </MobileList>

  <UDrawer
    v-model:open="open"
    :title="t('adminGroup.exclusions.sheetTitle')"
    :description="t('adminGroup.exclusions.sheetDescription')"
  >
    <template #body>
      <div class="flex flex-col gap-5 py-2">
        <UFormField :label="t('adminGroup.exclusions.giverLabel')">
          <USelect
            v-model="state.giverId"
            :items="options(state.receiverId)"
            :placeholder="t('adminGroup.exclusions.choose')"
            class="w-full"
          />
        </UFormField>
        <UFormField :label="t('adminGroup.exclusions.receiverLabel')">
          <USelect
            v-model="state.receiverId"
            :items="options(state.giverId)"
            :placeholder="t('adminGroup.exclusions.choose')"
            class="w-full"
          />
        </UFormField>
        <USwitch
          v-model="state.reciprocal"
          :label="t('adminGroup.exclusions.bothWays')"
        />
      </div>
    </template>
    <template #footer>
      <UButton
        block
        :disabled="!state.giverId || !state.receiverId"
        :loading="create.isPending.value"
        :label="t('adminGroup.exclusions.submit')"
        @click="onAdd"
      />
    </template>
  </UDrawer>
</template>
