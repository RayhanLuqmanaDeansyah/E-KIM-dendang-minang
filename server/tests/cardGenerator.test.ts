import { describe, it } from 'node:test';
import assert from 'node:assert';
import { generateKIMCard } from '../src/utils/cardGenerator';

describe('KIM Card Generator Algorithm', () => {
  it('should generate a 6x9 matrix', () => {
    const card = generateKIMCard('test-seed-1');
    assert.strictEqual(card.length, 6);
    assert.strictEqual(card[0].length, 9);
  });

  it('should have exactly 30 numbers total', () => {
    const card = generateKIMCard('test-seed-2');
    const numbers = card.flat().filter((val) => val !== null);
    assert.strictEqual(numbers.length, 30);
  });

  it('should have exactly 5 numbers per row', () => {
    const card = generateKIMCard('test-seed-3');
    for (let r = 0; r < 6; r++) {
      const numbersInRow = card[r].filter((val) => val !== null);
      assert.strictEqual(numbersInRow.length, 5);
    }
  });

  it('should respect column ranges', () => {
    const card = generateKIMCard('test-seed-4');
    const ranges = [
      [1, 9], [10, 19], [20, 29], [30, 39], [40, 49],
      [50, 59], [60, 69], [70, 79], [80, 90]
    ];

    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 9; c++) {
        const val = card[r][c];
        if (val !== null) {
          assert.ok(val >= ranges[c][0], `Value ${val} in column ${c} is less than ${ranges[c][0]}`);
          assert.ok(val <= ranges[c][1], `Value ${val} in column ${c} is greater than ${ranges[c][1]}`);
        }
      }
    }
  });

  it('should have numbers in columns sorted in ascending order from top to bottom', () => {
    const card = generateKIMCard('test-seed-5');
    for (let c = 0; c < 9; c++) {
      let lastVal = -1;
      for (let r = 0; r < 6; r++) {
        const val = card[r][c];
        if (val !== null) {
          assert.ok(val > lastVal, `Value ${val} in col ${c}, row ${r} is not strictly greater than previous value ${lastVal}`);
          lastVal = val;
        }
      }
    }
  });

  it('should generate identical cards for identical seeds', () => {
    const seed = 'deterministic-seed';
    const card1 = generateKIMCard(seed);
    const card2 = generateKIMCard(seed);
    assert.deepStrictEqual(card1, card2);
  });

  it('should generate different cards for different seeds', () => {
    const card1 = generateKIMCard('seed-a');
    const card2 = generateKIMCard('seed-b');
    assert.notDeepStrictEqual(card1, card2);
  });
});
