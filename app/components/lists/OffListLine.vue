<script setup lang="ts">
import { IDEA_TEXT_MAX } from '#server/utils/lists';
import { useAddOffListMutation } from '~/composables/queries/useLists';

// « J'offre autre chose à Léo », written in place at the end of a person
// (README 22.20, maquette ListeHorsListe): no sheet, no page. Touched, it
// is a line already ticked in my name; under it, who will read these
// words, and « Supprimer ». The return key, or touching elsewhere, says
// it; a line left empty goes. Without an account, an address is asked
// first.
const props = defineProps<{
  token: string;
  listPersonId: string;
  /** Who receives the gift; nobody on a list without people. */
  forName: string;
  /** Who holds the list, and reads these words. */
  holderName: string;
}>();
const { t } = useT();
/** « J'offre autre chose à Léo », or without a name. */
const label = computed(() =>
  props.forName
    ? t('lists.visitor.offListAction', { name: props.forName })
    : t('lists.single.offListAction'),
);
const toast = useMessages();
const errorMessage = useErrorMessage();
const { loggedIn } = useUserSession();
const add = useAddOffListMutation(() => props.token);
const row = ref<HTMLElement | null>(null);
const field = ref<HTMLInputElement | null>(null);
const writing = ref(false);
const text = ref('');

/**
 * Starts the line, or asks for an address first.
 * @returns Once the field has the focus.
 */
const start = async () => {
  if (!loggedIn.value) return navigateTo(`/l/${props.token}/connexion`);
  writing.value = true;
  await nextTick();
  field.value?.focus();
};
/** Says the gift, when something was written, and leaves the line. */
const commit = () => {
  const words = text.value.trim();
  writing.value = false;
  if (!words) return;
  add.mutate(
    // Under my name or not: my « mode anonyme » for this list decides.
    { listPersonId: props.listPersonId, text: words },
    {
      onSuccess: () => {
        text.value = '';
      },
      onError: (error) => {
        writing.value = true;
        toast.failed(errorMessage(error));
      },
    },
  );
};
/** « Supprimer »: nothing is said. */
const giveUp = () => {
  text.value = '';
  writing.value = false;
};
const onFocusOut = (event: FocusEvent) => {
  if (!writing.value) return;
  const to = event.relatedTarget;
  if (to instanceof Node && row.value?.contains(to)) return;
  commit();
};
</script>

<template>
  <li
    v-if="writing"
    ref="row"
    class="relative -my-1 -mr-2 -ml-2.5 flex items-start gap-[var(--line-gap,12px)] rounded-[16px] bg-default py-3 pr-2 pl-2.5 shadow-line-card"
    data-testid="off-list-line"
    @focusout="onFocusOut"
  >
    <span
      class="mt-0.5 flex size-[22px] shrink-0 items-center justify-center rounded-sm bg-success text-white"
      aria-hidden="true"
    >
      <UIcon name="i-lucide-check" class="size-3.5" />
    </span>
    <div class="flex min-w-0 grow flex-col gap-1">
      <input
        ref="field"
        v-model="text"
        type="text"
        enterkeyhint="done"
        :maxlength="IDEA_TEXT_MAX"
        class="w-full bg-transparent text-base leading-[1.45] font-semibold outline-none"
        :aria-label="label"
        data-testid="off-list-field"
        @keydown.enter.prevent="commit"
      />
      <p class="text-[13px] leading-[1.4] text-toned">
        {{ t('lists.offList.inlineHint', { name: holderName }) }}
      </p>
      <button
        type="button"
        class="flex min-h-11 items-center self-start text-sm font-bold text-toned underline underline-offset-2"
        @pointerdown.prevent
        @click="giveUp"
      >
        {{ t('lists.doc.removeLine') }}
      </button>
    </div>
  </li>
  <!-- On a list without people (maquette ListeSansPersonneVisiteur): a
       plain link under the ideas, once. -->
  <li v-else-if="!forName">
    <button
      type="button"
      class="flex min-h-11 items-center text-left text-[15px] font-bold text-primary-ink underline underline-offset-2"
      :disabled="add.isPending.value"
      data-testid="off-list-action"
      @click="start"
    >
      {{ label }}
    </button>
  </li>
  <li v-else class="relative">
    <button
      type="button"
      class="flex min-h-11 items-start gap-[var(--line-gap,12px)] py-[13px] text-left text-base/[22px] font-bold text-primary-ink"
      :disabled="add.isPending.value"
      data-testid="off-list-action"
      @click="start"
    >
      <span
        class="flex size-[22px] shrink-0 items-center justify-center rounded-sm border-[1.5px] border-dashed border-accented bg-page"
        aria-hidden="true"
      >
        <UIcon name="i-lucide-plus" class="size-3.5" />
      </span>
      {{ label }}
    </button>
  </li>
</template>
