import { describe, it, expect } from 'vitest';
import {
  AUDIT_TYPES,
  auditEvent,
  describeEvent,
  sanitizeMeta,
} from './audit.js';

const deps = { id: () => 'evt-1', now: () => '2026-11-13T10:00:00.000Z' };

describe('auditEvent', () => {
  it('builds a row with injected id and date', () => {
    const result = auditEvent(
      {
        type: 'pin_set',
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
        type: 'pin_set',
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
      auditEvent({ type: 'nope', groupId: 'g1', actor: 'guardian' }, deps)
        .reason,
    ).toBe('invalid_audit_event');
    expect(
      auditEvent({ type: 'pin_set', groupId: 'g1', actor: 'hacker' }, deps).ok,
    ).toBe(false);
  });

  it('never keeps a result or a secret in meta, at any depth', () => {
    const result = auditEvent(
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
    );
    expect(result.value.meta).toEqual({
      count: 3,
      nested: { keep: 1, deeper: { ok: true } },
    });
    expect(JSON.stringify(result.value)).not.toMatch(/receiver|p2|assignment/);
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
  const ev = (type, meta = {}, personId = 'p1') => ({ type, personId, meta });

  it('renders the README examples', () => {
    expect(
      describeEvent(ev('edition_created', { label: 'Noël 2026' }), { names }),
    ).toBe("L'édition Noël 2026 a été créée");
    expect(describeEvent(ev('participant_added'), { names })).toBe(
      "Léa rejoint l'édition",
    );
    expect(
      describeEvent(ev('couple_changed', { partnerName: 'Tom' }), { names }),
    ).toBe('Le couple Léa + Tom a été enregistré');
    expect(
      describeEvent(
        ev('message_sent', { messageType: 'invitation', via: 'whatsapp' }),
        { names },
      ),
    ).toBe("Le gardien a envoyé l'invitation à Léa sur WhatsApp");
    expect(describeEvent(ev('link_copied'), { names })).toBe(
      'Le gardien a copié le lien de Léa',
    );
    expect(
      describeEvent(ev('pin_failed', { attempts: 2, max: 5 }), { names }),
    ).toBe('Code erroné sur le lien de Léa (2/5)');
    expect(describeEvent(ev('pin_locked', { max: 5 }), { names })).toBe(
      'Le lien de Léa est bloqué après 5 erreurs',
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
          type === 'rules_changed'
          ? ''
          : "Quelqu'un",
      );
    });
    expect(describeEvent({ type: 'mystery' })).toBe('Événement inconnu');
  });
});
