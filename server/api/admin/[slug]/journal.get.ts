import { z } from 'zod';
import { requireGroupAccess } from '#server/http/auth';
import { validatedQuery } from '#server/http/validate';
import { listEditions } from '#server/database/editions';
import { loadJournal } from '#server/database/journal';
import { currentEdition } from '#server/utils/editions';
import { languageSchema } from '#server/utils/people';
import { localeFromHeader } from '#shared/i18n';

// The group's public journal for its guardian (README section 9): the
// same sentences every participant reads, nothing more, in the language
// the guardian uses the admin in.
const querySchema = z.object({ locale: languageSchema.optional() });

export default defineEventHandler(async (event) => {
  const { group, db } = await requireGroupAccess(event);
  const { locale } = await validatedQuery(event, querySchema);
  const language =
    locale ?? localeFromHeader(getRequestHeader(event, 'accept-language'));
  const [journal, editions] = await Promise.all([
    loadJournal(db, group.id, language),
    listEditions(db, group.id),
  ]);
  return {
    ...journal,
    currentEditionId: currentEdition(editions)?.id ?? null,
    language,
  };
});
