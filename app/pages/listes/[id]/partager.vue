<script setup lang="ts">
import type { ShareMissing } from '#server/utils/lists';
import {
  useListQuery,
  useShareListMutation,
} from '~/composables/queries/useLists';

// « Partager la liste » (README 22.19, maquette ListePartager): the link,
// made at the first share, and a ready-made message for the family chat,
// which says a word of the app too; « Partager le message », « Copier le
// message », « Copier le lien seul »; « Créer un nouveau lien » after a
// second tap. Without a name or without anyone, the screen says what is
// missing instead of making the link.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const id = computed(() => String(route.params.id));
const { t } = useT();
const toast = useToast();
const errorMessage = useErrorMessage();
const query = useListQuery(id);
const share = useShareListMutation(id);
const doc = computed(() => query.data.value);
useHead({ title: () => `${t('lists.share.title')} — ${t('common.appName')}` });
const context = computed(() => [
  { label: t('lists.home.title'), to: '/listes' },
  ...(doc.value?.list.title
    ? [{ label: doc.value.list.title, to: `/listes/${id.value}` }]
    : []),
]);

const token = ref<string | null>(null);
const missing = ref<ShareMissing[]>([]);
const failure = ref<unknown>(null);
const ask = (renew: boolean) =>
  share.mutate(
    { renew },
    {
      onSuccess: (data) => {
        token.value = data.token;
        if (renew) {
          confirming.value = false;
          toast.add({ title: t('lists.share.renewDone'), color: 'success' });
        }
      },
      onError: (error) => {
        const data = (
          error as { data?: { data?: { missing?: ShareMissing[] } } }
        ).data?.data;
        if (data?.missing) missing.value = data.missing;
        else failure.value = error;
      },
    },
  );
onMounted(() => ask(false));
const url = computed(() =>
  token.value && import.meta.client
    ? `${window.location.origin}/l/${token.value}`
    : '',
);
const { sentence, whole } = useListMessage(id, doc, url);

const copy = async (text: string, title: string) => {
  await navigator.clipboard.writeText(text);
  toast.add({ title, color: 'success', icon: 'i-lucide-clipboard-check' });
};
const onShare = () =>
  typeof navigator.share === 'function'
    ? navigator.share({ text: whole.value }).catch(() => null)
    : copy(whole.value, t('lists.share.copied'));
const confirming = ref(false);
</script>

<template>
  <AdminScreen :back="`/listes/${id}`">
    <div class="flex flex-col gap-1">
      <UiPageContext :parts="context" :label="t('common.context')" />
      <UiPageTitle>{{ t('lists.share.title') }}</UiPageTitle>
      <p class="text-[15px] text-toned">{{ t('lists.share.intro') }}</p>
    </div>

    <UiCard
      v-if="missing.length > 0"
      padding="lg"
      class="flex flex-col gap-3"
      data-testid="share-missing"
    >
      <h2 class="font-display text-xl font-bold">
        {{ t('lists.share.missing.heading') }}
      </h2>
      <ul class="flex list-disc flex-col gap-1 pl-5 text-[15px]">
        <li v-for="what in missing" :key="what">
          {{ t(`lists.share.missing.${what}`) }}
        </li>
      </ul>
      <UButton
        :to="`/listes/${id}`"
        block
        size="xl"
        class="h-12 justify-center font-bold"
        :label="t('lists.share.missing.back')"
      />
    </UiCard>
    <p v-else-if="failure" class="text-sm font-medium text-error" role="alert">
      {{ errorMessage(failure) }}
    </p>
    <UiSkeleton
      v-else-if="!token"
      :parts="['card', 'list']"
      :label="t('common.loading')"
    />

    <template v-else>
      <div
        class="flex flex-col gap-2 rounded-2xl rounded-bl-[4px] bg-[#f1e8d8] px-4 py-3.5 text-[15px] leading-[1.5]"
        data-testid="share-message"
      >
        <p class="whitespace-pre-line">{{ sentence }}</p>
        <p class="truncate font-semibold text-primary-ink">{{ url }}</p>
        <p class="text-toned">{{ t('lists.share.footer') }}</p>
      </div>
      <NuxtLink
        :to="`/listes/${id}/message`"
        class="-mt-2 flex min-h-11 items-center gap-1 self-start text-sm font-bold text-primary-ink"
      >
        {{ t('lists.share.personalize') }}
        <UIcon name="i-lucide-chevron-right" class="size-4" />
      </NuxtLink>
      <div class="flex flex-col gap-2.5">
        <UButton
          block
          size="xl"
          icon="i-lucide-send"
          class="h-13 justify-center text-[17px] font-bold"
          :label="t('lists.share.action')"
          @click="onShare"
        />
        <div class="grid grid-cols-2 gap-2.5">
          <UButton
            variant="outline"
            color="neutral"
            class="h-12 justify-center font-semibold"
            :label="t('lists.share.copy')"
            @click="copy(whole, t('lists.share.copied'))"
          />
          <UButton
            variant="outline"
            color="neutral"
            class="h-12 justify-center font-semibold"
            :label="t('lists.share.copyLink')"
            data-testid="copy-link"
            @click="copy(url, t('lists.share.linkCopied'))"
          />
        </div>
        <p class="text-sm text-toned">{{ t('lists.share.help') }}</p>
      </div>
      <UiList>
        <UiListItem
          v-if="!confirming"
          :title="t('lists.share.renew')"
          :subtitle="t('lists.share.renewHint')"
          :on-click="() => (confirming = true)"
        />
        <li v-else class="flex flex-col gap-2 px-4 py-3">
          <p class="text-sm">{{ t('lists.share.renewConfirm') }}</p>
          <div class="flex gap-2">
            <UButton
              class="min-h-11"
              :loading="share.isPending.value"
              :label="t('lists.share.renew')"
              @click="ask(true)"
            />
            <UButton
              variant="ghost"
              color="neutral"
              class="min-h-11"
              :label="t('common.actions.cancel')"
              @click="confirming = false"
            />
          </div>
        </li>
      </UiList>
    </template>
  </AdminScreen>
</template>
