import { describe, it, expect } from 'vitest';
import {
  buildHintsRequestEmail,
  canEditHints,
  canRequestHints,
  giverHintsState,
} from './hints';

import { failureOf } from '~~/tests/helpers';

describe('canEditHints', () => {
  it('lets the portrait be written until the edition is closed', () => {
    expect(canEditHints('preparing', 'full').ok).toBe(true);
    expect(canEditHints('drawn', 'portrait').ok).toBe(true);
    expect(failureOf(canEditHints('closed', 'full')).reason).toBe(
      'edition_closed',
    );
    expect(failureOf(canEditHints('drawn', 'none')).reason).toBe(
      'gift_hints_disabled',
    );
  });
});

describe('canRequestHints', () => {
  const base: Parameters<typeof canRequestHints>[0] = {
    status: 'drawn',
    mode: 'full',
    receiverHasHints: false,
    alreadyRequested: false,
  };

  it('allows one request, after the draw, when the receiver left nothing', () => {
    expect(canRequestHints(base).ok).toBe(true);
    expect(canRequestHints({ ...base, mode: 'portrait' }).ok).toBe(true);
  });

  it('says why not', () => {
    const reason = (state: Partial<typeof base>) =>
      failureOf(canRequestHints({ ...base, ...state })).reason;
    expect(reason({ alreadyRequested: true })).toBe('hints_already_requested');
    expect(reason({ receiverHasHints: true })).toBe('hints_already_given');
    expect(reason({ status: 'preparing' })).toBe('draw_not_done');
    expect(reason({ status: 'closed' })).toBe('draw_not_done');
    expect(reason({ mode: 'none' })).toBe('gift_hints_disabled');
  });
});

describe('giverHintsState', () => {
  const at = (day: number) =>
    `2026-12-${String(day).padStart(2, '0')}T10:00:00.000Z`;

  it('says none without hints, some before a first opening', () => {
    expect(
      giverHintsState({
        hasHints: false,
        hintsUpdatedAt: at(5),
        lastOpenedAt: at(1),
      }),
    ).toBe('none');
    expect(
      giverHintsState({
        hasHints: true,
        hintsUpdatedAt: at(5),
        lastOpenedAt: null,
      }),
    ).toBe('some');
  });

  it('says new when they changed since the result was last opened', () => {
    expect(
      giverHintsState({
        hasHints: true,
        hintsUpdatedAt: at(5),
        lastOpenedAt: at(3),
      }),
    ).toBe('new');
    expect(
      giverHintsState({
        hasHints: true,
        hintsUpdatedAt: at(2),
        lastOpenedAt: at(3),
      }),
    ).toBe('some');
  });
});

describe('hint emails', () => {
  const data = {
    firstName: 'Inès',
    editionLabel: 'Noël 2026',
    groupName: 'Famille Camille',
    link: 'https://example.com/p/abc/pistes',
    mode: 'full' as const,
  };

  it('asks without saying who asks', () => {
    const email = buildHintsRequestEmail(data, 'fr');
    expect(email.subject).toBe(
      'Secret Santa de Famille Camille : quelqu’un cherche une idée de cadeau pour toi',
    );
    expect(email.text).toContain('Bonjour Inès,');
    expect(email.text).toContain('Noël 2026 (Famille Camille)');
    expect(email.text).toContain(`\n${data.link}\n`);
    expect(email.text).toContain('On ne te dira pas qui demande');
    // It invites to write one's list (ticket 107, PistesEmail).
    expect(email.text).toContain(
      'Aide-la : écris ta liste de cadeaux, ou quelques mots sur ce que tu aimes.',
    );
    expect(email.text).toContain('Écrire ma liste :');
  });

  it('names who asks once the draw is revealed (README 22.18)', () => {
    const email = buildHintsRequestEmail({ ...data, from: 'Hugo' }, 'fr');
    expect(email.subject).toBe(
      'Secret Santa de Famille Camille : Hugo cherche une idée de cadeau pour toi',
    );
    expect(email.text).toContain('Hugo t’offre un cadeau pour Noël 2026');
    expect(email.text).not.toContain('On ne te dira pas qui demande');
  });
});
