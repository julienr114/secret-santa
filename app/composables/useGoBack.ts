/**
 * Going back like the browser does, to wherever the user came from (a
 * group may be opened from home, from every group or from an account).
 * When the page was opened directly, there is no such place: the given
 * page stands in for it.
 * @returns A function taking the fallback path.
 */
export const useGoBack = () => {
  const router = useRouter();
  return (fallback: string) => {
    const previous = import.meta.client ? window.history.state?.back : null;
    return previous ? router.back() : navigateTo(fallback);
  };
};
