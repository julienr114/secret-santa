<script setup lang="ts">
import { partyYears, type BirthParts } from '#shared/utils/memberFields';
import {
  UiIllusTree,
  UiIllusTreeEmpty,
  UiIllusWreath,
  UiIllusParcels,
  UiIllusLabel,
  UiIllusLetter,
  UiIllusSeats,
  UiIllusChecklist,
} from '#components';
import { AVATAR_COLORS, type Avatar } from '#server/utils/avatars';
import type { JournalEntry } from '#server/utils/audit';
import type { NotePosition } from '#server/utils/messages';
import { listView } from '#shared/utils/lists';

// Every interface component in its variants, in the language chosen in
// the menu. Its own headings are in French only: a developer's tool, the
// one screen exempt from the dictionaries.
definePageMeta({ middleware: 'admin', layout: 'admin' });
const { t, tk } = useT();
useHead({ title: () => `Guide de style — ${t('common.appName')}` });
// Opened from the last row of the administration: its parent.
const screen = {
  back: '/admin',
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
  { name: 'primary', hint: 'Corail : action', class: 'bg-primary' },
  { name: 'secondary', hint: 'Menthe foncée : réussi', class: 'bg-secondary' },
  { name: 'warning', hint: 'Lilas : attention', class: 'bg-warning' },
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
  {
    name: 'warning-fill',
    hint: 'Lilas plein : cadeau à plusieurs',
    class: 'bg-warning-fill',
  },
  { name: 'alert', hint: 'Rond d’une alerte du journal', class: 'bg-alert' },
  { name: 'star', hint: 'Étoile des idées', class: 'bg-star' },
  {
    name: 'line-strong',
    hint: 'Bord marqué, case prise',
    class: 'bg-line-strong',
  },
];
/** The eight illustrations of « Sorbet », by where they show. */
const ILLUSTRATIONS = [
  {
    is: UiIllusTree,
    name: 'UiIllusTree',
    hint: 'Connexion, à la place du logo',
  },
  {
    is: UiIllusTreeEmpty,
    name: 'UiIllusTreeEmpty',
    hint: 'Aucun tirage pour l’instant',
  },
  {
    is: UiIllusWreath,
    name: 'UiIllusWreath',
    hint: 'Lien d’invitation, à la place du logo',
  },
  { is: UiIllusParcels, name: 'UiIllusParcels', hint: 'Groupe rejoint' },
  {
    is: UiIllusLabel,
    name: 'UiIllusLabel',
    hint: 'Pistes de cadeaux à remplir',
  },
  { is: UiIllusLetter, name: 'UiIllusLetter', hint: 'Demande acceptée' },
  { is: UiIllusSeats, name: 'UiIllusSeats', hint: 'Édition sans participants' },
  { is: UiIllusChecklist, name: 'UiIllusChecklist', hint: 'Aucune liste' },
];
/** Codes shown by AdminStatusBadge: edition statuses, then participant badges. */
const STATUSES = ['preparing', 'drawn', 'closed'];
const BADGES = ['sent', 'wishes', 'viewed'];

/** A person's icon used throughout the examples. */
const sample = { emoji: '🥨', color: 'mustard' } as const;
const text = ref('');
const inlineName = ref('Camille');
const choice = ref<NotePosition>('after');
/** The link of the message bubble example. */
const BUBBLE_LINK = 'https://under-the-tree.party/p/aIFR42';
/** The message bubble example. */
const BUBBLE = `UiMessageBubble : un message tel qu'il partira, son lien seul sur sa ligne.\n${BUBBLE_LINK}`;
/** The message picked in the segmented control example. */
const segment = ref('drawn');
/** The choices of the segmented control example. */
const SEGMENTS = [
  { value: 'drawn', label: 'Tirage fait' },
  { value: 'reminder', label: 'Relance' },
  { value: 'redraw', label: 'Nouveau tirage' },
];
const toggle = ref(true);
/** The box of the UiCheckRow example. */
const ticked = ref(true);
/** The box of the UiConfirmBox example. */
const confirmed = ref(false);
const date = ref<BirthParts>({
  day: 25,
  month: 12,
  year: new Date().getFullYear(),
});
const dateYears = partyYears(new Date().getFullYear());
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
const iconOpen = ref(false);
const iconSample = ref<Avatar>({ emoji: '🚀', color: 'frost' });
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
    detail: 'Elle est dans l’événement mais pas dans ce Secret Santa.',
  },
  {
    key: 'info',
    state: 'ok' as const,
    icon: 'i-lucide-info',
    title: 'Une ligne qui renseigne',
    detail: 'icon remplace la coche (panneau « Le tirage a déjà été fait ? »).',
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
/** Examples of the long lists and the settings rows and sheets. */
const longList = pickable(12);
const expanded = ref(false);
const search = ref('');
const longView = computed(() =>
  listView(longList, {
    query: search.value,
    expanded: expanded.value,
    shown: 3,
    nameOf: (person) => person.name,
    from: 3,
  }),
);
const notifyOn = ref(true);
const sheetOpen = reactive({
  choice: false,
  number: false,
});
const settings = reactive({ years: 1, places: 10 });
const YEAR_CHOICES = [
  { value: 0, label: 'Non, peu importe' },
  { value: 1, label: 'Pas la même que l’an dernier' },
  { value: 2, label: 'Pas la même que les 2 dernières années' },
  {
    value: 3,
    label: 'Pas la même que les 3 dernières années',
    hint: 'Le tirage devient très contraint dans un petit événement',
  },
];
const yearLabel = computed(
  () => YEAR_CHOICES.find((c) => c.value === settings.years)?.label ?? '',
);
/** Fake failures, to show the error states. */
const loadFailure = { statusCode: 500 };
const refusal = { statusCode: 403, statusMessage: 'forbidden' };
const choices = useNotePositionItems();
/** A choice list with choices greyed (DevineReglageTrois). */
const gameChoice = ref('none');
const GAME_CHOICES = [
  { value: 'none', label: 'Aucun pronostic', hint: 'Le jeu est éteint' },
  {
    value: 'santa',
    label: 'Qui m’offre ?',
    hint: 'Chacun devine son propre Père Noël',
    disabled: true,
  },
];

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
 * @returns The entry as the journal expects it.
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
  personId: String(meta.name ?? 'Léa'),
  messageType: null,
  via: null,
  ownText: null,
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
/** The people of the sample journal, for the icons of a folded line. */
const journalPeople = [
  { id: 'Léa', name: 'Léa', avatar: { emoji: '🦌', color: 'plum' } },
  { id: 'Hugo', name: 'Hugo', avatar: { emoji: '🐧', color: 'mustard' } },
] as const;
/** One entry of each visual kind: plain line, folded lines, milestone, alert. */
const entries = computed(() => [
  entry('1', 'result_viewed', 5),
  entry('1b', 'result_viewed', 12, { name: 'Hugo' }),
  entry('2', 'draw_done', 30),
  entry('4', 'result_revealed', 200),
  entry('5', 'message_sent', 300),
  entry('6', 'edition_created', 400),
]);
// The messages after an action (README 23.3): the three kinds, fired
// for real, since they live at the bottom of the screen.
const messages = useMessages();
const undone = ref(0);
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
      <div class="flex flex-col gap-1">
        <UiPageContext
          label="UiPageContext"
          :parts="[
            { label: 'Famille Camille', to: '/admin/guide-de-style' },
            { label: 'Noël 2026', to: '/admin/guide-de-style' },
          ]"
        />
        <UiPageTitle>UiPageTitle : le titre de l'écran</UiPageTitle>
      </div>
      <UiSectionTitle>UiSectionTitle : au-dessus d'un groupe</UiSectionTitle>
      <h2 class="font-display text-[22px] leading-[1.2] font-semibold">
        Un titre, en Outfit
      </h2>
      <p>Texte courant, en DM Sans.</p>
      <p class="text-sm text-muted">Explication ou aide, en plus discret.</p>
      <UiTextPreview>
        UiTextPreview : un texte tel qu'il a été écrit. Les retours à la ligne
        sont gardés.
      </UiTextPreview>
      <UiMessageBubble :text="BUBBLE" :link="BUBBLE_LINK" />
      <UiSegmented v-model="segment" :items="SEGMENTS" label="UiSegmented" />
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
        <UiCountBadge :count="3" label="3 demandes à traiter" />
      </div>
    </section>

    <section class="flex flex-col gap-3">
      <UiSectionTitle>Icônes de personne</UiSectionTitle>
      <div class="flex items-center gap-3" data-testid="avatar-sizes">
        <UiAvatar :avatar="sample" size="sm" />
        <UiAvatar :avatar="sample" size="md" />
        <UiAvatar :avatar="sample" size="lg" />
        <UiAvatar :avatar="sample" size="xl" />
      </div>
      <UiCard class="flex items-center gap-3">
        <UiAvatar :avatar="sample" :px="26" />
        <span class="grow text-sm text-toned"
          >Un autocollant : 26 px dans une ligne, sur une carte blanche (px). À
          plat (flat), le dégradé seul :</span
        >
        <UiAvatar :avatar="sample" flat />
      </UiCard>
      <div class="flex flex-wrap gap-2">
        <UiAvatar
          v-for="color in AVATAR_COLORS"
          :key="color"
          :avatar="{ emoji: '🎄', color }"
        />
      </div>
      <UButton
        variant="outline"
        class="self-start"
        label="UiIconSheet : choisir une icône"
        @click="iconOpen = true"
      />
      <div class="flex items-center gap-3">
        <ListsTile :icon="{ emoji: '❄️', color: 'night' }" size="sm" />
        <ListsTile :icon="{ emoji: '🎂', color: 'mustard' }" />
        <ListsTile :icon="{ emoji: '🎁', color: 'brick' }" size="lg" />
        <span class="text-sm text-toned"
          >ListsTile : l’icône carrée d’une liste, penchée ; droite dans un
          panneau (flat)</span
        >
        <ListsTile :icon="{ emoji: '🎁', color: 'plum' }" size="sm" flat />
      </div>
      <AdminAvatarSheet
        v-model:open="iconOpen"
        :initial="iconSample"
        title="L’icône de Léo"
        @validate="
          (avatar) => {
            iconSample = avatar;
            iconOpen = false;
          }
        "
      />
    </section>

    <section class="flex flex-col gap-3">
      <UiSectionTitle>Cartes</UiSectionTitle>
      <UiCard>UiCard : une surface blanche, espacement <code>md</code>.</UiCard>
      <UiCard padding="lg" class="text-center">
        UiCard <code>lg</code> : pour un message centré.
      </UiCard>
      <UiStack :behind="2">
        <UiCard padding="lg">
          UiStack : une carte posée sur la pile, un bord par élément en attente
          derrière elle, deux au plus.
        </UiCard>
      </UiStack>
    </section>

    <section class="flex flex-col gap-3">
      <UiSectionTitle>Réservé au super-admin</UiSectionTitle>
      <UiRestricted label="Super-admin">
        <p class="text-sm">
          UiRestricted : ce que seul un super-admin voit sur un écran que tout
          le monde voit, dans un cadre en pointillés, sans phrase d'explication.
        </p>
      </UiRestricted>
      <UiRestricted label="Super-admin" flush>
        <ul>
          <UiListItem
            icon="i-lucide-trash-2"
            tone="danger"
            title="Avec des lignes (flush)"
            :on-click="() => undefined"
          />
        </ul>
      </UiRestricted>
    </section>

    <section class="flex flex-col gap-3">
      <UiSectionTitle>Pilotage d’un Secret Santa</UiSectionTitle>
      <UiStepper :steps="steps" :label="t('adminEdition.screen.steps.label')" />
      <UiActionCard
        eyebrow="UiActionCard"
        title="Préviens chacun que le tirage est fait"
        help="Une ligne d'aide sous l'action."
      >
        <UiCounters :items="counters" />
        <template #action>
          <UButton block icon="i-lucide-mail" label="Action principale" />
        </template>
        <template #footer>
          <p
            class="flex min-h-13 items-center px-5 text-[15px] font-bold text-primary-ink"
          >
            footer : une dernière ligne sur toute la largeur
          </p>
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
      <UiNotice variant="caution" icon="i-lucide-eye">
        UiNotice caution : à savoir, sans action à faire.
      </UiNotice>
      <UiNotice
        variant="danger"
        icon="i-lucide-triangle-alert"
        title="UiNotice danger"
      >
        <UiPointList
          :points="[
            { text: 'UiPointList tone error : ce qui sera perdu.' },
            { text: 'Un point par conséquence.' },
          ]"
          tone="error"
        />
      </UiNotice>
      <UiPointList
        :points="[
          { icon: 'i-lucide-check', text: 'UiPointList tone success' },
          { icon: 'i-lucide-check', text: 'Ce qui reste comme avant.' },
        ]"
        tone="success"
        class="text-toned"
      />
      <UiJournalPreview
        label="UiJournalPreview"
        icon="i-lucide-eye"
        text="La ligne que tous les membres liront dans le journal."
      />
      <UiConfirmBox v-model="confirmed" label="UiConfirmBox : je comprends" />
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
        to="/admin/guide-de-style"
        icon="i-lucide-mail"
        icon-tone="neutral"
        title="Ligne avec du nouveau"
        subtitle="Un point rouge avant la flèche, « nouveau » pour un lecteur d'écran"
        :dot="t('lines.dot')"
      />
      <UiListItem
        to="/admin/guide-de-style"
        icon="i-lucide-list-checks"
        icon-tone="lilac"
        title="Nouveauté pas encore vue, en gras"
        subtitle="Quoi de neuf"
        strong
        :dot="t('lines.dot')"
      />
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

    <section class="flex flex-col gap-3" data-testid="guide-messages">
      <UiSectionTitle>Messages après une action (useMessages)</UiSectionTitle>
      <p class="text-sm text-toned">
        Un bandeau prune foncé, en bas de l'écran, un seul à la fois. Jamais
        pour une information qui doit rester : c'est le rôle de UiNotice.
      </p>
      <div class="flex flex-wrap gap-2">
        <UButton
          variant="outline"
          color="neutral"
          label="Fait, et ça se rattrape"
          @click="
            messages.undo('Coche de Mamie retirée', () => {
              undone += 1;
            })
          "
        />
        <UButton
          variant="outline"
          color="neutral"
          label="Fait"
          @click="messages.done('3 emails envoyés', 'Inès, Louis et Mamie')"
        />
        <UButton
          variant="outline"
          color="neutral"
          label="Ça n'a pas marché"
          @click="
            messages.failed(
              'L’envoi n’est pas parti',
              'Vérifie ta connexion, puis réessaie.',
            )
          "
        />
      </div>
      <p class="text-sm text-toned" data-testid="guide-undone">
        « Annuler » touché {{ undone }} fois. Le premier reste 6 secondes, le
        deuxième 4, le troisième jusqu'à ce qu'on le ferme.
      </p>
    </section>

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
        <li class="flex flex-col items-center gap-1">
          <UiEnvelopeSent />
          <code class="text-xs">UiEnvelopeSent</code>
        </li>
        <li class="flex flex-col items-center gap-1">
          <UiPodium />
          <code class="text-xs">UiPodium (lot 19)</code>
        </li>
      </ul>
      <code class="text-xs"
        >Une illustration par composant (UiEnvelopePending, UiEnvelopeSealed,
        UiEnvelopeOpened, UiEnvelopeLocked), choisie par UiEnvelope selon
        envelopeState</code
      >
      <UiSectionTitle>Illustrations (README 23.5)</UiSectionTitle>
      <ul class="grid grid-cols-2 gap-3" data-testid="illustrations">
        <li
          v-for="illustration in ILLUSTRATIONS"
          :key="illustration.name"
          class="flex flex-col items-center gap-1 text-center"
        >
          <component :is="illustration.is" class="w-full! max-w-46" />
          <code class="text-xs">{{ illustration.name }}</code>
          <span class="text-xs text-muted">{{ illustration.hint }}</span>
        </li>
      </ul>
      <UiGiftTag>
        <p class="text-center text-muted">
          UiGiftTag : une étiquette cadeau, son contenu dans le slot.
        </p>
      </UiGiftTag>
      <UiTagList
        :tags="[
          'Plutôt utile',
          { label: 'Un moment', to: '#' },
          { label: 'Pour moi, ou à partager ?', to: '#', missing: true },
        ]"
      />
      <code class="text-xs"
        >UiTagList : les réponses de « Moi et les cadeaux », en lien, ou en
        pointillés quand il en manque une</code
      >
      <p class="flex flex-wrap items-center gap-1.5">
        <UiChip>Mamie</UiChip>
        <UiChip icon="i-lucide-users">7 personnes</UiChip>
        <UiChip kind="mine" icon="i-lucide-gift">Tu l’offres</UiChip>
        <UiChip kind="anonymous" icon="i-lucide-venetian-mask"
          >Tu l’offres en anonyme</UiChip
        >
        <UiChip kind="action" icon="i-lucide-plus" button>Se joindre</UiChip>
        <UiChip kind="selected" button>Mamie</UiChip>
      </p>
      <code class="text-xs"
        >UiChip : une pastille sous une ligne. Une information (pêche), mon état
        (menthe, ou aubergine en anonyme), une action (blanche, à filet : la
        seule qui se touche), et une information touchée (foncée)</code
      >
      <p class="flex items-center gap-2.5">
        <UiStar />
        <code class="text-xs">UiStar : l’étoile devant une idée précise</code>
      </p>
      <UiTile
        to="#"
        icon="i-lucide-list-checks"
        title="Mes idées de cadeaux"
        state="todo"
        text="À remplir"
      />
      <UiTile
        to="#"
        icon="i-lucide-list-checks"
        title="Mes idées de cadeaux"
        state="done"
        text="Remplies, modifiables jusqu’à la fête"
      />
      <div class="grid grid-cols-2 gap-3">
        <UiTile
          to="#"
          icon="i-lucide-list-checks"
          title="Mes idées de cadeaux"
          state="done"
          text="Remplies"
          compact
        />
        <UiTile
          to="#"
          icon="i-lucide-search"
          title="Devine qui"
          state="award"
          text="Le palmarès t’attend"
          compact
        />
      </div>
      <code class="text-xs"
        >UiTile : une chose à faire sur la page d’un tirage, à faire (cerclée de
        corail), faite (coche), seulement dite, ou le palmarès qui attend
        (award, en vert plein) ; seule, sur toute la largeur, à deux, côte à
        côte (compact)</code
      >
      <ParticipantJournalRow to="#" :alerts="0" />
      <ParticipantJournalRow to="#" :alerts="1" />
      <ParticipantRevealedBanner
        revealed-at="2026-11-18T10:00:00.000Z"
        :revealed-by="{ kind: 'name', name: 'Camille' }"
        journal-path="#"
      />
      <ParticipantDrawLines
        :santa="{
          id: 'hugo',
          name: 'Hugo',
          avatar: { emoji: '🐧', color: 'mustard' },
        }"
        :past="false"
        all-path="#"
      />
      <code class="text-xs"
        >ParticipantRevealedBanner et ParticipantDrawLines : un tirage dévoilé
        (22.18), le bandeau aux couleurs des alertes du journal, puis « Qui
        m’offre mon cadeau ? », repliée, et « Voir tout le tirage »</code
      >
    </section>

    <section class="flex flex-col gap-3">
      <UiSectionTitle>Longues listes</UiSectionTitle>
      <UiSearchField
        v-model="search"
        label="Chercher un prénom"
        clear-label="Effacer la recherche"
      />
      <UiList
        footer="UiSearchField au-dessus d'une liste de plus de 10 personnes ; la recherche montre tous les résultats, sans repli."
      >
        <UiFoldedRows
          :fold="longView"
          :key-of="(person) => person.id"
          :avatar-of="(person) => person.avatar"
          :more-label="(count) => `Voir les ${count} autres`"
          collapse-label="Replier la liste"
          detail="UiFoldedRows et UiFoldRow : listView, tout se déplie d’un coup"
          @more="expanded = true"
          @collapse="expanded = false"
        >
          <template #row="{ item: person }">
            <UiListItem :avatar="person.avatar" :title="person.name" />
          </template>
        </UiFoldedRows>
      </UiList>
    </section>

    <section class="flex flex-col gap-3">
      <UiSectionTitle>Réglages</UiSectionTitle>
      <UiList
        title="Lignes de réglage"
        footer="UiListItem avec value (ouvre un panneau) ou v-model:checked (interrupteur)."
      >
        <UiListItem
          title="Éviter la même personne"
          :value="yearLabel"
          :on-click="() => (sheetOpen.choice = true)"
        />
        <UiListItem
          v-model:checked="notifyOn"
          title="Quelqu'un rejoint le groupe"
          subtitle="Un email à chaque arrivée par le lien"
        />
        <UiListItem
          title="Places restantes"
          :value="String(settings.places)"
          :on-click="() => (sheetOpen.number = true)"
        />
      </UiList>
      <p class="px-1 text-xs text-muted">
        Panneaux : UiChoiceSheet et UiNumberSheet (un texte court s'écrit sur sa
        ligne, plus haut ; une date ouvre sa page, AdminDatePage), tous sur
        UiSettingSheet (Valider, Annuler, ligne d'erreur).
      </p>
      <UiChoiceSheet
        v-model:open="sheetOpen.choice"
        title="Éviter la même personne"
        description="Personne n’offre à quelqu’un qu’il a déjà eu ces dernières années."
        :choices="YEAR_CHOICES"
        :value="settings.years"
        :validate-label="t('common.actions.validate')"
        :cancel-label="t('common.actions.cancel')"
        @validate="(v) => ((settings.years = v), (sheetOpen.choice = false))"
      />
      <UiNumberSheet
        v-model:open="sheetOpen.number"
        title="Places restantes"
        description="Combien de personnes peuvent encore rejoindre le groupe par ce lien."
        :value="settings.places"
        :min="1"
        :max="50"
        hint="Le groupe peut encore accueillir 50 personnes au plus."
        decrease-label="Une place de moins"
        increase-label="Une place de plus"
        :validate-label="t('common.actions.validate')"
        :cancel-label="t('common.actions.cancel')"
        @validate="(v) => ((settings.places = v), (sheetOpen.number = false))"
      />
    </section>

    <section class="flex flex-col gap-3">
      <UiSectionTitle>Chargement et erreur</UiSectionTitle>
      <AdminQueryState
        :pending="true"
        :error="null"
        :rows="2"
        :skeleton="['title', 'stepper', 'card', 'list']"
      />
      <AdminQueryState
        :pending="false"
        :error="loadFailure"
        error-title="On n’arrive pas à charger l’édition"
        back-to="/admin/guide-de-style"
        back-label="Revenir au groupe"
      />
      <AdminQueryState :pending="false" :error="refusal" />
      <UiSkeleton
        :parts="['header', 'steps', 'envelope', 'groups']"
        label="UiSkeleton"
      />
      <UiSectionTitle>L’accueil arrive</UiSectionTitle>
      <UiSkeleton
        :parts="['greeting', 'parties']"
        gap="sm"
        label="UiSkeleton accueil"
      />
      <UiSectionTitle>Un événement arrive</UiSectionTitle>
      <UiSkeleton
        :parts="['head', 'members', 'sections']"
        gap="md"
        label="UiSkeleton événement"
      />
      <UiSectionTitle>Une liste, des réglages, des choix</UiSectionTitle>
      <UiSkeleton
        :parts="['bar', 'doc', 'icons', 'settings', 'chips']"
        :rows="2"
        label="UiSkeleton liste"
      />
    </section>

    <section class="flex flex-col gap-3">
      <UiSectionTitle>Actions en cours</UiSectionTitle>
      <UButton
        block
        loading
        disabled
        class="h-13 justify-center text-[17px] font-bold"
        label="UButton loading : « Tirage en cours… »"
      />
      <UiList footer="useBusy : l'indicateur n'apparaît qu'après 200 ms.">
        <UiListItem
          title="UiListItem busy"
          value="Que les 2 dernières années"
          busy
          busy-label="Enregistrement"
          :on-click="() => {}"
        />
      </UiList>
      <UiSpinner label="UiSpinner" />
      <UiList>
        <UiCheckRow
          v-model:checked="ticked"
          :avatar="sample"
          title="UiCheckRow"
          subtitle="Toute la ligne coche"
          label="Cocher l'exemple"
        />
      </UiList>
    </section>

    <section class="flex flex-col gap-3" data-testid="guide-inline">
      <UiSectionTitle
        >Un texte court s’écrit sur sa ligne (UiInlineTextRow)</UiSectionTitle
      >
      <p class="text-sm text-toned">
        Au repos : la valeur à l’encre, pas de flèche ; vide, « Ajouter » en
        gris. Touchée : on écrit là, le label et la bordure en rouge. Entrée ou
        toucher ailleurs enregistre, Échap annule. Une adresse fausse dit son
        erreur sous la ligne, qui reste ouverte.
      </p>
      <UiList>
        <UiInlineTextRow
          label="Prénom"
          :value="inlineName"
          required
          :save="async (value) => (inlineName = value)"
        />
        <UiInlineTextRow
          label="Nom de famille"
          :value="null"
          quiet
          :save="async () => undefined"
        />
        <UiInlineTextRow
          label="Adresse email"
          :value="null"
          type="email"
          quiet
          :check="
            (value) => (value.includes('@') ? null : 'Adresse email invalide')
          "
          :save="async () => undefined"
        >
          <template #writing>Ce que l’écriture déclenche se dit ici.</template>
        </UiInlineTextRow>
      </UiList>
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
      <!-- A date in one field, the date in full under it (ticket 160). -->
      <UiDateField
        v-model="date"
        :years="dateYears"
        weekday
        label="UiDateField : une date"
        testid="style-date"
      />
      <UiPersonField
        label="UiPersonField : une personne"
        :person="{ name: 'Hugo', avatar: sample }"
        placeholder="Choisir…"
        @open="picker = true"
      />
      <UiChoiceList
        v-model="choice"
        :choices="choices"
        label="UiChoiceList : un choix parmi quelques-uns"
        titled
      />
      <UiChoiceList
        v-model="gameChoice"
        :choices="GAME_CHOICES"
        label="UiChoiceList grisé : « Devine qui » après un tirage à trois"
        titled
      />
      <p class="px-1 text-xs text-muted">
        UiStickyFooter garde le bouton d'un long écran en bas, au-dessus de la
        barre du bas. Sur une page où l'on rédige (inline), le bouton est dans
        la page, à la fin du contenu : rien ne se place au-dessus du clavier.
      </p>
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
      <UiSectionTitle>Signal du journal sur l’accueil</UiSectionTitle>
      <HomeJournalSignal
        :signal="{
          count: 1,
          alert: { id: 'x', type: 'link_regenerated', createdAt: at(60) },
        }"
        path="/p/exemple"
      />
      <HomeJournalSignal
        :signal="{ count: 2, alert: null }"
        path="/p/exemple"
      />
    </section>

    <section class="flex flex-col gap-3">
      <UiSectionTitle>Journal</UiSectionTitle>
      <JournalView
        :entries="entries"
        :editions="[{ id: 'e', label: 'Noël 2026' }]"
        current-edition-id="e"
        :people="[...journalPeople]"
      />
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
          (peach-50, coral-600).
        </li>
        <li>
          Aucun texte en dur dans un écran du produit : tout passe par les
          dictionnaires.
        </li>
      </ul>
    </section>
  </AdminScreen>
</template>
