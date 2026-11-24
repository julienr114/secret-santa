import { describe, expect, it } from 'vitest';
import {
  REMINDER_DAYS,
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

describe('the reminder email', () => {
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

  it('leaves no placeholder in any language', () => {
    (['fr', 'en', 'de'] as const).forEach((locale) => {
      const email = buildReminderEmail(
        {
          groupName: 'G',
          editionLabel: 'E',
          eventDate: '2026-12-25',
          missing: ['L'],
          link: LINK,
        },
        locale,
      );
      expect(`${email.subject}${email.text}`, locale).not.toMatch(/\{\w+\}/);
    });
  });

  it('names the event, and the Secret Santa when it has two that year (ticket 110)', () => {
    const reminder = (santaName: string | null) =>
      buildReminderEmail(
        {
          groupName: 'Famille Camille',
          editionLabel: 'Noël 2026',
          santaName,
          link: LINK,
          eventDate: '2026-12-25',
          missing: ['Léa'],
        },
        'fr',
      ).subject;
    expect(reminder(null)).toBe('Famille Camille : le jour J approche');
    expect(reminder('Les enfants')).toBe(
      'Famille Camille (Les enfants) : le jour J approche',
    );
  });
});
