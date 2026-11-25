import { describe, expect, it } from 'vitest';
import {
  buildNewsEmail,
  buildSummaryEmail,
  emailWhen,
  goesNow,
  planNewsEmails,
  ownEmailGoes,
  summaryDue,
} from './newsEmail';

const news = {
  kind: 'ticked' as const,
  level: 'other' as const,
  mailable: true,
  seen: false,
  emailed: false,
};
const urgent = { ...news, kind: 'envelope' as const, level: 'urgent' as const };

describe('emailWhen', () => {
  it('puts the rest in the summary, and sends what presses at once', () => {
    expect(emailWhen(news, { mode: 'summary', phone: false })).toBe('summary');
    expect(emailWhen(urgent, { mode: 'summary', phone: false })).toBe('now');
  });

  it('waits ten minutes for what presses when a phone is told', () => {
    expect(emailWhen(urgent, { mode: 'summary', phone: true })).toBe('wait');
  });

  it('sends everything at once with « Tout de suite »', () => {
    expect(emailWhen(news, { mode: 'instant', phone: false })).toBe('now');
    expect(emailWhen(urgent, { mode: 'instant', phone: true })).toBe('now');
  });

  it('sends nothing with « Aucun email », even what presses', () => {
    expect(emailWhen(urgent, { mode: 'none', phone: false })).toBe('none');
  });

  it('sends nothing seen, gone already, or not to be mailed', () => {
    const account = { mode: 'instant' as const, phone: false };
    expect(emailWhen({ ...urgent, seen: true }, account)).toBe('none');
    expect(emailWhen({ ...urgent, emailed: true }, account)).toBe('none');
    expect(emailWhen({ ...news, mailable: false }, account)).toBe('none');
  });

  it('leaves the kinds with an email of their own, and new ideas', () => {
    const account = { mode: 'instant' as const, phone: false };
    expect(emailWhen({ ...urgent, kind: 'list_invite' }, account)).toBe('none');
    expect(emailWhen({ ...news, kind: 'new_ideas' }, account)).toBe('none');
  });
});

describe('goesNow', () => {
  const at = '2026-11-24T10:00:00.000Z';
  it('sends at once, or after ten minutes', () => {
    expect(goesNow('now', at, at)).toBe(true);
    expect(goesNow('wait', at, '2026-11-24T10:09:00.000Z')).toBe(false);
    expect(goesNow('wait', at, '2026-11-24T10:10:00.000Z')).toBe(true);
    expect(goesNow('summary', at, '2026-11-25T10:00:00.000Z')).toBe(false);
  });
});

describe('summaryDue', () => {
  it('goes once a day, from the morning on', () => {
    expect(summaryDue(null, '2026-11-24T07:59:00.000Z')).toBe(false);
    expect(summaryDue(null, '2026-11-24T08:00:00.000Z')).toBe(true);
    expect(summaryDue('2026-11-24', '2026-11-24T15:00:00.000Z')).toBe(false);
    expect(summaryDue('2026-11-23', '2026-11-24T08:15:00.000Z')).toBe(true);
  });
});

describe('ownEmailGoes', () => {
  it('goes to anyone but an account that wants no email', () => {
    expect(ownEmailGoes(null)).toBe(true);
    expect(ownEmailGoes('summary')).toBe(true);
    expect(ownEmailGoes('none')).toBe(false);
  });
});

describe('buildNewsEmail', () => {
  it('names the event, says the news, and how to change the setting', () => {
    const email = buildNewsEmail(
      {
        firstName: 'Hugo',
        news: {
          kind: 'envelope',
          count: 1,
          name: null,
          detail: null,
          place: 'Famille Camille',
          link: 'https://app.test/p/abc',
        },
        settings: 'https://app.test/compte/me-prevenir',
      },
      'fr',
    );
    expect(email.subject).toBe('Famille Camille : ton enveloppe t’attend');
    expect(email.text).toContain('Bonjour Hugo,');
    expect(email.text).toContain('Le tirage est fait : ton enveloppe t’attend');
    expect(email.text).toContain('https://app.test/p/abc');
    expect(email.text).toContain('https://app.test/compte/me-prevenir');
    expect(email.html).not.toContain('<img');
  });

  it('escapes what people wrote', () => {
    const email = buildNewsEmail(
      {
        firstName: '<b>',
        news: {
          kind: 'joined_gift',
          count: 1,
          name: 'Léa <i>',
          detail: 'Vélo',
          place: 'Noël',
          link: 'https://app.test/l/x',
        },
        settings: 'https://app.test/compte/me-prevenir',
      },
      'en',
    );
    expect(email.html).not.toContain('<i>');
    expect(email.html).toContain('&lt;b&gt;');
    expect(email.subject).toBe('Noël: Léa <i> joins your group gift');
  });
});

describe('buildSummaryEmail', () => {
  it('counts the news and gives a block to each event', () => {
    const email = buildSummaryEmail(
      {
        firstName: 'Hugo',
        blocks: [
          {
            title: 'Famille Camille',
            link: 'https://app.test/e/famille',
            opens: 'party',
            news: [
              { kind: 'joined', count: 1, name: 'Léa', detail: null },
              { kind: 'revealed', count: 1, name: null, detail: null },
            ],
          },
          {
            title: 'Noël 2026',
            link: 'https://app.test/listes/1',
            opens: 'list',
            news: [{ kind: 'ticked', count: 2, name: null, detail: null }],
          },
        ],
        settings: 'https://app.test/compte/me-prevenir',
      },
      'fr',
    );
    expect(email.subject).toBe('Under the Tree : 4 nouveautés depuis hier');
    expect(email.text).toContain(
      'Famille Camille\nLéa s’inscrit par le lien\nLe tirage est dévoilé : qui a offert à qui\nhttps://app.test/e/famille',
    );
    expect(email.text).toContain('2 cadeaux ont été cochés sur ta liste');
    expect(email.html).toContain('>Ouvrir la liste</a>');
    expect(email.html).not.toContain('<img');
  });
});

describe('planNewsEmails', () => {
  const waiting = (
    id: string,
    over: Partial<Parameters<typeof planNewsEmails>[0][number]> = {},
  ) => ({
    id,
    accountId: 'hugo',
    kind: 'ticked' as const,
    level: 'other' as const,
    mailable: true,
    at: '2026-11-23T18:00:00.000Z',
    mode: 'summary' as const,
    summarySentOn: '2026-11-23',
    ...over,
  });
  const MORNING = '2026-11-24T08:00:00.000Z';

  it('puts three news of the day in one summary the next morning', () => {
    const plan = planNewsEmails(
      [waiting('a'), waiting('b'), waiting('c')],
      MORNING,
    );
    expect(plan.single).toEqual([]);
    expect(plan.summaries.get('hugo')?.map((news) => news.id)).toEqual([
      'a',
      'b',
      'c',
    ]);
  });

  it('keeps what came after the morning for the next day', () => {
    expect(
      planNewsEmails(
        [waiting('a', { at: '2026-11-24T09:00:00.000Z' })],
        '2026-11-24T10:00:00.000Z',
      ).summaries.size,
    ).toBe(0);
  });

  it('waits for the morning, and sends the summary once a day', () => {
    expect(
      planNewsEmails([waiting('a')], '2026-11-24T07:45:00.000Z').summaries.size,
    ).toBe(0);
    expect(
      planNewsEmails([waiting('a', { summarySentOn: '2026-11-24' })], MORNING)
        .summaries.size,
    ).toBe(0);
  });

  it('sends what presses at once, and everything with « Tout de suite »', () => {
    const plan = planNewsEmails(
      [
        waiting('envelope', { kind: 'envelope', level: 'urgent' }),
        waiting('ticked', { accountId: 'lea', mode: 'instant' }),
      ],
      '2026-11-24T03:00:00.000Z',
    );
    expect(plan.single.map((news) => news.id)).toEqual(['envelope', 'ticked']);
  });

  it('keeps to what one run may send', () => {
    const plan = planNewsEmails(
      [
        waiting('a', { mode: 'instant' }),
        waiting('b', { mode: 'instant' }),
        waiting('c', { accountId: 'lea' }),
      ],
      MORNING,
      2,
    );
    expect(plan.single).toHaveLength(2);
    expect(plan.summaries.size).toBe(0);
  });
});

describe('the emails of a list I follow (ticket 122)', () => {
  const settings = 'https://app.test/compte/me-prevenir';
  it('say the person, and how to stop following', () => {
    const email = buildNewsEmail(
      {
        firstName: 'Hugo',
        news: {
          kind: 'followed_ideas',
          count: 3,
          name: 'Léo',
          detail: null,
          place: 'Noël 2026',
          link: 'https://app.test/l/tok',
        },
        settings,
      },
      'fr',
    );
    expect(email.subject).toBe('Noël 2026 : 3 nouvelles idées pour Léo');
    expect(email.text).toContain('Ne plus suivre une liste');
    expect(email.text).toContain(`${settings}#suivis`);
  });

  it('say the list when it has no people', () => {
    const email = buildNewsEmail(
      {
        firstName: null,
        news: {
          kind: 'followed_ideas',
          count: 1,
          name: null,
          detail: null,
          place: 'Mariage',
          link: 'https://app.test/l/tok',
        },
        settings,
      },
      'en',
    );
    expect(email.subject).toBe('Mariage: 1 new idea on the list');
  });

  it('put the stop line under a summary that tells of one', () => {
    const blocks = (kind: 'followed_person' | 'ticked') => [
      {
        title: 'Noël',
        link: 'https://app.test/e/noel',
        opens: 'party' as const,
        news: [{ kind, count: 1, name: 'Zoé', detail: null }],
      },
    ];
    expect(
      buildSummaryEmail(
        { firstName: 'Hugo', blocks: blocks('followed_person'), settings },
        'fr',
      ).text,
    ).toContain('Ne plus suivre une liste');
    expect(
      buildSummaryEmail(
        { firstName: 'Hugo', blocks: blocks('ticked'), settings },
        'fr',
      ).text,
    ).not.toContain('Ne plus suivre');
  });
});

describe('the phone first (ticket 124)', () => {
  const urgent = {
    id: 'e',
    accountId: 'hugo',
    kind: 'envelope' as const,
    level: 'urgent' as const,
    mailable: true,
    at: '2026-11-24T10:00:00.000Z',
    mode: 'summary' as const,
    summarySentOn: null,
    phone: true,
  };

  it('emails what presses ten minutes after the phone was told', () => {
    expect(
      planNewsEmails(
        [{ ...urgent, pushedAt: null }],
        '2026-11-24T10:20:00.000Z',
      ).single,
    ).toEqual([]);
    // A phone never told holds it thirty minutes at most.
    expect(
      planNewsEmails(
        [{ ...urgent, pushedAt: null }],
        '2026-11-24T10:30:00.000Z',
      ).single.map((news) => news.id),
    ).toEqual(['e']);
    expect(
      planNewsEmails(
        [{ ...urgent, pushedAt: '2026-11-24T10:15:00.000Z' }],
        '2026-11-24T10:20:00.000Z',
      ).single,
    ).toEqual([]);
    expect(
      planNewsEmails(
        [{ ...urgent, pushedAt: '2026-11-24T10:15:00.000Z' }],
        '2026-11-24T10:30:00.000Z',
      ).single.map((news) => news.id),
    ).toEqual(['e']);
  });
});
