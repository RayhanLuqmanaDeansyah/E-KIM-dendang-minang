import seedrandom from 'seedrandom';

export type KimCardGrid = Array<Array<number | null>>;

/**
 * Shuffles an array in-place using the provided random number generator.
 */
function shuffle<T>(array: T[], rng: () => number): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

/**
 * Returns all combinations of `k` elements from `arr`.
 */
function getCombinations<T>(arr: T[], k: number): T[][] {
  const results: T[][] = [];
  function helper(start: number, current: T[]) {
    if (current.length === k) {
      results.push([...current]);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      current.push(arr[i]);
      helper(i + 1, current);
      current.pop();
    }
  }
  helper(0, []);
  return results;
}

/**
 * Generates a 6x9 mask where exactly 5 cells per row are true,
 * and column counts match the required colCounts.
 */
function generateMask(colCounts: number[], rng: () => number): boolean[][] {
  const mask = Array.from({ length: 6 }, () => Array(9).fill(false));
  const currentColCounts = [...colCounts];

  function solve(row: number): boolean {
    if (row === 6) return true;

    const availableCols: number[] = [];
    for (let c = 0; c < 9; c++) {
      if (currentColCounts[c] > 0) availableCols.push(c);
    }

    if (availableCols.length < 5) return false;

    // To ensure variety, get all combinations of 5 columns, then shuffle them
    const combinations = getCombinations(availableCols, 5);
    shuffle(combinations, rng);

    for (const combo of combinations) {
      // Place
      for (const c of combo) {
        mask[row][c] = true;
        currentColCounts[c]--;
      }

      if (solve(row + 1)) return true;

      // Backtrack
      for (const c of combo) {
        mask[row][c] = false;
        currentColCounts[c]++;
      }
    }
    return false;
  }

  const success = solve(0);
  if (!success) {
    throw new Error("Failed to generate mask, which should be mathematically impossible with max col sum <= 6.");
  }
  return mask;
}

/**
 * Generates a KIM Card (6x9 grid) based on a seed.
 */
export function generateKIMCard(seed: string): KimCardGrid {
  const rng = seedrandom(seed);

  // 1. Determine how many numbers each column will have.
  // We need 30 numbers total. Let's ensure each column has at least 1, max 6.
  // Average is ~3.33. 
  const colCounts = Array(9).fill(1); // Give 1 to each of the 9 columns initially
  let remaining = 30 - 9; // 21

  while (remaining > 0) {
    const c = Math.floor(rng() * 9);
    if (colCounts[c] < 6) {
      colCounts[c]++;
      remaining--;
    }
  }

  // 2. Generate the binary mask layout for the 6x9 grid
  const mask = generateMask(colCounts, rng);

  // 3. Populate numbers into the columns based on the mask
  const ranges = [
    [1, 9], [10, 19], [20, 29], [30, 39], [40, 49], 
    [50, 59], [60, 69], [70, 79], [80, 90]
  ];

  const colNumbers: number[][] = [];
  for (let c = 0; c < 9; c++) {
    const [min, max] = ranges[c];
    const pool: number[] = [];
    for (let i = min; i <= max; i++) pool.push(i);
    
    shuffle(pool, rng);
    
    // Take exactly colCounts[c] numbers, then sort them ascending
    const selected = pool.slice(0, colCounts[c]).sort((a, b) => a - b);
    colNumbers.push(selected);
  }

  // 4. Fill the actual grid using the mask and the sorted numbers
  const grid: KimCardGrid = Array.from({ length: 6 }, () => Array(9).fill(null));
  
  // To place numbers correctly (top-to-bottom must be ascending),
  // we just consume the numbers from colNumbers one by one.
  const colPointers = Array(9).fill(0);
  
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 9; c++) {
      if (mask[r][c]) {
        grid[r][c] = colNumbers[c][colPointers[c]];
        colPointers[c]++;
      }
    }
  }

  return grid;
}
