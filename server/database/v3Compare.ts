import { mergeRules } from '../utils/rules';

// Compares a database of the V2 with the same one migrated to the V3
// (ticket 101): the same groups, draws and lists, in their new shape.
// Used by migrations.test.ts and by `pnpm v3:compare` on a copy of the
// production database. Returns what differs, nothing when all is there.

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
  'gift_lists',
  'gift_list_ideas',
  'gift_claims',
];

const countOf = (query: Query, table: string) =>
  Number(query(`SELECT count(*) AS n FROM \`${table}\``)[0]?.n ?? 0);

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
  return before('SELECT * FROM groups').flatMap((group) => {
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
};

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

const listsProblems = (before: Query, after: Query): string[] => {
  const links = after('SELECT * FROM gift_list_parties');
  const linked = before(
    'SELECT DISTINCT p.gift_list_id AS list_id, e.group_id, l.share_token FROM participations p JOIN editions e ON e.id = p.edition_id JOIN gift_lists l ON l.id = p.gift_list_id',
  );
  const linkedIds = new Set(linked.map((row) => String(row.list_id)));
  const expected = [
    ...linked.map((row) => ({
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
  return [
    ...expected
      .filter((e) => !found.has(`${e.list}:${e.party}:${e.visibility}`))
      .map(
        (e) =>
          `liste ${e.list} : absente de la fête ${e.party} (${e.visibility})`,
      ),
    ...(links.length === expected.length
      ? []
      : [
          `listes : ${links.length} rattachements, ${expected.length} attendus`,
        ]),
  ];
};

/**
 * What differs between a V2 database and its V3 migration.
 * @param before - Reads the database before the migration.
 * @param after - Reads the same database after it.
 * @returns One line per difference; empty when everything is there.
 */
export const compareV3 = (before: Query, after: Query): string[] => [
  ...groupsProblems(before, after),
  ...organisersProblems(before, after),
  ...editionsProblems(before, after),
  ...keptProblems(before, after),
  ...listsProblems(before, after),
];
