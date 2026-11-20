import type { HomeData } from '#server/database/homeParties';
import { keys } from './keys';
import { useApiQuery } from './useApi';

// The home of the V3 (ticket 103).

export type HomePartiesPayload = HomeData & { firstName: string | null };

/** My parties, their Secret Santas and lists, and my people. */
export const useHomePartiesQuery = () =>
  useApiQuery<HomePartiesPayload>(
    () => keys.homeParties(),
    () => '/api/home',
  );
