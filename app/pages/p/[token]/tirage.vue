<script setup lang="ts">
import { formatEventDate } from '#server/utils/rules';
import {
  useOpenDrawQuery,
  usePersonalQuery,
} from '~/composables/queries/usePersonal';

// « Qui offre à qui » (README 22.18, maquette TirageTout): once the draw is
// revealed, every pair, for the whole group; the participant's own line
// marked « toi ». Before the reveal, the route refuses and the page says
// so.
const route = useRoute();
const token = computed(() => String(route.params.token));
const personal = usePersonalQuery(token);
const query = useOpenDrawQuery(token, () => true);
const draw = computed(() => query.data.value);
const me = computed(() => personal.data.value);
const { t, locale } = useT();
const context = computed(() =>
  me.value
    ? [
        { label: me.value.groupName, to: `/p/${token.value}` },
        { label: me.value.editionLabel, to: `/p/${token.value}` },
      ]
    : [],
);
</script>

<template>
  <ParticipantScreen
    :token="token"
    :back="`/p/${token}`"
    :pending="query.isPending.value || personal.isPending.value"
    :error="query.error.value ?? personal.error.value"
    :skeleton="['title', 'list']"
  >
    <template v-if="draw && me">
      <div class="flex flex-col gap-1">
        <UiPageContext :parts="context" :label="t('common.context')" />
        <UiPageTitle>{{ t('participant.revealed.pageTitle') }}</UiPageTitle>
        <p class="mt-1 text-[15px] leading-[1.45] text-toned">
          {{
            t('participant.revealed.pageBody', {
              date: formatEventDate(draw.revealedAt.slice(0, 10), locale),
            })
          }}
        </p>
      </div>
      <UiList
        :title="
          t('participant.revealed.listTitle', { count: draw.pairs.length })
        "
        data-testid="all-pairs"
      >
        <li
          v-for="pair in draw.pairs"
          :key="pair.giver.id"
          class="flex min-h-15 items-center gap-3 px-4 py-2"
          :data-me="pair.receiver.id === draw.receiver.id || undefined"
        >
          <UiAvatar :avatar="pair.giver.avatar" />
          <span class="flex min-w-0 grow flex-col">
            <span class="font-semibold"
              >{{ pair.giver.name
              }}<span
                v-if="pair.receiver.id === draw.receiver.id"
                class="font-medium text-toned"
              >
                · {{ t('participant.revealed.you') }}</span
              ></span
            >
            <span class="text-[13px] text-toned">{{
              t('participant.revealed.givesTo', { name: pair.receiver.name })
            }}</span>
          </span>
          <UIcon
            name="i-lucide-arrow-right"
            class="size-4 shrink-0 text-dimmed"
            aria-hidden="true"
          />
          <UiAvatar :avatar="pair.receiver.avatar" size="sm" />
        </li>
      </UiList>
    </template>
  </ParticipantScreen>
</template>
