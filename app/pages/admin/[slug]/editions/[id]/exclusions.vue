<script setup lang="ts">
import { useEditionQuery } from '~/composables/queries/useGroup';
import {
  useCheckQuery,
  useClearWaiversMutation,
  useWaiveMutation,
} from '~/composables/queries/useEdition';

// Every pair that cannot draw each other in this edition: the group's
// exclusions, and the pairs of previous draws, which only say why and
// can be lifted for this edition. Once drawn, the list applied is kept.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const id = computed(() => String(route.params.id));
const { t } = useT();
const toast = useToast();
const errorMessage = useErrorMessage();
/**
 * Shows an error in a toast.
 * @param error - The error of a mutation.
 * @returns Nothing.
 */
const onError = (error: unknown) =>
  toast.add({ title: errorMessage(error), color: 'error' });
useHead({
  title: () =>
    `${t('adminEdition.screen.prepare.exclusions')} — ${t('common.appName')}`,
});
const screen = computed(() => ({
  back: `/admin/${slug.value}/editions/${id.value}`,
}));

const edition = useEditionQuery(slug, id);
const check = useCheckQuery(slug, id);
const status = computed(
  () => edition.data.value?.edition.status ?? 'preparing',
);
const canEdit = computed(() => status.value === 'preparing');
const participants = computed(() => edition.data.value?.participants ?? []);
/**
 * The participant who is this person.
 * @param pid - The person.
 * @returns The participant, if they take part.
 */
const personOf = (pid: string) => participants.value.find((p) => p.id === pid);
/**
 * The first name of a person of the edition.
 * @param pid - The person.
 * @returns Their first name, or "?".
 */
const firstNameOf = (pid: string) => personOf(pid)?.firstName ?? '?';

const previousPairs = computed(() =>
  canEdit.value ? (check.data.value?.previousPairs ?? []) : [],
);
const footer = computed(
  () =>
    [
      previousPairs.value.length > 0 &&
        t('adminEdition.cockpit.previousDrawsFooter'),
      check.data.value?.historyExclusions &&
        t('adminEdition.cockpit.pendingExclusions', {
          count: check.data.value.historyExclusions,
        }),
    ]
      .filter(Boolean)
      .join(' ') || undefined,
);

/** A giver and the receiver they cannot draw. */
type Pair = { giverId: string; receiverId: string };
const waive = useWaiveMutation(slug, id);
const clearWaivers = useClearWaiversMutation(slug, id);
const confirmWaiver = ref<string | null>(null);
/**
 * A key that names a pair.
 * @param p - The pair.
 * @returns The key.
 */
const pairKey = (p: Pair) => `${p.giverId}>${p.receiverId}`;
/**
 * Lifts a pair of a previous draw for this edition.
 * @param pair - The pair.
 * @returns Nothing: the mutation reports by itself.
 */
const onWaive = (pair: Pair) =>
  waive.mutate(
    { giverId: pair.giverId, receiverId: pair.receiverId },
    {
      onSettled: () => {
        confirmWaiver.value = null;
      },
      onError,
    },
  );
</script>

<template>
  <AdminScreen v-bind="screen">
    <AdminQueryState
      :pending="edition.isPending.value"
      :error="edition.error.value"
    >
      <AdminExclusions
        :slug="slug"
        :editable="canEdit"
        :archived="
          canEdit
            ? undefined
            : (edition.data.value?.edition.exclusionsAtDraw ?? [])
        "
        :has-extra="previousPairs.length > 0"
        :title="
          canEdit
            ? t('adminEdition.cockpit.exclusionsTitle')
            : t('adminEdition.cockpit.exclusionsAppliedTitle')
        "
        :footer="footer"
      >
        <template #extra>
          <UiListItem
            v-for="pair in previousPairs"
            :key="pairKey(pair)"
            :title="`${firstNameOf(pair.giverId)} → ${firstNameOf(pair.receiverId)}`"
            :subtitle="
              t('adminEdition.cockpit.previousDrawReason', {
                edition: pair.editionLabel,
              })
            "
            :chevron="false"
          >
            <template #trailing>
              <div
                v-if="confirmWaiver === pairKey(pair)"
                class="flex shrink-0 items-center gap-1"
              >
                <UButton
                  size="sm"
                  :label="t('adminEdition.cockpit.waive')"
                  :loading="waive.isPending.value"
                  @click.stop="onWaive(pair)"
                />
                <UButton
                  size="sm"
                  variant="ghost"
                  color="neutral"
                  :label="t('common.actions.cancel')"
                  @click.stop="confirmWaiver = null"
                />
              </div>
              <UButton
                v-else
                variant="ghost"
                color="neutral"
                icon="i-lucide-x"
                class="size-11 justify-center"
                :aria-label="
                  t('adminEdition.cockpit.waiveLabel', {
                    giver: firstNameOf(pair.giverId),
                    receiver: firstNameOf(pair.receiverId),
                  })
                "
                @click.stop="confirmWaiver = pairKey(pair)"
              />
            </template>
            <template #leading>
              <span
                class="flex w-[3.25rem] shrink-0 items-center"
                aria-hidden="true"
              >
                <UiAvatar
                  v-if="personOf(pair.giverId)"
                  :avatar="personOf(pair.giverId)!.avatar"
                  size="sm"
                  class="outline-2 outline-white"
                />
              </span>
            </template>
          </UiListItem>
        </template>
      </AdminExclusions>
      <div
        v-if="canEdit && check.data.value?.waivedCount"
        class="-mt-4 flex items-center justify-between gap-2 px-1 text-xs text-muted"
      >
        <span>
          {{
            t('adminEdition.cockpit.waived', {
              count: check.data.value.waivedCount,
            })
          }}
        </span>
        <UButton
          size="xs"
          variant="link"
          class="min-h-11"
          :label="t('adminEdition.cockpit.restoreAll')"
          :loading="clearWaivers.isPending.value"
          @click="clearWaivers.mutate(undefined, { onError })"
        />
      </div>
    </AdminQueryState>
  </AdminScreen>
</template>
