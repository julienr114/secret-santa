import { describe, expect, it } from 'vitest';
import { buildHolderInviteEmail } from './listEmail';

describe('the invitation to hold a list', () => {
  it('says who invites, to which list, with the link alone on its line', () => {
    const email = buildHolderInviteEmail(
      { by: 'Camille', title: 'Noël 2026' },
      'https://exemple.fr/listes/abc',
      'fr',
    );
    expect(email.subject).toBe(
      'Camille t’invite à tenir la liste « Noël 2026 »',
    );
    expect(email.text).toContain('Camille t’invite à tenir avec');
    expect(email.text.split('\n')).toContain('https://exemple.fr/listes/abc');
    expect(email.text).toContain('ignore cet email');
  });

  it('is written in the three languages', () => {
    for (const locale of ['en', 'de'] as const) {
      const email = buildHolderInviteEmail(
        { by: 'Camille', title: 'Noël 2026' },
        'https://exemple.fr/listes/abc',
        locale,
      );
      expect(email.subject).toContain('Camille');
      expect(email.subject).toContain('Noël 2026');
    }
  });
});
