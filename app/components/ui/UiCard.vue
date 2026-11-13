<template>
  <section class="rounded-xl bg-white p-4 shadow-sm ring-1 ring-neutral-200">
    <h2
      v-if="$slots.title"
      class="mb-3 text-base font-semibold text-neutral-900"
    >
      <slot name="title" />
    </h2>
    <slot />
  </section>
</template>
