import {
  editionSteps,
  type EditionStatus,
  type EditionStepView,
} from '#server/utils/editions';
import type { Step } from '~/components/ui/Stepper.vue';

/** The words of each step, in the dictionaries. */
const LABELS = {
  prepare: 'adminEdition.screen.steps.prepare',
  draw: 'adminEdition.screen.steps.draw',
  drawDone: 'adminEdition.screen.steps.drawDone',
  party: 'adminEdition.screen.steps.party',
  partyDone: 'adminEdition.screen.closed.partyDone',
} as const satisfies Record<EditionStepView['label'], string>;

/**
 * The stepper of an edition, on its screen and on the group's card.
 * @param status - Status of the edition.
 * @param eventDate - Day of the party.
 * @param revealed - Whether its results were revealed.
 * @returns The steps for `UiStepper`.
 */
export const useEditionSteps = (
  status: MaybeRefOrGetter<EditionStatus>,
  eventDate: MaybeRefOrGetter<string | null | undefined>,
  revealed: MaybeRefOrGetter<boolean> = false,
) => {
  const { t } = useT();
  const today = new Date().toLocaleDateString('sv-SE');
  return computed<Step[]>(() =>
    editionSteps(
      toValue(status),
      toValue(eventDate),
      today,
      toValue(revealed),
    ).map((step, index) => ({
      label: t(LABELS[step.label]),
      state: step.state,
      icon: index === 0 ? undefined : 'i-lucide-sparkle',
    })),
  );
};
