import { describe, it, expect } from 'vitest';
import { MESSAGE_TYPES, buildMessage, type MessageData } from './messages';
import { failureOf, valueOf } from '../../tests/helpers';

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
      'Salut Léa ! 🎁\nTu participes au Secret Santa de la famille Rabin (Noël 2026).\nOuvre ton lien, choisis ton code secret et note quelques idées de cadeaux :\nhttps://secret-santa.example/p/abc123',
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

  it('adapts the reminder to the participant state', () => {
    expect(
      valueOf(buildMessage('reminder', { ...data, pinChosen: false })),
    ).toContain('choisi ton code');
    expect(
      valueOf(buildMessage('reminder', { ...data, pinChosen: true })),
    ).toContain('consulté ton résultat');
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
