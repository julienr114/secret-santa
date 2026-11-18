/**
 * The start of an idea, to name it in a title: up to its first comma,
 * colon or parenthesis, and 40 characters at most.
 * @param text - The idea.
 * @returns Its short name.
 */
export const ideaShort = (text: string): string => {
  const head = text.split(/[,:(]/)[0]?.trim() ?? text;
  return head.length > 40 ? `${head.slice(0, 39).trimEnd()}…` : head;
};
