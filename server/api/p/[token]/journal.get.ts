import { loadJournal } from '#server/database/journal';
import { keyPeople } from '#server/utils/audit';
import { requirePersonalLink } from '#server/http/personal';
import { localeOf } from '#shared/i18n';

// The group's public journal, for anyone holding a valid link (README
// 8.5), written in the reader's preferred language; `me` is who reads it,
// for the filter « Moi » and the lines told to them. People are known by
// keys of this answer only, never by their ids.
export default defineEventHandler(async (event) => {
  const { db, group, edition, person } = await requirePersonalLink(event);
  const language = localeOf(person.language);
  const journal = await loadJournal(db, group.id, language, person.id);
  return {
    ...journal,
    ...keyPeople({ ...journal, me: person.id }),
    currentEditionId: edition.id,
    language,
  };
});
