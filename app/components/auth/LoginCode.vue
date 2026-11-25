<script setup lang="ts">
import {
  useLoginCodeMutation,
  useRequestLinkMutation,
} from '~/composables/queries/useAuth';
import { codeDigits, codeFromPaste } from '#server/utils/loginCode';

// « Tape ton code » (ticket 123, ConnexionCode), in the installed app
// only: six boxes, validated at the sixth digit; « Renvoyer un code »;
// « Utiliser une autre adresse ». One field over the six boxes, so that
// the phone offers the code of the email and a paste fills all six. The
// field is there for the finger (ticket 174): not hidden by its opacity,
// which made the iPhone offer no « Coller », only its letters and caret
// are transparent; and a paste takes the code out of whatever was copied.
const props = defineProps<{ email: string; next?: string | null }>();
const emit = defineEmits<{ other: [] }>();
const { t } = useT();
const errorMessage = useErrorMessage();
const { fetch: refreshSession } = useUserSession();
const check = useLoginCodeMutation();
const again = useRequestLinkMutation();
const typed = ref('');
const digits = computed(() => codeDigits(typed.value));
const field = ref<HTMLInputElement | null>(null);
const sentBefore = computed(() => t('auth.code.sentBefore'));
watch(digits, async (code) => {
  if (code.length !== 6 || check.isPending.value) return;
  check.mutate(
    { email: props.email, code },
    {
      onSuccess: async () => {
        await refreshSession();
        await navigateTo(props.next ?? '/');
      },
      onError: () => {
        typed.value = '';
        field.value?.focus();
      },
    },
  );
});
/**
 * A paste: the code out of what was copied (« 482 913 », the code and a
 * dot, the whole line of the email), the six boxes filled at once.
 * @param event - The paste.
 */
const onPaste = (event: ClipboardEvent) => {
  const pasted = event.clipboardData?.getData('text') ?? '';
  if (!pasted) return;
  event.preventDefault();
  typed.value = codeFromPaste(pasted);
};
const onAgain = () => {
  check.reset();
  typed.value = '';
  again.mutate({ email: props.email, next: props.next, code: true });
};
</script>

<template>
  <div class="flex flex-col gap-5" data-testid="login-code">
    <div class="flex flex-col gap-1.5">
      <h2 class="font-display text-[26px] leading-[1.15] font-bold">
        {{ t('auth.code.title') }}
      </h2>
      <p class="text-[15px] leading-[1.45] text-toned">
        {{ sentBefore }} <strong class="text-highlighted">{{ email }}</strong>{{
          t('auth.code.sentAfter')
        }}
      </p>
    </div>
    <label class="relative block">
      <span class="sr-only">{{ t('auth.code.label') }}</span>
      <span class="flex justify-between gap-2" aria-hidden="true">
        <span
          v-for="n in 6"
          :key="n"
          class="flex h-14 w-12 items-center justify-center rounded-2xl bg-default font-display text-2xl font-bold ring-1"
          :class="
            n === digits.length + 1 ? 'ring-2 ring-primary' : 'ring-accented'
          "
          >{{ digits[n - 1] ?? '' }}</span
        >
      </span>
      <input
        ref="field"
        v-model="typed"
        inputmode="numeric"
        autocomplete="one-time-code"
        autofocus
        class="absolute inset-0 size-full cursor-text bg-transparent text-base text-transparent caret-transparent outline-none selection:bg-transparent [-webkit-text-fill-color:transparent]"
        :disabled="check.isPending.value"
        data-testid="login-code-field"
        @paste="onPaste"
      />
    </label>
    <p
      v-if="check.isError.value"
      class="text-sm font-medium text-error"
      role="alert"
    >
      {{ errorMessage(check.error.value) }}
    </p>
    <p
      v-else-if="check.isPending.value"
      class="text-sm text-toned"
      role="status"
    >
      {{ t('auth.code.checking') }}
    </p>
    <p
      v-else-if="again.isSuccess.value"
      class="text-sm text-toned"
      role="status"
    >
      {{ t('auth.code.sentAgain') }}
    </p>
    <div class="flex flex-col items-start gap-1">
      <UButton
        variant="link"
        color="neutral"
        class="min-h-11 px-0 font-bold"
        :loading="again.isPending.value"
        :label="t('auth.code.again')"
        data-testid="login-code-again"
        @click="onAgain"
      />
      <UButton
        variant="link"
        color="neutral"
        class="min-h-11 px-0 font-bold"
        :label="t('auth.code.other')"
        @click="emit('other')"
      />
    </div>
  </div>
</template>
