<script setup lang="ts">
import { AVATAR_COLORS, type Avatar } from '#server/utils/avatars';
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
};

/** Surface tokens, by role. */
const SURFACES = [
  { name: 'bg-page', hint: 'Fond de page', class: 'bg-page' },
  { name: 'bg-default', hint: 'Carte, ligne de liste', class: 'bg-default' },
  { name: 'bg-muted', hint: 'Texte cité, aperçu', class: 'bg-muted' },
  { name: 'bg-skeleton', hint: 'Chargement', class: 'bg-skeleton' },
  { name: 'bg-track', hint: 'Fond de barre', class: 'bg-track' },
  { name: 'bg-divider', hint: 'Trait entre deux lignes', class: 'bg-divider' },
];
/** Meaning colours of the theme. */
const COLORS = [
  { name: 'primary', hint: 'Rouge brique : action', class: 'bg-primary' },
  { name: 'secondary', hint: 'Vert sapin : réussi', class: 'bg-secondary' },
  { name: 'warning', hint: 'Moutarde : attention', class: 'bg-warning' },
  { name: 'error', hint: 'Canneberge : danger', class: 'bg-error' },
  { name: 'primary-tint', hint: 'Pavé à faire', class: 'bg-primary-tint' },
  { name: 'primary-soft', hint: 'Halo, bouton rond', class: 'bg-primary-soft' },
  { name: 'success-tint', hint: 'Pavé réussi', class: 'bg-success-tint' },
  { name: 'success-soft', hint: 'Rond validé', class: 'bg-success-soft' },
  { name: 'warning-tint', hint: 'Encadré attention', class: 'bg-warning-tint' },
  {
    name: 'warning-soft',
    hint: 'Rond attention, surlignage',
    class: 'bg-warning-soft',
  },
  { name: 'error-soft', hint: 'Fond danger', class: 'bg-error-soft' },
];
/** Codes shown by AdminStatusBadge: edition statuses, then participant badges. */
const STATUSES = ['preparing', 'drawn', 'closed'];
const BADGES = ['sent', 'wishes', 'viewed'];

/** A person's icon used throughout the examples. */
const sample = { emoji: '🥨', color: 'mustard' } as const;
const text = ref('');
const choice = ref<NotePosition>('after');
const toggle = ref(true);
const date = ref('');
const sheet = ref(false);
/** The four states of the envelope of a draw. */
const ENVELOPES = ['pending', 'sealed', 'opened', 'locked'] as const;
/** Examples of the edition components. */
const steps = [
  { label: 'Préparer', state: 'done' as const },
  { label: 'Tirer', state: 'current' as const, icon: 'i-lucide-sparkle' },
  { label: 'Fêter', state: 'todo' as const },
];
const counters = [
  { value: 3, label: 'à prévenir', tone: 'primary' as const },
  { value: 1, label: 'pas encore ouvert', tone: 'warning' as const },
  { value: 1, label: 'a découvert', tone: 'success' as const },
];
const crowd: Avatar[] = AVATAR_COLORS.flatMap((color) => [
  { emoji: '🦌', color },
  { emoji: '🍷', color },
]);
const checklist = [
  { key: 'people', state: 'ok' as const, title: '12 participants' },
  {
    key: 'rules',
    state: 'ok' as const,
    title: 'Toutes les règles sont respectées',
    detail: '2 exclusions · personne ne se tire soi-même',
  },
  {
    key: 'missing',
    state: 'warning' as const,
    title: 'Léa ne participe pas encore',
    detail: 'Elle est dans le groupe mais pas dans cette édition.',
  },
];
const sheetDemo = ref(false);
const picker = ref(false);
const pickerBig = ref(false);
const picked = ref<string | null>(null);
const FIRST_NAMES = [
  'Camille',
  'Hugo',
  'Inès',
  'Louis',
  'Rose',
  'Lola',
  'Chloé',
  'Élodie',
  'Tom',
  'Zoé',
  'Yanis',
  'Lou',
];
/**
 * Sample people for the person picker.
 * @param count - How many.
 * @returns People with a name and an icon.
 */
const pickable = (count: number) =>
  FIRST_NAMES.slice(0, count).map((name, index) => ({
    id: name,
    name,
    avatar: crowd[index % crowd.length]!,
  }));
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
    </section>

    <section class="flex flex-col gap-3">
      <UiSectionTitle>Pilotage d'une édition</UiSectionTitle>
      <UiStepper :steps="steps" label="Étapes de l'édition" />
      <UiActionCard
        eyebrow="UiActionCard"
        title="Préviens chacun que le tirage est fait"
        help="Une ligne d'aide sous l'action."
      >
        <UiCounters :items="counters" />
        <template #action>
          <UButton block icon="i-lucide-mail" label="Action principale" />
        </template>
      </UiActionCard>
      <div class="flex items-center gap-3">
        <UiAvatarStack :avatars="crowd" label="12 participants" />
        <span class="text-sm text-muted"
          >UiAvatarStack : 4 au plus, puis +N</span
        >
      </div>
      <UiNotice variant="checklist" :items="checklist">
        <template #trailing="{ item }">
          <UiAvatarStack
            v-if="item.key === 'people'"
            :avatars="crowd"
            label="12 participants"
          />
        </template>
      </UiNotice>
      <UiNotice variant="info" icon="i-lucide-lock">
        UiNotice info : une ligne discrète, avec son icône.
      </UiNotice>
      <UiNotice variant="positive" icon="i-lucide-arrow-right">
        UiNotice positive : une bonne nouvelle, ou la suite.
      </UiNotice>
      <UiNotice variant="warning" title="UiNotice warning">
        <p class="text-sm">Un encadré qui demande une action.</p>
      </UiNotice>
      <UButton
        block
        variant="soft"
        label="UiSheet : ouvrir"
        @click="sheetDemo = true"
      />
      <UiSheet
        v-model:open="sheetDemo"
        title="Titre du panneau"
        description="UiSheet : corps, puis le pied avec l'action et la sortie."
      >
        <p class="py-2 text-sm">Le corps du panneau.</p>
        <template #footer>
          <UButton block label="Action" @click="sheetDemo = false" />
          <UButton
            block
            variant="ghost"
            color="neutral"
            label="Sortie"
            @click="sheetDemo = false"
          />
        </template>
      </UiSheet>
      <div class="grid grid-cols-2 gap-2">
        <UButton
          block
          variant="soft"
          label="UiPersonPicker (5)"
          @click="picker = true"
        />
        <UButton
          block
          variant="soft"
          label="Avec recherche (12)"
          @click="pickerBig = true"
        />
      </div>
      <UiPersonPicker
        v-model:open="picker"
        v-model:selected="picked"
        title="Le résultat de qui ?"
        :people="pickable(5)"
        search-label="Chercher un prénom"
        clear-label="Effacer la recherche"
        :results-text="(shown, total) => `${shown} prénoms sur ${total}`"
      />
      <UiPersonPicker
        v-model:open="pickerBig"
        v-model:selected="picked"
        title="Le résultat de qui ?"
        :people="pickable(12)"
        search-label="Chercher un prénom"
        clear-label="Effacer la recherche"
        :results-text="(shown, total) => `${shown} prénoms sur ${total}`"
        footnote="La recherche ignore les accents et les majuscules."
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
        :subtitle="t('adminEdition.screen.follow.state.notOpened')"
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

    <section class="flex flex-col gap-3">
      <UiSectionTitle>Page d'un tirage</UiSectionTitle>
      <ul class="grid grid-cols-2 gap-3">
        <li
          v-for="state in ENVELOPES"
          :key="state"
          class="flex flex-col items-center gap-1"
        >
          <UiEnvelope :state="state" />
          <code class="text-xs">UiEnvelope {{ state }}</code>
        </li>
      </ul>
      <UiGiftTag>
        <p class="text-center text-muted">
          UiGiftTag : une étiquette cadeau, son contenu dans le slot.
        </p>
      </UiGiftTag>
    </section>

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
        <li>Une cible tactile fait au moins 44 px.</li>
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
