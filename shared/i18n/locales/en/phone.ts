import type fr from '../fr/phone';
import type { Dict } from '../../types';

export default {
  install: {
    title: 'Put Under the Tree on your home screen',
    why: 'To open it with one tap, and know right away when your envelope is waiting.',
    step1: 'Tap “Share”, at the bottom of Safari.',
    step2: 'Choose “Add to Home Screen”.',
    step3:
      'Open the app from its new icon, and log in with the code received by email.',
    install: 'Install',
    understood: 'Got it',
    later: 'Later',
    row: 'Install the app',
  },
  notify: {
    title: 'Notifications on this phone?',
    what: 'Only what concerns you: your envelope, an invitation, a request for ideas. Never any advertising.',
    confirm:
      'Your phone will ask you to confirm. You can change your mind in “Notify me”.',
    enable: 'Turn on notifications',
    notNow: 'Not now',
    section: 'On this phone',
    switch: 'Notifications',
    switchHint: 'Right away, when something is urgent.',
    refused: 'Notifications are turned off in the phone’s settings.',
  },
} satisfies Dict<typeof fr>;
