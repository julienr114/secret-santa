// Nuxt UI theme, « Sorbet » (README 23.5): coral, mint, lilac, cranberry
// and plum.
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'coral',
      secondary: 'mint',
      neutral: 'plum',
      success: 'mint',
      warning: 'lilac',
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
        // The veil behind a sheet (README 23.5).
        overlay: 'bg-veil/75',
        // The height, the keyboard and the corners are set by UiSheet, after
        // the drawer's own direction classes.
        content: 'sm:mx-auto sm:max-w-md sm:rounded-t-3xl',
        // At the bottom, the home bar's room or 1 rem, whichever is more,
        // not both (asked by Julien on 18 November 2026); above the
        // keyboard (--sheet-lift), 1 rem.
        container:
          'min-h-0 gap-4 overflow-hidden px-0 pt-4 pb-[max(1rem,calc(env(safe-area-inset-bottom)-var(--sheet-lift,0px)))]',
        header: 'shrink-0 px-[max(1rem,env(safe-area-inset-left))]',
        // A little room above and below, taken back by the margins: the
        // frame of a box at the very top or bottom is not clipped.
        body: '-my-1 min-h-0 overflow-y-auto overscroll-contain px-[max(1rem,env(safe-area-inset-left))] py-1',
        footer: 'shrink-0 px-[max(1rem,env(safe-area-inset-left))]',
      },
    },
    // The messages after an action (README 23.3, Correction 26, maquette
    // StyleMessages): at the bottom, centred, above the bar of tabs and
    // the edge of the phone, 420 px wide at most on a computer; at the
    // top, under the title bar, while the keyboard is open (`app.vue`).
    toaster: {
      slots: {
        viewport:
          'mb-[calc(var(--tab-bar)+env(safe-area-inset-bottom))] mt-[calc(env(safe-area-inset-top)+3.5rem+var(--message-top,0px))] sm:w-[420px]',
      },
    },
    // One dark plum bar for every one of them: white text, the detail
    // lighter, a cast shadow, no outline. What differs between the three
    // kinds is in `useMessages`.
    toast: {
      slots: {
        root: 'min-h-13 items-center gap-3 rounded-[18px] bg-inverted py-2 pr-2 pl-4 shadow-[0_10px_28px_rgba(41,37,36,0.3)] ring-0',
        title: 'text-[15px] font-semibold text-inverted',
        description: 'text-[13px] font-normal text-message-detail',
        actions: 'shrink-0',
      },
      variants: {
        title: { true: { description: 'mt-0' } },
        // Whatever the kind, the dot, the text and the cross sit in the
        // middle of the bar's height (the default pushes them to the top).
        orientation: {
          vertical: { root: 'items-center', actions: 'items-center mt-0' },
        },
      },
    },
  },
});
