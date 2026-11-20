import type { Ref } from 'vue';
import type { ListLive } from '~/composables/useListLive';

type Field = HTMLInputElement | HTMLTextAreaElement | null | undefined;

/**
 * A text of a list written in place, live (lot 26): tells the others who
 * hold the list that I write it, what I typed and where my caret is,
 * while I am in it; and says who else writes it now, in which case it is
 * theirs and cannot be touched.
 * @param live - The live list, or null where there is none.
 * @param key - What names this text to the others (« title », « note »,
 *   « name:… »).
 * @param text - What I am typing.
 * @param active - Whether I am in the field.
 * @param field - The field, for the place of the caret.
 * @returns Who else writes it, and how to say again where I am.
 */
export const useLiveWriting = (
  live: ListLive | null,
  key: () => string,
  text: Ref<string>,
  active: Ref<boolean>,
  field: () => Field = () => null,
) => {
  const say = () => {
    if (!live || !active.value) return;
    live.writing(
      key(),
      text.value,
      field()?.selectionStart ?? text.value.length,
    );
  };
  watch(active, (on) => {
    if (!live) return;
    if (on) say();
    else live.idle();
  });
  watch(text, say);
  onBeforeUnmount(() => {
    if (active.value) live?.idle();
  });
  return { lockedBy: computed(() => live?.writingBy(key()) ?? null), say };
};
