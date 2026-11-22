// `pnpm v3:mot`: the email of the day after the switch to the V3 (ticket
// 113), once, to the accounts that knew the V2 and have a Secret Santa or
// a list under way. Julien runs it; nothing sends it by itself. Steps in
// docs/travail/bascule-v3.md:
//   pnpm -s v3:mot --requete            prints the query of the recipients
//   pnpm v3:mot <recipients.json>       shows what would leave, sends nothing
//   pnpm v3:mot <recipients.json> --envoyer
//                                       sends, with NUXT_RESEND_API_KEY
// `<recipients.json>` is the output of `wrangler d1 execute --remote
// --json` for the query. Every address sent to is written to
// `<recipients.json>.envoyes`: run again, it never sends twice. It never
// prints an address.
import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import {
  buildSwitchEmail,
  switchRecipients,
  type SwitchRecipient,
} from '../server/utils/switchEmail.ts';

const APP_URL = 'https://under-the-tree.party/';
const FROM = 'Under the Tree <gardien@under-the-tree.party>';
const BATCH = 100;

// Accounts created before the first migration of the V3 was applied, not
// disabled, with a Secret Santa not closed (taking part by their address,
// or organising it) or a list they hold whose day has not passed; and
// whether they held a list shared by its link before the switch.
const QUERY = `WITH switch AS (
  SELECT replace(applied_at, ' ', 'T') AS at FROM d1_migrations WHERE name = '0034_v3_parties.sql'
), held AS (
  SELECT l.id, l.account_id, l.shared_at, l.event_date FROM gift_lists l
  UNION
  SELECT l.id, h.account_id, l.shared_at, l.event_date FROM gift_lists l JOIN gift_list_holders h ON h.list_id = l.id
)
SELECT a.email, a.language,
  EXISTS (SELECT 1 FROM held WHERE held.account_id = a.id AND held.shared_at IS NOT NULL AND held.shared_at < (SELECT at FROM switch)) AS with_link
FROM accounts a
WHERE a.disabled_at IS NULL AND a.created_at < (SELECT at FROM switch)
  AND (
    EXISTS (SELECT 1 FROM persons p JOIN participations pa ON pa.person_id = p.id JOIN secret_santas s ON s.id = pa.secret_santa_id WHERE lower(p.email) = a.email AND s.status <> 'closed')
    OR EXISTS (SELECT 1 FROM party_organisers o JOIN secret_santas s ON s.party_id = o.party_id WHERE o.account_id = a.id AND s.status <> 'closed')
    OR EXISTS (SELECT 1 FROM held WHERE held.account_id = a.id AND (held.event_date IS NULL OR held.event_date >= date('now')))
  )
ORDER BY a.email;`;

const args = process.argv.slice(2);
if (args.includes('--requete')) {
  console.log(QUERY.replaceAll('\n', ' '));
  process.exit(0);
}
const send = args.includes('--envoyer');
const [file] = args.filter((arg) => !arg.startsWith('--'));
if (!file) {
  console.error(
    'Usage : pnpm -s v3:mot --requete | pnpm v3:mot <destinataires.json> [--envoyer]',
  );
  process.exit(2);
}
const journal = `${file}.envoyes`;
const sent = new Set(
  existsSync(journal)
    ? readFileSync(journal, 'utf8').split('\n').filter(Boolean)
    : [],
);
const recipients = switchRecipients(
  JSON.parse(readFileSync(file, 'utf8')),
  sent,
);

const variants = recipients.reduce<Record<string, number>>(
  (counts, { locale, withLink }) => {
    const name = `${locale}${withLink ? ' + lien' : ''}`;
    return { ...counts, [name]: (counts[name] ?? 0) + 1 };
  },
  {},
);
console.log(
  `${recipients.length} à envoyer (${sent.size} déjà envoyés) : ${
    Object.entries(variants)
      .map(([name, count]) => `${count} ${name}`)
      .join(', ') || 'personne'
  }.`,
);

if (!send) {
  Object.keys(variants).forEach((name) => {
    const [locale, link] = [name.slice(0, 2), name.endsWith('lien')];
    const email = buildSwitchEmail(
      APP_URL,
      locale as SwitchRecipient['locale'],
      link,
    );
    console.log(`\n--- ${name} ---\nObjet : ${email.subject}\n\n${email.text}`);
  });
  console.log('\nRien n’est parti. Pour envoyer : --envoyer.');
  process.exit(0);
}

const key = process.env.NUXT_RESEND_API_KEY;
if (!key) {
  console.error('NUXT_RESEND_API_KEY manque : rien n’est parti.');
  process.exit(2);
}

const batches = Array.from(
  { length: Math.ceil(recipients.length / BATCH) },
  (_, index) => recipients.slice(index * BATCH, (index + 1) * BATCH),
);
await batches.reduce<Promise<void>>(
  (done, batch, index) =>
    done.then(async () => {
      const response = await fetch('https://api.resend.com/emails/batch', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${key}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify(
          batch.map(({ email, locale, withLink }) => {
            const { subject, text, html } = buildSwitchEmail(
              APP_URL,
              locale,
              withLink,
            );
            return { from: FROM, to: [email], subject, text, html };
          }),
        ),
      });
      if (!response.ok) {
        console.error(
          `Lot ${index + 1} refusé (${response.status}) : relance la commande, ce qui est parti ne repart pas.`,
        );
        process.exit(1);
      }
      appendFileSync(journal, batch.map(({ email }) => `${email}\n`).join(''));
      console.log(
        `Lot ${index + 1}/${batches.length} : ${batch.length} envoyés.`,
      );
      // Resend takes two calls a second.
      await new Promise((resolve) => setTimeout(resolve, 600));
    }),
  Promise.resolve(),
);
console.log(
  `\n✓ Envoyé. Supprime ${file} et ${journal} : ce sont des adresses.`,
);
