<script setup lang="ts">
import { z } from 'zod';
import {
  useAddOrganizerMutation,
  useDashboardQuery,
  useOrganizersQuery,
  useRemoveOrganizerMutation,
} from '~/composables/queries/useGroup';

// Who may manage the group: accounts named by their address. They log in
// with a link sent to that address; there is no password to hand over.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const { t } = useT();
const errorMessage = useErrorMessage();
const toast = useToast();
const onError = (error: unknown) =>
  toast.add({ title: errorMessage(error), color: 'error' });

const dashboard = useDashboardQuery(slug);
const organizers = useOrganizersQuery(slug);
const add = useAddOrganizerMutation(slug);
const remove = useRemoveOrganizerMutation(slug);
const name = computed(() => dashboard.data.value?.group.name ?? slug.value);
useHead({
  title: () => `${t('adminGroup.organizers.title')} — ${t('common.appName')}`,
});
const screen = computed(() => ({
  back: `/admin/${slug.value}`,
  crumbs: [
    { label: name.value, to: `/admin/${slug.value}` },
    { label: t('adminGroup.organizers.title') },
  ],
}));

const open = ref(false);
const email = ref('');
const valid = computed(() => z.email().safeParse(email.value.trim()).success);
const openSheet = () => {
  email.value = '';
  add.reset();
  open.value = true;
};
const onAdd = () => {
  if (!valid.value) return;
  add.mutate(email.value.trim(), {
    onSuccess: () => {
      open.value = false;
    },
  });
};

// Removing asks for a second tap on the row itself.
const confirmId = ref<string | null>(null);
const onRemove = (accountId: string) =>
  remove.mutate(accountId, {
    onSettled: () => {
      confirmId.value = null;
    },
    onError,
  });
</script>

<template>
  <AdminScreen v-bind="screen">
    <UiPageTitle>{{ t('adminGroup.organizers.title') }}</UiPageTitle>
    <p class="text-sm text-muted">
      {{ t('adminGroup.organizers.intro', { name }) }}
    </p>
    <AdminQueryState
      :pending="organizers.isPending.value"
      :error="organizers.error.value"
    >
      <UiList :footer="t('adminGroup.organizers.superNote')">
        <UiListItem
          icon="i-lucide-plus"
          :title="t('adminGroup.organizers.add')"
          :on-click="openSheet"
        />
        <li
          v-if="organizers.data.value?.organizers.length === 0"
          class="px-4 py-3 text-sm text-muted"
        >
          {{ t('adminGroup.organizers.empty') }}
        </li>
        <UiListItem
          v-for="organizer in organizers.data.value?.organizers ?? []"
          :key="organizer.accountId"
          icon="i-lucide-circle-user"
          :title="organizer.email"
          :subtitle="organizer.me ? t('adminGroup.organizers.you') : undefined"
        >
          <template v-if="!organizer.me" #trailing>
            <div
              v-if="confirmId === organizer.accountId"
              class="flex shrink-0 items-center gap-1"
            >
              <UButton
                size="sm"
                color="error"
                :label="t('adminGroup.organizers.remove')"
                :loading="remove.isPending.value"
                @click="onRemove(organizer.accountId)"
              />
              <UButton
                size="sm"
                variant="ghost"
                color="neutral"
                :label="t('common.actions.cancel')"
                @click="confirmId = null"
              />
            </div>
            <UButton
              v-else
              variant="ghost"
              color="neutral"
              icon="i-lucide-x"
              :aria-label="
                t('adminGroup.organizers.removeLabel', {
                  email: organizer.email,
                })
              "
              @click="confirmId = organizer.accountId"
            />
          </template>
        </UiListItem>
      </UiList>
    </AdminQueryState>

    <UDrawer
      v-model:open="open"
      :title="t('adminGroup.organizers.addTitle')"
      :description="t('adminGroup.organizers.addDescription')"
    >
      <template #body>
        <form
          id="organizer-form"
          class="flex flex-col gap-4 py-2"
          novalidate
          @submit.prevent="onAdd"
        >
          <UFormField :label="t('auth.login.emailLabel')">
            <UInput
              v-model="email"
              type="email"
              inputmode="email"
              autocomplete="off"
              autocapitalize="none"
              class="w-full"
            />
          </UFormField>
          <UAlert
            v-if="add.isError.value"
            color="error"
            variant="subtle"
            :description="errorMessage(add.error.value)"
          />
        </form>
      </template>
      <template #footer>
        <UButton
          type="submit"
          form="organizer-form"
          block
          :disabled="!valid"
          :loading="add.isPending.value"
          :label="t('common.actions.validate')"
        />
      </template>
    </UDrawer>
  </AdminScreen>
</template>
