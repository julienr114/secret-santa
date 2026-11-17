import { describe, it, expect } from 'vitest';
import {
  applyPortraitPatch,
  buildHintsArrivedEmail,
  buildHintsRequestEmail,
  canEditHints,
  canEditIdeas,
  canRequestHints,
  giverHintsState,
  shouldAnnounceHints,
} from './hints';
import { EMPTY_PORTRAIT } from '#shared/utils/hints';
import { failureOf, valueOf } from '~~/tests/helpers';

describe('applyPortraitPatch', () => {
  it('sets answers and texts, and leaves the rest untouched', () => {
    const once = valueOf(
      applyPortraitPatch(EMPTY_PORTRAIT, {
        answers: { objectOrMoment: 'second' },
        texts: { lately: '  La course à pied  ' },
      }),
    );
    const twice = valueOf(
      applyPortraitPatch(once, { answers: { surprise: 'both' } }),
    );
    expect(twice.answers).toEqual({
      ...EMPTY_PORTRAIT.answers,
      objectOrMoment: 'second',
      surprise: 'both',
    });
    expect(twice.texts).toEqual({
      ...EMPTY_PORTRAIT.texts,
      lately: 'La course à pied',
    });
  });

  it('takes an answer back with null, and a blank text becomes null', () => {
    const filled = valueOf(
      applyPortraitPatch(EMPTY_PORTRAIT, {
        answers: { surprise: 'first' },
        texts: { avoid: 'Pas de bougies' },
      }),
    );
    const cleared = valueOf(
      applyPortraitPatch(filled, {
        answers: { surprise: null },
        texts: { avoid: '   ' },
      }),
    );
    expect(cleared).toEqual(EMPTY_PORTRAIT);
  });

  it('stores answers as fixed values only, never text', () => {
    expect(
      failureOf(
        applyPortraitPatch(EMPTY_PORTRAIT, {
          answers: { surprise: 'Surprends-moi' },
        }),
      ),
    ).toEqual({
      ok: false,
      reason: 'invalid_hints',
      details: { field: 'answers.surprise' },
    });
  });

  it('has no « Les deux me vont » for second hand', () => {
    expect(
      failureOf(
        applyPortraitPatch(EMPTY_PORTRAIT, { answers: { secondHand: 'both' } }),
      ).details,
    ).toEqual({ field: 'answers.secondHand' });
  });

  it('refuses a text over 300 characters and ignores unknown keys', () => {
    expect(
      failureOf(
        applyPortraitPatch(EMPTY_PORTRAIT, {
          texts: { wouldHelp: 'x'.repeat(301) },
        }),
      ).details,
    ).toEqual({ field: 'texts.wouldHelp' });
    expect(
      valueOf(
        applyPortraitPatch(EMPTY_PORTRAIT, {
          answers: { favouriteColour: 'first' },
          extra: true,
        }),
      ),
    ).toEqual(EMPTY_PORTRAIT);
  });
});

describe('canEditHints and canEditIdeas', () => {
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

  it('keeps the precise ideas for the full setting only', () => {
    expect(canEditIdeas('drawn', 'full').ok).toBe(true);
    expect(failureOf(canEditIdeas('drawn', 'portrait')).reason).toBe(
      'ideas_disabled',
    );
    expect(failureOf(canEditIdeas('closed', 'full')).reason).toBe(
      'edition_closed',
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

describe('shouldAnnounceHints', () => {
  const base = {
    hadHints: false,
    hasHintsNow: true,
    giverRevealed: true,
    alreadyAnnounced: false,
  };

  it('writes the first time hints appear after the giver looked', () => {
    expect(shouldAnnounceHints(base)).toBe(true);
  });

  it('never for a change, before the giver looked, nor twice', () => {
    expect(shouldAnnounceHints({ ...base, hadHints: true })).toBe(false);
    expect(shouldAnnounceHints({ ...base, hasHintsNow: false })).toBe(false);
    expect(shouldAnnounceHints({ ...base, giverRevealed: false })).toBe(false);
    expect(shouldAnnounceHints({ ...base, alreadyAnnounced: true })).toBe(
      false,
    );
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
    expect(email.subject).toBe('Quelqu’un cherche une idée de cadeau pour toi');
    expect(email.text).toContain('Bonjour Inès,');
    expect(email.text).toContain('Noël 2026 (Famille Camille)');
    expect(email.text).toContain(`\n${data.link}\n`);
    expect(email.text).toContain('On ne te dira pas qui demande');
    expect(email.text).toContain('six questions');
    expect(
      buildHintsRequestEmail({ ...data, mode: 'portrait' }, 'fr').text,
    ).toContain('cinq questions');
  });

  it('tells the giver that hints arrived, without naming the receiver', () => {
    const email = buildHintsArrivedEmail(
      { ...data, firstName: 'Camille', link: 'https://example.com/p/xyz' },
      'en',
    );
    expect(email.subject).toBe('Gift hints are waiting for you');
    expect(email.text).toContain('Hello Camille,');
    expect(email.text).not.toContain('Inès');
    expect(email.html).toContain('href="https://example.com/p/xyz"');
  });
});
