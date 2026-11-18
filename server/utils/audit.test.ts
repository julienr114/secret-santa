import { describe, it, expect } from 'vitest';
import {
  AUDIT_TYPES,
  auditEvent,
  describeEvent,
  journalEntries,
  keyPeople,
  journalSignal,
  unseenAlerts,
  sanitizeMeta,
  type Meta,
} from './audit';
import { failureOf, valueOf } from '~~/tests/helpers';

const deps = { id: () => 'evt-1', now: () => '2026-11-13T10:00:00.000Z' };

describe('auditEvent', () => {
  it('builds a row with injected id and date', () => {
    const result = auditEvent(
      {
        type: 'link_copied',
        groupId: 'g1',
        editionId: 'e1',
        personId: 'p1',
        actor: 'participant',
      },
      deps,
    );
    expect(result).toEqual({
      ok: true,
      value: {
        id: 'evt-1',
        type: 'link_copied',
        groupId: 'g1',
        editionId: 'e1',
        personId: 'p1',
        actor: 'participant',
        meta: null,
        createdAt: '2026-11-13T10:00:00.000Z',
      },
    });
  });

  it('rejects unknown types and actors', () => {
    expect(
      failureOf(
        auditEvent(
          { type: 'nope' as never, groupId: 'g1', actor: 'guardian' },
          deps,
        ),
      ).reason,
    ).toBe('invalid_audit_event');
    expect(
      auditEvent(
        { type: 'link_copied', groupId: 'g1', actor: 'hacker' as never },
        deps,
      ).ok,
    ).toBe(false);
  });

  it('never keeps a result or a secret in meta, at any depth', () => {
    const row = valueOf(
      auditEvent(
        {
          type: 'draw_done',
          groupId: 'g1',
          actor: 'guardian',
          meta: {
            count: 3,
            receiverId: 'p2',
            assignments: [{ giverId: 'a', receiverId: 'b' }],
            nested: {
              pinHash: 'x',
              token: 'y',
              keep: 1,
              deeper: { result: 'z', ok: true },
            },
          },
        },
        deps,
      ),
    );
    expect(row.meta).toEqual({
      count: 3,
      nested: { keep: 1, deeper: { ok: true } },
    });
    expect(JSON.stringify(row)).not.toMatch(/receiver|p2|assignment/);
  });

  it('sanitizes arrays too', () => {
    expect(sanitizeMeta([{ receiver: 1, a: 2 }, 'x', null])).toEqual([
      { a: 2 },
      'x',
      null,
    ]);
  });
});

describe('describeEvent', () => {
  const names = { p1: 'Léa', p2: 'Tom' };
  const ev = (
    type: string,
    meta: Meta = {},
    personId: string | null = 'p1',
  ) => ({ type, personId, meta });

  it('renders the README examples', () => {
    expect(
      describeEvent(ev('edition_created', { label: 'Noël 2026' }), { names }),
    ).toBe("L'édition Noël 2026 a été créée");
    expect(describeEvent(ev('participant_added'), { names })).toBe(
      'Léa est de la partie',
    );
    expect(
      describeEvent(
        ev('message_sent', { messageType: 'invitation', via: 'share' }),
        { names },
      ),
    ).toBe("L'organisateur a envoyé « Invitation » à Léa par partage");
    expect(describeEvent(ev('link_copied'), { names })).toBe(
      "L'organisateur a copié le lien de Léa",
    );
    expect(describeEvent(ev('draw_done', { count: 12 }, null), { names })).toBe(
      'Le tirage est fait, pour 12 participants',
    );
    expect(
      describeEvent(
        ev('draw_cancelled', { reason: 'désistement de Tom' }, null),
        { names },
      ),
    ).toBe('Le tirage a été annulé. Motif : désistement de Tom');
    // Only the first consultation is journaled: no count in the sentence.
    expect(describeEvent(ev('result_viewed', { count: 3 }), { names })).toBe(
      'Léa a ouvert son enveloppe',
    );
    expect(
      describeEvent(ev('edition_closed', { label: 'Noël 2026' }, null), {
        names,
      }),
    ).toBe("L'édition Noël 2026 est clôturée");
  });

  it('has a description for every type and copes with missing data', () => {
    AUDIT_TYPES.forEach((type) => {
      const text = describeEvent({ type, personId: 'unknown', meta: null });
      expect(text, type).not.toBe('Événement inconnu');
      expect(text, type).toContain(
        type.startsWith('edition') ||
          type.startsWith('draw') ||
          type.startsWith('answers_') ||
          type.startsWith('guess') ||
          type === 'rules_changed' ||
          type === 'results_revealed'
          ? ''
          : "Quelqu'un",
      );
    });
    expect(describeEvent({ type: 'mystery' })).toBe('Événement inconnu');
  });
});

describe('journalEntries', () => {
  const people = [
    { id: 'p1', firstName: 'Léa', lastName: 'Rabin' },
    { id: 'p2', firstName: 'Léa', lastName: 'Martin' },
    { id: 'p3', firstName: 'Tom', lastName: 'Rabin' },
  ];
  const row = (id: string, personId: string, createdAt: string) => ({
    id,
    type: 'result_viewed',
    editionId: 'e1',
    personId,
    actor: 'participant',
    meta: { count: 1, receiverId: 'p3' },
    createdAt,
  });

  it('no longer shows the old « wishes_updated » lines', () => {
    expect(
      journalEntries(
        [
          {
            ...row('a', 'p3', '2026-12-01T10:00:00.000Z'),
            type: 'wishes_updated',
          },
          row('b', 'p3', '2026-12-02T10:00:00.000Z'),
        ],
        people,
      ).map((e) => e.id),
    ).toEqual(['b']);
  });

  it('lists the newest first, with one sentence each', () => {
    const entries = journalEntries(
      [
        row('a', 'p3', '2026-12-01T10:00:00.000Z'),
        row('b', 'p3', '2026-12-02T10:00:00.000Z'),
      ],
      people,
    );
    expect(entries.map((e) => e.id)).toEqual(['b', 'a']);
    expect(entries[0]).toEqual({
      id: 'b',
      type: 'result_viewed',
      editionId: 'e1',
      actor: 'participant',
      createdAt: '2026-12-02T10:00:00.000Z',
      text: 'Tom a ouvert son enveloppe',
      personId: 'p3',
      messageType: null,
      via: null,
      ownText: null,
    });
  });

  it('tells the reader the events about them in the second person', () => {
    const entries = journalEntries(
      [
        row('a', 'p3', '2026-12-01T10:00:00.000Z'),
        row('b', 'p1', '2026-12-02T10:00:00.000Z'),
      ],
      people,
      'fr',
      'p3',
    );
    expect(entries.map((e) => e.ownText)).toEqual([
      null,
      'Tu as ouvert ton enveloppe',
    ]);
  });

  it('keeps the third person for an event without its own sentence', () => {
    const [entry] = journalEntries(
      [{ ...row('a', 'p3', '2026-12-01T10:00:00.000Z'), type: 'draw_done' }],
      people,
      'fr',
      'p3',
    );
    expect(entry?.ownText).toBe(entry?.text);
  });

  it('adds the last name only for homonyms', () => {
    const [entry] = journalEntries(
      [row('a', 'p2', '2026-12-01T10:00:00.000Z')],
      people,
    );
    expect(entry?.text).toBe('Léa Martin a ouvert son enveloppe');
  });

  it('never passes meta on', () => {
    const entries = journalEntries(
      [row('a', 'p1', '2026-12-01T10:00:00.000Z')],
      people,
    );
    expect(JSON.stringify(entries)).not.toContain('receiverId');
    expect(entries[0]).not.toHaveProperty('meta');
  });

  it('passes on which message was sent, and how', () => {
    const [entry] = journalEntries(
      [
        {
          ...row('a', 'p1', '2026-12-01T10:00:00.000Z'),
          type: 'message_sent',
          meta: { messageType: 'drawn', via: 'email', receiverId: 'p3' },
        },
      ],
      people,
    );
    expect(entry).toMatchObject({ messageType: 'drawn', via: 'email' });
    expect(entry?.text).toBe(
      "L'organisateur a envoyé « Tirage fait » à Léa Rabin par email",
    );
  });
});

describe('describeEvent in other languages', () => {
  const names = { p1: 'Léa' };
  const viewed = (count: number, locale: 'en' | 'de') =>
    describeEvent(
      { type: 'result_viewed', personId: 'p1', meta: { count } },
      { names, locale },
    );

  it('tells a discovered result in each language', () => {
    expect(viewed(1, 'en')).toBe('Léa opened their envelope');
    expect(viewed(1, 'de')).toBe('Léa hat den eigenen Umschlag geöffnet');
  });

  it('translates every type without leaving a placeholder', () => {
    (['fr', 'en', 'de'] as const).forEach((locale) => {
      AUDIT_TYPES.forEach((type) => {
        [false, true].forEach((own) => {
          const text = describeEvent(
            { type, personId: 'p1', meta: { count: 2, label: 'X' } },
            { names, locale, own },
          );
          expect(text, `${locale} ${type}`).not.toMatch(/\{\w+\}/);
        });
      });
    });
  });

  it("writes the journal in the reader's language", () => {
    const [entry] = journalEntries(
      [
        {
          id: 'a',
          type: 'message_sent',
          editionId: 'e1',
          personId: 'p1',
          actor: 'guardian',
          meta: { messageType: 'invitation', via: 'email' },
          createdAt: '2026-12-01T10:00:00.000Z',
        },
      ],
      [{ id: 'p1', firstName: 'Léa' }],
      'en',
    );
    expect(entry?.text).toBe('The organizer sent “Invitation” to Léa by email');
  });
});

describe('changes a participant makes to their own profile', () => {
  const names = { p1: 'Léa' };
  it('are told in the journal, in every language', () => {
    expect(
      describeEvent({ type: 'avatar_changed', personId: 'p1' }, { names }),
    ).toBe('Léa a changé son icône');
    expect(
      describeEvent(
        { type: 'language_changed', personId: 'p1', meta: { language: 'de' } },
        { names },
      ),
    ).toBe('Léa a changé sa langue (Deutsch)');
    expect(
      describeEvent(
        { type: 'language_changed', personId: 'p1', meta: { language: 'en' } },
        { names, locale: 'en' },
      ),
    ).toBe('Léa changed their language (English)');
  });
});

describe('keyPeople', () => {
  const entry = (id: string, personId: string | null) => ({
    id,
    type: 'result_viewed',
    editionId: 'e1',
    actor: 'participant',
    createdAt: '2026-12-01T10:00:00.000Z',
    text: '…',
    personId,
    messageType: null,
    via: null,
    ownText: null,
  });
  const keyed = keyPeople({
    entries: [entry('a', 'secret-1'), entry('b', 'secret-2'), entry('c', null)],
    people: [
      { id: 'secret-1', name: 'Léa' },
      { id: 'secret-2', name: 'Tom' },
    ],
    me: 'secret-2',
  });

  it('never gives a real id away', () => {
    expect(JSON.stringify(keyed)).not.toMatch(/secret/);
  });

  it('keeps each line with its person, and the reader', () => {
    expect(keyed.entries.map((e) => e.personId)).toEqual(['p0', 'p1', null]);
    expect(keyed.people.map((p) => [p.id, p.name])).toEqual([
      ['p0', 'Léa'],
      ['p1', 'Tom'],
    ]);
    expect(keyed.me).toBe('p1');
  });
});

describe('unseenAlerts', () => {
  const at = (minute: number) =>
    `2026-12-01T10:${String(minute).padStart(2, '0')}:00.000Z`;
  const rows = [
    { id: 'u1', type: 'result_revealed', personId: 'p2', createdAt: at(30) },
    { id: 'u2', type: 'link_regenerated', personId: 'p1', createdAt: at(20) },
    { id: 'u3', type: 'link_regenerated', personId: 'p2', createdAt: at(15) },
    { id: 'u4', type: 'result_viewed', personId: 'p1', createdAt: at(12) },
    { id: 'u5', type: 'results_revealed', personId: null, createdAt: at(5) },
    { id: 'u6', type: 'draw_cancelled', personId: null, createdAt: at(3) },
    { id: 'u7', type: 'draw_revealed', personId: null, createdAt: at(2) },
  ];

  it('counts what README 22.15 lists, and the renewal of my own link', () => {
    // An access to a result, results revealed before the party, a
    // cancelled draw, my link; not someone else's link, a discovery, nor
    // results revealed from the day of the party.
    expect(unseenAlerts(rows, 'p1', at(0))).toBe(4);
  });

  it('counts only what happened after the last visit', () => {
    expect(unseenAlerts(rows, 'p1', at(20))).toBe(1);
    expect(unseenAlerts(rows, 'p1', at(30))).toBe(0);
  });
});

describe('journalSignal', () => {
  const row = (
    id: string,
    type: string,
    personId: string | null,
    minute: number,
  ) => ({
    id,
    type,
    personId,
    createdAt: `2026-12-01T10:${String(minute).padStart(2, '0')}:00.000Z`,
  });
  const since = '2026-12-01T10:00:00.000Z';

  it('says nothing when no alert waits', () => {
    expect(
      journalSignal([row('a', 'result_viewed', 'p1', 5)], 'p1', since),
    ).toBeNull();
  });

  it('names the alert when it is alone', () => {
    expect(
      journalSignal(
        [
          row('a', 'link_regenerated', 'p1', 5),
          row('b', 'link_regenerated', 'p2', 6),
        ],
        'p1',
        since,
      ),
    ).toEqual({
      count: 1,
      alert: {
        id: 'a',
        type: 'link_regenerated',
        createdAt: row('a', '', null, 5).createdAt,
      },
    });
  });

  it('only counts several', () => {
    expect(
      journalSignal(
        [
          row('a', 'draw_cancelled', null, 5),
          row('b', 'result_revealed', 'p3', 7),
        ],
        'p1',
        since,
      ),
    ).toEqual({ count: 2, alert: null });
  });
});
