import { z } from 'zod';
import { avatarColorSchema, avatarEmojiSchema } from './avatars';
import { isPlainName, WEB_ADDRESS_REFUSED } from './limits';
import { emailSchema } from './people';
import {
  HINT_ANSWERS,
  HINT_QUESTIONS,
  HINT_TEXTS,
  HINT_TEXT_MAX,
} from '#shared/utils/hints';
import {
  IDEA_TEXT_MAX,
  LIST_NOTE_MAX,
  LIST_TITLE_MAX,
  MEMBER_FIELD_MAX,
  MEMBER_NAME_MAX,
  listIconSchema,
} from './lists';

// What the routes of the gift lists accept (README 22.19).

const isoDay = z.iso.date();
/**
 * A name printed in emails and on pages others open: a first name, the
 * name of a list. One that carries a web address is refused (lot 38 A).
 */
const plainName = (max: number) =>
  z.string().trim().max(max).refine(isPlainName, WEB_ADDRESS_REFUSED);

export const newMemberSchema = z.object({
  firstName: plainName(MEMBER_NAME_MAX).min(1),
  avatar: z.object({ emoji: avatarEmojiSchema, color: avatarColorSchema }),
});

export const memberPatchSchema = z
  .object({
    firstName: plainName(MEMBER_NAME_MAX).min(1),
    avatar: z.object({ emoji: avatarEmojiSchema, color: avatarColorSchema }),
    birthDate: isoDay.nullable(),
    clothingSize: z.string().trim().max(MEMBER_FIELD_MAX).nullable(),
    shoeSize: z.string().trim().max(MEMBER_FIELD_MAX).nullable(),
    /** The address of their own account; null no longer links them. */
    email: emailSchema.nullable(),
    answers: z.partialRecord(
      z.enum(HINT_QUESTIONS),
      z.enum(HINT_ANSWERS).nullable(),
    ),
    texts: z.partialRecord(
      z.enum(HINT_TEXTS),
      z.string().trim().max(HINT_TEXT_MAX).nullable(),
    ),
  })
  .partial();

export const listPatchSchema = z
  .object({
    title: plainName(LIST_TITLE_MAX),
    eventDate: isoDay.nullable(),
    /** The word for the family; null or empty erases it. */
    note: z.string().trim().max(LIST_NOTE_MAX).nullable(),
    icon: listIconSchema,
  })
  .partial()
  .refine((body) => Object.keys(body).length > 0, 'nothing to update');

export const newListSchema = z.object({
  icon: listIconSchema,
  title: plainName(LIST_TITLE_MAX).default(''),
  eventDate: isoDay.nullable().default(null),
  /** « Reprendre cette liste »: the list to start from (lot 27). */
  from: z.string().min(1).max(40).optional(),
});

const ideaTextSchema = z.string().trim().max(IDEA_TEXT_MAX);
const urlSchema = z
  .url({ protocol: /^https?$/ })
  .max(2000)
  .nullable();

export const newIdeaSchema = z.object({
  listPersonId: z.string().min(1),
  text: ideaTextSchema,
  url: urlSchema.default(null),
  after: z.string().nullable().default(null),
});

export const ideaPatchSchema = z
  .object({ text: ideaTextSchema, url: urlSchema })
  .partial()
  .refine((body) => Object.keys(body).length > 0, 'nothing to update');

export const addPersonSchema = z.union([
  z.object({ memberId: z.string().min(1) }),
  z.object({ newMember: newMemberSchema }),
]);
