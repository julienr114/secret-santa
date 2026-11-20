import { describe, expect, it } from 'vitest';
import { asAddress, linkHost } from './ideaLink';

describe('asAddress', () => {
  it('keeps an address as pasted', () => {
    expect(asAddress(' https://exemple.fr/billes?ref=1 ')).toBe(
      'https://exemple.fr/billes?ref=1',
    );
    expect(asAddress('http://exemple.fr')).toBe('http://exemple.fr/');
  });

  it('completes an address typed without its start', () => {
    expect(asAddress('exemple.fr/velo')).toBe('https://exemple.fr/velo');
    expect(asAddress('www.exemple.fr')).toBe('https://www.exemple.fr/');
  });

  it('refuses what is not an address', () => {
    expect(asAddress('')).toBeNull();
    expect(asAddress('un vélo')).toBeNull();
    expect(asAddress('velo')).toBeNull();
    expect(asAddress('ftp://exemple.fr')).toBeNull();
    expect(asAddress('javascript:alert(1)')).toBeNull();
  });
});

describe('the name of the site a link goes to', () => {
  it('is its host, without « www. »', () => {
    expect(linkHost('https://www.lutin-jouets.fr/circuit?ref=1')).toBe(
      'lutin-jouets.fr',
    );
    expect(linkHost('http://maison-fromage.fr')).toBe('maison-fromage.fr');
    expect(linkHost('https://WWW.Exemple.FR/a')).toBe('exemple.fr');
  });

  it('is empty for what is not an address', () => {
    expect(linkHost('pas une adresse')).toBe('');
    expect(linkHost('')).toBe('');
  });
});
