<script setup lang="ts">
import { HINT_QUESTIONS, HINT_TEXTS } from '#shared/utils/hints';
import { useLinkQuery } from '~/composables/queries/useLists';

// The tastes of a person of a list, for those who open its link (README
// 22.19): their practical details, the answers to the questions of the
// gift hints and their texts, to give something not on the list. Read
// only.
const route = useRoute();
const token = computed(() => String(route.params.token));
const pid = computed(() => String(route.params.pid));
const { t, tk } = useT();
const query = useLinkQuery(token);
const parent = computed(() => `/l/${token.value}`);
const person = computed(() =>
  query.data.value?.people.find((p) => p.id === pid.value),
);
const tags = computed(() =>
  HINT_QUESTIONS.flatMap((question) => {
    const answer = person.value?.member.answers[question];
    return answer ? [tk(`hints.tags.${question}.${answer}`)] : [];
  }),
);
const texts = computed(() =>
  HINT_TEXTS.flatMap((key) => {
    const text = person.value?.member.texts[key];
    return text ? [{ key, text }] : [];
  }),
);
</script>

<template>
  <ListsScreen
    :back="parent"
    :pending="query.isPending.value"
    :error="query.error.value"
  >
    <template v-if="person">
      <div class="flex items-center gap-3.5">
        <UiAvatar
          :avatar="person.member.avatar"
          class="size-16! text-[32px]!"
        />
        <UiPageTitle>{{
          t('lists.tastes.title', { name: person.member.firstName })
        }}</UiPageTitle>
      </div>
      <UiCard padding="md" class="flex flex-col gap-3" data-testid="tastes">
        <template v-if="tags.length > 0">
          <h2 class="font-display text-xl leading-[1.2] font-bold">
            {{ t('lists.person.prefers', { name: person.member.firstName }) }}
          </h2>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="tag in tags"
              :key="tag"
              class="rounded-full bg-muted px-3 py-1.5 text-sm font-semibold ring-1 ring-default"
              >{{ tag }}</span
            >
          </div>
        </template>
        <div
          v-for="item in texts"
          :key="item.key"
          class="flex flex-col gap-0.5"
        >
          <h3 class="text-xs font-bold tracking-[0.04em] text-toned uppercase">
            {{ t(`lists.person.texts.${item.key}`) }}
          </h3>
          <p class="text-[15px] leading-[1.45]">{{ item.text }}</p>
        </div>
        <p
          v-if="tags.length === 0 && texts.length === 0"
          class="text-[15px] text-toned"
        >
          {{ t('lists.tastes.none', { name: person.member.firstName }) }}
        </p>
      </UiCard>
    </template>
  </ListsScreen>
</template>
