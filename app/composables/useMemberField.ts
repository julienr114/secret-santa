import type { MemberView } from '#server/http/lists';
import { useMemberQuery } from '~/composables/queries/useLists';

/**
 * Fills the field of a page of one of my people (Correction 27) from
 * what is saved, once: what is being chosen is not put back when the
 * person is read again.
 * @param fill - Puts the saved value in the field.
 */
export const useMemberField = (fill: (member: MemberView) => void) => {
  const route = useRoute();
  const query = useMemberQuery(() => String(route.params.id));
  const filled = ref(false);
  // Once the page is in the browser: filled while the server writes the
  // page, the field would differ from what the browser first draws, and
  // a ticked size or a disabled button would keep the look of the server.
  onMounted(() =>
    watch(
      () => query.data.value?.member,
      (member) => {
        if (!member || filled.value) return;
        filled.value = true;
        fill(member);
      },
      { immediate: true },
    ),
  );
};
