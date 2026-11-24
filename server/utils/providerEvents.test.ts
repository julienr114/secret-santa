import { describe, expect, it } from 'vitest';
import { blocksOf, verifyProviderEvent } from './providerEvents';

const SECRET = `whsec_${btoa('a secret of the webhook')}`;
const sign = async (id: string, timestamp: string, body: string) => {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode('a secret of the webhook'),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const mac = new Uint8Array(
    await crypto.subtle.sign(
      'HMAC',
      key,
      new TextEncoder().encode(`${id}.${timestamp}.${body}`),
    ),
  );
  return `v1,${btoa(String.fromCharCode(...mac))}`;
};

describe('verifyProviderEvent', () => {
  const body = '{"type":"email.bounced"}';
  it('takes a signature of the provider, of now', async () => {
    const signature = await sign('msg_1', '1000', body);
    expect(
      await verifyProviderEvent(
        { id: 'msg_1', timestamp: '1000', signature, body },
        SECRET,
        1100,
      ),
    ).toBe(true);
  });

  it('refuses another body, an old time, or no secret', async () => {
    const signature = await sign('msg_1', '1000', body);
    const event = { id: 'msg_1', timestamp: '1000', signature, body };
    expect(
      await verifyProviderEvent({ ...event, body: '{}' }, SECRET, 1100),
    ).toBe(false);
    expect(await verifyProviderEvent(event, SECRET, 1000 + 301)).toBe(false);
    expect(await verifyProviderEvent(event, '', 1100)).toBe(false);
  });
});

describe('blocksOf', () => {
  it('blocks an address that does not exist, and one that complained', () => {
    expect(
      blocksOf({
        type: 'email.bounced',
        data: { to: ['nobody@x.fr'], bounce: { type: 'Permanent' } },
      }),
    ).toEqual({ emails: ['nobody@x.fr'], cause: 'bounce' });
    expect(
      blocksOf({ type: 'email.complained', data: { to: 'angry@x.fr' } }),
    ).toEqual({ emails: ['angry@x.fr'], cause: 'complaint' });
  });

  it('leaves a mailbox full for a while, and the other events', () => {
    expect(
      blocksOf({
        type: 'email.bounced',
        data: { to: ['full@x.fr'], bounce: { type: 'Transient' } },
      }),
    ).toBeNull();
    expect(
      blocksOf({ type: 'email.delivered', data: { to: ['a@x.fr'] } }),
    ).toBeNull();
  });
});
