// The title and the text of each line of the home and of the page of an
// event (docs/spec/v3/lignes.md, tickets 112 and 120): for each line, its
// cases in order, the first that applies is written; the red dot goes
// with the cases marked ● there. Pure: the server reads the facts, these
// choose the words, the screen translates them. Never a result of a draw,
// never who asks for ideas: no fact here carries a name of that kind.

/** A piece of a text: a key of the dictionaries and its values. */
export type LinePart = {
  key: string;
  params?: Record<string, string | number>;
  /** The end of « Devine qui » (an instant), written by the screen. */
  end?: string;
};

/** The text under a line, its pieces joined by « · », and its dot. */
export type LineText = { parts: LinePart[]; dot: boolean };

const part = (key: string, params?: LinePart['params']): LinePart =>
  params ? { key, params } : { key };

const text = (parts: LinePart[], dot = false): LineText => ({ parts, dot });

/**
 * Up to three names, then « Léo, Zoé et 2 autres » (lignes.md, « La ligne
 * d'une liste »).
 * @param prefix - The keys: `${prefix}.one`, `.two`, `.three`, `.more`.
 * @param names - The first names, in their order.
 * @returns The piece.
 */
export const namesPart = (
  prefix: string,
  names: readonly string[],
): LinePart => {
  const [a = '', b = '', c = ''] = names;
  if (names.length <= 1) return part(`${prefix}.one`, { a });
  if (names.length === 2) return part(`${prefix}.two`, { a, b });
  if (names.length === 3) return part(`${prefix}.three`, { a, b, c });
  return part(`${prefix}.more`, { a, b, count: names.length - 2 });
};

/** What the line of a Secret Santa needs, seen by one who takes part. */
export type ParticipantFacts = {
  drawn: boolean;
  /** I opened my envelope. */
  opened: boolean;
  revealed: boolean;
  /** I looked at my page since the reveal. */
  revealSeen: boolean;
  /** Someone asked me for ideas, and I have not been back since. */
  asked: boolean;
  /** The list or the tastes of the one I drew changed since my visit. */
  receiverNews: boolean;
};

/**
 * The text of a Secret Santa for one who takes part (lignes.md, « Le
 * texte du participant »).
 * @param facts - Where the draw and I are.
 * @returns The text.
 */
export const participantLine = (facts: ParticipantFacts): LineText => {
  if (!facts.drawn) return text([part('lines.santa.notDrawn')]);
  if (!facts.opened) return text([part('lines.santa.envelope')], true);
  if (facts.revealed && !facts.revealSeen) {
    return text([part('lines.santa.revealedNew')], true);
  }
  if (facts.asked) return text([part('lines.santa.asked')], true);
  if (facts.receiverNews) return text([part('lines.santa.receiverNews')], true);
  if (facts.revealed) return text([part('lines.santa.revealed')]);
  return text([part('lines.santa.knows')]);
};

/** What the line of a Secret Santa needs, seen by its organiser. */
export type OrganiserFacts = {
  status: 'preparing' | 'drawn' | 'closed';
  revealed: boolean;
  participants: number;
  /** How many opened their envelope. */
  viewed: number;
};

/**
 * The text of a Secret Santa for its organiser (lignes.md, « Le texte de
 * l'organisateur »). A Secret Santa revealed is no longer « Tiré »: its
 * cases come before those of the draw.
 * @param facts - Its status and its counts.
 * @returns The text.
 */
export const organiserLine = (facts: OrganiserFacts): LineText => {
  if (facts.status === 'closed') return text([part('lines.organiser.over')]);
  if (facts.status === 'preparing') {
    return text([
      part('lines.organiser.prepare'),
      part('lines.organiser.participants', { count: facts.participants }),
    ]);
  }
  if (facts.revealed) return text([part('lines.organiser.revealed')]);
  return text([
    part('lines.organiser.done'),
    facts.viewed < facts.participants
      ? part('lines.organiser.someViewed', {
          viewed: facts.viewed,
          count: facts.participants,
        })
      : part('lines.organiser.allViewed'),
  ]);
};

/** What the line « Devine qui » needs. */
export type GameFacts = {
  /** The game is on, the draw made, and I take part. */
  shown: boolean;
  open: boolean;
  /** I made a guess (or passed my turn). */
  played: boolean;
  /** The palmarès came out. */
  resultsOut: boolean;
  resultsSeen: boolean;
  /** The end of the guesses (an instant). */
  endsAt: string | null;
};

/**
 * The text of « Devine qui » (lignes.md, « La ligne « Devine qui » »), or
 * null when the line is not shown.
 * @param facts - Where the game and I are.
 * @returns The text, or null.
 */
export const gameLine = (facts: GameFacts): LineText | null => {
  if (!facts.shown) return null;
  if (facts.resultsOut) {
    return facts.resultsSeen
      ? text([part('lines.game.palmares')])
      : text([part('lines.game.palmaresNew')], true);
  }
  if (facts.open && !facts.played) {
    return text(
      facts.endsAt
        ? [
            part('lines.game.play'),
            { key: 'lines.game.until', end: facts.endsAt },
          ]
        : [part('lines.game.play')],
      true,
    );
  }
  if (facts.open) {
    return text([part('lines.game.played'), part('lines.game.answerDay')]);
  }
  return text([part('lines.game.waiting')]);
};

/** Someone a list is made for: their first name, and whether it is me. */
export type ListPerson = { name: string; me: boolean };

/** What the line of a list needs. */
export type ListFacts = {
  /** I hold it. */
  holder: boolean;
  /** The people it is made for, in their order (« nobody » left out). */
  people: readonly ListPerson[];
  /** The first names of those who hold it, for a list made for nobody. */
  holders: readonly string[];
  draft: boolean;
  ideas: number;
  /** Ticks on it since my last visit (I hold it). */
  ticked: number;
  /** Here, only the one who drew me sees it (I hold it). */
  giverOnly: boolean;
  /** The other events it is in (I hold it). */
  elsewhere: readonly string[];
  /** The gifts I offer on it (someone else's). */
  offered: number;
  /** Ideas since my last visit, all of them before a first one. */
  newIdeas: number;
};

/**
 * The title of a list (lignes.md): « Ma liste » when I hold it, else
 * « La liste de » and those it is made for, or those who hold it.
 * @param facts - The list.
 * @returns The title.
 */
export const listTitle = (facts: ListFacts): LinePart => {
  if (facts.holder) return part('lines.list.mine');
  const names =
    facts.people.length > 0
      ? facts.people.map((person) => person.name)
      : facts.holders;
  return namesPart('lines.list.of', names);
};

/**
 * Whom my list is for, « moi » last: « Léo, Zoé et moi », or null when it
 * is for me alone (or for nobody).
 * @param people - Those it is made for.
 * @returns The piece, or null.
 */
const forWhom = (people: readonly ListPerson[]): LinePart | null => {
  const others = people.filter((person) => !person.me).map((p) => p.name);
  if (others.length === 0) return null;
  if (!people.some((person) => person.me)) {
    return namesPart('lines.names', others);
  }
  const [a = '', b = ''] = others;
  if (others.length === 1) return part('lines.names.twoMe', { a });
  if (others.length === 2) return part('lines.names.threeMe', { a, b });
  return part('lines.names.more', { a, b, count: others.length - 1 });
};

/**
 * The text of a list I hold (lignes.md, « Le texte, quand je la tiens »).
 * @param facts - The list.
 * @returns The text.
 */
const heldLine = (facts: ListFacts): LineText => {
  if (facts.draft) return text([part('lines.list.draft')]);
  if (facts.ideas === 0) return text([part('lines.list.empty')]);
  const first =
    forWhom(facts.people) ?? part('lines.list.ideas', { count: facts.ideas });
  if (facts.ticked > 0) {
    return text(
      [first, part('lines.list.ticked', { count: facts.ticked })],
      true,
    );
  }
  if (facts.giverOnly) return text([first, part('lines.list.giverOnly')]);
  const [only] = facts.elsewhere;
  if (facts.elsewhere.length === 1 && only !== undefined) {
    return text([first, part('lines.list.alsoOne', { name: only })]);
  }
  if (facts.elsewhere.length > 1) {
    return text([
      first,
      part('lines.list.alsoMany', { count: facts.elsewhere.length }),
    ]);
  }
  return text([first]);
};

/**
 * The text of someone else's list (lignes.md, « Le texte, quand elle est
 * à quelqu'un d'autre »).
 * @param facts - The list.
 * @returns The text.
 */
const othersLine = (facts: ListFacts): LineText => {
  if (facts.ideas === 0) return text([part('lines.list.empty')]);
  const offer = part('lines.list.offer', { count: facts.offered });
  const fresh = part('lines.list.newIdeas', { count: facts.newIdeas });
  if (facts.offered > 0 && facts.newIdeas > 0)
    return text([offer, fresh], true);
  if (facts.newIdeas > 0) return text([fresh], true);
  if (facts.offered > 0) return text([offer]);
  return text([part('lines.list.ideas', { count: facts.ideas })]);
};

/**
 * The text under the line of a list.
 * @param facts - The list.
 * @returns The text.
 */
export const listLine = (facts: ListFacts): LineText =>
  facts.holder ? heldLine(facts) : othersLine(facts);
