/**
 * Copies a text. The clipboard of the browser only exists on a secure
 * page (https, or localhost): elsewhere, as on a phone that opens the
 * development server by its address on the wifi, the text is copied the
 * old way, from a field selected off the screen.
 * @param text - What to copy.
 * @returns Whether it was copied.
 */
export const copyText = async (text: string): Promise<boolean> => {
  if (navigator.clipboard) {
    const done = await navigator.clipboard.writeText(text).then(
      () => true,
      () => false,
    );
    if (done) return true;
  }
  const field = document.createElement('textarea');
  field.value = text;
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.opacity = '0';
  document.body.append(field);
  field.select();
  field.setSelectionRange(0, text.length);
  const copied = document.execCommand('copy');
  field.remove();
  return copied;
};
