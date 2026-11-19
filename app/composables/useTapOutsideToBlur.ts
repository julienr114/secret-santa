/**
 * On a page where one writes (README 23.3): touching outside the field
 * closes the keyboard, which a phone does not always do by itself. A
 * touch on a field, a label or what can be pressed is left alone.
 * Nothing on the server.
 */
export const useTapOutsideToBlur = () => {
  const onPointerDown = (event: PointerEvent) => {
    const field = document.activeElement;
    if (
      !(field instanceof HTMLInputElement) &&
      !(field instanceof HTMLTextAreaElement)
    ) {
      return;
    }
    const target = event.target;
    if (
      target instanceof Element &&
      target.closest('input, textarea, select, label, button, a, [role]')
    ) {
      return;
    }
    field.blur();
  };
  onMounted(() => document.addEventListener('pointerdown', onPointerDown));
  onBeforeUnmount(() =>
    document.removeEventListener('pointerdown', onPointerDown),
  );
};
