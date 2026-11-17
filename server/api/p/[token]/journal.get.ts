import { loadJournal } from '#server/database/journal';
import { requirePersonalLink } from '#server/http/personal';
import { localeOf } from '#shared/i18n';

// The group's public journal, for anyone holding a valid link (README
// 8.5), written in the reader's preferred language; `me` is who reads it,
// for the filter « Moi » and the lines told to them.
export default defineEventHandler(async (event) => {
  const { db, group, edition, person } = await requirePersonalLink(event);
  const language = localeOf(person.language);
  return {
    ...(await loadJournal(db, group.id, language, person.id)),
    currentEditionId: edition.id,
    me: person.id,
    language,
  };
});
