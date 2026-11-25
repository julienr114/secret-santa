<script setup lang="ts">
// Once, on the home (ticket 124): in a phone's browser, the offer to
// install the app; in the installed app, the offer of notifications.
// Never twice on this phone, never on a computer. Remembered on the
// phone only: a choice of this device.
const device = usePhone();
const installOpen = ref(false);
const notifyOpen = ref(false);
const busy = ref(false);
const INSTALL_KEY = 'utt-install-offered';
const NOTIFY_KEY = 'utt-notify-offered';
/**
 * Whether an offer was made on this phone, and marks it made.
 * @param key - The offer.
 * @returns True the first time.
 */
const firstTime = (key: string): boolean => {
  try {
    if (localStorage.getItem(key)) return false;
    localStorage.setItem(key, '1');
    return true;
  } catch {
    return false;
  }
};
watch(
  () =>
    [
      device.installWay.value,
      device.installed.value,
      device.pushReady.value,
      device.subscribed.value,
    ] as const,
  ([way, installed, ready, subscribed]) => {
    if (way && !installOpen.value && firstTime(INSTALL_KEY)) {
      installOpen.value = true;
    } else if (
      installed &&
      ready &&
      !subscribed &&
      !notifyOpen.value &&
      firstTime(NOTIFY_KEY)
    ) {
      notifyOpen.value = true;
    }
  },
);
const onEnable = async () => {
  busy.value = true;
  await device.subscribe().catch(() => false);
  busy.value = false;
  notifyOpen.value = false;
};
</script>

<template>
  <PhoneInstallSheet
    v-if="device.installWay.value"
    v-model:open="installOpen"
    :way="device.installWay.value"
    @install="device.install().then(() => (installOpen = false))"
  />
  <PhoneNotifySheet v-model:open="notifyOpen" :busy="busy" @enable="onEnable" />
</template>
