<script setup lang="ts">
import { fullName } from '#server/utils/people';
import {
  useDeleteExclusionMutation,
  usePeopleQuery,
} from '~/composables/queries/useGroup';

// The group's exclusions as a list (remove with ×, then a second tap) and
// an "add" row that opens « Nouvelle exclusion ». Used on the exclusions screen and on the edition
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
const toast = useMessages();
const onError = (error: unknown) => toast.failed(errorMessage(error));
const people = usePeopleQuery(() => props.slug);
const remove = useDeleteExclusionMutation(() => props.slug);

const persons = computed(() => people.data.value?.persons ?? []);
const exclusions = computed(() =>
  props.archived
    ? props.archived.map((e) => ({ ...e, id: `${e.giverId}>${e.receiverId}` }))
    : (people.data.value?.exclusions ?? []),
);
const past = computed(() => Boolean(props.archived));
const personOf = (id: string) => persons.value.find((p) => p.id === id);
const nameOf = (id: string) => {
  const person = personOf(id);
  return person ? fullName(person) : '?';
};

// Removing asks for a second tap on the row itself.
const confirmId = ref<string | null>(null);
/**
 * The line under a row: both ways, or this way only.
 * @param ex - The exclusion.
 * @returns The line.
 */
const subtitleOf = (ex: { reciprocal: boolean }) => {
  if (!ex.reciprocal) return t('adminGroup.exclusions.oneWayOnly');
  return past.value
    ? t('adminGroup.exclusions.reciprocalPast')
    : t('adminGroup.exclusions.reciprocal');
};
const onRemove = (exclusionId: string) =>
  remove.mutate(exclusionId, {
    onSettled: () => {
      confirmId.value = null;
    },
    onError,
  });

const open = ref(false);
/**
 * The title of a row: « Camille et Hugo » both ways, « Inès ne tire pas
 * Louis » one way, in full words (decided on 17 November 2026).
 * @param ex - The exclusion.
 * @returns The title.
 */
const titleOf = (ex: {
  giverId: string;
  receiverId: string;
  reciprocal: boolean;
}) => {
  const names = { giver: nameOf(ex.giverId), receiver: nameOf(ex.receiverId) };
  if (ex.reciprocal) return t('adminGroup.exclusions.pair', names);
  return past.value
    ? t('adminGroup.exclusions.oneWayPast', names)
    : t('adminGroup.exclusions.oneWay', names);
};
</script>

<template>
  <UiList :title="title" :footer="footer">
    <!-- Adding comes first, then the rules, then the extra rows. -->
    <UiListItem
      v-if="editable"
      icon="i-lucide-plus"
      :title="t('adminGroup.exclusions.add')"
      :on-click="() => (open = true)"
    />
    <li
      v-if="exclusions.length === 0 && !hasExtra"
      class="px-4 py-3 text-sm text-muted"
    >
      {{ t('adminGroup.exclusions.empty') }}
    </li>
    <UiListItem
      v-for="ex in exclusions"
      :key="ex.id"
      :title="titleOf(ex)"
      :subtitle="subtitleOf(ex)"
    >
      <template #leading>
        <!-- Two avatars for a pair excluded both ways, the giver alone
             when it only goes one way. -->
        <span class="flex w-[3.25rem] shrink-0 items-center" aria-hidden="true">
          <UiAvatar
            v-if="personOf(ex.giverId)"
            :avatar="personOf(ex.giverId)!.avatar"
            size="sm"
            class="outline-2 outline-white"
          />
          <UiAvatar
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
    </UiListItem>
    <!-- Other pairs that cannot draw each other, e.g. from previous draws. -->
    <slot name="extra" />
  </UiList>

  <AdminExclusionSheet v-model:open="open" :slug="slug" />
</template>
