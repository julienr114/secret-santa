// Nuxt UI theme: brick red, pine green and warm stone, a Christmas-card
// palette (see README section 11 and the art direction note).
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'brick',
      secondary: 'pine',
      neutral: 'stone',
      warning: 'orange',
    },
    button: { defaultVariants: { size: 'lg' } },
    input: { defaultVariants: { size: 'lg' } },
    select: { defaultVariants: { size: 'lg' } },
    textarea: { defaultVariants: { size: 'lg' } },
    // Mobile first, and kept that way on larger screens: pages sit in a
    // phone-wide column (max-w-md), and so do the bottom sheets.
    drawer: {
      slots: { content: 'sm:mx-auto sm:max-w-md sm:rounded-t-2xl' },
    },
  },
});
