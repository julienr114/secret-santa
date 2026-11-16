<script setup lang="ts">
import type { Avatar } from '#server/utils/avatars';

// One row: optional leading avatar or icon, title and subtitle (or a
// subtitle slot), trailing slot and a chevron when it opens another screen
// (`chevron: false` hides it when the row carries its own action). A
// settings row shows its current `value` on the right, or a switch when
// it is bound with `v-model:checked`.
const props = withDefaults(
  defineProps<{
    to?: string;
    chevron?: boolean;
    title: string;
    subtitle?: string;
    icon?: string;
    avatar?: Avatar;
    emoji?: string;
    tone?: 'default' | 'danger';
    /** The colour of the round icon: brick for what to do, grey otherwise. */
    iconTone?: 'primary' | 'neutral';
    /** The current value of a setting, shown on the right. */
    value?: string;
    /** The name of the row, when its texts do not say what a tap does. */
    label?: string;
    /** Makes the row a button (otherwise a link with `to`, or plain). */
    onClick?: () => void;
  }>(),
  {
    to: undefined,
    chevron: true,
    subtitle: undefined,
    icon: undefined,
    avatar: undefined,
    emoji: undefined,
    tone: 'default',
    iconTone: 'primary',
    value: undefined,
    label: undefined,
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
          class="block truncate font-semibold"
          :class="tone === 'danger' ? 'text-error-ink' : ''"
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
          class="block truncate text-[13px] text-toned"
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
        size="lg"
        color="success"
        :aria-label="title"
        class="flex min-h-11 shrink-0 items-center"
      />
      <slot name="trailing" />
      <UIcon
        v-if="(to || value) && chevron"
        name="i-lucide-chevron-right"
        class="size-5 shrink-0 text-dimmed"
      />
    </component>
  </li>
</template>
