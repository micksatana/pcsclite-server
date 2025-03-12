import { describe, expect, it } from 'vitest';
import { delay } from './delay';

describe('delay', () => {
  it('should execution', async () => {
    const now = Date.now();
    await delay(100);

    const done = Date.now();

    expect(done - now).toBeGreaterThanOrEqual(100);
  });
});
