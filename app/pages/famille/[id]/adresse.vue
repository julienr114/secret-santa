<script setup lang="ts">
import type { MemberView } from '#server/http/lists';
import {
  useMemberQuery,
  useUpdateMemberMutation,
} from '~/composables/queries/useLists';

// The email address of one of my people (Correction 27, lot 25, maquettes
// ProcheAdresse, ListePersonneCompte): it links them to their own
// account, so that they write their own ideas on my lists. One line, the
// keyboard of addresses, no capital nor correction. Once an address is
// given, the page shows where it stands (linked, or no account at that
// address yet) and « Ne plus relier ».
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const id = computed(() => String(route.params.id));
const { t } = useT();
const goBack = useGoBack();
const query = useMemberQuery(id);
const update = useUpdateMemberMutation(id);
const errorMessage = useErrorMessage();
const draft = ref('');
const address = computed(() => draft.value.trim().toLowerCase());
/** Looks like an address: the server checks it for good. */
const valid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.value));
const parent = computed(() => {
  const params = new URLSearchParams();
  if (route.query.liste) params.set('liste', String(route.query.liste));
  if (route.query.place) params.set('place', String(route.query.place));
  const search = params.toString();
  return `/famille/${id.value}${search ? `?${search}` : ''}`;
});
const unlinkFailure = ref<string | null>(null);
const onUnlink = () =>
  update.mutate(
    { email: null },
    {
      onSuccess: () => goBack(parent.value),
      onError: (error) => {
        unlinkFailure.value = errorMessage(error);
      },
    },
  );
const given = (member: MemberView) => Boolean(member.email);
</script>

<template>
  <ListsMemberFieldPage
    :title="t('lists.person.field.email')"
    :title-mine="t('lists.person.field.email')"
    :patch="valid ? { email: address } : null"
    :no-validate="Boolean(query.data.value?.member.email)"
  >
    <template #default="{ member }">
      <template v-if="given(member)">
        <UiList data-testid="member-account">
          <UiListItem
            :title="member.email ?? ''"
            :subtitle="
              member.linked
                ? t('lists.person.account.linked')
                : t('lists.person.account.waiting')
            "
            icon="i-lucide-circle-user"
            :icon-tone="member.linked ? 'primary' : 'neutral'"
            one-line
          />
        </UiList>
        <UButton
          block
          variant="outline"
          color="neutral"
          class="h-12 justify-center text-base font-bold"
          :loading="update.isPending.value"
          :label="t('lists.person.account.unlink')"
          data-testid="member-unlink"
          @click="onUnlink"
        />
        <p
          v-if="unlinkFailure"
          class="text-sm font-medium text-error"
          role="alert"
        >
          {{ unlinkFailure }}
        </p>
      </template>
      <UInput
        v-else
        v-model="draft"
        type="email"
        inputmode="email"
        autocomplete="off"
        autocapitalize="none"
        autocorrect="off"
        spellcheck="false"
        enterkeyhint="done"
        size="xl"
        :maxlength="254"
        :aria-label="t('lists.person.field.emailField')"
        :placeholder="t('lists.person.field.emailPlaceholder')"
        :ui="{ base: 'h-12 text-base placeholder:text-muted' }"
        data-testid="member-field"
      />
    </template>
  </ListsMemberFieldPage>
</template>
