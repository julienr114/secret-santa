<script setup lang="ts">
// Something to know, in six strengths: `info`, a quiet line with its
// icon; `positive`, a green band; `caution`, the same in mustard with a
// frame; `warning`, a framed card with a title; `danger`, the same in red
// with its icon and a thicker frame, for what cannot be undone;
// `checklist`, rows each checked or needing attention, with room on the
// right (`trailing`) and below (`detail`) of each.

/** A row of a checklist. */
export type NoticeItem = {
  key: string;
  state: 'ok' | 'warning';
  title: string;
  detail?: string;
};
withDefaults(
  defineProps<{
    variant:
      'info' | 'positive' | 'caution' | 'warning' | 'danger' | 'checklist';
    icon?: string;
    title?: string;
    items?: NoticeItem[];
  }>(),
  { icon: undefined, title: undefined, items: () => [] },
);
</script>

<template>
  <p
    v-if="variant === 'info'"
    class="flex items-start gap-2 text-sm text-muted"
  >
    <UIcon v-if="icon" :name="icon" class="mt-0.5 size-4 shrink-0" />
    <span><slot /></span>
  </p>
  <div
    v-else-if="variant === 'positive'"
    class="flex items-center gap-3 rounded-[10px] bg-success-tint px-3 py-2.5 text-sm text-success-ink"
  >
    <UIcon v-if="icon" :name="icon" class="size-5 shrink-0" />
    <slot />
  </div>
  <div
    v-else-if="variant === 'caution'"
    role="status"
    class="flex items-start gap-2.5 rounded-xl bg-warning-tint px-3.5 py-3 text-sm leading-[1.45] text-mustard-900 ring-1 ring-warning-ring"
  >
    <UIcon v-if="icon" :name="icon" class="mt-0.5 size-4.5 shrink-0" />
    <span><slot /></span>
  </div>
  <section
    v-else-if="variant === 'warning'"
    class="flex flex-col gap-2.5 rounded-2xl bg-warning-tint p-4 text-mustard-900 ring-1 ring-warning-ring"
  >
    <h2
      v-if="title"
      class="font-display text-[19px] leading-[1.2] font-semibold text-mustard-950"
    >
      {{ title }}
    </h2>
    <slot />
  </section>
  <section
    v-else-if="variant === 'danger'"
    role="alert"
    class="flex flex-col gap-2.5 rounded-xl border-2 border-error bg-error-tint p-3.5 text-cranberry-900"
  >
    <h2
      v-if="title"
      class="flex items-center gap-2 font-display text-[19px] leading-[1.2] font-bold"
    >
      <UIcon v-if="icon" :name="icon" class="size-5 shrink-0" />
      {{ title }}
    </h2>
    <slot />
  </section>
  <ul
    v-else
    class="divide-y divide-divider overflow-hidden rounded-xl ring-1 ring-default"
  >
    <li
      v-for="item in items"
      :key="item.key"
      class="flex items-start gap-3 px-3.5 py-3"
      :class="
        item.state === 'warning' ? 'bg-warning-tint text-warning-ink' : ''
      "
    >
      <span
        class="flex size-7 shrink-0 items-center justify-center rounded-full"
        :class="
          item.state === 'ok'
            ? 'bg-success-soft text-success-ink'
            : 'bg-warning-soft text-warning-ink'
        "
        aria-hidden="true"
      >
        <UIcon
          :name="
            item.state === 'ok' ? 'i-lucide-check' : 'i-lucide-alert-triangle'
          "
          class="size-4"
        />
      </span>
      <div class="flex min-w-0 grow flex-col gap-0.5">
        <p class="text-[15px] font-semibold">{{ item.title }}</p>
        <p
          v-if="item.detail"
          class="text-[13px]"
          :class="item.state === 'ok' ? 'text-muted' : ''"
        >
          {{ item.detail }}
        </p>
        <slot name="detail" :item="item" />
      </div>
      <slot name="trailing" :item="item" />
    </li>
  </ul>
</template>
