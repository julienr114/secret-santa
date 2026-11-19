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
  back: isSuper.value ? '/admin/groupes' : '/',
}));

// A super-admin creates groups for others and names their organiser; any
// other account creates its own and organises it.
const { user } = useUserSession();
const isSuper = computed(() => user.value?.role === 'super_admin');
const create = useCreateGroupMutation();
// How many more groups the account may create; nothing without a limit.
const home = useHomeQuery();
const groupsLeft = computed(() => home.data.value?.groupsLeft ?? null);
const toast = useMessages();

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
        toast.done(t('adminGroup.newGroup.created'));
        navigateTo(`/admin/${group.slug}`, { replace: true });
      },
    },
  );
</script>

<template>
  <AdminScreen v-bind="screen">
    <div class="flex flex-col gap-1">
      <UiPageTitle>{{ t('adminGroup.newGroup.title') }}</UiPageTitle>
      <p class="text-[15px] text-toned">{{ t('adminGroup.newGroup.intro') }}</p>
    </div>
    <UForm
      :schema="schema"
      :state="state"
      class="flex flex-col gap-6"
      @submit="onSubmit"
    >
      <UFormField
        name="name"
        :label="t('adminGroup.newGroup.nameLabel')"
        :help="t('adminGroup.newGroup.nameHelp')"
        :ui="{
          label: 'text-[15px] font-semibold',
          help: 'text-[13px] leading-[1.4] text-toned',
        }"
      >
        <UInput
          v-model="state.name"
          :placeholder="t('adminGroup.newGroup.namePlaceholder')"
          size="xl"
          class="w-full"
          :ui="{ base: 'h-12' }"
          autofocus
        />
      </UFormField>
      <UiRestricted v-if="isSuper" :label="t('auth.account.superAdmin')">
        <UFormField
          name="organizer"
          :help="t('adminGroup.newGroup.organizerHelp')"
          :ui="{ help: 'text-[13px] leading-[1.4] text-toned' }"
        >
          <template #label>
            <span class="text-[15px] font-semibold"
              >{{ t('adminGroup.newGroup.organizerLabel') }}
              <span class="font-normal text-toned">{{
                t('adminEdition.newEdition.optional')
              }}</span></span
            >
          </template>
          <UInput
            v-model="state.organizer"
            type="email"
            inputmode="email"
            autocomplete="off"
            autocapitalize="none"
            :placeholder="t('adminGroup.newGroup.organizerPlaceholder')"
            size="xl"
            class="w-full"
            :ui="{ base: 'h-12' }"
          />
        </UFormField>
      </UiRestricted>
      <UiNotice v-else variant="info" icon="i-lucide-info">
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
        size="xl"
        class="h-12 justify-center font-bold"
        :loading="create.isPending.value"
        :label="
          create.isPending.value
            ? t('adminGroup.newGroup.creating')
            : t('adminGroup.newGroup.submit')
        "
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
