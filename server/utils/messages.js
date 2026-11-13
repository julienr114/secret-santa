import { ok, fail } from './result.js';

// Messages the guardian sends on WhatsApp (README 13.2). Pure templates:
// short, no formatting, the link alone on the last line so WhatsApp makes
// it clickable. They never contain a result.

export const MESSAGE_TYPES = ['invitation', 'drawn', 'reminder', 'redraw'];

/**
 * @typedef {object} MessageData
 * @property {string} firstName
 * @property {string} groupName
 * @property {string} editionLabel
 * @property {string} link
 * @property {string} [budget]
 * @property {string} [eventDate]
 * @property {boolean} [pinChosen] for reminders
 */

const details = ({ budget, eventDate }) =>
  [
    budget && `Budget : ${budget}.`,
    eventDate && `Rendez-vous le ${eventDate}.`,
  ].filter(Boolean);

const TEMPLATES = {
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

/**
 * @param {string} type
 * @param {MessageData} data
 * @returns {import('./result.js').Result<string>}
 */
export const buildMessage = (type, data) => {
  const template = TEMPLATES[type];
  if (!template) return fail('unknown_message_type', { type });
  return ok([...template(data), data.link].join('\n'));
};
