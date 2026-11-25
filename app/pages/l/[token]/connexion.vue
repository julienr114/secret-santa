<script setup lang="ts">
import { useRequestLinkMutation } from '~/composables/queries/useAuth';
import { useLinkQuery } from '~/composables/queries/useLists';

// Ticking without an account (README 22.19, maquette ListeConnexion, on a
// page since it has two fields, README 23.3): the address and the first
// name the holder will see; « Recevoir mon lien ». The usual magic link
// brings back to the list, and the gift is ticked.
const route = useRoute();
const token = computed(() => String(route.params.token));
const ideaId = computed(() => String(route.query.cocher ?? ''));
// A bell touched (ticket 122): followed on coming back.
const follow = computed(() => String(route.query.suivre ?? ''));
const { t } = useT();
const errorMessage = useErrorMessage();
const query = useLinkQuery(token);
const ask = useRequestLinkMutation();
const parent = computed(() => `/l/${token.value}`);
const idea = computed(() =>
  query.data.value?.people
    .flatMap((p) => p.ideas)
    .find((i) => i.id === ideaId.value),
);
const email = ref('');
const firstName = ref('');
const sent = ref(false);
const onSend = () =>
  ask.mutate(
    {
      email: email.value.trim(),
      firstName: firstName.value.trim() || undefined,
      next: ideaId.value
        ? `${parent.value}?cocher=${ideaId.value}`
        : follow.value
          ? `${parent.value}?suivre=${encodeURIComponent(follow.value)}`
          : parent.value,
    },
    {
      onSuccess: () => {
        sent.value = true;
      },
    },
  );
</script>

<template>
  <ListsScreen
    :back="parent"
    :pending="query.isPending.value"
    :error="query.error.value"
  >
    <div class="flex flex-col gap-1">
      <p class="text-sm text-toned">{{ query.data.value?.list.title }}</p>
      <UiPageTitle>{{
        t(follow ? 'lists.login.titleFollow' : 'lists.login.title')
      }}</UiPageTitle>
      <p class="mt-1 text-[15px] leading-[1.45] text-toned">
        {{ t(follow ? 'lists.login.introFollow' : 'lists.login.intro') }}
      </p>
    </div>
    <p
      v-if="sent"
      class="rounded-xl bg-success-soft px-4 py-3 text-[15px] text-success-ink"
      role="status"
      data-testid="login-sent"
    >
      {{ t('lists.login.sent', { email }) }}
    </p>
    <template v-else>
      <UiTextField
        id="visitor-email"
        v-model="email"
        :label="t('lists.login.email')"
        :multiline="false"
        inputmode="email"
        :placeholder="t('lists.login.emailPlaceholder')"
      />
      <!-- Following asks for no name: nobody sees who follows. -->
      <UiTextField
        v-if="!follow"
        id="visitor-name"
        v-model="firstName"
        :label="t('lists.login.firstName')"
        :multiline="false"
        :placeholder="
          t('lists.login.firstNamePlaceholder', {
            name: query.data.value?.holder.name ?? '',
          })
        "
      />
      <!-- The first name is optional (lot 27 ter): without one, the
           ticks are anonymous. -->
      <p
        v-if="!follow"
        class="-mt-2 text-sm text-toned"
        data-testid="login-no-name"
      >
        {{ t('lists.login.noName') }}
      </p>
      <p
        v-if="ask.isError.value"
        class="text-sm font-medium text-error"
        role="alert"
      >
        {{ errorMessage(ask.error.value) }}
      </p>
      <UiStickyFooter inline>
        <UButton
          block
          size="xl"
          class="h-13 justify-center text-[17px] font-bold"
          :disabled="!email.includes('@')"
          :loading="ask.isPending.value"
          :label="t('lists.login.send')"
          data-testid="visitor-send"
          @click="onSend"
        />
        <p v-if="idea" class="text-center text-[13px] text-toned">
          {{ t('lists.login.waiting', { idea: ideaName(idea) }) }}
        </p>
      </UiStickyFooter>
    </template>
  </ListsScreen>
</template>
