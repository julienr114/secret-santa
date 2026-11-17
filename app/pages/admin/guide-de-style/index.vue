<script setup lang="ts">
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
const christmasDay = `${new Date().getFullYear()}-12-25`;
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
  text: false,
  number: false,
  date: false,
});
const settings = reactive({ years: 1, note: '', places: 10, until: '' });
const YEAR_CHOICES = [
  { value: 0, label: 'Non, peu importe' },
  { value: 1, label: 'Pas la même que l’an dernier' },
  { value: 2, label: 'Pas la même que les 2 dernières années' },
  {
    value: 3,
    label: 'Pas la même que les 3 dernières années',
    hint: 'Le tirage devient très contraint dans un petit groupe',
  },
];
const yearLabel = computed(
  () => YEAR_CHOICES.find((c) => c.value === settings.years)?.label ?? '',
);
/** Fake failures, to show the error states. */
const loadFailure = { statusCode: 500 };
const refusal = { statusCode: 403, statusMessage: 'forbidden' };
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
      <p>Texte courant, en Nunito.</p>
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
      <div class="flex items-center gap-3">
        <UiAvatar :avatar="sample" size="sm" />
        <UiAvatar :avatar="sample" size="md" />
        <UiAvatar :avatar="sample" size="lg" />
        <UiAvatar :avatar="sample" size="xl" />
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
        text="La ligne que tout le groupe lira dans le journal."
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
      <p class="flex items-center gap-2.5">
        <UiStar />
        <code class="text-xs">UiStar : l’étoile devant une idée précise</code>
      </p>
      <UiTile
        to="#"
        icon="i-lucide-list-checks"
        title="Mes pistes de cadeaux"
        state="todo"
        text="À remplir"
      />
      <UiTile
        to="#"
        icon="i-lucide-list-checks"
        title="Mes pistes de cadeaux"
        state="done"
        text="Remplies, modifiables jusqu’à la fête"
      />
      <div class="grid grid-cols-2 gap-3">
        <UiTile
          to="#"
          icon="i-lucide-list-checks"
          title="Mes pistes de cadeaux"
          state="done"
          text="Remplies"
          compact
        />
        <UiTile
          to="#"
          icon="i-lucide-circle-help"
          title="Une autre chose"
          state="todo"
          text="À faire"
          compact
        />
      </div>
      <code class="text-xs"
        >UiTile : une chose à faire sur la page d’un tirage, à faire (cerclée de
        brique), faite (coche) ou seulement dite ; seule, sur toute la largeur,
        à deux, côte à côte (compact)</code
      >
      <ParticipantJournalRow to="#" :alerts="0" />
      <ParticipantJournalRow to="#" :alerts="1" />
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
          title="Mot ajouté aux messages"
          :value="settings.note || 'Aucun'"
          :on-click="() => (sheetOpen.text = true)"
        />
        <UiListItem
          title="Places restantes"
          :value="String(settings.places)"
          :on-click="() => (sheetOpen.number = true)"
        />
        <UiListItem
          title="Date limite"
          :value="settings.until || 'Aucune'"
          :on-click="() => (sheetOpen.date = true)"
        />
      </UiList>
      <p class="px-1 text-xs text-muted">
        Panneaux : UiChoiceSheet, UiTextSheet, UiNumberSheet et AdminDateSheet,
        tous sur UiSettingSheet (Valider, Annuler, ligne d'erreur).
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
      <UiTextSheet
        v-model:open="sheetOpen.text"
        title="Mot ajouté aux messages"
        description="Ajouté tel quel à chaque message envoyé aux participants."
        label="Ton mot"
        :value="settings.note"
        :maxlength="500"
        hint="Envoyé tel quel, quelle que soit la langue."
        :validate-label="t('common.actions.validate')"
        :cancel-label="t('common.actions.cancel')"
        error="Exemple de ligne d'erreur : le panneau reste ouvert."
        @validate="(v) => ((settings.note = v), (sheetOpen.text = false))"
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
      <AdminDateSheet
        v-model:open="sheetOpen.date"
        title="Date limite"
        description="Facultatif. Le lien ne marche plus après ce jour."
        label="Date"
        :value="settings.until"
        clear-label="Pas de date limite"
        @validate="(v) => ((settings.until = v), (sheetOpen.date = false))"
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
      <p class="px-1 text-xs text-muted">
        UiStickyFooter garde le bouton d'un écran en bas, au-dessus de la barre
        de l'iPhone (écran « Personnaliser le message »).
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
