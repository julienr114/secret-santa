import { describe, expect, it } from 'vitest';
import {
  buildDecisionEmail,
  buildGroupRequestEmail,
  buildLoginEmail,
} from './loginEmail';

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

describe('buildGroupRequestEmail', () => {
  const request = {
    email: 'lea@example.com',
    message: 'Le Noël <des> cousins',
  };

  it('names who asks, quotes their words and ends on the admin link', () => {
    const email = buildGroupRequestEmail(request, LINK, 'fr');
    expect(email.subject).toContain('demande de groupe');
    expect(email.text).toContain('lea@example.com demande à créer un groupe');
    expect(email.text).toContain(request.message);
    expect(email.text.split('\n').at(-1)).toBe(LINK);
  });

  it('escapes the words of the asker in the HTML', () => {
    expect(buildGroupRequestEmail(request, LINK, 'fr').html).toContain(
      'Le Noël &lt;des&gt; cousins',
    );
  });

  it('leaves no placeholder in any language', () => {
    (['fr', 'en', 'de'] as const).forEach((locale) => {
      const email = buildGroupRequestEmail(request, LINK, locale);
      expect(`${email.subject}${email.text}`, locale).not.toMatch(/\{\w+\}/);
    });
  });
});

describe('buildDecisionEmail', () => {
  it('says whether the request was approved or refused', () => {
    expect(buildDecisionEmail(true, LINK, 'fr').text).toContain('acceptée');
    expect(buildDecisionEmail(false, LINK, 'fr').text).toContain('refusée');
    expect(buildDecisionEmail(true, LINK, 'en').subject).not.toBe(
      buildDecisionEmail(false, LINK, 'en').subject,
    );
  });

  it('carries the word of the super-admin, escaped in the HTML', () => {
    const email = buildDecisionEmail(
      false,
      LINK,
      'fr',
      'Complet <cette> année',
    );
    expect(email.text).toContain(
      "Le mot de l'administrateur :\nComplet <cette> année",
    );
    expect(email.html).toContain('Complet &lt;cette&gt; année');
    expect(buildDecisionEmail(false, LINK, 'fr').text).not.toContain(
      "Le mot de l'administrateur",
    );
  });

  it('carries the link to the app', () => {
    expect(buildDecisionEmail(true, LINK, 'de').html).toContain(
      `href="${LINK}"`,
    );
  });
});
