import { api } from '~/composables/queries/useApi';

// The app on the phone (ticket 124): whether it runs installed, how to
// install it (the three gestures on iPhone, the phone's own offer on
// Android), and the notifications of this device. Known once the page is
// in the browser; nothing on a computer.

/** How this device installs the app. */
export type InstallWay = 'ios' | 'android' | null;

type InstallPrompt = Event & { prompt: () => Promise<void> };

const fromB64Url = (text: string) =>
  Uint8Array.from(
    atob(
      text.replaceAll('-', '+').replaceAll('_', '/') +
        '='.repeat((4 - (text.length % 4)) % 4),
    ),
    (c) => c.charCodeAt(0),
  );

/**
 * The app on this phone.
 * @returns Whether it is installed, how to install it, and the
 * notifications of this device.
 */
export const usePhone = () => {
  const installed = useInstalledApp();
  const config = useRuntimeConfig();
  const prompt = useState<InstallPrompt | null>('install-prompt', () => null);
  const ios = ref(false);
  const phone = ref(false);
  const pushReady = ref(false);
  const subscribed = ref(false);
  onMounted(async () => {
    ios.value = /iPhone|iPad|iPod/.test(navigator.userAgent);
    phone.value = window.matchMedia('(pointer: coarse)').matches;
    pushReady.value =
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window &&
      Boolean(config.public.vapidPublicKey);
    if (!pushReady.value) return;
    const registration = await navigator.serviceWorker.getRegistration();
    subscribed.value = Boolean(
      await registration?.pushManager.getSubscription(),
    );
  });
  /** How to install here: never in the app, nor on a computer. */
  const installWay = computed<InstallWay>(() => {
    if (installed.value || !phone.value) return null;
    if (ios.value) return 'ios';
    return prompt.value ? 'android' : null;
  });
  /** Android: the phone's own offer to install. */
  const install = async () => {
    await prompt.value?.prompt();
    prompt.value = null;
  };
  /**
   * Notifications on this device: the phone asks first, after a gesture.
   * @returns Whether it is subscribed now.
   */
  const subscribe = async (): Promise<boolean> => {
    if (!pushReady.value) return false;
    if ((await Notification.requestPermission()) !== 'granted') return false;
    const registration = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: fromB64Url(String(config.public.vapidPublicKey)),
    });
    const { endpoint, keys } = subscription.toJSON();
    await api('/api/push/subscriptions', {
      method: 'POST',
      body: { endpoint, keys },
    });
    subscribed.value = true;
    return true;
  };
  /** No more notifications on this device. */
  const unsubscribe = async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    const subscription = await registration?.pushManager.getSubscription();
    if (subscription) {
      await api('/api/push/subscriptions', {
        method: 'DELETE',
        body: { endpoint: subscription.endpoint },
      });
      await subscription.unsubscribe();
    }
    subscribed.value = false;
  };
  return {
    phone,
    installed,
    installWay,
    install,
    pushReady,
    subscribed,
    subscribe,
    unsubscribe,
  };
};
