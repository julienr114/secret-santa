import { describe, it, expect } from 'vitest';
import {
  EMAIL_BATCH_MAX,
  defaultMessageType,
  MESSAGE_TYPES,
  NOTE_MAX,
  addNote,
  buildEmail,
  buildMessage,
  emailTargets,
  escapeHtml,
  messageTypesFor,
  type MessageData,
} from './messages';
import { failureOf, valueOf } from '~~/tests/helpers';

const data: MessageData = {
  firstName: 'Léa',
  groupName: 'la famille Rabin',
  editionLabel: 'Noël 2026',
  link: 'https://secret-santa.example/p/abc123',
};

describe('buildMessage', () => {
  it('ends with the link alone on its own line, for every type', () => {
    MESSAGE_TYPES.forEach((type) => {
      const text = valueOf(buildMessage(type, data));
      const lines = text.split('\n');
      expect(lines.at(-1), type).toBe(data.link);
      expect(text.indexOf(data.link), type).toBe(text.lastIndexOf(data.link));
      expect(text, type).toContain('Léa');
    });
  });

  it('writes the invitation and the drawn message with budget and date', () => {
    expect(valueOf(buildMessage('invitation', data))).toBe(
      'Salut Léa ! 🎁\nTu participes au Secret Santa de la famille Rabin (Noël 2026).\nOuvre ton lien et laisse quelques pistes de cadeaux :\nhttps://secret-santa.example/p/abc123',
    );
    expect(
      valueOf(
        buildMessage('drawn', {
          ...data,
          budget: '20 € max',
          eventDate: '24 décembre',
        }),
      ),
    ).toBe(
      'Léa, le tirage est fait ! 🎁\nBudget : 20 € max.\nRendez-vous le 24 décembre.\nOuvre ton lien pour découvrir à qui tu offres un cadeau :\nhttps://secret-santa.example/p/abc123',
    );
    expect(valueOf(buildMessage('drawn', data))).not.toContain('Budget');
  });

  it('writes a short reminder', () => {
    expect(valueOf(buildMessage('reminder', data))).toContain(
      "ton lien t'attend",
    );
  });

  it('never leaks a result, whatever extra data is passed', () => {
    const poisoned = {
      ...data,
      receiverFirstName: 'Tom',
      receiverId: 'p2',
      assignments: ['Tom'],
    } as MessageData;
    MESSAGE_TYPES.forEach((type) => {
      expect(valueOf(buildMessage(type, poisoned)), type).not.toMatch(/Tom|p2/);
    });
  });

  it('rejects unknown types', () => {
    expect(failureOf(buildMessage('spam', data))).toEqual({
      ok: false,
      reason: 'unknown_message_type',
      details: { type: 'spam' },
    });
  });
});

describe('messageTypesFor', () => {
  it('offers no draw message before the draw', () => {
    expect(messageTypesFor('preparing')).toEqual(['invitation', 'reminder']);
  });

  it('offers the draw messages once drawn, and no invitation any more', () => {
    expect(messageTypesFor('drawn')).toEqual(['drawn', 'reminder', 'redraw']);
  });

  it('offers nothing in a draft or a closed edition', () => {
    expect(messageTypesFor('closed')).toEqual([]);
  });
});

describe('buildEmail', () => {
  it('gives every type a subject with the first name, a text and an HTML twin', () => {
    MESSAGE_TYPES.forEach((type) => {
      const email = valueOf(buildEmail(type, data));
      expect(email.subject, type).toContain('Léa');
      expect(email.subject, type).not.toContain('\n');
      expect(email.text, type).toContain(data.link);
      expect(email.html, type).toContain(`href="${data.link}"`);
      expect(email.text, type).toContain('la famille Rabin');
    });
  });

  it('keeps the link alone on its line in the text', () => {
    const { text } = valueOf(buildEmail('invitation', data));
    expect(text.split('\n')).toContain(data.link);
  });

  it('escapes what comes from the guardian in the HTML', () => {
    const { html, text } = valueOf(
      buildEmail('drawn', {
        ...data,
        firstName: '<b>Léa</b>',
        budget: '20 € & "pas plus"',
      }),
    );
    expect(html).not.toContain('<b>Léa</b>');
    expect(html).toContain('&lt;b&gt;Léa&lt;/b&gt;');
    expect(html).toContain('20 € &amp; &quot;pas plus&quot;');
    expect(text).toContain('20 € & "pas plus"');
  });

  it('never leaks a result, whatever extra data is passed', () => {
    const poisoned = {
      ...data,
      receiverFirstName: 'Tom',
      receiverId: 'p2',
    } as MessageData;
    MESSAGE_TYPES.forEach((type) => {
      const email = valueOf(buildEmail(type, poisoned));
      expect(JSON.stringify(email), type).not.toMatch(/Tom|p2/);
    });
  });

  it('rejects unknown types', () => {
    expect(failureOf(buildEmail('spam', data)).reason).toBe(
      'unknown_message_type',
    );
  });
});

describe('escapeHtml', () => {
  it('escapes the five significant characters', () => {
    expect(escapeHtml(`<a href="x">Tom & 'Léa'</a>`)).toBe(
      '&lt;a href=&quot;x&quot;&gt;Tom &amp; &#39;Léa&#39;&lt;/a&gt;',
    );
  });
});

describe('emailTargets', () => {
  const person = (
    participationId: string,
    email: string | null,
    messageSentAt: string | null = null,
  ) => ({ participationId, email, messageSentAt });
  const people = [
    person('a', 'a@example.com'),
    person('b', null),
    person('c', 'c@example.com', '2026-11-13T10:00:00.000Z'),
  ];

  it('writes only to people with an address not marked as sent', () => {
    const result = emailTargets(people, 'unsent');
    expect(result.targets.map((p) => p.participationId)).toEqual(['a']);
    expect(result.withoutEmail).toBe(1);
    expect(result.left).toBe(0);
  });

  it('writes to everyone with an address when asked', () => {
    expect(
      emailTargets(people, 'all').targets.map((p) => p.participationId),
    ).toEqual(['a', 'c']);
  });

  it('caps a request to one batch and says how many are left', () => {
    const many = Array.from({ length: EMAIL_BATCH_MAX + 7 }, (_, i) =>
      person(`p${i}`, `p${i}@example.com`),
    );
    const result = emailTargets(many, 'unsent');
    expect(result.targets).toHaveLength(EMAIL_BATCH_MAX);
    expect(result.left).toBe(7);
  });
});

describe('languages', () => {
  it("writes the message in the recipient's language, link last", () => {
    const english = valueOf(buildMessage('invitation', data, 'en'));
    const german = valueOf(buildMessage('invitation', data, 'de'));
    expect(english.split('\n')[0]).toBe('Hi Léa! 🎁');
    expect(german.split('\n')[0]).toBe('Hallo Léa! 🎁');
    [english, german].forEach((text) => {
      expect(text.split('\n').at(-1)).toBe(data.link);
      expect(text).toContain('la famille Rabin');
      expect(text).not.toContain('{');
    });
  });

  it('translates subject, text and signature of an email', () => {
    const email = valueOf(
      buildEmail(
        'drawn',
        { ...data, budget: '20 €', eventDate: '24.12.' },
        'de',
      ),
    );
    expect(email.subject).toBe('Léa, die Wichtel-Auslosung ist erfolgt');
    expect(email.text).toContain('Budget: 20 €.');
    expect(email.text).toContain('Wir sehen uns am 24.12..');
    expect(email.text).toContain('Dieser Link ist persönlich');
    expect(email.html).not.toContain('{');
  });

  it('leaves no placeholder unfilled, in any language or type', () => {
    (['fr', 'en', 'de'] as const).forEach((locale) => {
      MESSAGE_TYPES.forEach((type) => {
        const full = { ...data, budget: '20 €', eventDate: 'x' };
        const email = valueOf(buildEmail(type, full, locale));
        expect(
          `${email.subject}${email.text}${valueOf(buildMessage(type, full, locale))}`,
          `${locale} ${type}`,
        ).not.toMatch(/\{\w+\}/);
      });
    });
  });
});

describe('emailTargets with chosen people', () => {
  const person = (
    participationId: string,
    email: string | null,
    messageSentAt: string | null = null,
  ) => ({ participationId, email, messageSentAt });
  const people = [
    person('a', 'a@example.com'),
    person('b', null),
    person('c', 'c@example.com', '2026-11-13T10:00:00.000Z'),
    person('d', 'd@example.com'),
  ];

  it('writes to the chosen ones, sent already or not, and nobody else', () => {
    const result = emailTargets(people, 'unsent', ['c', 'a']);
    expect(result.targets.map((p) => p.participationId)).toEqual(['a', 'c']);
    expect(result.withoutEmail).toBe(0);
  });

  it('counts the chosen ones who have no address, and ignores unknown ids', () => {
    const result = emailTargets(people, 'all', ['b', 'd', 'nobody']);
    expect(result.targets.map((p) => p.participationId)).toEqual(['d']);
    expect(result.withoutEmail).toBe(1);
  });
});

describe('date of the party in a message', () => {
  it("is written in the recipient's language when it is a real date", () => {
    const dated = { ...data, eventDate: '2026-12-24' };
    expect(valueOf(buildMessage('drawn', dated, 'fr'))).toContain(
      'Rendez-vous le 24 décembre.',
    );
    expect(valueOf(buildMessage('drawn', dated, 'en'))).toContain(
      'See you on December 24.',
    );
    expect(valueOf(buildMessage('drawn', dated, 'de'))).toContain(
      'Wir sehen uns am 24. Dezember.',
    );
  });
});

describe("the organiser's note", () => {
  const plain = valueOf(buildMessage('invitation', data));

  it('goes below the message by default, set apart by an empty line', () => {
    const text = valueOf(
      buildMessage(
        'invitation',
        data,
        'fr',
        'Rendez-vous chez Mamie.\n\nÀ 19 h !',
      ),
    );
    expect(text).toBe(`${plain}\n\nRendez-vous chez Mamie.\nÀ 19 h !`);
    // The standard text is untouched: the link still follows its sentence.
    expect(text.split('\n')[3]).toBe(data.link);
    expect(addNote(plain, ' Rendez-vous chez Mamie.\n\nÀ 19 h ! ')).toBe(text);
  });

  it('goes above the message when asked', () => {
    const text = addNote(plain, 'Rendez-vous chez Mamie.', 'before');
    expect(text).toBe(`Rendez-vous chez Mamie.\n\n${plain}`);
    expect(text.split('\n').at(-1)).toBe(data.link);
    expect(
      valueOf(
        buildMessage(
          'invitation',
          data,
          'fr',
          'Rendez-vous chez Mamie.',
          'before',
        ),
      ),
    ).toBe(text);
  });

  it('changes nothing when empty', () => {
    expect(addNote(plain, '')).toBe(plain);
    expect(addNote(plain, '  \n ', 'before')).toBe(plain);
    expect(valueOf(buildMessage('invitation', data, 'fr', null))).toBe(plain);
  });

  it('is sent as written in an email, escaped in the HTML, at the chosen place', () => {
    const note = 'Apporte un <dessert> & ta bonne humeur';
    const below = valueOf(buildEmail('invitation', data, 'de', note));
    expect(below.text).toContain(`${data.link}\n\n${note}\n\n`);
    expect(below.html).toContain(
      'Apporte un &lt;dessert&gt; &amp; ta bonne humeur',
    );
    expect(below.html.indexOf('Apporte')).toBeGreaterThan(
      below.html.indexOf('href='),
    );
    const above = valueOf(buildEmail('invitation', data, 'de', note, 'before'));
    expect(above.text.startsWith(`${note}\n\nHallo Léa!`)).toBe(true);
    expect(above.html.indexOf('Apporte')).toBeLessThan(
      above.html.indexOf('Hallo'),
    );
  });

  it('is cut at its maximum length', () => {
    const text = addNote('a\nlink', 'x'.repeat(NOTE_MAX + 50));
    expect(text.split('\n').at(-1)).toHaveLength(NOTE_MAX);
  });
});

describe('defaultMessageType', () => {
  it('invites before the draw, then reminds', () => {
    expect(defaultMessageType('preparing', false, false)).toBe('invitation');
    expect(defaultMessageType('preparing', true, false)).toBe('reminder');
  });

  it('says the draw is done, then reminds', () => {
    expect(defaultMessageType('drawn', false, false)).toBe('drawn');
    expect(defaultMessageType('drawn', true, false)).toBe('reminder');
  });

  it('announces a new draw after a redraw', () => {
    expect(defaultMessageType('drawn', false, true)).toBe('redraw');
    expect(defaultMessageType('drawn', true, true)).toBe('reminder');
  });

  it('offers nothing once closed', () => {
    expect(defaultMessageType('closed', false, false)).toBeNull();
  });

  it('always offers a message the stage allows', () => {
    for (const status of ['preparing', 'drawn'])
      for (const sent of [true, false])
        for (const redrawn of [true, false])
          expect(messageTypesFor(status)).toContain(
            defaultMessageType(status, sent, redrawn),
          );
  });
});
