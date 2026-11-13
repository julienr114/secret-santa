<script setup lang="ts">
import { z } from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';
import { useDashboardQuery } from '~/composables/queries/useGroup';
import { useUpdateGroupMutation } from '~/composables/queries/useGroups';

// Super-admin only: set or reset the guardian password of a group.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t } = useT();
const errorMessage = useErrorMessage();
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const { user } = useUserSession();
if (user.value?.role !== 'super_admin')
  await navigateTo(`/admin/${slug.value}`, { replace: true });

const dashboard = useDashboardQuery(slug);
const update = useUpdateGroupMutation();
const toast = useToast();
const name = computed(() => dashboard.data.value?.group.name ?? slug.value);
useHead({
  title: computed(
    () => `${t('adminGroup.guardian.title')} — ${t('common.appName')}`,
  ),
});
const screen = computed(() => ({
  back: `/admin/${slug.value}`,
  crumbs: [
    { label: t('adminGroup.groups.title'), to: '/admin/groupes' },
    { label: name.value, to: `/admin/${slug.value}` },
    { label: t('adminGroup.guardian.crumb') },
  ],
}));

// The sentence shows the slug as <code>: translate it around a marker,
// then render the text before and after the marker on each side.
const SLUG_MARKER = '\u0000';
const intro = computed(() => {
  const [before = '', after = ''] = t('adminGroup.guardian.intro', {
    name: name.value,
    slug: SLUG_MARKER,
  }).split(SLUG_MARKER);
  return { before, after };
});

const schema = computed(() =>
  z.object({
    password: z.string().min(10, t('adminGroup.guardian.passwordMin')).max(200),
  }),
);
type Schema = z.output<typeof schema.value>;
const state = reactive<Schema>({ password: '' });
const onSubmit = (event: FormSubmitEvent<Schema>) => {
  const id = dashboard.data.value?.group.id;
  if (!id) return;
  update.mutate(
    { id, guardianPassword: event.data.password },
    {
      onSuccess: () => {
        toast.add({
          title: t('adminGroup.guardian.saved'),
          color: 'success',
          icon: 'i-lucide-check',
        });
        navigateTo(`/admin/${slug.value}`);
      },
    },
  );
};
</script>

<template>
  <AdminScreen v-bind="screen">
    <h1 class="font-display text-3xl font-bold">
      {{ t('adminGroup.guardian.title') }}
    </h1>
    <p class="text-muted">
      {{ intro.before }}<code>{{ slug }}</code
      >{{ intro.after }}
    </p>
    <UForm
      :schema="schema"
      :state="state"
      class="flex flex-col gap-5"
      @submit="onSubmit"
    >
      <UFormField
        name="password"
        :label="t('adminGroup.guardian.passwordLabel')"
        :help="t('adminGroup.guardian.passwordHelp')"
        required
      >
        <UInput
          v-model="state.password"
          type="password"
          autocomplete="new-password"
          class="w-full"
          autofocus
        />
      </UFormField>
      <UAlert
        v-if="update.isError.value"
        color="error"
        variant="subtle"
        :description="errorMessage(update.error.value)"
      />
      <UButton
        type="submit"
        block
        :loading="update.isPending.value"
        :label="t('common.actions.save')"
      />
    </UForm>
  </AdminScreen>
</template>
