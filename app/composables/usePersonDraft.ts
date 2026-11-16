import { z } from 'zod';
import type { Avatar } from '#server/utils/avatars';
import { DEFAULT_LOCALE, type Locale } from '#shared/i18n';

/** What a person's screen edits before saving. */
export type PersonDraft = {
  firstName: string;
  lastName: string;
  email: string;
  language: Locale;
  avatar: Avatar;
};

/**
 * A person being written on the « Nouvelle personne » or person screen:
 * the fields, their errors once a save was tried, and the value to send.
 * @param initial - The person as saved, or the defaults of a new one.
 * @returns The draft, its errors, `check` before saving and the value.
 */
export const usePersonDraft = (
  initial: Partial<Omit<PersonDraft, 'avatar'>> & { avatar: Avatar },
) => {
  const { t } = useT();
  const blank = (): PersonDraft => ({
    firstName: initial.firstName ?? '',
    lastName: initial.lastName ?? '',
    email: initial.email ?? '',
    language: initial.language ?? DEFAULT_LOCALE,
    avatar: initial.avatar,
  });
  const draft = reactive<PersonDraft>(blank());
  const tried = ref(false);
  const errors = computed(() => {
    if (!tried.value) return {};
    const email = draft.email.trim();
    return {
      firstName: draft.firstName.trim()
        ? undefined
        : t('adminGroup.personForm.firstNameRequired'),
      email:
        email === '' || z.email().safeParse(email).success
          ? undefined
          : t('adminGroup.personForm.emailInvalid'),
    };
  });
  /**
   * Shows the errors, if any.
   * @returns True when the draft can be saved.
   */
  const check = () => {
    tried.value = true;
    return !errors.value.firstName && !errors.value.email;
  };
  const value = computed(() => ({
    firstName: draft.firstName.trim(),
    lastName: draft.lastName.trim() || null,
    email: draft.email.trim().toLowerCase() || null,
    language: draft.language,
    avatarEmoji: draft.avatar.emoji,
    avatarColor: draft.avatar.color,
  }));
  /**
   * Starts again from an empty draft, with a new icon.
   * @param avatar - The new person's icon.
   * @returns Nothing.
   */
  const reset = (avatar: Avatar) => {
    Object.assign(draft, { ...blank(), firstName: '', email: '', avatar });
    tried.value = false;
  };
  return { draft, errors, check, value, reset };
};
