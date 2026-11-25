<script setup lang="ts">
import {
  useEditionQuery,
  useInviteLinkMutation,
} from '~/composables/queries/useGroup';

// Until when the invitation link of a Secret Santa works (ticket 160), on
// a page of its own: one field, the date in full under it; « Pas de date
// limite » takes it away. Back to the link.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const id = computed(() => String(route.params.id));
const { t } = useT();
const toast = useMessages();
const errorMessage = useErrorMessage();
const goBack = useGoBack();
const context = useScreenContext(slug, id);
useHead({ title: () => context.titleOf(t('adminEdition.invite.until')) });
const back = computed(
  () => `/admin/${slug.value}/editions/${id.value}/invitation`,
);
const query = useEditionQuery(slug, id);
const save = useInviteLinkMutation(slug, id);
const invite = computed(() => query.data.value?.invite);
/**
 * Saves the last day of the link, or takes it away, then goes back.
 * @param until - The day chosen (ISO), or null.
 */
const onValidate = (until: string | null) => {
  const current = invite.value;
  save.mutate(
    {
      open: true,
      until,
      ...(current?.places ? { places: current.places } : {}),
      message: current?.message?.trim() || null,
    },
    {
      onSuccess: () => goBack(back.value),
      onError: (error) => toast.failed(errorMessage(error)),
    },
  );
};
</script>

<template>
  <AdminDatePage
    :parts="context.parts.value"
    :back="back"
    :title="t('adminEdition.invite.until')"
    :value="invite?.until"
    :ready="Boolean(query.data.value)"
    :clear-label="t('adminEdition.invite.noUntil')"
    :busy="save.isPending.value"
    testid="invite-until"
    @validate="onValidate"
  >
    <p class="text-sm text-toned">{{ t('adminEdition.invite.untilHelp') }}</p>
  </AdminDatePage>
</template>
