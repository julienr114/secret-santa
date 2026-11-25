import type fr from '../fr/phone';
import type { Dict } from '../../types';

export default {
  install: {
    title: 'Leg Under the Tree auf deinen Home-Bildschirm',
    why: 'Um es mit einem Tipp zu öffnen und sofort zu wissen, wenn dein Umschlag wartet.',
    step1: 'Tippe unten in Safari auf „Teilen“.',
    step2: 'Wähle „Zum Home-Bildschirm“.',
    step3:
      'Öffne die App über ihr neues Symbol und melde dich mit dem Code aus der E-Mail an.',
    install: 'Installieren',
    understood: 'Verstanden',
    later: 'Später',
    row: 'App installieren',
  },
  notify: {
    title: 'Mitteilungen auf diesem Handy?',
    what: 'Nur was dich betrifft: dein Umschlag, eine Einladung, eine Bitte um Ideen. Nie Werbung.',
    confirm:
      'Dein Handy fragt dich, ob du zustimmst. Du kannst es dir unter „Mich benachrichtigen“ anders überlegen.',
    enable: 'Mitteilungen einschalten',
    notNow: 'Jetzt nicht',
    section: 'Auf diesem Handy',
    switch: 'Mitteilungen',
    switchHint: 'Sofort, wenn etwas eilt.',
    refused: 'Mitteilungen sind in den Einstellungen des Handys ausgeschaltet.',
  },
} satisfies Dict<typeof fr>;
