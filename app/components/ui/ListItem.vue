<script setup lang="ts">
import type { Avatar } from '#server/utils/avatars';

// One row: optional leading avatar or icon, title and subtitle (or a
// subtitle slot), trailing slot and a chevron when it opens another screen
// (`chevron: false` hides it when the row carries its own action;
// `chevron: true` shows it on a button row that opens a sheet). A
// settings row shows its current `value` on the right, or a switch when
// it is bound with `v-model:checked`.
const props = withDefaults(
  defineProps<{
    to?: string;
    /** Shown for a link or a value unless false; forced when true. */
    chevron?: boolean;
    title: string;
    subtitle?: string;
    icon?: string;
    avatar?: Avatar;
    emoji?: string;
    tone?: 'default' | 'danger';
    /** Something over or set aside: the title is greyed. */
    muted?: boolean;
    /** Keeps the title on one line, cut with « … » (an email address). */
    oneLine?: boolean;
    /**
     * The colour of the round icon: coral for what to do, grey otherwise,
     * lilac for a list (V3).
     */
    iconTone?: 'primary' | 'neutral' | 'lilac';
    /** The current value of a setting, shown on the right. */
    value?: string;
    /** The name of the row, when its texts do not say what a tap does. */
    label?: string;
    /** Saving: a wheel replaces the chevron, read out as `busyLabel`. */
    busy?: boolean;
    busyLabel?: string;
    /** Makes the row a button (otherwise a link with `to`, or plain). */
    onClick?: () => void;
  }>(),
  {
    to: undefined,
    chevron: undefined,
    subtitle: undefined,
    icon: undefined,
    avatar: undefined,
    emoji: undefined,
    tone: 'default',
    muted: false,
    oneLine: false,
    iconTone: 'primary',
    value: undefined,
    label: undefined,
    busy: false,
    busyLabel: undefined,
    onClick: undefined,
  },
);
/** A setting turned on or off; no switch when left unbound. */
const checked = defineModel<boolean | undefined>('checked', {
  default: undefined,
});

/** Background and colour of the round icon, by tone. */
const ICON_TONES = {
  primary: 'bg-primary-soft text-primary',
  neutral: 'bg-muted text-toned',
  lilac: 'bg-lilac-100 text-lilac-800',
  danger: 'bg-error-soft text-error-ink',
};
// A string in <component :is> does not resolve global components.
const NuxtLink = resolveComponent('NuxtLink');
</script>

<template>
  <li>
    <component
      :is="to ? NuxtLink : props.onClick ? 'button' : 'div'"
      :to="to"
      :type="!to && props.onClick ? 'button' : undefined"
      :aria-label="label"
      :aria-busy="busy || undefined"
      class="flex min-h-15 w-full items-center gap-3 px-4 py-2 text-left"
      :class="to || props.onClick ? 'transition-colors active:bg-muted' : ''"
      @click="props.onClick?.()"
    >
      <slot v-if="$slots.leading" name="leading" />
      <UiAvatar v-else-if="avatar" :avatar="avatar" />
      <span
        v-else-if="emoji || icon"
        class="flex size-10 shrink-0 items-center justify-center rounded-full"
        :class="ICON_TONES[tone === 'danger' ? 'danger' : iconTone]"
        aria-hidden="true"
      >
        <span v-if="emoji" class="text-lg">{{ emoji }}</span>
        <UIcon v-else :name="icon!" class="size-5" />
      </span>
      <span class="min-w-0 grow">
        <span
          class="font-semibold"
          :class="[
            oneLine ? 'block truncate' : 'line-clamp-2',
            tone === 'danger' ? 'text-error-ink' : muted ? 'text-muted' : '',
          ]"
        >
          {{ title }}
        </span>
        <span
          v-if="$slots.subtitle"
          class="flex min-w-0 items-center gap-1.25 text-[13px] text-toned"
        >
          <slot name="subtitle" />
        </span>
        <span
          v-else-if="subtitle"
          class="line-clamp-2 text-[13px] text-toned"
          >{{ subtitle }}</span
        >
      </span>
      <span
        v-if="value"
        class="max-w-[150px] shrink-0 truncate text-right text-[15px] text-muted"
        >{{ value }}</span
      >
      <USwitch
        v-if="checked !== undefined"
        v-model="checked"
        :loading="busy"
        size="lg"
        color="success"
        :aria-label="title"
        class="flex min-h-11 shrink-0 items-center"
      />
      <slot name="trailing" />
      <UiSpinner
        v-if="busy && checked === undefined"
        :label="busyLabel ?? title"
      />
      <UIcon
        v-else-if="chevron ?? Boolean(to || value)"
        name="i-lucide-chevron-right"
        class="size-5 shrink-0 text-dimmed"
      />
    </component>
  </li>
</template>
