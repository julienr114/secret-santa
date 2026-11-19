import { describe, expect, it } from 'vitest';
import { keyboardInset } from './keyboard';

describe('keyboardInset', () => {
  it('lifts a bottom sheet above an iPhone keyboard', () => {
    // 844 px high, the keyboard takes 336: 508 px visible.
    expect(
      keyboardInset({ layout: 844, visualHeight: 508, visualTop: 0 }),
    ).toEqual({ lift: 336, visible: 508 });
  });

  it('counts the scroll the browser made to show the field', () => {
    expect(
      keyboardInset({ layout: 844, visualHeight: 508, visualTop: 120 }),
    ).toEqual({ lift: 216, visible: 508 });
  });

  it('does nothing without a keyboard, or for the browser’s bars', () => {
    expect(
      keyboardInset({ layout: 844, visualHeight: 844, visualTop: 0 }).lift,
    ).toBe(0);
    expect(
      keyboardInset({ layout: 844, visualHeight: 790, visualTop: 0 }).lift,
    ).toBe(0);
  });
});
