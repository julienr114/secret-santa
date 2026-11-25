import { z } from 'zod';
import { useDb } from '#server/database/client';
import {
  findAccountByEmail,
  latestLoginCode,
  openSessionFor,
  tryLoginCode,
  useLoginCode,
} from '#server/database/accounts';
import { countUp } from '#server/database/counters';
import { organizedGroupCount } from '#server/database/groups';
import { nowIso, secretsOf } from '#server/http/context';
import { knownDeviceOf } from '#server/http/device';
import { accountEmailSchema } from '#server/utils/accounts';
import { roleOf } from '#server/utils/auth';
import { codePrint, codeState } from '#server/utils/loginCode';

// The six digits of the installed app (ticket 123, ConnexionCode): the
// latest code of the address, on the device that asked, within 15
// minutes, once; each try counts, and the sixth is refused even right.
// A wrong code, an unknown address, another device: the same refusal.
const bodySchema = z.object({
  email: accountEmailSchema,
  code: z.string().regex(/^\d{6}$/),
});

export default defineEventHandler(async (event) => {
  const db = useDb(event);
  const now = nowIso();
  const refuse = async () => {
    await countUp(db, 'login_failed', now.slice(0, 10));
    return createError({
      statusCode: 401,
      statusMessage: 'login_code_invalid',
    });
  };
  const parsed = bodySchema.safeParse(await readBody(event).catch(() => null));
  if (!parsed.success) throw await refuse();
  const account = await findAccountByEmail(db, parsed.data.email);
  if (!account || account.disabledAt) throw await refuse();
  const row = await latestLoginCode(db, account.id);
  if (!row || codeState(row, now) !== 'open') throw await refuse();
  // Counted before comparing: two tries at once never both pass.
  if (!(await tryLoginCode(db, row.id))) throw await refuse();
  const device = await knownDeviceOf(event);
  const matches =
    device !== null &&
    (await codePrint(parsed.data.code, device, secretsOf(event).dataKey)) ===
      row.codePrint;
  if (!matches || !(await useLoginCode(db, row.id, now))) {
    throw await refuse();
  }
  const sessionId = await openSessionFor(db, {
    accountId: account.id,
    userAgent: getRequestHeader(event, 'user-agent') ?? null,
    now,
  });
  const user = {
    role: roleOf({
      isSuperAdmin: account.isSuperAdmin,
      groupCount: await organizedGroupCount(db, account.id),
    }),
    accountId: account.id,
    sessionId,
  };
  await setUserSession(event, { user, loggedInAt: now });
  setResponseHeader(event, 'Cache-Control', 'no-store');
  return { user };
});
