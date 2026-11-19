<script setup lang="ts">
import type { ListDocument } from '#server/http/lists';
import type IdeaLine from './IdeaLine.vue';

// A person on a list, as its holder writes it (README 22.19, maquette
// ListeTeneur): the round icon of 52 px left of the first name and the
// line of practical details, « ses goûts » to their page, then their
// ideas and the empty line at the end, « Une autre idée… ».
const props = defineProps<{
  listId: string;
  person: ListDocument['people'][number];
}>();
const { t } = useT();
const member = computed(() => props.person.member);
/** « 6 ans · taille 6 ans, pointure 30 », or « Moi ». */
const details = computed(() => {
  const m = member.value;
  const sizes = [
    m.clothingSize ? t('lists.doc.size', { size: m.clothingSize }) : null,
    m.shoeSize ? t('lists.doc.shoe', { size: m.shoeSize }) : null,
  ].filter(Boolean);
  return [
    m.isSelf ? t('lists.doc.me') : null,
    m.age === null ? null : t('lists.doc.age', { count: m.age }),
    sizes.length > 0 ? sizes.join(', ') : null,
  ]
    .filter(Boolean)
    .join(' · ');
});
const lines = ref<InstanceType<typeof IdeaLine>[]>([]);
const last = ref<InstanceType<typeof IdeaLine> | null>(null);
/**
 * The return key on a line: on to the next one, the empty line last.
 * @param index - The line left.
 */
const onNext = (index: number) =>
  (index + 1 < props.person.ideas.length
    ? lines.value[index + 1]
    : last.value
  )?.start();
</script>

<template>
  <section class="flex flex-col gap-1" data-testid="list-person">
    <header class="flex items-center gap-3 pb-1">
      <UiAvatar :avatar="member.avatar" :px="52" />
      <div class="flex min-w-0 flex-col">
        <h2 class="font-display text-[28px] leading-[1.1] font-bold">
          {{ member.firstName }}
        </h2>
        <p class="text-sm text-toned">
          {{ details }}<template v-if="details"> · </template>
          <NuxtLink
            :to="`/famille/${member.id}?liste=${listId}&place=${person.id}`"
            class="text-primary-ink underline"
            >{{ t('lists.doc.tastes') }}</NuxtLink
          >
        </p>
      </div>
    </header>
    <ul class="flex flex-col">
      <ListsIdeaLine
        v-for="(idea, index) in person.ideas"
        :key="idea.id"
        ref="lines"
        :list-id="listId"
        :list-person-id="person.id"
        :for-name="member.firstName"
        :idea="idea"
        :line="`${person.id}:${index}`"
        @next="onNext(index)"
      />
      <li
        v-for="gift in person.offList"
        :key="gift.id"
        class="flex items-start gap-3 py-2"
        data-testid="holder-off-list"
      >
        <span
          class="mt-0.5 flex size-[22px] shrink-0 items-center justify-center rounded-sm bg-line-strong text-highlighted"
          aria-hidden="true"
        >
          <UIcon name="i-lucide-check" class="size-3.5" />
        </span>
        <p class="flex flex-wrap items-center gap-x-2 gap-y-1 text-base">
          <span class="text-toned line-through">{{
            t('lists.doc.offList', {
              text: gift.kind === 'surprise' ? '' : gift.text,
            })
          }}</span>
          <span
            v-if="gift.kind === 'holder'"
            class="rounded-full bg-muted px-2 py-0.5 text-xs font-bold text-default"
            >{{ gift.by ?? t('lists.doc.anonymous') }}</span
          >
        </p>
      </li>
      <ListsIdeaLine
        ref="last"
        :list-id="listId"
        :list-person-id="person.id"
        :for-name="member.firstName"
        :idea="null"
        :after="null"
        :placeholder="
          person.ideas.length === 0
            ? t('lists.doc.ideaFor', { name: member.firstName })
            : t('lists.doc.anotherIdea')
        "
        :line="`${person.id}:new`"
      />
    </ul>
  </section>
</template>
