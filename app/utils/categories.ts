import type { PartyCategory } from '#shared/utils/categories';

/** The tint of a category's pill and icon: green for Christmas, lilac else. */
export const categoryTint = (category: PartyCategory): string =>
  category === 'christmas'
    ? 'bg-mint-100 text-mint-500'
    : 'bg-lilac-100 text-lilac-800';
