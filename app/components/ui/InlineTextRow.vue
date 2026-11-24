<script setup lang="ts">
// A short text written on its row (docs/spec/v3/regles-d-ecran.md, « Un
// texte court s'écrit sur sa ligne », ticket 162; V3TirageNouveau,
// V3TirageNouveauEcrire, Compte, GroupePersonne). At rest: its label, its
// value in ink on the right, no arrow; empty, its invite in grey. Touched,
// one writes there, the caret at the end: the row stays white and still,
// only its label and its border turn red, the border on the lines that
// are there and the corners of the card. « OK », Entrée or a touch
// elsewhere saves, when the value changed, with « Enregistré » at the
// bottom; Échap cancels; a required value emptied takes the old one back.
// An error shows under the row, which stays open. What writing sets off is
// said under it while one writes (`writing` slot). A real input with its
// label, 44 px and more to touch.
const props = withDefaults(
  defineProps<{
    label: string;
    value: string | null;
    /** Shown when empty: « Ajouter » by default. */
    placeholder?: string;
    required?: boolean;
    type?: 'text' | 'email';
    maxlength?: number;
    /** Saves a value that changed; a failure is shown under the row. */
    save: (value: string) => Promise<unknown>;
    /** Checks a value first: the words of an error, or null. */
    check?: (value: string) => string | null;
    /** No « Enregistré »: a draft kept on this screen, not saved yet. */
    quiet?: boolean;
    disabled?: boolean;
  }>(),
  {
    placeholder: undefined,
    required: false,
    type: 'text',
    maxlength: 100,
    check: undefined,
    quiet: false,
    disabled: false,
  },
);
const { t } = useT();
const toast = useMessages();
const errorMessage = useErrorMessage();
const inputId = useId();
const errorId = useId();
const field = ref<HTMLInputElement | null>(null);
const focused = ref(false);
const saving = ref(false);
const error = ref<string | null>(null);
const draft = ref('');
/** Échap was pressed: the blur that follows saves nothing. */
const cancelled = ref(false);
/** Open: being written, being saved, or held by an error. */
const open = computed(() => focused.value || saving.value || !!error.value);
const shown = computed(() => (open.value ? draft.value : (props.value ?? '')));

const onFocus = () => {
  if (!error.value && !saving.value) draft.value = props.value ?? '';
  focused.value = true;
};
/** A touch that opens the row: the caret goes at the end of the value. */
const tapped = ref(false);
const onPointerDown = () => {
  tapped.value = !focused.value;
};
const onClick = () => {
  if (!tapped.value) return;
  tapped.value = false;
  const input = field.value;
  input?.setSelectionRange(input.value.length, input.value.length);
};
const onEscape = () => {
  cancelled.value = true;
  draft.value = props.value ?? '';
  error.value = null;
  field.value?.blur();
};
/** Saves what was written, if anything changed. */
const commit = async () => {
  const written = draft.value.trim();
  const before = props.value ?? '';
  if (written === before || (props.required && written === '')) {
    draft.value = before;
    error.value = null;
    return;
  }
  const wrong = props.check?.(written) ?? null;
  if (wrong) {
    error.value = wrong;
    return;
  }
  error.value = null;
  saving.value = true;
  try {
    await props.save(written);
    if (!props.quiet) toast.done(t('common.saved'));
  } catch (failure) {
    error.value = errorMessage(failure);
  } finally {
    saving.value = false;
  }
};
const onBlur = () => {
  focused.value = false;
  if (cancelled.value) {
    cancelled.value = false;
    return;
  }
  void commit();
};
</script>

<template>
  <li
    class="sm:first:rounded-t-lg sm:last:rounded-b-lg"
    :data-writing="open || undefined"
  >
    <label
      :for="inputId"
      class="flex min-h-14 items-center gap-3 rounded-[inherit] px-4 py-2"
      :class="[
        open ? 'shadow-[inset_0_0_0_1.5px_var(--ui-primary)]' : '',
        disabled ? '' : 'cursor-text',
      ]"
      @pointerdown="onPointerDown"
    >
      <span
        class="shrink-0 font-semibold"
        :class="open ? 'text-primary-ink' : ''"
        >{{ label }}</span
      >
      <input
        :id="inputId"
        ref="field"
        :value="shown"
        :type="type"
        :inputmode="type === 'email' ? 'email' : undefined"
        :autocapitalize="type === 'email' ? 'none' : 'words'"
        autocomplete="off"
        enterkeyhint="done"
        :maxlength="maxlength"
        :disabled="disabled"
        :placeholder="placeholder ?? t('common.actions.add')"
        :aria-invalid="error ? true : undefined"
        :aria-describedby="error ? errorId : undefined"
        :aria-busy="saving || undefined"
        class="min-h-11 min-w-0 grow bg-transparent text-right text-base text-default outline-none placeholder:text-dimmed"
        @input="draft = ($event.target as HTMLInputElement).value"
        @focus="onFocus"
        @click="onClick"
        @blur="onBlur"
        @keydown.enter.prevent="field?.blur()"
        @keydown.esc.prevent.stop="onEscape"
      />
      <UiSpinner v-if="saving" :label="t('common.actions.saving')" />
    </label>
    <p
      v-if="focused && $slots.writing"
      class="px-4 pb-3 text-[13px] leading-[1.4] text-toned"
    >
      <slot name="writing" />
    </p>
    <p
      v-if="error"
      :id="errorId"
      role="alert"
      class="px-4 pb-3 text-sm text-error-ink"
      data-testid="inline-error"
    >
      {{ error }}
    </p>
  </li>
</template>
