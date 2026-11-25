// Android offers to install the app by an event that comes once, early
// (ticket 124): it is kept here, so that « Installer » can use it later.
// Never in the installed app, where it does not come.
type InstallPrompt = Event & { prompt: () => Promise<void> };

export default defineNuxtPlugin(() => {
  const kept = useState<InstallPrompt | null>('install-prompt', () => null);
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    kept.value = event as InstallPrompt;
  });
  window.addEventListener('appinstalled', () => {
    kept.value = null;
  });
});
