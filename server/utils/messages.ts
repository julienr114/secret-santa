import { ok, fail, type Result } from './result';

// Messages the guardian sends on WhatsApp (README 13.2). Pure templates:
// short, no formatting, the link alone on the last line so WhatsApp makes
// it clickable. They never contain a result.

export const MESSAGE_TYPES = [
  'invitation',
  'drawn',
  'reminder',
  'redraw',
] as const;
export type MessageType = (typeof MESSAGE_TYPES)[number];

export type MessageData = {
  firstName: string;
  groupName: string;
  editionLabel: string;
  link: string;
  budget?: string;
  eventDate?: string;
  /** for reminders */
  pinChosen?: boolean;
};

const details = ({ budget, eventDate }: MessageData): string[] =>
  [
    budget && `Budget : ${budget}.`,
    eventDate && `Rendez-vous le ${eventDate}.`,
  ].filter((line): line is string => Boolean(line));

const TEMPLATES: Record<MessageType, (d: MessageData) => string[]> = {
  invitation: (d) => [
    `Salut ${d.firstName} ! 🎁`,
    `Tu participes au Secret Santa de ${d.groupName} (${d.editionLabel}).`,
    'Ouvre ton lien, choisis ton code secret et note quelques idées de cadeaux :',
  ],
  drawn: (d) => [
    `${d.firstName}, le tirage est fait ! 🎁`,
    ...details(d),
    'Ouvre ton lien pour découvrir à qui tu offres un cadeau :',
  ],
  reminder: (d) => [
    `Petit rappel ${d.firstName} : ${
      d.pinChosen
        ? "tu n'as pas encore consulté ton résultat."
        : "tu n'as pas encore choisi ton code secret."
    }`,
    'Ton lien :',
  ],
  redraw: (d) => [
    `${d.firstName}, un nouveau tirage a eu lieu : ton ancien résultat n'est plus valable.`,
    'Ton lien ne change pas :',
  ],
};

const isMessageType = (type: string): type is MessageType =>
  (MESSAGE_TYPES as readonly string[]).includes(type);

export const buildMessage = (
  type: string,
  data: MessageData,
): Result<string> => {
  if (!isMessageType(type)) return fail('unknown_message_type', { type });
  return ok([...TEMPLATES[type](data), data.link].join('\n'));
};
