import { describe, it, expect } from 'vitest';
import {
  AUDIT_TYPES,
  auditEvent,
  describeEvent,
  journalEntries,
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
      "Léa rejoint l'édition",
    );
    expect(
      describeEvent(
        ev('message_sent', { messageType: 'invitation', via: 'share' }),
        { names },
      ),
    ).toBe("L'organisateur a envoyé l'invitation à Léa (partagé)");
    expect(describeEvent(ev('link_copied'), { names })).toBe(
      "L'organisateur a copié le lien de Léa",
    );
    expect(describeEvent(ev('draw_done', { count: 12 }, null), { names })).toBe(
      'Le tirage a été effectué pour 12 participants',
    );
    expect(
      describeEvent(
        ev('draw_cancelled', { reason: 'désistement de Tom' }, null),
        { names },
      ),
    ).toBe('Le tirage a été annulé. Motif : désistement de Tom');
    // Only the first consultation is journaled: no count in the sentence.
    expect(describeEvent(ev('result_viewed', { count: 3 }), { names })).toBe(
      'Léa a découvert son résultat',
    );
    expect(describeEvent(ev('wishes_updated', { count: 1 }), { names })).toBe(
      'Léa a mis à jour sa liste de souhaits (1 idée)',
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
      text: 'Tom a découvert son résultat',
    });
  });

  it('adds the last name only for homonyms', () => {
    const [entry] = journalEntries(
      [row('a', 'p2', '2026-12-01T10:00:00.000Z')],
      people,
    );
    expect(entry?.text).toBe('Léa Martin a découvert son résultat');
  });

  it('never passes meta on', () => {
    const entries = journalEntries(
      [row('a', 'p1', '2026-12-01T10:00:00.000Z')],
      people,
    );
    expect(JSON.stringify(entries)).not.toContain('receiverId');
    expect(entries[0]).not.toHaveProperty('meta');
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
    expect(viewed(1, 'en')).toBe('Léa discovered their result');
    expect(viewed(1, 'de')).toBe('Léa hat das eigene Ergebnis entdeckt');
  });

  it('translates every type without leaving a placeholder', () => {
    (['fr', 'en', 'de'] as const).forEach((locale) => {
      AUDIT_TYPES.forEach((type) => {
        const text = describeEvent(
          { type, personId: 'p1', meta: { count: 2, label: 'X' } },
          { names, locale },
        );
        expect(text, `${locale} ${type}`).not.toMatch(/\{\w+\}/);
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
    expect(entry?.text).toBe(
      'The organizer sent the invitation to Léa (email)',
    );
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
