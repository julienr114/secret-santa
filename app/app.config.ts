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
  },
});
