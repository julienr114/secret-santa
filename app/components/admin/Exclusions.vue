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
  defineProps<{ slug: string; editable?: boolean; title?: string }>(),
  {
    editable: true,
    title: undefined,
  },
);

const toast = useToast();
const onError = (error: unknown) =>
  toast.add({ title: errorMessage(error), color: 'error' });
const people = usePeopleQuery(() => props.slug);
const create = useCreateExclusionMutation(() => props.slug);
const remove = useDeleteExclusionMutation(() => props.slug);

const persons = computed(() => people.data.value?.persons ?? []);
const exclusions = computed(() => people.data.value?.exclusions ?? []);
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
  <MobileList :title="title">
    <li v-if="exclusions.length === 0" class="px-4 py-3 text-sm text-muted">
      Aucune exclusion.
    </li>
    <MobileListItem
      v-for="ex in exclusions"
      :key="ex.id"
      :avatar="personOf(ex.giverId)?.avatar"
      :title="`${nameOf(ex.giverId)} ${ex.reciprocal ? '↔' : '→'} ${nameOf(ex.receiverId)}`"
      :subtitle="
        ex.reciprocal
          ? 'Ne se tirent pas, dans les deux sens'
          : `${nameOf(ex.giverId)} ne tire pas ${nameOf(ex.receiverId)}`
      "
    >
      <template v-if="editable" #trailing>
        <UButton
          variant="ghost"
          color="neutral"
          icon="i-lucide-x"
          :aria-label="`Retirer l'exclusion ${nameOf(ex.giverId)} et ${nameOf(ex.receiverId)}`"
          :loading="remove.isPending.value && remove.variables.value === ex.id"
          @click.stop="remove.mutate(ex.id, { onError })"
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
