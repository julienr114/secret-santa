import { describe, it, expect } from 'vitest';
import {
  AUDIT_TYPES,
  auditEvent,
  describeEvent,
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
    ).toBe("Le gardien a envoyé l'invitation à Léa (partagé)");
    expect(describeEvent(ev('link_copied'), { names })).toBe(
      'Le gardien a copié le lien de Léa',
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
    expect(describeEvent(ev('result_viewed', { count: 3 }), { names })).toBe(
      'Léa a consulté son résultat (3ᵉ fois)',
    );
    expect(describeEvent(ev('result_viewed', { count: 1 }), { names })).toBe(
      'Léa a consulté son résultat (1ʳᵉ fois)',
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
