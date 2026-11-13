<script setup lang="ts">
import { z } from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';
import {
  useDashboardQuery,
  useEditionQuery,
} from '~/composables/queries/useGroup';
import {
  useRevealAllMutation,
  type DrawPair,
} from '~/composables/queries/useEdition';
import { errorMessage } from '~/utils/errors';

// Last-resort access to the current draw (decision of 2026-11-13): the
// guardian could open the personal links anyway, so this official way is
// guarded and, above all, written to the journal every participant reads.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const route = useRoute();
const slug = computed(() => String(route.params.slug));
const id = computed(() => String(route.params.id));
const edition = useEditionQuery(slug, id);
const dashboard = useDashboardQuery(slug);
const reveal = useRevealAllMutation(slug, id);

useHead({ title: 'Voir le tirage — Secret Santa' });
const screen = computed(() => ({
  back: `/admin/${slug.value}/editions/${id.value}`,
  crumbs: [
    {
      label: dashboard.data.value?.group.name ?? slug.value,
      to: `/admin/${slug.value}`,
    },
    {
      label: edition.data.value?.edition.label ?? 'Édition',
      to: `/admin/${slug.value}/editions/${id.value}`,
    },
    { label: 'Voir le tirage' },
  ],
}));

const SENTENCE = 'JE VEUX VOIR LE TIRAGE';
const schema = z.object({
  password: z.string().min(1, 'Mot de passe requis'),
  sentence: z
    .string()
    .refine(
      (v) => v.trim().toUpperCase() === SENTENCE,
      `Recopie « ${SENTENCE} »`,
    ),
  understood: z.boolean().refine((v) => v, 'Coche pour confirmer'),
});
type Schema = z.output<typeof schema>;
const state = reactive<Schema>({
  password: '',
  sentence: '',
  understood: false,
});

// Shown only in this component's state: gone when leaving the screen.
const pairs = ref<DrawPair[] | null>(null);
const onSubmit = (event: FormSubmitEvent<Schema>) =>
  reveal.mutate(
    { password: event.data.password, sentence: event.data.sentence },
    {
      onSuccess: (data) => {
        pairs.value = data.pairs;
        state.password = '';
      },
    },
  );
</script>

<template>
  <AdminScreen v-bind="screen">
    <h1 class="font-display text-3xl font-bold">Voir le tirage</h1>
    <template v-if="pairs">
      <UAlert
        color="warning"
        variant="subtle"
        icon="i-lucide-eye"
        description="Ta consultation est inscrite au journal du groupe. Le résultat disparaît quand tu quittes cet écran."
      />
      <AdminDrawPairs
        :pairs="pairs"
        :people="edition.data.value?.participants ?? []"
      />
    </template>
    <template v-else>
      <ul class="flex list-disc flex-col gap-1 pl-5 text-sm text-muted">
        <li>
          À n'utiliser qu'en dernier recours (désaccord, doute sur un bug…).
        </li>
        <li>
          Le journal du groupe affichera, pour tous les participants : « Le
          gardien a consulté les résultats du tirage ».
        </li>
        <li>
          Le résultat ne s'affiche qu'ici, et disparaît quand tu quittes
          l'écran.
        </li>
      </ul>
      <UForm
        :schema="schema"
        :state="state"
        class="flex flex-col gap-5"
        @submit="onSubmit"
      >
        <UFormField name="password" label="Ton mot de passe" required>
          <UInput
            v-model="state.password"
            type="password"
            autocomplete="current-password"
            class="w-full"
          />
        </UFormField>
        <UFormField name="sentence" :label="`Recopie : ${SENTENCE}`" required>
          <UInput
            v-model="state.sentence"
            autocomplete="off"
            autocapitalize="characters"
            class="w-full"
          />
        </UFormField>
        <UFormField name="understood">
          <UCheckbox
            v-model="state.understood"
            label="Je comprends que tout le groupe saura que j'ai regardé"
          />
        </UFormField>
        <UAlert
          v-if="reveal.isError.value"
          color="error"
          variant="subtle"
          :description="errorMessage(reveal.error.value)"
        />
        <UButton
          type="submit"
          color="neutral"
          block
          icon="i-lucide-eye"
          :loading="reveal.isPending.value"
          label="Voir le tirage"
        />
      </UForm>
    </template>
  </AdminScreen>
</template>
