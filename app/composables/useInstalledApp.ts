/**
 * Whether the app runs installed on the phone (ticket 123): there, a
 * link from an email opens in the browser, not in the app, so one logs
 * in with a code. Known once the page is in the browser; in a browser,
 * false, and nothing changes.
 * @returns True in the installed app.
 */
export const useInstalledApp = () => {
  const installed = ref(false);
  onMounted(() => {
    installed.value =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
  });
  return installed;
};
