<script setup lang="ts">
import { byName, fullName } from '#server/utils/people';
import {
  useCreateExclusionMutation,
  usePeopleQuery,
} from '~/composables/queries/useGroup';

// « Nouvelle exclusion »: who, who they never draw (each picked in a
// sheet over this one), both ways or not, the sentence it makes, then
// « Ajouter l'exclusion ». Opened from the exclusions or from a person,
// who is then already chosen. The picker sits inside this sheet, as a
// nested sheet must.
const props = defineProps<{
  slug: string;
  /** The person it is about, chosen beforehand. */
  giverId?: string | null;
}>();
const open = defineModel<boolean>('open', { required: true });
const { t } = useT();
const errorMessage = useErrorMessage();
const people = usePeopleQuery(() => props.slug);
const create = useCreateExclusionMutation(() => props.slug);
const busy = useBusy(() => create.isPending.value);

const giver = ref<string | null>(null);
const receiver = ref<string | null>(null);
const reciprocal = ref(true);
watch(open, (opened) => {
  if (!opened) return;
  giver.value = props.giverId ?? null;
  receiver.value = null;
  reciprocal.value = true;
  create.reset();
});
const active = computed(() =>
  (people.data.value?.persons ?? []).filter((p) => p.active).toSorted(byName),
);
const personOf = (id: string | null) => active.value.find((p) => p.id === id);
const fieldOf = (id: string | null) => {
  const person = personOf(id);
  return person ? { name: fullName(person), avatar: person.avatar } : null;
};
/**
 * The people one may pick for a field: everyone but the other one.
 * @param other - The person chosen in the other field.
 * @returns The people, as the picker shows them.
 */
const pickable = (other: string | null) =>
  active.value
    .filter((p) => p.id !== other)
    .map((p) => ({ id: p.id, name: fullName(p), avatar: p.avatar }));
const picking = ref<'giver' | 'receiver' | null>(null);
const pickerOpen = computed({
  get: () => picking.value !== null,
  set: (value) => {
    if (!value) picking.value = null;
  },
});
const picked = computed({
  get: () => (picking.value === 'receiver' ? receiver.value : giver.value),
  set: (id) => {
    if (picking.value === 'receiver') receiver.value = id;
    else giver.value = id;
    picking.value = null;
  },
});

/** Stands in for the names, to set them in bold within the sentence. */
const SLOT = '\u0000';
/** The sentence the exclusion makes, cut around the names. */
const sentence = computed(() => {
  const a = personOf(giver.value);
  const b = personOf(receiver.value);
  if (!a || !b) return null;
  const names = reciprocal.value
    ? t('adminGroup.exclusions.pair', {
        giver: fullName(a),
        receiver: fullName(b),
      })
    : fullName(a);
  const words = reciprocal.value
    ? t('adminGroup.exclusions.previewBoth', { names: SLOT })
    : t('adminGroup.exclusions.previewOne', {
        giver: SLOT,
        receiver: fullName(b),
      });
  const [before, after] = words.split(SLOT);
  return { before, names, after };
});
/**
 * Adds the exclusion, then closes the sheet.
 * @returns Nothing: the mutation reports by itself.
 */
const onAdd = () =>
  giver.value &&
  receiver.value &&
  create.mutate(
    {
      giverId: giver.value,
      receiverId: receiver.value,
      reciprocal: reciprocal.value,
    },
    {
      onSuccess: () => {
        open.value = false;
      },
    },
  );
</script>

<template>
  <UiSheet
    v-model:open="open"
    :title="t('adminGroup.exclusions.sheetTitle')"
    :description="t('adminGroup.exclusions.sheetDescription')"
    :busy="create.isPending.value"
  >
    <div class="flex flex-col gap-4" data-testid="exclusion-sheet">
      <UiPersonField
        :label="t('adminGroup.exclusions.giverLabel')"
        :person="fieldOf(giver)"
        :placeholder="t('adminGroup.exclusions.choose')"
        @open="picking = 'giver'"
      />
      <UiPersonField
        :label="t('adminGroup.exclusions.receiverLabel')"
        :person="fieldOf(receiver)"
        :placeholder="t('adminGroup.exclusions.choose')"
        @open="picking = 'receiver'"
      />
      <USwitch
        v-model="reciprocal"
        size="lg"
        color="success"
        :label="t('adminGroup.exclusions.bothWays')"
        :ui="{
          root: 'flex-row-reverse justify-between min-h-11 items-center',
          label: 'text-[15px] font-semibold',
        }"
      />
      <UiNotice v-if="sentence" variant="positive">
        <span
          >{{ sentence.before }}<strong>{{ sentence.names }}</strong
          >{{ sentence.after }}</span
        >
      </UiNotice>
      <p
        v-if="create.isError.value"
        class="text-sm font-medium text-error"
        role="alert"
      >
        {{ errorMessage(create.error.value) }}
      </p>
      <UiPersonPicker
        v-model:open="pickerOpen"
        v-model:selected="picked"
        nested
        :title="
          picking === 'receiver'
            ? t('adminGroup.exclusions.receiverLabel')
            : t('adminGroup.exclusions.giverLabel')
        "
        :people="pickable(picking === 'receiver' ? giver : receiver)"
        :search-label="t('adminEdition.screen.lists.search')"
        :clear-label="t('adminEdition.screen.lists.clear')"
        :results-text="
          (shown, total) =>
            t('adminEdition.reveal.results', { count: shown, total })
        "
      />
    </div>
    <template #footer>
      <UButton
        block
        size="xl"
        class="h-13 justify-center text-[17px] font-bold"
        :disabled="!giver || !receiver || create.isPending.value"
        :loading="busy"
        :label="
          busy ? t('common.actions.saving') : t('adminGroup.exclusions.submit')
        "
        @click="onAdd"
      />
      <UButton
        block
        variant="ghost"
        color="neutral"
        class="h-[46px] justify-center text-base font-semibold"
        :disabled="create.isPending.value"
        :label="t('common.actions.cancel')"
        @click="open = false"
      />
    </template>
  </UiSheet>
</template>
