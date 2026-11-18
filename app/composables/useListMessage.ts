import type { ListDocument } from '#server/http/lists';

/**
 * The message that shares a list (README 22.19, maquette ListePartager):
 * the ready-made sentence, or the one written over it in « Personnaliser
 * le message » (kept while the app is open, never saved), the link, then
 * a word about the app.
 * @param id - The list.
 * @param doc - Its document.
 * @param url - Its public link.
 * @returns The sentence alone, and the whole message.
 */
export const useListMessage = (
  id: MaybeRefOrGetter<string>,
  doc: MaybeRefOrGetter<ListDocument | undefined>,
  url: MaybeRefOrGetter<string>,
) => {
  const { t } = useT();
  const custom = useState<Record<string, string>>('list-messages', () => ({}));
  const names = computed(() => {
    const people = toValue(doc)?.people ?? [];
    const all = [
      ...people.filter((p) => !p.member.isSelf).map((p) => p.member.firstName),
      ...(people.some((p) => p.member.isSelf) ? [t('lists.share.me')] : []),
    ];
    return all.length > 1
      ? `${all.slice(0, -1).join(', ')} ${t('lists.share.and')} ${all.at(-1)}`
      : (all[0] ?? '');
  });
  const ready = computed(() =>
    t('lists.share.message', {
      title: toValue(doc)?.list.title ?? '',
      names: names.value,
    }),
  );
  const sentence = computed({
    get: () => custom.value[toValue(id)] ?? ready.value,
    set: (value: string) => {
      custom.value = { ...custom.value, [toValue(id)]: value };
    },
  });
  const whole = computed(
    () => `${sentence.value}\n${toValue(url)}\n\n${t('lists.share.footer')}`,
  );
  return { sentence, ready, whole };
};
