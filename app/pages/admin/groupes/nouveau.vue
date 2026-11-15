<script setup lang="ts">
import { z } from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';
import { useCreateGroupMutation } from '~/composables/queries/useGroups';
import { useHomeQuery } from '~/composables/queries/useAuth';

definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t } = useT();
const errorMessage = useErrorMessage();
useHead({
  title: computed(
    () => `${t('adminGroup.newGroup.title')} — ${t('common.appName')}`,
  ),
});
const screen = computed(() => ({
  back: '/',
}));

// A super-admin creates groups for others and names their organiser; any
// other account creates its own and organises it.
const { user } = useUserSession();
const isSuper = computed(() => user.value?.role === 'super_admin');
const create = useCreateGroupMutation();
// How many more groups the account may create; nothing without a limit.
const home = useHomeQuery();
const groupsLeft = computed(() => home.data.value?.groupsLeft ?? null);
const toast = useToast();

const schema = computed(() =>
  z.object({
    name: z
      .string()
      .trim()
      .min(1, t('adminGroup.newGroup.nameRequired'))
      .max(100),
    organizer: z
      .string()
      .trim()
      .refine(
        (value) => value === '' || z.email().safeParse(value).success,
        t('auth.login.emailInvalid'),
      ),
  }),
);
type Schema = z.output<typeof schema.value>;
const state = reactive<Schema>({ name: '', organizer: '' });
const onSubmit = (event: FormSubmitEvent<Schema>) =>
  create.mutate(
    {
      name: event.data.name,
      organizers: event.data.organizer ? [event.data.organizer] : [],
    },
    {
      onSuccess: ({ group }) => {
        toast.add({
          title: t('adminGroup.newGroup.created'),
          color: 'success',
          icon: 'i-lucide-check',
        });
        navigateTo(`/admin/${group.slug}`, { replace: true });
      },
    },
  );
</script>

<template>
  <AdminScreen v-bind="screen">
    <UiPageTitle>
      {{ t('adminGroup.newGroup.title') }}
    </UiPageTitle>
    <UForm
      :schema="schema"
      :state="state"
      class="flex flex-col gap-5"
      @submit="onSubmit"
    >
      <UFormField
        name="name"
        :label="t('adminGroup.newGroup.nameLabel')"
        required
      >
        <UInput
          v-model="state.name"
          :placeholder="t('adminGroup.newGroup.namePlaceholder')"
          class="w-full"
          autofocus
        />
      </UFormField>
      <UFormField
        v-if="isSuper"
        name="organizer"
        :label="t('adminGroup.newGroup.organizerLabel')"
        :help="t('adminGroup.newGroup.organizerHelp')"
      >
        <UInput
          v-model="state.organizer"
          type="email"
          inputmode="email"
          autocomplete="off"
          autocapitalize="none"
          class="w-full"
        />
      </UFormField>
      <UiNotice v-if="!isSuper" variant="info" icon="i-lucide-info">
        {{ t('adminGroup.newGroup.note') }}
      </UiNotice>
      <UAlert
        v-if="create.isError.value"
        color="error"
        variant="subtle"
        :description="errorMessage(create.error.value)"
      />
      <UButton
        type="submit"
        block
        :loading="create.isPending.value"
        :label="t('adminGroup.newGroup.submit')"
      />
      <p
        v-if="!isSuper && groupsLeft !== null"
        class="text-center text-sm text-muted"
        data-testid="groups-left"
      >
        {{ t('adminGroup.newGroup.groupsLeft', { count: groupsLeft }) }}
      </p>
    </UForm>
  </AdminScreen>
</template>
