<script setup lang="ts">
import { AVATAR_COLORS } from '#server/utils/avatars';
import type { JournalEntry } from '#server/utils/audit';
import type { NotePosition } from '#server/utils/messages';

// Every interface component in its variants, in the language chosen in
// the menu. Its own headings are in French only: a developer's tool, the
// one screen exempt from the dictionaries.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t, tk } = useT();
useHead({ title: () => `Guide de style — ${t('common.appName')}` });
const screen = {
  back: '/',
  crumbs: [
    { label: t('auth.home.title'), to: '/' },
    { label: 'Guide de style' },
  ],
};

/** Surface tokens, by role. */
const SURFACES = [
  { name: 'bg-page', hint: 'Fond de page', class: 'bg-page' },
  { name: 'bg-default', hint: 'Carte, ligne de liste', class: 'bg-default' },
  { name: 'bg-muted', hint: 'Texte cité, aperçu', class: 'bg-muted' },
  { name: 'bg-skeleton', hint: 'Chargement', class: 'bg-skeleton' },
  { name: 'bg-track', hint: 'Fond de barre', class: 'bg-track' },
];
/** Meaning colours of the theme. */
const COLORS = [
  { name: 'primary', hint: 'Rouge brique : action', class: 'bg-primary' },
  { name: 'secondary', hint: 'Vert sapin : réussi', class: 'bg-secondary' },
  { name: 'warning', hint: 'Moutarde : attention', class: 'bg-warning' },
  { name: 'error', hint: 'Canneberge : danger', class: 'bg-error' },
];
/** Codes shown by AdminStatusBadge: edition statuses, then participant badges. */
const STATUSES = ['draft', 'invitations', 'drawn', 'closed'];
const BADGES = ['sent', 'wishes', 'viewed'];

/** A person's icon used throughout the examples. */
const sample = { emoji: '🥨', color: 'mustard' } as const;
const text = ref('');
const choice = ref<NotePosition>('after');
const toggle = ref(true);
const date = ref('');
const sheet = ref(false);
const christmasDay = `${new Date().getFullYear()}-12-25`;
const choices = useNotePositionItems();

const now = new Date();
/**
 * An instant in the recent past, for the sample journal.
 * @param minutes - How long ago.
 * @returns The ISO date.
 */
const at = (minutes: number) =>
  new Date(now.getTime() - minutes * 60_000).toISOString();
/**
 * A sample journal entry, written in the current language.
 * @param id - Unique key of the entry.
 * @param type - Journal event type.
 * @param minutes - How long ago it happened.
 * @param meta - Values overriding the sample placeholders.
 * @returns The entry as JournalList expects it.
 */
const entry = (
  id: string,
  type: string,
  minutes: number,
  meta: Record<string, string | number> = {},
): JournalEntry => ({
  id,
  type,
  editionId: 'e',
  actor: 'guardian',
  createdAt: at(minutes),
  text: tk(`journal.events.${type}`, {
    name: 'Léa',
    label: 'Noël 2026',
    count: 9,
    reason: '…',
    what: t('journal.what.invitation'),
    via: t('journal.via.share'),
    language: 'Deutsch',
    ...meta,
  }),
});
/** One entry of each visual kind: plain line, milestone, alert. */
const entries = computed(() => [
  entry('1', 'result_viewed', 5),
  entry('2', 'draw_done', 30),
  entry('3', 'wishes_updated', 90, { count: 3 }),
  entry('4', 'result_revealed', 200),
  entry('5', 'message_sent', 300),
  entry('6', 'edition_created', 400),
]);
</script>

<template>
  <AdminScreen v-bind="screen">
    <UiPageTitle>Guide de style</UiPageTitle>
    <p class="text-sm text-muted">
      Les composants d'interface de l'application (dossier
      <code>app/components/ui</code>) et les règles qui vont avec. Change la
      langue dans le menu pour voir les textes dans les trois langues.
    </p>

    <section class="flex flex-col gap-3">
      <UiSectionTitle>Surfaces</UiSectionTitle>
      <ul class="grid grid-cols-2 gap-3">
        <li v-for="s in SURFACES" :key="s.name" class="flex flex-col gap-1">
          <span class="h-12 rounded-lg ring-1 ring-black/10" :class="s.class" />
          <code class="text-xs">{{ s.name }}</code>
          <span class="text-xs text-muted">{{ s.hint }}</span>
        </li>
      </ul>
      <UiSectionTitle>Couleurs de sens</UiSectionTitle>
      <ul class="grid grid-cols-2 gap-3">
        <li v-for="c in COLORS" :key="c.name" class="flex flex-col gap-1">
          <span class="h-12 rounded-lg" :class="c.class" />
          <code class="text-xs">{{ c.name }}</code>
          <span class="text-xs text-muted">{{ c.hint }}</span>
        </li>
      </ul>
    </section>

    <section class="flex flex-col gap-3">
      <UiSectionTitle>Textes</UiSectionTitle>
      <UiPageTitle>UiPageTitle : le titre de l'écran</UiPageTitle>
      <UiSectionTitle>UiSectionTitle : au-dessus d'un groupe</UiSectionTitle>
      <p>Texte courant, en Nunito.</p>
      <p class="text-sm text-muted">Explication ou aide, en plus discret.</p>
      <UiTextPreview>
        UiTextPreview : un texte tel qu'il a été écrit. Les retours à la ligne
        sont gardés.
      </UiTextPreview>
    </section>

    <section class="flex flex-col gap-3">
      <UiSectionTitle>Boutons</UiSectionTitle>
      <UButton
        block
        icon="i-lucide-sparkles"
        :label="t('adminEdition.cockpit.startDraw')"
      />
      <UButton block variant="soft" :label="t('common.actions.add')" />
      <UButton
        block
        variant="outline"
        color="neutral"
        :label="t('common.actions.cancel')"
      />
      <UButton
        block
        color="error"
        icon="i-lucide-trash-2"
        :label="t('common.actions.delete')"
      />
      <div class="flex items-center gap-3">
        <UButton
          size="md"
          class="rounded-full"
          icon="i-lucide-send"
          variant="soft"
          aria-label="À faire"
        />
        <UButton
          size="md"
          class="rounded-full"
          icon="i-lucide-send"
          variant="outline"
          color="neutral"
          aria-label="Déjà fait"
        />
        <span class="text-sm text-muted"
          >Action d'une ligne : à faire, déjà fait</span
        >
      </div>
    </section>

    <section class="flex flex-col gap-3">
      <UiSectionTitle>Pastilles</UiSectionTitle>
      <div class="flex flex-wrap gap-2">
        <AdminStatusBadge v-for="code in STATUSES" :key="code" :code="code" />
        <AdminStatusBadge v-for="code in BADGES" :key="code" :code="code" />
        <UBadge color="neutral" variant="subtle" size="sm" label="DE" />
      </div>
    </section>

    <section class="flex flex-col gap-3">
      <UiSectionTitle>Icônes de personne</UiSectionTitle>
      <div class="flex items-center gap-3">
        <UiAvatar :avatar="sample" size="sm" />
        <UiAvatar :avatar="sample" size="md" />
        <UiAvatar :avatar="sample" size="lg" />
      </div>
      <div class="flex flex-wrap gap-2">
        <UiAvatar
          v-for="color in AVATAR_COLORS"
          :key="color"
          :avatar="{ emoji: '🎄', color }"
        />
      </div>
    </section>

    <section class="flex flex-col gap-3">
      <UiSectionTitle>Cartes</UiSectionTitle>
      <UiCard>UiCard : une surface blanche, espacement <code>md</code>.</UiCard>
      <UiCard padding="lg" class="text-center">
        UiCard <code>lg</code> : pour un message centré.
      </UiCard>
      <AdminStatusCard
        emoji="🎲"
        :title="t('adminEdition.cockpit.drawPossible')"
        :description="
          t('adminEdition.cockpit.drawPossibleDescription', { count: 9 })
        "
      >
        <UButton
          block
          icon="i-lucide-sparkles"
          :label="t('adminEdition.cockpit.startDraw')"
        />
      </AdminStatusCard>
      <AdminStatusCard
        emoji="🎁"
        :title="t('adminEdition.cockpit.drawDone')"
        :description="
          t('adminEdition.cockpit.drawnDescription', { viewed: 3, total: 9 })
        "
        :progress="{ value: 3, total: 9 }"
      />
      <AdminStatusCard
        emoji="🚧"
        tone="problem"
        :title="t('errors.no_solution')"
      />
      <AdminStatusCard
        emoji="📦"
        tone="quiet"
        :title="t('adminEdition.cockpit.closedNotice')"
      />
    </section>

    <UiList
      title="Liste"
      footer="UiList et UiListItem : bord à bord sur téléphone, encadrée au-delà."
    >
      <UiListItem
        to="/admin/guide-de-style"
        icon="i-lucide-users"
        title="Ligne qui ouvre un écran"
        subtitle="Avec une icône et un chevron"
      />
      <UiListItem
        :avatar="sample"
        title="Ligne avec une personne"
        :subtitle="t('common.participantStatus.invitationSent')"
      >
        <template #trailing>
          <UBadge color="neutral" variant="subtle" size="sm" label="FR" />
          <UButton
            size="md"
            class="rounded-full"
            icon="i-lucide-send"
            variant="soft"
            aria-label="Action"
          />
        </template>
      </UiListItem>
      <UiListItem emoji="🎄" title="Ligne avec un emoji" :chevron="false" />
      <UiListItem
        icon="i-lucide-plus"
        :title="t('adminGroup.exclusions.add')"
        :on-click="() => (sheet = true)"
      />
      <UiListItem
        icon="i-lucide-trash-2"
        tone="danger"
        :title="t('common.actions.delete')"
        subtitle="Action dangereuse"
        :on-click="() => undefined"
      />
    </UiList>

    <section class="flex flex-col gap-4">
      <UiSectionTitle>Champs</UiSectionTitle>
      <UFormField label="Texte court" help="Aide sous le champ.">
        <UInput v-model="text" class="w-full" />
      </UFormField>
      <UFormField label="Texte long">
        <UTextarea :rows="2" class="w-full" />
      </UFormField>
      <URadioGroup
        v-model="choice"
        :items="choices"
        legend="Choix unique"
        orientation="horizontal"
      />
      <USwitch v-model="toggle" label="Interrupteur" />
      <UFormField :label="t('adminGroup.rules.eventDate')">
        <AdminDateField v-model="date" :suggestion="christmasDay" />
      </UFormField>
    </section>

    <section class="flex flex-col gap-3">
      <UiSectionTitle>Panneau du bas</UiSectionTitle>
      <UButton
        block
        variant="soft"
        label="Ouvrir un panneau"
        @click="sheet = true"
      />
      <UDrawer
        v-model:open="sheet"
        title="Titre du panneau"
        description="Une action courte, sans quitter l'écran."
      >
        <template #body>
          <UiList>
            <UiListItem
              icon="i-lucide-share-2"
              title="Un choix"
              :on-click="() => (sheet = false)"
            />
            <UiListItem
              icon="i-lucide-copy"
              title="Un autre choix"
              :on-click="() => (sheet = false)"
            />
          </UiList>
        </template>
        <template #footer>
          <UButton
            block
            :label="t('common.actions.validate')"
            @click="sheet = false"
          />
        </template>
      </UDrawer>
    </section>

    <section class="flex flex-col gap-3">
      <UiSectionTitle>Journal</UiSectionTitle>
      <JournalList :entries="entries" />
    </section>

    <section class="flex flex-col gap-2">
      <UiSectionTitle>Règles</UiSectionTitle>
      <ul class="flex list-disc flex-col gap-1.5 pl-5 text-sm">
        <li>
          Une colonne de la largeur d'un téléphone, sur tous les écrans ; les
          barres prennent toute la largeur.
        </li>
        <li>
          Une action courte sur un élément s'ouvre dans un panneau du bas ; un
          formulaire long a son écran.
        </li>
        <li>
          Un panneau enregistre avec un bouton « Valider » ; le fermer autrement
          abandonne.
        </li>
        <li>Une cible tactile fait au moins 40 px.</li>
        <li>
          Une action dangereuse est rouge, en bas de liste, et demande une
          confirmation.
        </li>
        <li>
          La ligne « ajouter » est en haut d'une liste de règles, en bas d'une
          liste de personnes.
        </li>
        <li>
          Les écrans nomment un rôle (bg-page, primary), jamais une teinte
          (kraft-50, brick-600).
        </li>
        <li>
          Aucun texte en dur dans un écran du produit : tout passe par les
          dictionnaires.
        </li>
      </ul>
    </section>
  </AdminScreen>
</template>
