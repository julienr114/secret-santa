<script setup lang="ts">
import {
  useHomeQuery,
  useRequestGroupMutation,
} from '~/composables/queries/useAuth';
import type { EditionSummary } from '#server/database/home';
import { formatDay } from '~/utils/labels';

// The home of a logged-in account, the same for everyone: a greeting,
// their draws, then the groups they organise, with the way to create or
// ask for one.
const REQUEST_MAX = 500;
const { t, locale } = useT();
const errorMessage = useErrorMessage();
const toast = useToast();
const home = useHomeQuery();
useHead({
  title: () => `${t('auth.home.title')} — ${t('common.appName')}`,
});
const draws = computed(() => home.data.value?.draws ?? []);
// Closed editions stay within reach, folded under the current ones.
// Several draws at once: the one waiting for an action comes first.
const STEP_ORDER = ['discover', 'addWishes', 'seeAgain', 'wait', 'closed'];
const currentDraws = computed(() =>
  draws.value
    .filter((draw) => draw.status !== 'closed')
    .toSorted(
      (a, b) => STEP_ORDER.indexOf(a.step) - STEP_ORDER.indexOf(b.step),
    ),
);
const pastDraws = computed(() =>
  draws.value.filter((draw) => draw.status === 'closed'),
);
const showPast = ref(false);
const fromHome = useDrawFromHome();
const groups = computed(() => home.data.value?.groups ?? []);
const firstName = computed(() => home.data.value?.firstName ?? null);
const avatar = computed(() => home.data.value?.avatar);
// The avatar opens its picker; the names are on "Mon compte", which the
// link under the greeting leads to.
const avatarOpen = ref(false);
const greeting = computed(() =>
  firstName.value
    ? t('auth.home.hello', { name: firstName.value })
    : t('auth.home.helloNobody'),
);
// What an organiser wants to know at a glance about each group.
const summaryOf = (current: EditionSummary | null) => {
  if (!current) return t('auth.home.groupIdle');
  const counts = {
    count: current.participants,
    sent: current.participants - current.toNotify,
    viewed: current.viewed,
  };
  return `${current.label} · ${t(`auth.home.groupState.${current.status}`, counts)}`;
};
const groupsLeft = computed(() => home.data.value?.groupsLeft ?? null);
const canCreate = computed(() => home.data.value?.canCreateGroup ?? false);

// Without room for a group, the account may ask for one, once at a time.
const request = computed(() => home.data.value?.request ?? null);
const isPending = computed(() => request.value?.status === 'pending');
const requestNote = computed(() => {
  if (!request.value || request.value.status === 'approved') return null;
  const date = formatDay(request.value.createdAt, locale.value);
  return isPending.value
    ? t('auth.home.requestPending', { date })
    : t('auth.home.requestRefused', { date });
});
const ask = useRequestGroupMutation();
const open = ref(false);
const message = ref('');
const canValidate = computed(() => message.value.trim().length > 0);
const openSheet = () => {
  message.value = '';
  ask.reset();
  open.value = true;
};
const onValidate = () => {
  if (!canValidate.value) return;
  ask.mutate(message.value.trim(), {
    onSuccess: () => {
      open.value = false;
      toast.add({
        title: t('auth.home.requestSent'),
        color: 'success',
        icon: 'i-lucide-check',
      });
    },
  });
};
</script>

<template>
  <AdminScreen>
    <AdminQueryState :pending="home.isPending.value" :error="home.error.value">
      <div class="flex items-center gap-4">
        <button
          v-if="avatar"
          type="button"
          class="relative shrink-0 rounded-full focus-visible:ring-2 focus-visible:ring-primary"
          :aria-label="t('auth.home.editAvatar')"
          @click="avatarOpen = true"
        >
          <UiAvatar :avatar="avatar" class="size-14 text-2xl" />
          <span
            class="absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-full bg-default shadow ring-1 ring-default"
            aria-hidden="true"
          >
            <UIcon name="i-lucide-pencil" class="size-3 text-muted" />
          </span>
        </button>
        <div class="flex min-w-0 flex-col items-start">
          <UiPageTitle>{{ greeting }}</UiPageTitle>
          <UButton
            to="/compte"
            variant="link"
            size="sm"
            class="-ml-2.5"
            :color="firstName ? 'neutral' : 'primary'"
            :label="
              firstName
                ? t('auth.home.editProfile')
                : t('auth.home.profileMissing')
            "
          />
        </div>
      </div>
      <section class="flex flex-col gap-2" data-testid="home-draws">
        <UiList :title="t('auth.home.draws')" title-size="lg">
          <li
            v-if="currentDraws.length === 0"
            class="px-4 py-3 text-sm text-muted"
          >
            {{
              pastDraws.length > 0
                ? t('auth.home.drawsNoneCurrent')
                : t('auth.home.drawsEmpty')
            }}
          </li>
          <HomeDrawRow
            v-for="draw in currentDraws"
            :key="draw.id"
            :draw="draw"
            @open="fromHome = { path: draw.path }"
          />
        </UiList>
        <template v-if="pastDraws.length > 0">
          <UButton
            variant="link"
            color="neutral"
            size="sm"
            class="self-start px-1"
            :trailing-icon="
              showPast ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'
            "
            :aria-expanded="showPast"
            :label="
              showPast
                ? t('auth.home.drawsPastHide')
                : t('auth.home.drawsPast', { count: pastDraws.length })
            "
            @click="showPast = !showPast"
          />
          <UiList v-if="showPast" class="opacity-80">
            <UiListItem
              v-for="draw in pastDraws"
              :key="draw.id"
              :to="draw.path"
              icon="i-lucide-archive"
              :title="draw.groupName"
              :subtitle="draw.editionLabel"
              @click="fromHome = { path: draw.path }"
            />
          </UiList>
        </template>
      </section>

      <UiList
        :title="t('auth.home.groups')"
        title-size="lg"
        :footer="canCreate || isPending ? undefined : t('auth.home.requestWhy')"
        data-testid="home-groups"
      >
        <UiListItem
          v-for="group in groups"
          :key="group.id"
          :to="`/admin/${group.slug}`"
          emoji="🎄"
          :title="group.name"
          :subtitle="summaryOf(group.current)"
        />
        <UiListItem
          v-if="canCreate"
          to="/admin/groupes/nouveau"
          icon="i-lucide-plus"
          :title="t('auth.home.newGroup')"
          :subtitle="
            groupsLeft === null
              ? undefined
              : t('auth.home.groupsLeft', { count: groupsLeft })
          "
        />
        <li v-else-if="requestNote" class="px-4 py-3 text-sm" role="status">
          {{ requestNote }}
        </li>
        <UiListItem
          v-if="!canCreate && !isPending"
          icon="i-lucide-send"
          :title="
            groups.length > 0
              ? t('auth.home.requestAction')
              : t('auth.home.organize')
          "
          :subtitle="t('auth.home.requestHint')"
          :on-click="openSheet"
        />
      </UiList>
    </AdminQueryState>

    <HomeProfileSheet
      v-if="avatar"
      v-model:open="avatarOpen"
      :initial="avatar"
    />
    <UDrawer
      v-model:open="open"
      :title="t('auth.home.requestAction')"
      :description="t('auth.home.requestDescription')"
    >
      <template #body>
        <form
          id="group-request-form"
          class="flex flex-col gap-4 py-2"
          novalidate
          @submit.prevent="onValidate"
        >
          <UFormField :label="t('auth.home.requestLabel')">
            <UTextarea
              v-model="message"
              :maxlength="REQUEST_MAX"
              :rows="4"
              autoresize
              :placeholder="t('auth.home.requestPlaceholder')"
              class="w-full"
            />
          </UFormField>
          <UAlert
            v-if="ask.isError.value"
            color="error"
            variant="subtle"
            :description="errorMessage(ask.error.value)"
          />
        </form>
      </template>
      <template #footer>
        <UButton
          type="submit"
          form="group-request-form"
          block
          :disabled="!canValidate"
          :loading="ask.isPending.value"
          :label="t('common.actions.validate')"
        />
      </template>
    </UDrawer>
  </AdminScreen>
</template>
