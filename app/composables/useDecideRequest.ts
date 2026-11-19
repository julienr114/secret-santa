import { useDecideRequestMutation } from '~/composables/queries/useAdmin';

/**
 * Answers requests for a group, from the administration's card or from a
 * request's sheet: a toast says what was decided, and the button pressed
 * shows its wheel while the answer is on its way.
 * @returns `decide`, and `deciding` for one request and one answer.
 */
export const useDecideRequest = () => {
  const mutation = useDecideRequestMutation();
  const { t } = useT();
  const toast = useMessages();
  const errorMessage = useErrorMessage();
  /**
   * Accepts or refuses a request.
   * @param id - The request.
   * @param approve - True to accept it.
   * @param onDone - What to do once it is decided, like closing a sheet.
   * @param note - A word for the asker, added to the email.
   * @returns Nothing: the toast reports.
   */
  const decide = (
    id: string,
    approve: boolean,
    onDone?: () => void,
    note?: string,
  ) =>
    mutation.mutate(
      { id, approve, note },
      {
        onSuccess: () => {
          onDone?.();
          toast.done(
            approve ? t('auth.admin.approved') : t('auth.admin.refused'),
          );
        },
        onError: (error) => toast.failed(errorMessage(error)),
      },
    );
  /**
   * Whether an answer to a request is on its way.
   * @param id - The request.
   * @param approve - The answer, or either when left out.
   * @returns True while it is sent.
   */
  const deciding = (id: string, approve?: boolean) =>
    mutation.isPending.value &&
    mutation.variables.value?.id === id &&
    (approve === undefined || mutation.variables.value.approve === approve);
  return { decide, deciding };
};
