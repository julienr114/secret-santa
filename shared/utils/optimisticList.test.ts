import { describe, expect, it } from 'vitest';
import {
  withIdeaAdded,
  withIdeaChanged,
  withListChanged,
  withoutIdea,
} from './optimisticList';

const doc = {
  people: [
    {
      id: 'leo',
      ideas: [
        { id: 'a', text: 'Vélo' },
        { id: 'b', text: 'Puzzle' },
      ],
      lines: ['a', 'x', 'b'],
    },
    { id: 'zoe', ideas: [{ id: 'c', text: 'Poupée' }] },
  ],
};

describe('what is written in a list shows at once', () => {
  it('changes an idea in place', () => {
    const next = withIdeaChanged(doc, 'b', { text: 'Puzzle 1000 pièces' });
    expect(next.people[0]?.ideas[1]?.text).toBe('Puzzle 1000 pièces');
    expect(next.people[1]).toEqual(doc.people[1]);
  });

  it('takes an idea off, and off the order of its person', () => {
    const next = withoutIdea(doc, 'a');
    expect(next.people[0]?.ideas.map((i) => i.id)).toEqual(['b']);
    expect(next.people[0]?.lines).toEqual(['x', 'b']);
  });

  it('puts a new idea after its line, else at the end', () => {
    const after = withIdeaAdded(doc, 'leo', 'a', { id: 'n', text: 'Livre' });
    expect(after.people[0]?.ideas.map((i) => i.id)).toEqual(['a', 'n', 'b']);
    expect(after.people[0]?.lines).toEqual(['a', 'n', 'x', 'b']);
    const end = withIdeaAdded(doc, 'zoe', null, { id: 'n', text: 'Livre' });
    expect(end.people[1]?.ideas.map((i) => i.id)).toEqual(['c', 'n']);
    expect(end.people[1]).not.toHaveProperty('lines');
  });

  it('changes the head of a list, its word as written', () => {
    const list = {
      title: 'Noël',
      eventDate: null,
      icon: { emoji: '🎄', color: 'pine' },
      note: { kind: 'none' as const },
    };
    expect(withListChanged(list, { title: 'Noël 2026' }).title).toBe(
      'Noël 2026',
    );
    expect(withListChanged(list, { note: ' Bonjour ' }).note).toEqual({
      kind: 'text',
      text: 'Bonjour',
    });
    expect(
      withListChanged(
        { ...list, note: { kind: 'text', text: 'x' } },
        {
          note: null,
        },
      ).note,
    ).toEqual({ kind: 'none' });
  });
});
