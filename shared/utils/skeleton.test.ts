import { describe, expect, it } from 'vitest';
import { SKELETON_LINES, skeletonLines } from './skeleton';

describe('skeletonLines', () => {
  it('takes the widths in turn', () => {
    expect(skeletonLines(2)).toEqual([SKELETON_LINES[0], SKELETON_LINES[1]]);
  });

  it('starts where it is told', () => {
    expect(skeletonLines(1, 2)).toEqual([SKELETON_LINES[2]]);
  });

  it('comes back to the first widths after the last', () => {
    const lines = skeletonLines(SKELETON_LINES.length + 1);
    expect(lines.at(-1)).toEqual(SKELETON_LINES[0]);
  });

  it('has no line for nothing', () => {
    expect(skeletonLines(0)).toEqual([]);
    expect(skeletonLines(-1)).toEqual([]);
  });
});
