import { requireGroupAccess } from '../../../http/auth.js';
import { unwrap } from '../../../http/errors.js';
import { mergeRules } from '../../../utils/rules.js';

export default defineEventHandler(async (event) => {
  const { group } = await requireGroupAccess(event);
  return { rules: unwrap(mergeRules(group.rules)) };
});
