// Nuxt UI theme: brick red, pine green, mustard, cranberry and warm stone, a Christmas-card
// palette (see README section 11 and the art direction note).
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'brick',
      secondary: 'pine',
      neutral: 'stone',
      success: 'pine',
      warning: 'mustard',
      error: 'cranberry',
    },
    button: { defaultVariants: { size: 'lg' } },
    input: { defaultVariants: { size: 'lg' } },
    select: { defaultVariants: { size: 'lg' } },
    textarea: { defaultVariants: { size: 'lg' } },
    // Mobile first, and kept that way on larger screens: pages sit in a
    // phone-wide column (max-w-md), and so do the bottom sheets.
    // A sheet never grows past the visible height: its body scrolls, its
    // head and foot stay, and its content keeps clear of the iPhone's
    // corners and home bar while its ground reaches the edge (README 23.3).
    drawer: {
      slots: {
        content:
          'max-h-[calc(100dvh-env(safe-area-inset-top)-0.5rem)] rounded-t-[20px] sm:mx-auto sm:max-w-md sm:rounded-t-2xl',
        container:
          'min-h-0 gap-4 overflow-hidden px-0 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))]',
        header: 'shrink-0 px-[max(1rem,env(safe-area-inset-left))]',
        // A little room above and below, taken back by the margins: the
        // frame of a box at the very top or bottom is not clipped.
        body: '-my-1 min-h-0 overflow-y-auto overscroll-contain px-[max(1rem,env(safe-area-inset-left))] py-1',
        footer: 'shrink-0 px-[max(1rem,env(safe-area-inset-left))]',
      },
    },
    // Toasts stay clear of the iPhone's notch and home bar.
    toaster: {
      slots: {
        viewport:
          'mb-[env(safe-area-inset-bottom)] mt-[env(safe-area-inset-top)]',
      },
    },
  },
});
