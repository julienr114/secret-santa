<script setup lang="ts">
import {
  useCreateExclusionMutation,
  useDashboardQuery,
  useDeleteExclusionMutation,
  usePeopleQuery,
} from '~/composables/queries/useGroup';
import { errorMessage } from '~/utils/errors';

definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const toast = useToast();
const onError = (error: unknown) =>
  toast.add({ title: errorMessage(error), color: 'error' });
const dashboard = useDashboardQuery(slug);
const people = usePeopleQuery(slug);
const create = useCreateExclusionMutation(slug);
const remove = useDeleteExclusionMutation(slug);
const name = computed(() => dashboard.data.value?.group.name ?? slug.value);
useHead({ title: 'Exclusions — Secret Santa' });
const screen = computed(() => ({
  back: `/admin/${slug.value}/personnes`,
  crumbs: [
    { label: name.value, to: `/admin/${slug.value}` },
    { label: 'Personnes', to: `/admin/${slug.value}/personnes` },
    { label: 'Exclusions' },
  ],
}));

const persons = computed(() =>
  (people.data.value?.persons ?? []).filter((p) => p.active),
);
const nameOf = (id: string) =>
  people.data.value?.persons.find((p) => p.id === id)?.firstName ?? '?';
const options = (exclude?: string) =>
  persons.value.map((p) => ({
    label: p.firstName,
    value: p.id,
    disabled: p.id === exclude,
  }));
const state = reactive<{
  giverId?: string;
  receiverId?: string;
  reciprocal: boolean;
}>({ reciprocal: true });
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
      onSuccess: () =>
        Object.assign(state, { giverId: undefined, receiverId: undefined }),
      onError,
    },
  );
</script>

<template>
  <AdminScreen v-bind="screen">
    <h1 class="font-display text-3xl font-bold">Exclusions</h1>
    <p class="text-muted">
      En plus des couples, des paires qui ne doivent jamais se tirer.
    </p>
    <AdminQueryState
      :pending="people.isPending.value"
      :error="people.error.value"
    >
      <MobileList
        v-if="people.data.value?.exclusions.length"
        title="Exclusions actuelles"
      >
        <MobileListItem
          v-for="ex in people.data.value?.exclusions ?? []"
          :key="ex.id"
          icon="i-lucide-ban"
          :title="`${nameOf(ex.giverId)} ${ex.reciprocal ? '↔' : '→'} ${nameOf(ex.receiverId)}`"
          :subtitle="
            ex.reciprocal
              ? 'Dans les deux sens'
              : `${nameOf(ex.giverId)} ne tire jamais ${nameOf(ex.receiverId)}`
          "
        >
          <template #trailing>
            <UButton
              variant="ghost"
              color="neutral"
              size="sm"
              icon="i-lucide-x"
              aria-label="Retirer"
              :loading="remove.isPending.value"
              @click.stop="remove.mutate(ex.id, { onError })"
            />
          </template>
        </MobileListItem>
      </MobileList>

      <section class="flex flex-col gap-4">
        <h2
          class="px-1 text-xs font-semibold tracking-wide text-muted uppercase"
        >
          Ajouter
        </h2>
        <UFormField label="Donneur">
          <USelect
            v-model="state.giverId"
            :items="options(state.receiverId)"
            placeholder="Choisir…"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Ne tire jamais">
          <USelect
            v-model="state.receiverId"
            :items="options(state.giverId)"
            placeholder="Choisir…"
            class="w-full"
          />
        </UFormField>
        <USwitch v-model="state.reciprocal" label="Dans les deux sens" />
        <UButton
          block
          :disabled="!state.giverId || !state.receiverId"
          :loading="create.isPending.value"
          label="Ajouter l'exclusion"
          @click="onAdd"
        />
      </section>
    </AdminQueryState>
  </AdminScreen>
</template>
