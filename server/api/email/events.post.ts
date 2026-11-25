import { useDb } from '#server/database/client';
import { blockAddress } from '#server/database/emailBlocks';
import { nowIso, secretsOf } from '#server/http/context';
import {
  blocksOf,
  verifyProviderEvent,
  type ProviderEvent,
} from '#server/utils/providerEvents';
import { emailPrint } from '#server/utils/stopEmail';

// The webhook of the email provider (ticket 130): a bounce of an address
// that does not exist, or a complaint, blocks the address at once. Only
// an event the provider signed counts; any other gets 401. Nothing of
// the event is kept but the print of the address.
export default defineEventHandler(async (event) => {
  const secrets = secretsOf(event);
  const body = (await readRawBody(event)) ?? '';
  const signed = await verifyProviderEvent(
    {
      id: getRequestHeader(event, 'svix-id'),
      timestamp: getRequestHeader(event, 'svix-timestamp'),
      signature: getRequestHeader(event, 'svix-signature'),
      body,
    },
    secrets.resendWebhookSecret,
    Math.floor(Date.now() / 1000),
  );
  if (!signed) {
    throw createError({ statusCode: 401, statusMessage: 'unauthorized' });
  }
  const parsed = (() => {
    try {
      return JSON.parse(body) as ProviderEvent;
    } catch {
      return null;
    }
  })();
  if (!parsed) {
    throw createError({ statusCode: 400, statusMessage: 'invalid_body' });
  }
  const blocks = blocksOf(parsed);
  if (blocks) {
    const db = useDb(event);
    const now = nowIso();
    await Promise.all(
      blocks.emails.map(async (email) =>
        blockAddress(
          db,
          await emailPrint(email, secrets.dataKey),
          blocks.cause,
          now,
        ),
      ),
    );
  }
  return { ok: true };
});
