import type { HomeData } from '#server/database/homeParties';
import type { OrganisedParty } from '#server/database/organising';
import type { listOrganisedSecretSantas } from '#server/database/quota';
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

/**
 * What « Créer › Un Secret Santa » shows: my parties, my limit, or the
 * pause of new Secret Santa.
 */
export type NewSecretSantaPayload = {
  paused: boolean;
  limitReached: boolean;
  parties: OrganisedParty[];
  secretSantas: Awaited<ReturnType<typeof listOrganisedSecretSantas>>;
};

/**
 * The parties I organise, or the Secret Santa that keep me at my limit.
 * @param enabled - Read only once the step is shown.
 * @returns The query.
 */
export const useNewSecretSantaQuery = (enabled: MaybeRefOrGetter<boolean>) =>
  useApiQuery<NewSecretSantaPayload>(
    () => keys.newSecretSanta(),
    () => '/api/secret-santas/new',
    enabled,
  );
