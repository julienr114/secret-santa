<script setup lang="ts">
import { CATEGORY_DEFAULTS } from '#shared/utils/categories';
import type { ComingBirthday } from '#shared/utils/homeParties';
import { formatDay } from '~/utils/labels';

// « Bientôt » (docs/spec/v3/accueil-et-creation.md): the birthday of one
// of my people, proposed 60 days ahead; « Préparer » opens « Pour quelle
// occasion ? » already filled.
const props = defineProps<{ birthday: ComingBirthday }>();
const { t, locale } = useT();
const emoji = CATEGORY_DEFAULTS.birthday.emoji!;
const when = computed(() =>
  [
    formatDay(`${props.birthday.date}T12:00:00Z`, locale.value),
    props.birthday.days === 0
      ? t('party.today')
      : t('party.inDays', { count: props.birthday.days }),
    t('home.age', { count: props.birthday.age }),
  ].join(' · '),
);
</script>

<template>
  <section
    class="flex items-center gap-2.5 rounded-[28px] border-[1.5px] border-dashed border-peach-300 py-3 pr-3 pl-4"
    data-testid="home-birthday"
  >
    <span
      class="flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-lilac-100 text-base"
      aria-hidden="true"
    >
      <UiEmoji :emoji="emoji" />
    </span>
    <span class="flex min-w-0 grow flex-col">
      <span class="font-display text-[17px] leading-tight font-bold">{{
        t('party.create.birthdayOf', { name: birthday.firstName })
      }}</span>
      <span class="text-[13px] text-toned">{{ when }}</span>
    </span>
    <UButton
      :to="`/e/nouvelle?categorie=birthday&proche=${birthday.memberId}`"
      color="neutral"
      variant="outline"
      class="min-h-10 shrink-0"
      :label="t('home.prepare')"
    />
  </section>
</template>
