import { describe, expect, it } from 'vitest';
import {
  REMINDER_DAYS,
  buildAllViewedEmail,
  buildJoinedEmail,
  buildReminderEmail,
  isEveryoneViewed,
  isReminderDue,
} from './notifications';

const LINK = 'https://under-the-tree.party/admin/famille';

describe('isEveryoneViewed', () => {
  it('is true once the last one has looked', () => {
    expect(isEveryoneViewed({ participants: 4, viewed: 4 })).toBe(true);
    expect(isEveryoneViewed({ participants: 4, viewed: 3 })).toBe(false);
  });

  it('is false for an empty edition', () => {
    expect(isEveryoneViewed({ participants: 0, viewed: 0 })).toBe(false);
  });
});

describe('isReminderDue', () => {
  const edition = {
    status: 'drawn' as const,
    eventDate: '2026-12-25',
    reminderSentAt: null,
  };

  it('is due a few days before the exchange, until the day', () => {
    expect(isReminderDue(edition, '2026-12-22')).toBe(true);
    expect(isReminderDue(edition, '2026-12-25')).toBe(true);
    expect(isReminderDue(edition, '2026-12-21')).toBe(REMINDER_DAYS >= 4);
  });

  it('waits for the draw, and goes only once', () => {
    expect(
      isReminderDue({ ...edition, status: 'preparing' }, '2026-12-23'),
    ).toBe(false);
    expect(
      isReminderDue(
        { ...edition, reminderSentAt: '2026-12-22T08:00:00Z' },
        '2026-12-23',
      ),
    ).toBe(false);
  });

  it('needs a dated exchange that is not over', () => {
    expect(isReminderDue({ ...edition, eventDate: '' }, '2026-12-23')).toBe(
      false,
    );
    expect(
      isReminderDue({ ...edition, eventDate: '24 décembre' }, '2026-12-23'),
    ).toBe(false);
    expect(isReminderDue(edition, '2026-12-26')).toBe(false);
  });
});

describe('notification emails', () => {
  it('says who joined, and ends on the link', () => {
    const email = buildJoinedEmail(
      { groupName: 'Famille Démo', firstName: 'Zoé', link: LINK },
      'fr',
    );
    expect(email.subject).toContain('Zoé');
    expect(email.text).toContain('Famille Démo');
    expect(email.text.split('\n').at(-1)).toBe(LINK);
  });

  it('names who has not discovered their result yet', () => {
    const email = buildReminderEmail(
      {
        groupName: 'Famille Démo',
        editionLabel: 'Noël 2026',
        eventDate: '2026-12-25',
        missing: ['Léa', 'Tom'],
        link: LINK,
      },
      'fr',
    );
    expect(email.text).toContain('Léa, Tom');
    expect(email.text).toContain('25 décembre');
  });

  it('escapes names in the HTML', () => {
    expect(
      buildJoinedEmail(
        { groupName: 'A & B', firstName: '<Zoé>', link: LINK },
        'fr',
      ).html,
    ).toContain('&lt;Zoé&gt;');
  });

  it('leaves no placeholder in any language', () => {
    (['fr', 'en', 'de'] as const).forEach((locale) => {
      const emails = [
        buildJoinedEmail(
          { groupName: 'G', firstName: 'Z', link: LINK },
          locale,
        ),
        buildAllViewedEmail(
          { groupName: 'G', editionLabel: 'E', link: LINK },
          locale,
        ),
        buildReminderEmail(
          {
            groupName: 'G',
            editionLabel: 'E',
            eventDate: '2026-12-25',
            missing: ['L'],
            link: LINK,
          },
          locale,
        ),
      ];
      emails.forEach((email) =>
        expect(`${email.subject}${email.text}`, locale).not.toMatch(/\{\w+\}/),
      );
    });
  });
});

describe('the subjects of the organisers’ emails (ticket 110)', () => {
  const santa = (santaName: string | null) => ({
    groupName: 'Famille Camille',
    editionLabel: 'Noël 2026',
    santaName,
    link: LINK,
  });
  const reminder = (santaName: string | null) =>
    buildReminderEmail(
      { ...santa(santaName), eventDate: '2026-12-25', missing: ['Léa'] },
      'fr',
    ).subject;

  it('names the event first', () => {
    expect(
      buildJoinedEmail(
        { groupName: 'Famille Camille', firstName: 'Zoé', link: LINK },
        'fr',
      ).subject,
    ).toBe('Famille Camille : Zoé s’inscrit par le lien');
    const several = buildJoinedEmail(
      {
        groupName: 'Famille Camille',
        santaName: 'Les adultes',
        firstName: 'Zoé',
        link: LINK,
      },
      'fr',
    );
    expect(several.subject).toBe(
      'Famille Camille (Les adultes) : Zoé s’inscrit par le lien',
    );
    expect(several.text).toContain(
      'au Secret Santa « Famille Camille (Les adultes) »',
    );
    expect(buildAllViewedEmail(santa(null), 'fr').subject).toBe(
      'Famille Camille : toutes les enveloppes sont ouvertes',
    );
    expect(reminder(null)).toBe('Famille Camille : le jour J approche');
  });

  it('adds the Secret Santa when the event has two that year', () => {
    expect(buildAllViewedEmail(santa('Les enfants'), 'fr').subject).toBe(
      'Famille Camille (Les enfants) : toutes les enveloppes sont ouvertes',
    );
    expect(reminder('Les enfants')).toBe(
      'Famille Camille (Les enfants) : le jour J approche',
    );
  });
});
