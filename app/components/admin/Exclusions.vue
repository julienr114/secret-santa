<script setup lang="ts">
import {
  useCreateExclusionMutation,
  useDeleteExclusionMutation,
  usePeopleQuery,
} from '~/composables/queries/useGroup';
import { errorMessage } from '~/utils/errors';

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
  }>(),
  { editable: true, title: undefined, footer: undefined, archived: undefined },
);

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
    <li v-if="exclusions.length === 0" class="px-4 py-3 text-sm text-muted">
      Aucune exclusion.
    </li>
    <MobileListItem
      v-for="ex in exclusions"
      :key="ex.id"
      :title="`${nameOf(ex.giverId)} ${ex.reciprocal ? '↔' : '→'} ${nameOf(ex.receiverId)}`"
      :subtitle="
        ex.reciprocal
          ? past
            ? 'Ne se sont pas tirés, dans les deux sens'
            : 'Ne se tirent pas, dans les deux sens'
          : past
            ? `${nameOf(ex.giverId)} n'a pas tiré ${nameOf(ex.receiverId)}`
            : `${nameOf(ex.giverId)} ne tire pas ${nameOf(ex.receiverId)}`
      "
    >
      <template #leading>
        <span class="flex shrink-0 items-center" aria-hidden="true">
          <AdminAvatar
            v-if="personOf(ex.giverId)"
            :avatar="personOf(ex.giverId)!.avatar"
            size="sm"
            class="outline-2 outline-white"
          />
          <AdminAvatar
            v-if="personOf(ex.receiverId)"
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
            label="Retirer"
            :loading="
              remove.isPending.value && remove.variables.value === ex.id
            "
            @click.stop="onRemove(ex.id)"
          />
          <UButton
            size="sm"
            variant="ghost"
            color="neutral"
            label="Annuler"
            @click.stop="confirmId = null"
          />
        </div>
        <UButton
          v-else
          variant="ghost"
          color="neutral"
          icon="i-lucide-x"
          :aria-label="`Retirer l'exclusion ${nameOf(ex.giverId)} et ${nameOf(ex.receiverId)}`"
          @click.stop="confirmId = ex.id"
        />
      </template>
    </MobileListItem>
    <MobileListItem
      v-if="editable"
      icon="i-lucide-plus"
      title="Ajouter une exclusion"
      @click="openSheet"
    />
  </MobileList>

  <UDrawer
    v-model:open="open"
    title="Nouvelle exclusion"
    description="Deux personnes qui ne doivent pas se tirer : un couple, des frères et sœurs…"
  >
    <template #body>
      <div class="flex flex-col gap-5 py-2">
        <UFormField label="Qui">
          <USelect
            v-model="state.giverId"
            :items="options(state.receiverId)"
            placeholder="Choisir…"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Ne tire pas">
          <USelect
            v-model="state.receiverId"
            :items="options(state.giverId)"
            placeholder="Choisir…"
            class="w-full"
          />
        </UFormField>
        <USwitch v-model="state.reciprocal" label="Dans les deux sens" />
      </div>
    </template>
    <template #footer>
      <UButton
        block
        :disabled="!state.giverId || !state.receiverId"
        :loading="create.isPending.value"
        label="Ajouter l'exclusion"
        @click="onAdd"
      />
    </template>
  </UDrawer>
</template>
