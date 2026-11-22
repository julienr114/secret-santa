import { describe, expect, it } from 'vitest';
import { buildSwitchEmail, switchRecipients } from './switchEmail';

const APP = 'https://under-the-tree.party/';

describe('buildSwitchEmail', () => {
  it('says the word of the switch, then the address of the app', () => {
    const email = buildSwitchEmail(APP, 'fr', false);
    expect(email.subject).toBe('Under the Tree a changé');
    const lines = email.text.split('\n');
    expect(lines[0]).toMatch(/^Under the Tree a changé\. Tes groupes/);
    expect(lines[1]).toBe(APP);
    expect(email.text).not.toContain('toujours ouverte');
    expect(email.html).toContain(`href="${APP}"`);
  });

  it('adds the sentence on the link for those who held a list shared by it', () => {
    expect(buildSwitchEmail(APP, 'fr', true).text.split('\n')[1]).toBe(
      'Ta liste est toujours ouverte à ceux qui ont son lien.',
    );
    expect(buildSwitchEmail(APP, 'en', true).text).toContain(
      'still open to anyone who has its link',
    );
  });

  it('is written in the language of the account, never with an image', () => {
    (['fr', 'en', 'de'] as const).forEach((locale) => {
      const email = buildSwitchEmail(APP, locale, true);
      expect(`${email.subject}${email.text}`, locale).not.toMatch(/\{\w+\}/);
      expect(email.html, locale).not.toContain('<img');
    });
    expect(buildSwitchEmail(APP, 'de', false).subject).toBe(
      'Under the Tree hat sich verändert',
    );
  });
});

describe('switchRecipients', () => {
  const output = [
    {
      results: [
        { email: 'Camille@example.com', language: 'fr', with_link: 0 },
        { email: 'hugo@example.com', language: 'en', with_link: 1 },
        { email: 'camille@example.com', language: 'fr', with_link: 0 },
        { email: 'zoe@example.com', language: null, with_link: 0 },
        { email: null, language: 'de', with_link: 0 },
      ],
      success: true,
    },
  ];

  it('reads the output of wrangler: each address once, in its language', () => {
    expect(switchRecipients(output, new Set())).toEqual([
      { email: 'camille@example.com', locale: 'fr', withLink: false },
      { email: 'hugo@example.com', locale: 'en', withLink: true },
      { email: 'zoe@example.com', locale: 'fr', withLink: false },
    ]);
  });

  it('leaves out those already sent to: the email goes once', () => {
    expect(
      switchRecipients(output, new Set(['hugo@example.com'])).map(
        ({ email }) => email,
      ),
    ).toEqual(['camille@example.com', 'zoe@example.com']);
  });

  it('gives nobody for an output it does not know', () => {
    expect(switchRecipients({}, new Set())).toEqual([]);
    expect(switchRecipients(null, new Set())).toEqual([]);
  });
});
