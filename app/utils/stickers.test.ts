import { describe, expect, it } from 'vitest';
import {
  personSticker,
  stickerEdge,
  stickerShadow,
  tileSticker,
} from './stickers';

const shade = { bg: '#ffd0c8', ring: '#ff8478' };

describe('stickers', () => {
  it('gives an edge of 5 % of the size, 2 px at least', () => {
    expect(stickerEdge(26)).toBe(2);
    expect(stickerEdge(40)).toBe(2);
    expect(stickerEdge(56)).toBe(3);
    expect(stickerEdge(80)).toBe(4);
  });

  it('casts a shorter shadow under 36 px', () => {
    expect(stickerShadow(32)).toBe('0 2px 5px rgba(90, 40, 60, 0.2)');
    expect(stickerShadow(36)).toBe('0 3px 8px rgba(90, 40, 60, 0.22)');
  });

  it('draws a person: a gradient from white, an edge and a shadow', () => {
    expect(personSticker(shade, 40)).toEqual({
      backgroundImage:
        'linear-gradient(150deg, #ffffff 0%, #ffd0c8 42%, #ff8478 135%)',
      boxShadow: '0 0 0 2px #ffffff, 0 3px 8px rgba(90, 40, 60, 0.22)',
    });
    expect(personSticker(shade, 32, true)).toEqual({
      backgroundImage:
        'linear-gradient(150deg, #ffffff 0%, #ffd0c8 42%, #ff8478 135%)',
    });
  });

  it('draws the tile of a list: rounder corners, tilted, or flat', () => {
    expect(tileSticker(shade, 56)).toEqual({
      backgroundImage: 'linear-gradient(150deg, #ffd0c8 0%, #ff8478 110%)',
      borderRadius: '17px',
      boxShadow: '0 0 0 3px #ffffff, 0 3px 8px rgba(90, 40, 60, 0.22)',
      transform: 'rotate(-3deg)',
    });
    expect(tileSticker(shade, 44, true)).toEqual({
      backgroundImage: 'linear-gradient(150deg, #ffd0c8 0%, #ff8478 110%)',
      borderRadius: '13px',
    });
  });
});
