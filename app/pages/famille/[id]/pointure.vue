<script setup lang="ts">
import {
  SHOE_SIZES,
  shoeSizesOf,
  shoeSizesText,
  toggleShoeSize,
} from '#shared/utils/memberFields';

// The shoe size, or sizes, of one of my people (Correction 27, maquette
// ProchePointure): chosen in a grid, nothing to write. Two groups,
// « Enfant » (16 to 34) and « Ado et adulte » (35 to 50), six a row;
// touching a size ticks it, touching it again unticks it. Saved as a
// text, in rising order: « 30 », « 30 ou 31 ». A size written by hand
// before the grid (« 30,5 ») stays shown until one is chosen here.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t } = useT();
const sizes = ref<number[]>([]);
/** What was written by hand, and is not of the grid. */
const kept = ref<string | null>(null);
useMemberField((member) => {
  const saved = shoeSizesOf(member.shoeSize);
  sizes.value = saved ?? [];
  kept.value = saved ? null : member.shoeSize;
});
const text = computed(() =>
  shoeSizesText(sizes.value, t('lists.person.field.or')),
);
const groups = computed(() => [
  { label: t('lists.person.field.child'), sizes: SHOE_SIZES.child },
  { label: t('lists.person.field.adult'), sizes: SHOE_SIZES.adult },
]);
</script>

<template>
  <ListsMemberFieldPage
    :title="t('lists.person.field.shoe')"
    :title-mine="t('lists.person.field.shoeMine')"
    :patch="text ? { shoeSize: text } : null"
    :clear-label="t('lists.person.field.clearAll')"
    :clear-patch="{ shoeSize: null }"
  >
    <template #default>
      <p
        v-if="kept && sizes.length === 0"
        class="text-[15px] font-semibold"
        data-testid="shoe-kept"
      >
        {{ kept }}
      </p>
      <section
        v-for="group in groups"
        :key="group.label"
        class="flex flex-col gap-2"
      >
        <h2
          class="px-1 text-xs font-bold tracking-[0.04em] text-toned uppercase"
        >
          {{ group.label }}
        </h2>
        <div class="grid grid-cols-6 gap-2">
          <button
            v-for="size in group.sizes"
            :key="size"
            type="button"
            role="checkbox"
            :aria-checked="sizes.includes(size)"
            class="h-11 rounded-2xl text-base font-bold"
            :class="
              sizes.includes(size)
                ? 'bg-primary-tint text-primary-ink ring-2 ring-primary ring-inset'
                : 'bg-default ring-1 ring-default ring-inset'
            "
            data-testid="shoe-size"
            @click="sizes = toggleShoeSize(sizes, size)"
          >
            {{ size }}
          </button>
        </div>
      </section>
    </template>
  </ListsMemberFieldPage>
</template>
