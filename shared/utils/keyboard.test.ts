import { describe, expect, it } from 'vitest';
import { emptyBelow, keyboardInset } from './keyboard';

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

describe('emptyBelow', () => {
  it('measures the empty page shown under the content', () => {
    // 508 px visible, the content ends at 400.
    expect(
      emptyBelow({ contentBottom: 400, visualTop: 0, visualHeight: 508 }),
    ).toBe(108);
    // Scrolled down 150 px over a content ending at 600.
    expect(
      emptyBelow({ contentBottom: 600, visualTop: 150, visualHeight: 508 }),
    ).toBe(58);
  });

  it('is 0 while the content goes on below', () => {
    expect(
      emptyBelow({ contentBottom: 900, visualTop: 100, visualHeight: 508 }),
    ).toBe(0);
  });
});
