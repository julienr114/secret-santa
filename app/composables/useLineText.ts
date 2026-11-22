import type { LinePart, LineText } from '#shared/utils/lines';

/**
 * The words of the lines of the home and of an event (lignes.md): a
 * title, and a text whose pieces are joined by « · ».
 * @returns `part` for one piece, `line` for a whole text.
 */
export const useLineText = () => {
  const { tk } = useT();
  const guessEnd = useGuessEnd();
  const part = (piece: LinePart): string =>
    tk(
      piece.key,
      piece.end ? { ...piece.params, end: guessEnd(piece.end) } : piece.params,
    );
  const line = (text: LineText | null | undefined): string | undefined =>
    text && text.parts.length > 0
      ? text.parts.map(part).join(' · ')
      : undefined;
  return { part, line };
};
