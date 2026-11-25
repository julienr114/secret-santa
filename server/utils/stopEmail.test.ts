import { describe, expect, it } from 'vitest';
import {
  blockWarning,
  mayReceive,
  readWithEither,
  signReport,
  signStop,
  verifyReport,
  verifyStop,
  withFoot,
} from './stopEmail';
import { emailPrint } from './emailPrint';

const SECRET = 'test-secret';

describe('emailPrint', () => {
  it('gives the same print to the same address, in any case', async () => {
    const print = await emailPrint('Hugo@X.fr ', SECRET);
    expect(print).toBe(await emailPrint('hugo@x.fr', SECRET));
    expect(print).not.toContain('hugo');
    expect(print).not.toBe(await emailPrint('hugo@x.fr', 'other'));
  });
});

describe('the stop link', () => {
  it('carries the address, signed', async () => {
    const token = await signStop('Hugo@x.fr', SECRET);
    expect(await verifyStop(token, SECRET)).toBe('hugo@x.fr');
  });

  it('refuses what the server did not sign', async () => {
    const token = await signStop('hugo@x.fr', SECRET);
    const [, mac] = token.split('.');
    const forged = `${btoa('zoe@x.fr').replaceAll('=', '')}.${mac}`;
    expect(await verifyStop(forged, SECRET)).toBeNull();
    expect(await verifyStop(token, 'other')).toBeNull();
    expect(await verifyStop('nonsense', SECRET)).toBeNull();
  });
});

describe('the report link', () => {
  it('names the event and the account that sent', async () => {
    const token = await signReport({ partyId: 'p1', accountId: 'a1' }, SECRET);
    expect(await verifyReport(token, SECRET)).toEqual({
      partyId: 'p1',
      accountId: 'a1',
    });
    expect(await verifyReport(token, 'other')).toBeNull();
  });
});

describe('mayReceive', () => {
  it('sends nothing to an address that refused, but the login link', () => {
    expect(mayReceive({ blocked: true, login: false })).toBe(false);
    expect(mayReceive({ blocked: true, login: true })).toBe(true);
    expect(mayReceive({ blocked: false, login: false })).toBe(true);
  });
});

describe('blockWarning', () => {
  it('says the person asked, or that the address does not exist', () => {
    expect(blockWarning('person')).toBe('refused');
    expect(blockWarning('complaint')).toBe('refused');
    expect(blockWarning('bounce')).toBe('unknown');
    expect(blockWarning(null)).toBeNull();
  });
});

describe('withFoot', () => {
  const email = { subject: 'S', text: 'Bonjour', html: '<p>Bonjour</p>' };
  it('adds how to refuse, how to report, and on a first email who gave the address', () => {
    const footed = withFoot(
      email,
      {
        stop: 'https://app.test/arreter/t',
        report: { link: 'https://app.test/signaler/r', by: 'Camille' },
        first: { by: 'Camille' },
      },
      'fr',
    );
    expect(footed.text).toContain(
      'Ce que l’application sait de toi : ton prénom et cette adresse, donnés par Camille. Rien d’autre.',
    );
    expect(footed.text).toContain('Ne plus recevoir d’emails d’Under the Tree');
    expect(footed.text).toContain('https://app.test/arreter/t');
    expect(footed.text).toContain(
      'Tu ne connais pas Camille ? Signaler cet envoi',
    );
    expect(footed.html).toContain('href="https://app.test/signaler/r"');
  });

  it('adds only how to refuse to an email the app sent itself', () => {
    const footed = withFoot(
      email,
      { stop: 'https://app.test/arreter/t' },
      'en',
    );
    expect(footed.text).toContain('Stop receiving emails from Under the Tree');
    expect(footed.text).not.toContain('Report');
  });
});

describe('a signed link after a change of key (Q-043)', () => {
  it('is read with the key in use, else with the one before', async () => {
    const old = await signStop('lea@example.com', 'ancienne');
    const read = (token: string, secrets: string[]) =>
      readWithEither(secrets, (secret) => verifyStop(token, secret));
    expect(await read(old, ['nouvelle', 'ancienne'])).toBe('lea@example.com');
    expect(await read(old, ['nouvelle', ''])).toBeNull();
    expect(
      await read(await signStop('lea@example.com', 'nouvelle'), [
        'nouvelle',
        'ancienne',
      ]),
    ).toBe('lea@example.com');
  });
});
