import { mergeRules } from '../utils/rules';

// Compares a database of the V2 with the same one migrated to the V3
// (tickets 101 and 113): as many events as groups, each Secret Santa with
// its participants and their envelopes, each list with its ideas and its
// ticks, the gift hints become a list kept for the one who drew them, a
// list shared by link still public. Used by migrations.test.ts, `pnpm
// v3:essai` and `pnpm v3:compare` on a copy of the production database.
// Returns what differs, nothing when all is there. It never reads who drew
// whom: an envelope is compared as it is stored, sealed.

type Row = Record<string, unknown>;
/** Runs a read on one database and returns its rows. */
export type Query = (sql: string) => Row[];

const byId = (rows: Row[]) => new Map(rows.map((row) => [String(row.id), row]));

const json = (value: unknown) =>
  value === null || value === undefined ? null : JSON.parse(String(value));

const same = (a: unknown, b: unknown) =>
  JSON.stringify(a) === JSON.stringify(b);

/** Tables whose rows only got a column renamed: same ids, same count. */
const KEPT = [
  'manual_exclusions',
  'participations',
  'assignments',
  'wishes',
  'gift_portraits',
  'hint_requests',
  'guesses',
  'draw_answers',
  'audit_log',
  'accounts',
  'gift_claims',
  'gift_list_givers',
  'gift_giver_claims',
];

const countOf = (query: Query, table: string) =>
  Number(query(`SELECT count(*) AS n FROM \`${table}\``)[0]?.n ?? 0);

const quoted = (value: unknown) => `'${String(value).replaceAll("'", "''")}'`;

/** Whether a table has a column (a migration applied or not yet). */
const hasColumn = (query: Query, table: string, column: string) =>
  query(`SELECT name FROM pragma_table_info('${table}')`).some(
    (row) => row.name === column,
  );

/** The rows of a query, each as one line of its columns, sorted. */
const lines = (rows: Row[]) =>
  rows.map((row) => JSON.stringify(Object.values(row))).toSorted();

/**
 * Where the invitation link of a group went: still on its party (up to
 * 0039), else on one of its Secret Santa being prepared, or closed when it
 * has none (ticket 116).
 */
const linkProblems = (group: Row, party: Row, after: Query): string[] => {
  if ('invite_code' in party) {
    return party.invite_code === group.invite_code
      ? []
      : [`fête ${group.id} : invite_code a changé`];
  }
  if (group.invite_code === null || group.invite_code === undefined) return [];
  const santas = after(
    `SELECT party_id, status, invite_code FROM secret_santas WHERE party_id = '${String(group.id).replaceAll("'", "''")}'`,
  );
  const kept = santas.some((santa) => santa.invite_code === group.invite_code);
  const preparing = santas.some((santa) => santa.status === 'preparing');
  return kept || !preparing ? [] : [`fête ${group.id} : lien perdu`];
};

const groupsProblems = (before: Query, after: Query): string[] => {
  const parties = byId(after('SELECT * FROM parties'));
  const groups = countOf(before, 'groups');
  const events = Number(
    after('SELECT count(*) AS n FROM parties WHERE from_list = 0')[0]?.n ?? 0,
  );
  return [
    ...(events === groups
      ? []
      : [`${groups} groupes avant, ${events} événements de groupe après`]),
    ...groupsKept(before, parties, after),
  ];
};

const groupsKept = (
  before: Query,
  parties: Map<string, Row>,
  after: Query,
): string[] =>
  before('SELECT * FROM groups').flatMap((group) => {
    const party = parties.get(String(group.id));
    if (!party) return [`groupe ${group.id} : aucune fête`];
    return [
      ...(['name', 'slug', 'created_by'] as const)
        .filter((key) => party[key] !== group[key])
        .map((key) => `fête ${group.id} : ${key} a changé`),
      ...linkProblems(group, party, after),
      ...(party.category === 'christmas' && party.from_list === 0
        ? []
        : [`fête ${group.id} : pas une fête de Noël`]),
    ];
  });

const organisersProblems = (before: Query, after: Query): string[] => {
  const pairs = (rows: Row[], key: string) =>
    rows.map((row) => `${row[key]}:${row.account_id}`).toSorted();
  const old = pairs(before('SELECT * FROM group_members'), 'group_id');
  const kept = new Set(
    pairs(after('SELECT * FROM party_organisers'), 'party_id'),
  );
  return old
    .filter((pair) => !kept.has(pair))
    .map((pair) => `organisateur ${pair} : perdu`);
};

const editionsProblems = (before: Query, after: Query): string[] => {
  const santas = byId(
    after(
      'SELECT s.*, y.year AS y_year, y.party_id AS y_party FROM secret_santas s JOIN party_years y ON y.id = s.year_id',
    ),
  );
  return before(
    'SELECT e.*, g.rules AS group_rules FROM editions e JOIN groups g ON g.id = e.group_id',
  ).flatMap((edition) => {
    const santa = santas.get(String(edition.id));
    if (!santa) return [`édition ${edition.id} : aucun Secret Santa`];
    return [
      ...(santa.party_id === edition.group_id &&
      santa.y_party === edition.group_id
        ? []
        : [`Secret Santa ${edition.id} : pas dans sa fête`]),
      ...(santa.y_year === edition.year
        ? []
        : [`Secret Santa ${edition.id} : pas dans son année`]),
      ...(
        ['label', 'status', 'drawn_at', 'closed_at', 'rules_snapshot'] as const
      )
        .filter((key) => santa[key] !== edition[key])
        .map((key) => `Secret Santa ${edition.id} : ${key} a changé`),
      ...(same(
        mergeRules(json(santa.rules)),
        mergeRules(json(edition.group_rules), json(edition.rules_override)),
      )
        ? []
        : [`Secret Santa ${edition.id} : ses réglages ont changé`]),
    ];
  });
};

/**
 * Each Secret Santa keeps its participants, their links and whether they
 * opened their envelope, and its envelopes, sealed as they were.
 */
const envelopesProblems = (before: Query, after: Query): string[] => {
  const participants = (query: Query, column: string) =>
    lines(
      query(
        `SELECT ${column} AS santa, id, person_id, token_hash, first_viewed_at FROM participations`,
      ),
    );
  const envelopes = (query: Query, column: string) =>
    lines(
      query(
        `SELECT ${column} AS santa, id, giver_person_id, receiver_enc, receiver_iv FROM assignments`,
      ),
    );
  const missing = (old: string[], now: string[], what: string) => {
    const kept = new Set(now);
    return old
      .filter((line) => !kept.has(line))
      .map((line) => `${what} ${String(JSON.parse(line)[1])} : a changé`);
  };
  return [
    ...missing(
      participants(before, 'edition_id'),
      participants(after, 'secret_santa_id'),
      'participant',
    ),
    ...missing(
      envelopes(before, 'edition_id'),
      envelopes(after, 'secret_santa_id'),
      'enveloppe',
    ),
  ];
};

/** Everyone who took part in a Secret Santa came in by it (ticket 117). */
const entriesProblems = (before: Query, after: Query): string[] => {
  const tables = after(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'member_entries'",
  );
  if (tables.length === 0) return [];
  const entered = new Set(
    after(
      'SELECT person_id, secret_santa_id FROM member_entries WHERE secret_santa_id IS NOT NULL',
    ).map((row) => `${row.person_id}:${row.secret_santa_id}`),
  );
  return before('SELECT id, person_id, edition_id FROM participations')
    .filter((row) => !entered.has(`${row.person_id}:${row.edition_id}`))
    .map((row) => `participant ${row.id} : pas membre par son Secret Santa`);
};

const keptProblems = (before: Query, after: Query): string[] => {
  const members = Number(
    after(
      'SELECT count(*) AS n FROM persons p JOIN parties f ON f.id = p.party_id WHERE f.from_list = 0',
    )[0]?.n ?? 0,
  );
  const persons = countOf(before, 'persons');
  return [
    ...KEPT.flatMap((table) => {
      const old = countOf(before, table);
      const now = countOf(after, table);
      return old === now
        ? []
        : [`${table} : ${old} lignes avant, ${now} après`];
    }),
    ...(members === persons
      ? []
      : [`persons : ${persons} membres avant, ${members} après`]),
  ];
};

/**
 * The participations whose gift hints become a list (0038): a person with
 * an account, ideas left, a Secret Santa not closed, no list linked.
 */
const hintsOf = (before: Query) =>
  before(
    `SELECT p.id, e.group_id, a.id AS account_id FROM participations p
     JOIN persons ps ON ps.id = p.person_id
     JOIN accounts a ON a.email = lower(ps.email)
     JOIN editions e ON e.id = p.edition_id
     WHERE e.status != 'closed' AND p.gift_list_id IS NULL
       AND p.id IN (SELECT participation_id FROM wishes)`,
  );

/**
 * Each list keeps its holders, its title, its ideas and its ticks; one
 * shared by its link keeps its link, still public.
 */
const listsKept = (before: Query, after: Query): string[] => {
  const now = byId(after('SELECT * FROM gift_lists'));
  const children = (query: Query, table: string, list: unknown) =>
    query(
      `SELECT id FROM ${table} WHERE list_id = ${quoted(list)} ORDER BY id`,
    ).map((row) => String(row.id));
  return before('SELECT * FROM gift_lists').flatMap((list) => {
    const kept = now.get(String(list.id));
    if (!kept) return [`liste ${list.id} : perdue`];
    return [
      ...(['account_id', 'title', 'shared_at'] as const)
        .filter((key) => kept[key] !== list[key])
        .map((key) => `liste ${list.id} : ${key} a changé`),
      ...(list.share_token === null || kept.share_token === list.share_token
        ? []
        : [`liste ${list.id} : son lien a changé`]),
      ...(
        [
          'gift_list_holders',
          'gift_list_ideas',
          'gift_claims',
          'gift_giver_claims',
        ] as const
      )
        .filter(
          (table) =>
            !same(
              children(before, table, list.id),
              children(after, table, list.id),
            ),
        )
        .map((table) => `liste ${list.id} : ${table} a changé`),
    ];
  });
};

/**
 * The gift hints of each participation became a list of its own, in the
 * draw's event, kept for the one who drew them, with the same ideas; the
 * lists the migration made are those and no other.
 */
const hintsProblems = (before: Query, after: Query): string[] => {
  const old = new Set(before('SELECT id FROM gift_lists').map((r) => r.id));
  const made = after('SELECT id FROM gift_lists')
    .map((row) => String(row.id))
    .filter((id) => !old.has(id));
  const hints = hintsOf(before);
  const moved = hints.flatMap((hint) => {
    const list = after(
      `SELECT gift_list_id AS id FROM participations WHERE id = ${quoted(hint.id)}`,
    )[0]?.id;
    if (!list) return [`pistes ${hint.id} : aucune liste`];
    const owner = after(
      `SELECT account_id FROM gift_lists WHERE id = ${quoted(list)}`,
    )[0]?.account_id;
    const shared = after(
      `SELECT visibility FROM gift_list_parties WHERE list_id = ${quoted(list)} AND party_id = ${quoted(hint.group_id)}`,
    );
    const texts = (query: Query, sql: string) =>
      query(sql).map((row) => [row.text, row.url ?? null]);
    return [
      ...(owner === hint.account_id
        ? []
        : [`pistes ${hint.id} : pas sa liste`]),
      ...(shared.length === 1 && shared[0]?.visibility === 'giver'
        ? []
        : [`pistes ${hint.id} : pas réservées à celui qui l'a tiré`]),
      ...(same(
        texts(
          before,
          `SELECT label AS text, url FROM wishes WHERE participation_id = ${quoted(hint.id)} ORDER BY position`,
        ),
        texts(
          after,
          `SELECT text, url FROM gift_list_ideas WHERE list_id = ${quoted(list)} ORDER BY position`,
        ),
      )
        ? []
        : [`pistes ${hint.id} : les idées ont changé`]),
    ];
  });
  return [
    ...moved,
    ...(made.length === hints.length
      ? []
      : [`listes : ${made.length} créées, ${hints.length} attendues (pistes)`]),
  ];
};

/**
 * Where each list is shared: a list linked to a draw in its event (to all
 * its members when shared by link, else to the one who drew its holder;
 * a list whose sharing was stopped becomes a draft once 0037 ran), any
 * other one in an event of its own; the hint lists come on top.
 */
const listsProblems = (before: Query, after: Query): string[] => {
  const drafts = hasColumn(after, 'gift_lists', 'party_id');
  const links = after('SELECT * FROM gift_list_parties');
  const linked = before(
    'SELECT DISTINCT p.gift_list_id AS list_id, e.group_id, l.share_token, l.shared_at FROM participations p JOIN editions e ON e.id = p.edition_id JOIN gift_lists l ON l.id = p.gift_list_id',
  );
  const linkedIds = new Set(linked.map((row) => String(row.list_id)));
  const expected = [
    ...linked
      .filter(
        (row) =>
          !(drafts && row.share_token !== null && row.shared_at === null),
      )
      .map((row) => ({
        list: String(row.list_id),
        party: String(row.group_id),
        visibility: row.share_token === null ? 'giver' : 'party',
      })),
    ...before('SELECT id FROM gift_lists')
      .filter((row) => !linkedIds.has(String(row.id)))
      .map((row) => ({
        list: String(row.id),
        party: String(row.id),
        visibility: 'party',
      })),
  ];
  const found = new Set(
    links.map((row) => `${row.list_id}:${row.party_id}:${row.visibility}`),
  );
  const total = expected.length + hintsOf(before).length;
  const homeless = drafts
    ? Number(
        after('SELECT count(*) AS n FROM gift_lists WHERE party_id IS NULL')[0]
          ?.n ?? 0,
      )
    : 0;
  return [
    ...expected
      .filter((e) => !found.has(`${e.list}:${e.party}:${e.visibility}`))
      .map(
        (e) =>
          `liste ${e.list} : absente de la fête ${e.party} (${e.visibility})`,
      ),
    ...(links.length === total
      ? []
      : [`listes : ${links.length} rattachements, ${total} attendus`]),
    ...(homeless === 0 ? [] : [`listes : ${homeless} sans événement`]),
  ];
};

/**
 * What differs between a V2 database and its V3 migration.
 * @param before - Reads the database before the migration.
 * @param after - Reads the same database after it.
 * @returns One line per difference; empty when everything is there.
 */
/**
 * The ideas keep their kind (ticket 152): after the migration, none has a
 * star, none is a title.
 */
const ideasPlain = (_before: Query, after: Query): string[] =>
  // Only once the migration of ticket 152 ran: the columns are there.
  after(
    "SELECT name FROM pragma_table_info('gift_list_ideas') WHERE name = 'stars'",
  ).length === 0
    ? []
    : after(
        'SELECT id FROM gift_list_ideas WHERE stars <> 0 OR is_title <> 0',
      ).map((row) => `idée ${row.id} : des étoiles ou un titre`);

export const compareV3 = (before: Query, after: Query): string[] => [
  ...groupsProblems(before, after),
  ...organisersProblems(before, after),
  ...editionsProblems(before, after),
  ...envelopesProblems(before, after),
  ...entriesProblems(before, after),
  ...keptProblems(before, after),
  ...listsKept(before, after),
  ...hintsProblems(before, after),
  ...listsProblems(before, after),
  ...ideasPlain(before, after),
];
