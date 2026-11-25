import { and, asc, eq, exists, inArray, isNull } from 'drizzle-orm';
import type { Db } from './client';
import { accounts, news, pushSubscriptions } from './schema';
import { countUnseen, pushedUnseen } from './news';
import { newsSectionsOf } from './newsPage';
import { newId } from '#server/http/context';
import {
  deviceGone,
  encryptForDevice,
  pushMessageOf,
  vapidHeader,
  type DeviceKeys,
} from '#server/utils/webPush';
import { localeOf, translateKey } from '#shared/i18n';
import { newsText } from '#shared/utils/news';

// The notifications of the phone (ticket 124): a device subscribes and
// unsubscribes; what presses goes to the phones of the account at the
// next run of the scheduled task, each news once, marked before it goes.
// A device its push service no longer knows is forgotten.

/** The news one run sends to phones at most. */
const PUSHES_PER_RUN = 10;

/**
 * Keeps a device that asked for notifications (one row per device).
 * @param db - The database.
 * @param input - The account, the address of the device, its keys.
 * @param input.accountId - The account.
 * @param input.endpoint - Its address at its push service.
 * @param input.keys - Its keys.
 * @param now - Now (ISO).
 * @returns Once kept.
 */
export const subscribeDevice = async (
  db: Db,
  input: { accountId: string; endpoint: string; keys: DeviceKeys },
  now: string,
): Promise<void> => {
  await db
    .insert(pushSubscriptions)
    .values({
      id: newId(),
      accountId: input.accountId,
      endpoint: input.endpoint,
      p256dh: input.keys.p256dh,
      auth: input.keys.auth,
      createdAt: now,
    })
    .onConflictDoUpdate({
      target: pushSubscriptions.endpoint,
      set: {
        accountId: input.accountId,
        p256dh: input.keys.p256dh,
        auth: input.keys.auth,
      },
    });
};

/**
 * Forgets a device of an account.
 * @param db - The database.
 * @param accountId - The account.
 * @param endpoint - The address of the device.
 * @returns Once forgotten.
 */
export const unsubscribeDevice = async (
  db: Db,
  accountId: string,
  endpoint: string,
): Promise<void> => {
  await db
    .delete(pushSubscriptions)
    .where(
      and(
        eq(pushSubscriptions.accountId, accountId),
        eq(pushSubscriptions.endpoint, endpoint),
      ),
    );
};

/** What sending needs: the keys of the app, and how a request leaves. */
export type PushTools = {
  dataKey: CryptoKey;
  now: string;
  vapid: { publicKey: string; privateKey: string; subject: string };
  /** Sends one request to a push service; its status. */
  post: (
    endpoint: string,
    headers: Record<string, string>,
    body: Uint8Array<ArrayBuffer>,
  ) => Promise<number>;
};

/**
 * Sends what presses to the phones (ticket 124): each news not seen yet,
 * not sent yet, of an account with a device, once.
 * @param db - The database.
 * @param tools - The keys, now, and how requests leave.
 * @returns How many notifications left.
 */
export const sendNewsPushes = async (
  db: Db,
  tools: PushTools,
): Promise<number> => {
  const waiting = await db
    .select({ news, account: accounts })
    .from(news)
    .innerJoin(accounts, eq(accounts.id, news.accountId))
    .where(
      and(
        eq(news.level, 'urgent'),
        isNull(news.seenAt),
        isNull(news.pushedAt),
        isNull(accounts.disabledAt),
        exists(
          db
            .select({ id: pushSubscriptions.id })
            .from(pushSubscriptions)
            .where(eq(pushSubscriptions.accountId, news.accountId)),
        ),
      ),
    )
    .orderBy(asc(news.updatedAt))
    .limit(PUSHES_PER_RUN);
  if (waiting.length === 0) return 0;
  const claimed = new Set(
    (
      await db
        .update(news)
        .set({ pushedAt: tools.now })
        .where(
          and(
            inArray(
              news.id,
              waiting.map(({ news: row }) => row.id),
            ),
            isNull(news.pushedAt),
          ),
        )
        .returning({ id: news.id })
    ).map((row) => row.id),
  );
  const rows = waiting.filter(({ news: row }) => claimed.has(row.id));
  const owners = [
    ...new Map(rows.map(({ account }) => [account.id, account])).values(),
  ];
  const [sections, devices, badges] = await Promise.all([
    newsSectionsOf(
      db,
      owners,
      rows.map(({ news: row }) => row),
      tools.dataKey,
      tools.now,
    ),
    db
      .select()
      .from(pushSubscriptions)
      .where(
        inArray(
          pushSubscriptions.accountId,
          owners.map((owner) => owner.id),
        ),
      ),
    Promise.all(
      owners.map(
        async (owner) =>
          [
            owner.id,
            {
              badge: await countUnseen(db, owner.id),
              waiting: await pushedUnseen(db, owner.id),
            },
          ] as const,
      ),
    ).then((pairs) => new Map(pairs)),
  ]);
  const sent = await Promise.all(
    rows.flatMap(({ news: row, account }) => {
      const section = sections
        .get(account.id)
        ?.find((one) => one.news.some((line) => line.id === row.id));
      const line = section?.news.find((one) => one.id === row.id);
      if (!section || !line) return [];
      const { key, params } = newsText(line);
      const counts = badges.get(account.id);
      const message = pushMessageOf(
        {
          id: row.id,
          words: translateKey(localeOf(account.language), key, params),
          place: section.title,
          to: line.to,
        },
        counts?.badge ?? 0,
        counts?.waiting ?? [row.id],
      );
      return devices
        .filter((device) => device.accountId === account.id)
        .map(async (device) => {
          const status = await tools
            .post(
              device.endpoint,
              {
                Authorization: await vapidHeader(
                  { endpoint: device.endpoint, ...tools.vapid },
                  Math.floor(Date.parse(tools.now) / 1000),
                ),
                'Content-Encoding': 'aes128gcm',
                'Content-Type': 'application/octet-stream',
                TTL: String(24 * 60 * 60),
                Urgency: 'high',
              },
              await encryptForDevice(JSON.stringify(message), {
                p256dh: device.p256dh,
                auth: device.auth,
              }),
            )
            .catch(() => 0);
          if (deviceGone(status)) {
            await db
              .delete(pushSubscriptions)
              .where(eq(pushSubscriptions.id, device.id));
          }
          return status >= 200 && status < 300 ? 1 : 0;
        });
    }),
  );
  return sent.reduce<number>((sum, one) => sum + one, 0);
};
