import type { MessageType } from '#server/utils/messages';
import { useSendMessageMutation, type Via } from './queries/useEdition';
import { errorMessage } from '~/utils/errors';

/**
 * Sends a message through the guardian's own WhatsApp, the clipboard or the
 * phone share sheet. The WhatsApp tab is opened synchronously on tap (popup
 * blockers), then pointed at the wa.me URL once the server answered.
 */
export const useSendMessage = (slug: MaybeRefOrGetter<string>) => {
  const send = useSendMessageMutation(slug);
  const toast = useToast();

  const run = (participationId: string, type: MessageType, via: Via) => {
    const tab = via === 'whatsapp' ? window.open('', '_blank') : null;
    send.mutate(
      { participationId, type, via },
      {
        onSuccess: async ({ text, whatsappUrl }) => {
          if (via === 'whatsapp') {
            if (tab) tab.location.href = whatsappUrl;
            else window.location.href = whatsappUrl;
          } else if (via === 'share' && navigator.share) {
            await navigator.share({ text }).catch(() => undefined);
          } else {
            await navigator.clipboard.writeText(text);
            toast.add({
              title: 'Message copié',
              description: 'Colle-le dans WhatsApp.',
              icon: 'i-lucide-clipboard-check',
              color: 'success',
            });
          }
        },
        onError: (error) => {
          tab?.close();
          toast.add({ title: errorMessage(error), color: 'error' });
        },
      },
    );
  };
  return { run, pending: send.isPending, variables: send.variables };
};
