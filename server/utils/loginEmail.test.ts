import { describe, expect, it } from 'vitest';
import { buildLoginEmail } from './loginEmail';

const LINK = 'https://under-the-tree.party/login/abc_DEF-123';

describe('buildLoginEmail', () => {
  it('puts the link alone on its line, in the text and as a link in the HTML', () => {
    const email = buildLoginEmail(LINK, 'fr');
    expect(email.subject).toBe('Ton lien de connexion à Under the Tree');
    expect(email.text.split('\n')[1]).toBe(LINK);
    expect(email.html).toContain(`href="${LINK}"`);
  });

  it('is written in the language of the account, without placeholders', () => {
    (['fr', 'en', 'de'] as const).forEach((locale) => {
      const email = buildLoginEmail(LINK, locale);
      expect(`${email.subject}${email.text}`, locale).not.toMatch(/\{\w+\}/);
    });
    expect(buildLoginEmail(LINK, 'de').text).toContain('15 Minuten');
    expect(buildLoginEmail(LINK, 'en').subject).toContain('login link');
  });

  it('escapes the link in the HTML', () => {
    expect(buildLoginEmail('https://x.test/?a=1&b="2"', 'fr').html).toContain(
      'https://x.test/?a=1&amp;b=&quot;2&quot;',
    );
  });
});
