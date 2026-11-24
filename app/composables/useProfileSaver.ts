import type { Locale } from '#shared/i18n';
import type { Avatar } from '#server/utils/avatars';
import {
  useAccountQuery,
  useSaveProfileMutation,
  type ProfileBody,
} from '~/composables/queries/useAuth';

/** One change of the profile, as a row makes it. */
type ProfilePatch = Partial<{
  firstName: string;
  lastName: string | null;
  language: Locale;
  avatar: Avatar;
}>;
/** The parts of the profile a row shows. */
type ProfileField = keyof ProfilePatch;

/**
 * What the server takes for a change: the icon in its two parts.
 * @param patch - The change.
 * @returns The body to send.
 */
const bodyOf = ({ avatar, ...rest }: ProfilePatch): ProfileBody => ({
  ...rest,
  ...(avatar ? { avatarEmoji: avatar.emoji, avatarColor: avatar.color } : {}),
});

/**
 * The account and its profile, each change saved on its own as soon as
 * it is chosen, like the settings (README 23.3): the new value shows at
 * once, the row says it is saving, and an error puts the old value back
 * with a toast.
 * @returns The account, the profile as shown, `save`, `saving`, and
 * `commit` for a row written in place.
 */
export const useProfileSaver = () => {
  const account = useAccountQuery();
  const update = useSaveProfileMutation();
  const toast = useMessages();
  const errorMessage = useErrorMessage();
  /** Values chosen and not yet confirmed by the server. */
  const pending = ref<ProfilePatch>({});
  const shown = computed(() => ({ ...account.data.value, ...pending.value }));
  /**
   * Saves one change, shown at once.
   * @param patch - The fields that change.
   * @returns Nothing: errors are told in a toast.
   */
  const save = (patch: ProfilePatch) => {
    pending.value = { ...pending.value, ...patch };
    const fields = Object.keys(patch);
    /** Forgets the values of this change, kept or not. */
    const settle = () => {
      pending.value = Object.fromEntries(
        Object.entries(pending.value).filter(([key]) => !fields.includes(key)),
      );
    };
    update.mutate(bodyOf(patch), {
      onSettled: settle,
      onError: (error) => toast.failed(errorMessage(error)),
    });
  };
  /**
   * Whether a field is being saved.
   * @param field - The field.
   * @returns True while its change is on its way.
   */
  const saving = (field: ProfileField) => field in pending.value;
  /**
   * Saves one change written on its row (ticket 162): shown at once, a
   * failure handed back to the row, which says it under itself.
   * @param patch - The fields that change.
   * @returns Once the server answered.
   */
  const commit = async (patch: ProfilePatch) => {
    pending.value = { ...pending.value, ...patch };
    const fields = Object.keys(patch);
    try {
      await update.mutateAsync(bodyOf(patch));
    } finally {
      pending.value = Object.fromEntries(
        Object.entries(pending.value).filter(([key]) => !fields.includes(key)),
      );
    }
  };
  return { account, shown, save, saving, commit };
};
