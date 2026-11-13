import type { MessageType } from '#server/utils/messages';
import { useMarkSentMutation, type Via } from './queries/useEdition';

/**
 * Shares a prepared message through the phone share sheet (WhatsApp, SMS…),
 * or copies it when the device has no share sheet. Both must start right on
 * tap, before any await (Safari), hence texts loaded beforehand. The
 * participant is marked as "sent" only if sharing was not cancelled.
 */
export const useShareMessage = (slug: MaybeRefOrGetter<string>) => {
  const mark = useMarkSentMutation(slug);
  const toast = useToast();
  const { t } = useT();
  const errorMessage = useErrorMessage();

  const deliver = async (text: string): Promise<Via | null> => {
    if (typeof navigator.share === 'function') {
      return navigator.share({ text }).then(
        () => 'share' as const,
        () => null,
      );
    }
    await navigator.clipboard.writeText(text);
    toast.add({
      title: t('adminEdition.share.copied'),
      description: t('adminEdition.share.copiedDescription'),
      icon: 'i-lucide-clipboard-check',
      color: 'success',
    });
    return 'copy';
  };

  const share = async (
    participationId: string,
    type: MessageType,
    text: string | undefined,
  ) => {
    if (!text) return;
    const via = await deliver(text);
    if (via) {
      mark.mutate(
        { participationId, type, via },
        {
          onError: (error) =>
            toast.add({ title: errorMessage(error), color: 'error' }),
        },
      );
    }
  };

  const copy = async (
    participationId: string,
    type: MessageType,
    text: string | undefined,
  ) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    toast.add({
      title: t('adminEdition.share.copied'),
      icon: 'i-lucide-clipboard-check',
      color: 'success',
    });
    mark.mutate({ participationId, type, via: 'copy' });
  };

  return { share, copy };
};
