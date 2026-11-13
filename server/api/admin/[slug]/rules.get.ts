import { requireGroupAccess } from '#server/http/auth';
import { unwrap } from '#server/http/errors';
import { mergeRules } from '#server/utils/rules';

export default defineEventHandler(async (event) => {
  const { group } = await requireGroupAccess(event);
  return { rules: unwrap(mergeRules(group.rules)) };
});
