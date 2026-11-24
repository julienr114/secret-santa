import { describe, expect, it } from 'vitest';
import {
  buildHolderInviteEmail,
  buildListSharedEmail,
  inviteDay,
} from './listEmail';

describe('the invitation to hold a list', () => {
  const invite = {
    by: 'Camille',
    title: 'Noël 2026',
    level: 'write' as const,
    expiresAt: '2026-11-26T20:00:00.000Z',
  };
  const link = 'https://exemple.fr/invitation/abc';

  it('says who invites, to which list, with the link alone on its line', () => {
    const email = buildHolderInviteEmail(invite, link, 'fr');
    expect(email.subject).toBe(
      'Camille t’invite à tenir la liste « Noël 2026 »',
    );
    expect(email.text).toContain('Camille t’invite à tenir à ses côtés');
    expect(email.text.split('\n')).toContain(link);
  });

  it('says what the level lets them do', () => {
    const write = buildHolderInviteEmail(invite, link, 'fr').text;
    expect(write).toContain('voir qui offre quoi');
    expect(write).not.toContain('partager');
    const manage = buildHolderInviteEmail(
      { ...invite, level: 'manage' },
      link,
      'fr',
    ).text;
    expect(manage).toContain('partager');
  });

  it('says until when it is good, that it can be refused, and what the app is', () => {
    const { text } = buildHolderInviteEmail(invite, link, 'fr');
    expect(text).toContain('Elle vaut 7 jours, jusqu’au 26 novembre.');
    expect(text).toContain('Tu peux aussi la refuser.');
    expect(text).toContain('gratuite et sans publicité');
  });

  it('has no link to report or to stop the emails before lots 39 and 35', () => {
    const { html } = buildHolderInviteEmail(invite, link, 'fr');
    expect(html.match(/<a /g)).toHaveLength(1);
  });

  it('counts the day at the hour of Paris', () => {
    expect(inviteDay('2026-11-25T23:30:00.000Z', 'fr')).toBe('26 novembre');
  });

  it('is written in the three languages', () => {
    for (const locale of ['en', 'de'] as const) {
      const email = buildHolderInviteEmail(invite, link, locale);
      expect(email.subject).toContain('Camille');
      expect(email.subject).toContain('Noël 2026');
      expect(email.text).not.toContain('lists.');
    }
  });
});

describe('the email of a list shared by an address', () => {
  const share = { by: 'Camille', title: 'Noël 2026' };
  const link = 'https://exemple.fr/l/k3Fq9xT2';

  it('says who shares which list, and what to do there, with the link alone', () => {
    const email = buildListSharedEmail(share, link, 'fr');
    expect(email.subject).toBe(
      'Camille a partagé sa liste « Noël 2026 » avec toi',
    );
    expect(email.text).toContain(
      'Camille a partagé avec toi sa liste de cadeaux « Noël 2026 ». Coche ce que tu offres, et personne n’aura la même idée.',
    );
    expect(email.text.split('\n')).toContain(link);
    expect(email.text).toContain('gratuite et sans publicité');
    expect(email.html.match(/<a /g)).toHaveLength(1);
    expect(email.html).not.toContain('<img');
  });

  it('is written in the three languages', () => {
    for (const locale of ['en', 'de'] as const) {
      const email = buildListSharedEmail(share, link, locale);
      expect(email.subject).toContain('Camille');
      expect(email.subject).toContain('Noël 2026');
      expect(email.text).not.toContain('lists.');
    }
  });
});
