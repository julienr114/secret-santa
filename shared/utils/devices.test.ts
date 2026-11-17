import { describe, expect, it } from 'vitest';
import { deviceIcon } from './devices';

describe('deviceIcon', () => {
  it('draws a phone for a phone or a tablet', () => {
    expect(deviceIcon('iPhone · Safari')).toBe('i-lucide-smartphone');
    expect(deviceIcon('iPad · Safari')).toBe('i-lucide-smartphone');
    expect(deviceIcon('Android · Chrome')).toBe('i-lucide-smartphone');
  });

  it('draws a laptop otherwise, or when the device is unknown', () => {
    expect(deviceIcon('Mac · Chrome')).toBe('i-lucide-laptop');
    expect(deviceIcon('Windows · Edge')).toBe('i-lucide-laptop');
    expect(deviceIcon(null)).toBe('i-lucide-laptop');
  });
});
